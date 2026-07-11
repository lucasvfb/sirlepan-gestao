import Link from "next/link";

const metrics = [
  ["Compras no mês", "R$ 0,00", "Aguardando lançamentos"],
  ["Produtos ativos", "0", "Cadastre os primeiros produtos"],
  ["Fornecedores", "0", "Base inicial vazia"],
  ["Maior variação", "0%", "Sem histórico ainda"]
];

export default function Home() {
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
            <div className="subtitle">Acompanhe os principais números da Sirlepan.</div>
          </div>
          <div className="badge">Banco Supabase preparado</div>
        </header>

        <section className="grid">
          {metrics.map(([label, value, note]) => (
            <article className="card" key={label}>
              <div className="metric-label">{label}</div>
              <div className="metric-value">{value}</div>
              <div className="metric-note">{note}</div>
            </article>
          ))}
        </section>

        <section className="section">
          <div className="section-title">
            <h2>Compras recentes</h2>
            <button className="button">Nova compra</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Fornecedor</th>
                  <th>Loja</th>
                  <th>Documento</th>
                  <th>Total</th>
                </tr>
              </thead>
            </table>
            <div className="empty">Nenhuma compra registrada até o momento.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
