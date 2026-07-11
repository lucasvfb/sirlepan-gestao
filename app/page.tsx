"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Compra = {
  id: string;
  data_compra: string;
  valor_total: number;
  fornecedor_id: string | null;
  loja_id: string;
  fornecedores: { nome: string } | null;
  lojas: { nome: string } | null;
};

type Produto = {
  id: string;
  nome: string;
  preco_custo_atual: number;
  preco_venda: number;
  ativo: boolean;
};

type Historico = {
  id: string;
  preco_anterior: number | null;
  preco_novo: number;
  variacao_percentual: number | null;
  data_registro: string;
  produtos: { nome: string } | null;
};

const brl = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor || 0);

export default function Home() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState(0);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const supabase = createClient();
        const inicioMes = new Date();
        inicioMes.setDate(1);
        const inicio = inicioMes.toISOString().slice(0, 10);

        const [c, p, f, h] = await Promise.all([
          supabase
            .from("compras")
            .select("id,data_compra,valor_total,fornecedor_id,loja_id,fornecedores(nome),lojas(nome)")
            .gte("data_compra", inicio)
            .order("data_compra", { ascending: false }),
          supabase
            .from("produtos")
            .select("id,nome,preco_custo_atual,preco_venda,ativo")
            .order("nome"),
          supabase
            .from("fornecedores")
            .select("id", { count: "exact", head: true })
            .eq("ativo", true),
          supabase
            .from("historico_precos")
            .select("id,preco_anterior,preco_novo,variacao_percentual,data_registro,produtos(nome)")
            .order("data_registro", { ascending: false })
            .limit(8)
        ]);

        const primeiroErro = c.error || p.error || f.error || h.error;
        if (primeiroErro) throw primeiroErro;

        setCompras((c.data ?? []) as unknown as Compra[]);
        setProdutos((p.data ?? []) as Produto[]);
        setFornecedores(f.count ?? 0);
        setHistorico((h.data ?? []) as unknown as Historico[]);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar o dashboard.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const totalMes = useMemo(
    () => compras.reduce((soma, compra) => soma + Number(compra.valor_total || 0), 0),
    [compras]
  );

  const maiorVariacao = useMemo(() => {
    return historico.reduce((maior, item) => {
      const atual = Math.abs(Number(item.variacao_percentual || 0));
      return atual > maior ? atual : maior;
    }, 0);
  }, [historico]);

  const margemMedia = useMemo(() => {
    const validos = produtos.filter(p => Number(p.preco_custo_atual) > 0 && Number(p.preco_venda) > 0);
    if (!validos.length) return 0;
    return validos.reduce((soma, p) => {
      const custo = Number(p.preco_custo_atual);
      const venda = Number(p.preco_venda);
      return soma + ((venda - custo) / custo) * 100;
    }, 0) / validos.length;
  }, [produtos]);

  const comprasRecentes = compras.slice(0, 6);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Sirlepan Gestão</div>
        <div className="tagline">Compras, custos e fornecedores</div>
        <nav className="nav">
          <Link className="active" href="/">Dashboard</Link>
          <Link href="/compras">Compras</Link>
          <Link href="/produtos">Produtos</Link>
          <Link href="/fornecedores">Fornecedores</Link>
          <Link href="/relatorios">Relatórios</Link>
          <Link href="/login">Entrar</Link>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Visão geral</h1>
            <div className="subtitle">Acompanhe compras, custos e margens da Sirlepan.</div>
          </div>
          <Link className="button" href="/compras">+ Nova compra</Link>
        </header>

        {erro && <div className="error">{erro}</div>}

        <section className="grid">
          <article className="card">
            <div className="metric-label">Compras no mês</div>
            <div className="metric-value">{brl(totalMes)}</div>
            <div className="metric-note">{compras.length} lançamento(s)</div>
          </article>
          <article className="card">
            <div className="metric-label">Produtos ativos</div>
            <div className="metric-value">{produtos.filter(p => p.ativo).length}</div>
            <div className="metric-note">Itens disponíveis para compra</div>
          </article>
          <article className="card">
            <div className="metric-label">Fornecedores ativos</div>
            <div className="metric-value">{fornecedores}</div>
            <div className="metric-note">Base cadastrada</div>
          </article>
          <article className="card">
            <div className="metric-label">Margem média</div>
            <div className="metric-value">{margemMedia.toFixed(1)}%</div>
            <div className="metric-note">Com base nos preços cadastrados</div>
          </article>
        </section>

        <section className="section dashboard-duplo">
          <div>
            <div className="section-title">
              <h2>Compras recentes</h2>
              <Link href="/compras">Ver módulo</Link>
            </div>
            <div className="table-wrap">
              {carregando ? (
                <div className="empty">Carregando...</div>
              ) : comprasRecentes.length === 0 ? (
                <div className="empty">Nenhuma compra registrada neste mês.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Fornecedor</th>
                      <th>Loja</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprasRecentes.map(compra => (
                      <tr key={compra.id}>
                        <td>{new Date(`${compra.data_compra}T12:00:00`).toLocaleDateString("pt-BR")}</td>
                        <td>{compra.fornecedores?.nome ?? "—"}</td>
                        <td>{compra.lojas?.nome ?? "—"}</td>
                        <td><strong>{brl(Number(compra.valor_total))}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div>
            <div className="section-title">
              <h2>Últimas variações</h2>
              <Link href="/relatorios">Ver relatório</Link>
            </div>
            <div className="card variacoes-card">
              {historico.length === 0 ? (
                <div className="empty">Sem histórico de preços ainda.</div>
              ) : historico.map(item => {
                const variacao = Number(item.variacao_percentual || 0);
                return (
                  <div className="variacao-item" key={item.id}>
                    <div>
                      <strong>{item.produtos?.nome ?? "Produto"}</strong>
                      <span>{brl(Number(item.preco_anterior || 0))} → {brl(Number(item.preco_novo))}</span>
                    </div>
                    <b className={variacao > 0 ? "subiu" : variacao < 0 ? "caiu" : ""}>
                      {variacao > 0 ? "+" : ""}{variacao.toFixed(1)}%
                    </b>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <h2>Alerta de variação</h2>
          </div>
          <article className="card">
            <div className="metric-label">Maior variação recente</div>
            <div className="metric-value">{maiorVariacao.toFixed(1)}%</div>
            <div className="metric-note">Consulte os detalhes no relatório de preços.</div>
          </article>
        </section>
      </main>
    </div>
  );
}
