"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./compras.css";

type Option = { id: string; nome: string };
type Produto = Option & { unidade: string; preco_custo_atual: number };
type Item = { produto_id: string; quantidade: number; unidade: string; valor_unitario: number };

const vazio: Item = { produto_id: "", quantidade: 1, unidade: "UN", valor_unitario: 0 };
const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export default function ComprasPage() {
  const [lojas, setLojas] = useState<Option[]>([]);
  const [fornecedores, setFornecedores] = useState<Option[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loja, setLoja] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [documento, setDocumento] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [frete, setFrete] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [itens, setItens] = useState<Item[]>([{ ...vazio }]);
  const [aviso, setAviso] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const subtotal = useMemo(
    () => itens.reduce((s, i) => s + Number(i.quantidade) * Number(i.valor_unitario), 0),
    [itens]
  );
  const total = Math.max(0, subtotal + frete - desconto);

  useEffect(() => {
    async function carregar() {
      try {
        const supabase = createClient();
        const [l, f, p] = await Promise.all([
          supabase.from("lojas").select("id,nome").eq("ativa", true).order("nome"),
          supabase.from("fornecedores").select("id,nome").eq("ativo", true).order("nome"),
          supabase.from("produtos").select("id,nome,unidade,preco_custo_atual").eq("ativo", true).order("nome")
        ]);
        const e = l.error || f.error || p.error;
        if (e) throw e;
        setLojas(l.data ?? []);
        setFornecedores(f.data ?? []);
        setProdutos((p.data ?? []) as Produto[]);
        if (l.data?.[0]) setLoja(l.data[0].id);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar os dados.");
      }
    }
    carregar();
  }, []);

  function alterarItem(index: number, campo: keyof Item, valor: string | number) {
    setItens(lista => lista.map((item, i) => {
      if (i !== index) return item;
      const novo = { ...item, [campo]: valor } as Item;
      if (campo === "produto_id") {
        const produto = produtos.find(p => p.id === valor);
        if (produto) {
          novo.unidade = produto.unidade || "UN";
          novo.valor_unitario = Number(produto.preco_custo_atual || 0);
        }
      }
      return novo;
    }));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setAviso("");
    setErro("");
    if (!loja || !fornecedor) return setErro("Selecione a loja e o fornecedor.");
    const validos = itens.filter(i => i.produto_id && i.quantidade > 0);
    if (!validos.length) return setErro("Adicione pelo menos um produto.");

    setSalvando(true);
    try {
      const supabase = createClient();
      const { data: usuario } = await supabase.auth.getUser();
      if (!usuario.user) throw new Error("Entre no sistema antes de registrar uma compra.");

      const { data: compra, error: compraErro } = await supabase.from("compras").insert({
        loja_id: loja,
        fornecedor_id: fornecedor,
        numero_documento: documento || null,
        data_compra: data,
        valor_produtos: subtotal,
        valor_frete: frete,
        valor_desconto: desconto,
        valor_total: total,
        status: "paga",
        created_by: usuario.user.id
      }).select("id").single();

      if (compraErro) throw compraErro;

      const { error: itemErro } = await supabase.from("itens_compra").insert(
        validos.map(i => ({
          compra_id: compra.id,
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          unidade: i.unidade,
          valor_unitario: i.valor_unitario,
          valor_total: i.quantidade * i.valor_unitario
        }))
      );
      if (itemErro) throw itemErro;

      setAviso("Compra registrada com sucesso.");
      setDocumento("");
      setFrete(0);
      setDesconto(0);
      setItens([{ ...vazio }]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível registrar a compra.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="compras-page">
      <header className="compras-topo">
        <div>
          <Link href="/">← Dashboard</Link><Link className="sair-link" href="/logout">Sair</Link>
          <h1>Nova compra</h1>
          <p>Registre os produtos recebidos e atualize os custos automaticamente.</p>
        </div>
        <div className="total-card"><span>Total</span><strong>{brl(total)}</strong></div>
      </header>

      <form onSubmit={salvar}>
        <section className="compra-card">
          <h2>Dados da compra</h2>
          <div className="dados-grid">
            <label>Loja<select value={loja} onChange={e => setLoja(e.target.value)}>
              <option value="">Selecione</option>{lojas.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
            </select></label>
            <label>Fornecedor<select value={fornecedor} onChange={e => setFornecedor(e.target.value)}>
              <option value="">Selecione</option>{fornecedores.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
            </select></label>
            <label>Data<input type="date" value={data} onChange={e => setData(e.target.value)} /></label>
            <label>Nº da nota<input value={documento} onChange={e => setDocumento(e.target.value)} placeholder="Ex.: 12345" /></label>
          </div>
        </section>

        <section className="compra-card">
          <div className="linha-titulo">
            <h2>Produtos</h2>
            <button type="button" className="secundario" onClick={() => setItens(v => [...v, { ...vazio }])}>+ Adicionar produto</button>
          </div>
          <div className="itens">
            {itens.map((item, index) => (
              <div className="item" key={index}>
                <label className="produto">Produto<select value={item.produto_id} onChange={e => alterarItem(index, "produto_id", e.target.value)}>
                  <option value="">Selecione</option>{produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select></label>
                <label>Qtd.<input type="number" min="0.001" step="0.001" value={item.quantidade} onChange={e => alterarItem(index, "quantidade", Number(e.target.value))} /></label>
                <label>Unidade<input value={item.unidade} onChange={e => alterarItem(index, "unidade", e.target.value.toUpperCase())} /></label>
                <label>Valor unitário<input type="number" min="0" step="0.01" value={item.valor_unitario} onChange={e => alterarItem(index, "valor_unitario", Number(e.target.value))} /></label>
                <div className="subtotal"><span>Subtotal</span><strong>{brl(item.quantidade * item.valor_unitario)}</strong></div>
                <button type="button" className="remover" onClick={() => setItens(v => v.length === 1 ? [{ ...vazio }] : v.filter((_, i) => i !== index))}>×</button>
              </div>
            ))}
          </div>
        </section>

        <section className="compra-card resumo">
          <div className="ajustes">
            <label>Frete<input type="number" min="0" step="0.01" value={frete} onChange={e => setFrete(Number(e.target.value))} /></label>
            <label>Desconto<input type="number" min="0" step="0.01" value={desconto} onChange={e => setDesconto(Number(e.target.value))} /></label>
          </div>
          <div className="valores">
            <div><span>Produtos</span><strong>{brl(subtotal)}</strong></div>
            <div><span>Frete</span><strong>{brl(frete)}</strong></div>
            <div><span>Desconto</span><strong>- {brl(desconto)}</strong></div>
            <div className="final"><span>Total</span><strong>{brl(total)}</strong></div>
          </div>
        </section>

        {erro && <div className="msg erro">{erro}</div>}
        {aviso && <div className="msg sucesso">{aviso}</div>}
        <div className="acoes"><button className="principal" disabled={salvando}>{salvando ? "Salvando..." : "Registrar compra"}</button></div>
      </form>
    </main>
  );
}
