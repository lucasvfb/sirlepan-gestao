"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./relatorios.css";

type Historico = {
  id: string;
  preco_anterior: number | null;
  preco_novo: number;
  variacao_percentual: number | null;
  data_registro: string;
  produtos: { nome: string } | null;
  fornecedores: { nome: string } | null;
  lojas: { nome: string } | null;
};

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export default function RelatoriosPage() {
  const [dados, setDados] = useState<Historico[]>([]);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("historico_precos")
          .select("id,preco_anterior,preco_novo,variacao_percentual,data_registro,produtos(nome),fornecedores(nome),lojas(nome)")
          .order("data_registro", { ascending: false })
          .limit(200);
        if (error) throw error;
        setDados((data ?? []) as unknown as Historico[]);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar o relatório.");
      }
    }
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return dados;
    return dados.filter(item =>
      [item.produtos?.nome ?? "", item.fornecedores?.nome ?? "", item.lojas?.nome ?? ""]
        .some(valor => valor.toLowerCase().includes(termo))
    );
  }, [dados, busca]);

  const maioresAltas = [...filtrados]
    .filter(i => Number(i.variacao_percentual || 0) > 0)
    .sort((a, b) => Number(b.variacao_percentual || 0) - Number(a.variacao_percentual || 0))
    .slice(0, 5);

  const maioresQuedas = [...filtrados]
    .filter(i => Number(i.variacao_percentual || 0) < 0)
    .sort((a, b) => Number(a.variacao_percentual || 0) - Number(b.variacao_percentual || 0))
    .slice(0, 5);

  return (
    <main className="relatorios-page">
      <header className="relatorios-topo">
        <div>
          <Link href="/">← Dashboard</Link><Link className="sair-link" href="/logout">Sair</Link>
          <h1>Relatórios</h1>
          <p>Acompanhe a evolução dos preços dos produtos comprados.</p>
        </div>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar produto, fornecedor ou loja..." />
      </header>

      {erro && <div className="relatorio-msg">{erro}</div>}

      <section className="relatorios-grid">
        <article className="relatorio-card">
          <h2>Maiores aumentos</h2>
          {maioresAltas.length === 0 ? <p>Sem dados.</p> : maioresAltas.map(item => (
            <div className="ranking-item" key={item.id}>
              <span>{item.produtos?.nome ?? "Produto"}</span>
              <strong className="alta">+{Number(item.variacao_percentual).toFixed(1)}%</strong>
            </div>
          ))}
        </article>

        <article className="relatorio-card">
          <h2>Maiores reduções</h2>
          {maioresQuedas.length === 0 ? <p>Sem dados.</p> : maioresQuedas.map(item => (
            <div className="ranking-item" key={item.id}>
              <span>{item.produtos?.nome ?? "Produto"}</span>
              <strong className="queda">{Number(item.variacao_percentual).toFixed(1)}%</strong>
            </div>
          ))}
        </article>
      </section>

      <section className="relatorio-card">
        <h2>Histórico de preços</h2>
        <div className="relatorio-tabela">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Fornecedor</th>
                <th>Loja</th>
                <th>Preço anterior</th>
                <th>Novo preço</th>
                <th>Variação</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(item => {
                const variacao = Number(item.variacao_percentual || 0);
                return (
                  <tr key={item.id}>
                    <td>{new Date(item.data_registro).toLocaleDateString("pt-BR")}</td>
                    <td><strong>{item.produtos?.nome ?? "—"}</strong></td>
                    <td>{item.fornecedores?.nome ?? "—"}</td>
                    <td>{item.lojas?.nome ?? "—"}</td>
                    <td>{brl(Number(item.preco_anterior || 0))}</td>
                    <td>{brl(Number(item.preco_novo))}</td>
                    <td>
                      <span className={`variacao-badge ${variacao > 0 ? "alta" : variacao < 0 ? "queda" : ""}`}>
                        {variacao > 0 ? "+" : ""}{variacao.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtrados.length === 0 && <div className="relatorio-vazio">Nenhum registro encontrado.</div>}
        </div>
      </section>
    </main>
  );
}
