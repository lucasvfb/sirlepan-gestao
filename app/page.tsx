"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Boxes, Factory, HandCoins, PackageCheck, ShoppingCart, WalletCards } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type Unit = { id: string; name: string; type: string };
type Revenue = { unit_id: string; revenue_date: string; cash: number; pix: number; debit: number; credit: number; delivery: number; others: number };
type Entry = { id?: string; description?: string | null; amount: number; entry_type: string; status: string; due_date: string | null; created_at?: string };
type Transfer = { id: string; status: string };
type Order = { id: string; status: string; pickup_at: string };
type Movement = { id: string; movement_type: string; quantity: number; occurred_at: string; notes: string | null };

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const date = (v?: string | null) => v ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(v)) : "—";

export default function Dashboard() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [products, setProducts] = useState(0);
  const [stockItems, setStockItems] = useState(0);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const ini = new Date(); ini.setDate(1);
        const start = ini.toISOString().slice(0, 10);
        const [u, r, e, p, s, t, o, m] = await Promise.all([
          supabase.from("erp_units").select("id,name,type").eq("active", true).order("name"),
          supabase.from("erp_daily_revenue").select("unit_id,revenue_date,cash,pix,debit,credit,delivery,others").gte("revenue_date", start),
          supabase.from("erp_financial_entries").select("id,description,amount,entry_type,status,due_date,created_at").neq("status", "cancelled").order("created_at", { ascending: false }).limit(8),
          supabase.from("erp_products").select("id", { count: "exact", head: true }).eq("active", true),
          supabase.from("erp_stock_items").select("id", { count: "exact", head: true }).eq("active", true),
          supabase.from("erp_transfers").select("id,status").in("status", ["draft", "sent", "divergent"]),
          supabase.from("erp_orders").select("id,status,pickup_at").in("status", ["quote", "confirmed", "in_production", "ready"]),
          supabase.from("erp_stock_movements").select("id,movement_type,quantity,occurred_at,notes").order("occurred_at", { ascending: false }).limit(6),
        ]);
        const fail = u.error || r.error || e.error || p.error || s.error || t.error || o.error || m.error;
        if (fail) throw fail;
        setUnits((u.data ?? []) as Unit[]); setRevenues((r.data ?? []) as Revenue[]); setEntries((e.data ?? []) as Entry[]);
        setProducts(p.count ?? 0); setStockItems(s.count ?? 0); setTransfers((t.data ?? []) as Transfer[]); setOrders((o.data ?? []) as Order[]); setMovements((m.data ?? []) as Movement[]);
      } catch (err) { setErro(err instanceof Error ? err.message : "Erro ao carregar o ERP."); }
    })();
  }, []);

  const totalRevenue = useMemo(() => revenues.reduce((sum, r) => sum + [r.cash,r.pix,r.debit,r.credit,r.delivery,r.others].reduce((a,b) => a + Number(b || 0),0),0), [revenues]);
  const expenses = useMemo(() => entries.filter(e => e.entry_type === "expense" && e.status === "paid").reduce((s,e) => s + Number(e.amount || 0),0), [entries]);
  const overdue = useMemo(() => entries.filter(e => ["forecast","partial","overdue"].includes(e.status) && e.due_date && new Date(e.due_date + "T23:59:59") < new Date()).length, [entries]);
  const result = totalRevenue - expenses;
  const attention = overdue + transfers.length + orders.filter(o => o.status === "ready").length;
  const outgoing = ["production_consumption","loss","transfer_out"];

  return <AppShell>
    <div className="dashboard-v2">
      <header className="dashboard-welcome">
        <div><span className="eyebrow">PAINEL DE GESTÃO</span><h1>Visão geral</h1><p>O que está acontecendo na Sirlepan e o que precisa da sua atenção.</p></div>
        <div className={`health-pill ${attention ? "warn" : ""}`}><span className="health-dot" />{attention ? `${attention} ponto${attention > 1 ? "s" : ""} de atenção` : "Operação em dia"}</div>
      </header>

      {erro && <div className="notice error">{erro}</div>}

      <section className="executive-grid">
        <article className="executive-card featured"><div className="executive-icon"><WalletCards size={20}/></div><div><span>Faturamento do mês</span><strong>{brl(totalRevenue)}</strong><small><ArrowUpRight size={13}/> consolidado das unidades</small></div></article>
        <article className="executive-card"><div className="executive-icon"><ArrowDownRight size={20}/></div><div><span>Despesas pagas</span><strong>{brl(expenses)}</strong><small>lançamentos efetivados</small></div></article>
        <article className="executive-card result"><div className="executive-icon"><HandCoins size={20}/></div><div><span>Resultado simples</span><strong>{brl(result)}</strong><small>faturamento − despesas</small></div></article>
        <article className={`executive-card ${attention ? "danger" : ""}`}><div className="executive-icon"><AlertTriangle size={20}/></div><div><span>Atenções</span><strong>{attention}</strong><small>itens que exigem revisão</small></div></article>
      </section>

      <section className="dashboard-columns">
        <div className="dashboard-main-column">
          <div className="panel-card">
            <div className="panel-heading"><div><span className="eyebrow">ACESSO RÁPIDO</span><h2>O que você quer fazer?</h2></div></div>
            <div className="action-grid-v2">
              <Link href="/financeiro"><span className="action-icon"><HandCoins size={21}/></span><div><strong>Lançar faturamento</strong><small>Fechamento diário</small></div><ArrowRight size={17}/></Link>
              <Link href="/compras"><span className="action-icon"><ShoppingCart size={21}/></span><div><strong>Registrar compra</strong><small>Entrada de mercadoria</small></div><ArrowRight size={17}/></Link>
              <Link href="/producao"><span className="action-icon"><Factory size={21}/></span><div><strong>Concluir produção</strong><small>Gerar produto acabado</small></div><ArrowRight size={17}/></Link>
              <Link href="/estoque"><span className="action-icon"><Boxes size={21}/></span><div><strong>Transferir estoque</strong><small>Matriz → Resgate</small></div><ArrowRight size={17}/></Link>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-heading"><div><span className="eyebrow">MOVIMENTAÇÃO</span><h2>Últimos movimentos de estoque</h2></div><Link href="/estoque">Ver estoque <ArrowRight size={14}/></Link></div>
            <div className="activity-list">
              {movements.length === 0 && <div className="empty-state">Nenhuma movimentação registrada ainda.</div>}
              {movements.map(m => <div className="activity-row" key={m.id}><span className={`movement-symbol ${outgoing.includes(m.movement_type) ? "out" : "in"}`}>{outgoing.includes(m.movement_type) ? "−" : "+"}</span><div><strong>{m.notes || m.movement_type.replaceAll("_"," ")}</strong><small>{date(m.occurred_at)}</small></div><b>{Number(m.quantity).toLocaleString("pt-BR")}</b></div>)}
            </div>
          </div>
        </div>

        <aside className="dashboard-side-column">
          <div className="attention-card">
            <div className="panel-heading"><div><span className="eyebrow">ATENÇÃO</span><h2>Pendências</h2></div></div>
            <Link href="/financeiro" className={overdue ? "has-alert" : ""}><span><AlertTriangle size={17}/></span><div><strong>Contas vencidas</strong><small>Financeiro</small></div><b>{overdue}</b></Link>
            <Link href="/estoque" className={transfers.length ? "has-alert" : ""}><span><Boxes size={17}/></span><div><strong>Transferências</strong><small>Aguardando conclusão</small></div><b>{transfers.length}</b></Link>
            <Link href="/encomendas" className={orders.length ? "has-alert" : ""}><span><PackageCheck size={17}/></span><div><strong>Encomendas abertas</strong><small>Agenda operacional</small></div><b>{orders.length}</b></Link>
          </div>

          <div className="mini-stats-card">
            <div><span>Produtos ativos</span><strong>{products}</strong></div><div><span>Itens de estoque</span><strong>{stockItems}</strong></div><div><span>Unidades</span><strong>{units.length}</strong></div>
          </div>
        </aside>
      </section>

      <section className="panel-card units-panel">
        <div className="panel-heading"><div><span className="eyebrow">ESTRUTURA</span><h2>Operação por unidade</h2></div></div>
        <div className="unit-grid">{units.map(u => <div className="unit-card" key={u.id}><span className="unit-status"/><div><strong>{u.name}</strong><small>{u.type === "production" ? "Produção · estoque · abastecimento" : "Revenda · recebimento · atendimento"}</small></div><span className="badge ok">Ativa</span></div>)}</div>
      </section>
    </div>
  </AppShell>;
}
