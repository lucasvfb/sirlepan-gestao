"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes, Building2, ChevronDown, ClipboardList, Factory, FileBarChart,
  HandCoins, LayoutDashboard, LogOut, Menu, PackageSearch, Settings,
  ShoppingCart, Store, Users, X
} from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

const links = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/financeiro", label: "Financeiro", icon: HandCoins },
  { href: "/compras", label: "Compras", icon: ShoppingCart },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/producao", label: "Produção", icon: Factory },
  { href: "/produtos", label: "Produtos", icon: PackageSearch },
  { href: "/fornecedores", label: "Fornecedores", icon: Building2 },
  { href: "/pessoas", label: "Pessoas", icon: Users },
  { href: "/encomendas", label: "Encomendas", icon: ClipboardList },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/configuracao", label: "Configurações", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabaseConfigured()) { if (active) { setErro("Supabase não configurado."); setLoading(false); } return; }
      try {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("O Supabase demorou demais para responder.")), 8000)),
        ]);
        if (!active) return;
        if (!result.data.session) { router.replace("/login"); return; }
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setErro(e instanceof Error ? e.message : "Não foi possível abrir o ERP.");
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [router]);

  async function sair() { await supabase.auth.signOut(); router.replace("/login"); }
  const current = links.find(x => x.href === pathname) ?? links[0];

  if (loading) return <main className="boot-screen"><div className="boot-mark">S</div><strong>ERP Sirlepan</strong></main>;
  if (erro) return <main className="login-page"><section className="login-box"><h1>Não foi possível abrir o sistema</h1><div className="notice error">{erro}</div></section></main>;

  const Sidebar = () => <>
    <div className="ref-brand">
      <div className="ref-emblem"><span>S</span></div>
      <div className="ref-wordmark">SIRLEPAN</div>
      <div className="ref-since">— 2007 —</div>
    </div>

    <nav className="ref-nav" aria-label="Navegação principal">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return <Link key={href} href={href} className={active ? "active" : ""}>
          <Icon size={20} strokeWidth={1.9}/><span>{label}</span>
        </Link>;
      })}
    </nav>

    <div className="ref-sidebar-copy">
      <span>COMPRAS NA NOTA E VALES</span>
      <p>Uma padaria de bairro,<br/>feita para você!</p>
    </div>

    <div className="ref-admin">
      <div className="ref-admin-avatar">A</div>
      <div><strong>Administrador</strong><span>Gestão Sirlepan</span></div>
    </div>
    <button className="ref-logout" onClick={sair}><LogOut size={19}/> Sair do sistema</button>
  </>;

  return <>
    <header className="ref-mobile-top">
      <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={23}/></button>
      <strong>SIRLEPAN</strong>
      <button onClick={sair} aria-label="Sair"><LogOut size={20}/></button>
    </header>

    {mobileOpen && <div className="ref-mobile-backdrop" onClick={() => setMobileOpen(false)}>
      <aside className="ref-mobile-drawer" onClick={e => e.stopPropagation()}>
        <button className="ref-mobile-close" onClick={() => setMobileOpen(false)}><X size={20}/></button>
        <Sidebar/>
      </aside>
    </div>}

    <div className="ref-shell">
      <aside className="ref-sidebar"><Sidebar/></aside>
      <section className="ref-workspace">
        <header className="ref-topbar">
          <div className="ref-page-title"><current.icon size={22}/><h1>{current.label}</h1></div>
          <div className="ref-top-actions">
            <div className="ref-unit"><Store size={17}/><span>Unidade: Todas</span><ChevronDown size={16}/></div>
            <div className="ref-status"><i/>Sistema online</div>
          </div>
        </header>
        <main className="ref-content">{children}</main>
      </section>
    </div>
  </>;
}
