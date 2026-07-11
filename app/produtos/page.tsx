"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./produtos.css";

type Categoria = { id: string; nome: string };
type Produto = {
  id: string;
  nome: string;
  marca: string | null;
  unidade: string;
  preco_custo_atual: number;
  preco_venda: number;
  ativo: boolean;
  categoria_id: string | null;
  categorias: { nome: string } | null;
};

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busca, setBusca] = useState("");
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [unidade, setUnidade] = useState("UN");
  const [categoriaId, setCategoriaId] = useState("");
  const [precoVenda, setPrecoVenda] = useState(0);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const supabase = createClient();
      const [p, c] = await Promise.all([
        supabase
          .from("produtos")
          .select("id,nome,marca,unidade,preco_custo_atual,preco_venda,ativo,categoria_id,categorias(nome)")
          .order("nome"),
        supabase.from("categorias").select("id,nome").eq("ativa", true).order("nome")
      ]);
      if (p.error) throw p.error;
      if (c.error) throw c.error;
      setProdutos((p.data ?? []) as unknown as Produto[]);
      setCategorias(c.data ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar os produtos.");
    }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter(p =>
      [p.nome, p.marca ?? "", p.categorias?.nome ?? ""].some(v => v.toLowerCase().includes(termo))
    );
  }, [produtos, busca]);

  function limpar() {
    setNome("");
    setMarca("");
    setUnidade("UN");
    setCategoriaId("");
    setPrecoVenda(0);
    setEditandoId(null);
  }

  function editar(produto: Produto) {
    setNome(produto.nome);
    setMarca(produto.marca ?? "");
    setUnidade(produto.unidade);
    setCategoriaId(produto.categoria_id ?? "");
    setPrecoVenda(Number(produto.preco_venda || 0));
    setEditandoId(produto.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");
    if (!nome.trim()) return setErro("Informe o nome do produto.");

    setSalvando(true);
    try {
      const supabase = createClient();
      const payload = {
        nome: nome.trim(),
        marca: marca.trim() || null,
        unidade: unidade.trim().toUpperCase() || "UN",
        categoria_id: categoriaId || null,
        preco_venda: Number(precoVenda || 0)
      };

      const resposta = editandoId
        ? await supabase.from("produtos").update(payload).eq("id", editandoId)
        : await supabase.from("produtos").insert(payload);

      if (resposta.error) throw resposta.error;
      setAviso(editandoId ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.");
      limpar();
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(produto: Produto) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("produtos").update({ ativo: !produto.ativo }).eq("id", produto.id);
      if (error) throw error;
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível alterar o produto.");
    }
  }

  return (
    <main className="produtos-page">
      <header className="produtos-topo">
        <div>
          <Link href="/">← Dashboard</Link><Link className="sair-link" href="/logout">Sair</Link>
          <h1>Produtos</h1>
          <p>Cadastre os itens comprados e acompanhe custos e preços de venda.</p>
        </div>
        <div className="contador">{produtos.filter(p => p.ativo).length} ativos</div>
      </header>

      <section className="produto-card">
        <h2>{editandoId ? "Editar produto" : "Novo produto"}</h2>
        <form className="produto-form" onSubmit={salvar}>
          <label>Nome<input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Farinha de trigo 1 kg" /></label>
          <label>Marca<input value={marca} onChange={e => setMarca(e.target.value)} placeholder="Opcional" /></label>
          <label>Categoria<select value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
            <option value="">Sem categoria</option>
            {categorias.map(c => <option value={c.id} key={c.id}>{c.nome}</option>)}
          </select></label>
          <label>Unidade<input value={unidade} onChange={e => setUnidade(e.target.value)} /></label>
          <label>Preço de venda<input type="number" min="0" step="0.01" value={precoVenda} onChange={e => setPrecoVenda(Number(e.target.value))} /></label>
          <div className="form-acoes">
            {editandoId && <button type="button" className="cancelar" onClick={limpar}>Cancelar</button>}
            <button className="salvar" disabled={salvando}>{salvando ? "Salvando..." : editandoId ? "Atualizar" : "Cadastrar"}</button>
          </div>
        </form>
        {erro && <div className="mensagem erro">{erro}</div>}
        {aviso && <div className="mensagem sucesso">{aviso}</div>}
      </section>

      <section className="produto-card">
        <div className="lista-topo">
          <h2>Produtos cadastrados</h2>
          <input className="busca" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar produto..." />
        </div>
        <div className="tabela-wrap">
          <table>
            <thead><tr><th>Produto</th><th>Categoria</th><th>Custo atual</th><th>Venda</th><th>Margem</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {filtrados.map(p => {
                const custo = Number(p.preco_custo_atual || 0);
                const venda = Number(p.preco_venda || 0);
                const margem = custo > 0 ? ((venda - custo) / custo) * 100 : 0;
                return (
                  <tr key={p.id}>
                    <td><strong>{p.nome}</strong><small>{p.marca || p.unidade}</small></td>
                    <td>{p.categorias?.nome ?? "—"}</td>
                    <td>{brl(custo)}</td>
                    <td>{brl(venda)}</td>
                    <td>{margem.toFixed(1)}%</td>
                    <td><span className={`status ${p.ativo ? "ativo" : "inativo"}`}>{p.ativo ? "Ativo" : "Inativo"}</span></td>
                    <td className="acoes-tabela">
                      <button onClick={() => editar(p)}>Editar</button>
                      <button onClick={() => alternarAtivo(p)}>{p.ativo ? "Desativar" : "Ativar"}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtrados.length && <div className="vazio">Nenhum produto encontrado.</div>}
        </div>
      </section>
    </main>
  );
}
