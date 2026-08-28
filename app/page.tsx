"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  ClipboardList,
  Factory,
  HandCoins,
  ShoppingCart,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type Unit = { id: string; name: string; type: string };
type Revenue = { unit_id: string; revenue_date: string; cash: number; pix: number; debit: number; credit: number; delivery: number; others: number };
type Entry = { amount: number; entry_type: string; status: string; due_date: string | null };
type Transfer = { id: string; status: string };
type Order = { id: string; status: string; pickup_at: string };

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export default function Dashboard() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [products, setProducts] = useState(0);
  const [stockItems, setStockItems] = useState(0);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const ini = new Date();
        ini.setDate(1);
        const start = ini.toISOString().slice(0, 10);
        const [u, r, e, p, s, t, o] = await Promise.all([
          supabase.from("erp_units\").select("id,name,type").eq("active", true).order("name"),
          supabase.from("erp_daily_revenue").select("unit_id,revenue_date,cash,pix,debit,credit,delivery,others").gte("revenue_date", start),
          supabase.from("erp_financial_entries").select("amount,entry_type,status,due_date").neq("status", "cancelled"),
          supabase.from("erp_products").select("id", { count: "exact", head: true }).eq("active", true),
          supabase.from("erp_stock_items").select("id", { count: "exact", head: true }).eq("active", true),
          supabase.from("erp_transfers").select("id,status").in("status", ["draft", "sent", "divergent"]),
          supabase.from("erp_orders").select("id,status,pickup_at").in("status", ["quote", "confirmed", "in_production", "ready"]),
        ]);
        const fail = u.error || r.error || e.error || p.error || s.error || t.error || o.error;
        if (fail) throw fail;
        setUnits((u.data ?? []) as Unit[]);
        setRevenues((r.data ?? []) as Revenue[]);
        setEntries((e.data ?? []) as Entry[]);
        setProducts(p.count ?? 0);
        setStockItems(s.count ?? 0);
        setTransfers((t.data ?? []) as Transfer[]);
        setOrders((o.data ?? []) as Order[]);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao carregar o ERP.");
      }
    })();
  }, []);

  const totalRevenue = useMemo(
    () => revenues.reduce((sum, r) => sum + [r.cash, r.pix, r.debit, r.credit, r.delivery, r.others].reduce((a, b) => a + Number(b || 0), 0), 0),
    [revenues]
  );
  const expenses = useMemo(
    () => entries.filter((e) => e.entry_type === "expense" && e.status === "paid").reduce((s, e) => s + Number(e.amount || 0), 0),
    [entries]
  );
  const overdue = useMemo(
    () => entries.filter((e) => ["forecast", "partial", "overdue"].includes(e.status) && e.due_date && new Date(e.due_date + "T23:59:59") < new Date()).length,
    [entries]
  );
  const result = totalRevenue - expenses;

  return (
    <AppShell>
      <div className="topbar dashboard-header">
        <div>
          <span className="eyebrow">Visão executiva</span>
          <h1>Dashboard</h1>
          <div className="subtitle">Acompanhe o desempenho das duas unidades e o que exige sua atenção hoje.</div>
        </div>
        <div className="dashboard-result">
          <span>Resultado simples</span>
          <strong>{brl(result)}</strong>
          <small>Faturamento menos despesas pagas</small>
        </div>
      </div>

      {erro && <div className="notice error">{erro}</div>}

      <section className="grid4 dashboard-metrics">
        <div className="card metric-card primary"><div className="metric-label">Faturamento do mês</div><div className="metric-value">{brl(totalRevenue)}</div><div className="metric-note">Consolidado das duas unidades</div></div>
        <div className="card metric-card"><div className="metric-label">Despesas pagas</div><div className="metric-value">{brl(expenses)}</div><div className="metric-note">Lançamentos efetivados</div></div>
        <div className={`card metric-card ${overdue ? "attention" : ""}`}><div className="metric-label">Contas vencidas</div><div className="metric-value">{overdue}</div><div className="metric-note">Pendências financeiras</div></div>
        <div className={`card metric-card ${transfers.length ? "attention" : ""}`}><div className="metric-label">Transferências pendentes</div><div className="metric-value">{transfers.length}</div><div className="metric-note">Matriz → Resgate</div></div>
      </section>

      <section className="quick-actions">
        <Link href="/financeiro"><HandCoins size={18} /><div><strong>Lançar faturamento</strong><span>Registrar movimento do dia</span></div><ArrowRight size={16} /></Link>
        <Link href="/compras"><ShoppingCart size={18} /><div><strong>Registrar compra</strong><span>Entrada e atualização do estoque</span></div><ArrowRight size={16} /></Link>
        <Link href="/producao"><Factory size={18} /><div><strong>Concluir produção</strong><span>Baixar insumos e gerar produto</span></div><ArrowRight size={16} /></Link>
        <Link href="/estoque"><Boxes size={18} /><div><strong>Transferir estoque</strong><span>Matriz para Resgate</span></div><ArrowRight size={16} /></Link>
      </section>

      <section className="grid4 secondary-metrics">
        <div className="card"><div className="metric-label">Produtos ativos</div><div className="metric-value">{products}</div><div className="metric-note">Cadastro comercial</div></div>
        <div className="card"><div className="metric-label">Itens de estoque</div><div className="metric-value">{stockItems}</div><div className="metric-note">Insumos, embalagens e revenda</div></div>
        <div className="card"><div className="metric-label">Encomendas abertas</div><div className="metric-value">{orders.length}</div><div className="metric-note">Agenda operacional</div></div>
        <div className="card"><div className="metric-label">Unidades ativas</div><div className="metric-value">{units.length}</div><div className="metric-note">{units.map((u) => u.name).join(" · ") || "—"}</div></div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Operação por unidade</h2>
            <div className="subtitle">Papéis definidos para evitar mistura de estoque e produção.</div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Unidade</th><th>Perfil</th><th>Responsabilidade</th><th>Status</th></tr></thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.type === "production" ? "Produção" : "Revenda"}</td>
                  <td>{u.type === "production" ? "Produz, armazena e abastece" : "Recebe, armazena e revende"}</td>
                  <td><span className="badge ok">Ativa</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
