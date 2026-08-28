"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes, Building2, ChevronRight, ClipboardList, Factory, FileBarChart,
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
    async function verify() {
      if (!supabaseConfigured()) { if (active) { setErro("Supabase não configurado."); setLoading(false); } return; }
      try {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("O Supabase demorou demais para responder.")), 8000))
        ]);
        if (!active) return;
        if (!result.data.session) { router.replace("/login"); return; }
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setErro(e instanceof Error ? e.message : "Não foi possível verificar a sessão.");
        setLoading(false);
      }
    }
    verify();
    return () => { active = false; };
  }, [pathname, router]);

  async function sair() { await supabase.auth.signOut(); router.replace("/login"); }

  if (loading) return <main className="boot-screen"><div className="boot-mark">S</div><div className="boot-copy"><strong>Sirlepan</strong><span>Carregando gestão...</span></div></main>;
  if (erro) return <main className="login-page"><section className="login-box"><div className="login-marca">S</div><h1>Não foi possível abrir o sistema</h1><div className="notice error">{erro}</div><button className="button" style={{width:"100%"}} onClick={()=>router.replace("/login")}>Ir para o login</button></section></main>;

  const current = links.find(i => i.href === pathname) ?? links[0];

  const NavContent = () => <>
    <div className="sirlepan-wordmark">
      <div className="sirlepan-seal">S</div>
      <strong>SIRLEPAN</strong>
      <span>2007</span>
    </div>
    <div className="sidebar-rule" />
    <nav className="nav reference-nav" aria-label="Navegação principal">
      {links.map(({href,label,icon:Icon}) => {
        const active = pathname === href;
        return <Link key={href} href={href} className={active ? "active" : ""}>
          <Icon size={19} strokeWidth={active ? 2.2 : 1.8}/><span>{label}</span>{["/financeiro","/compras"].includes(href)&&<ChevronRight size={15} className="nav-chevron"/>}
        </Link>
      })}
    </nav>
    <div className="sidebar-promo">
      <span>COMPRAS NA NOTA E VALES</span>
      <p>Uma padaria de bairro,<br/>feita para você!</p>
    </div>
    <div className="sidebar-footer reference-footer">
      <div className="admin-card"><div className="admin-avatar">A</div><div><strong>Administrador</strong><span>Gestão Sirlepan</span></div></div>
      <button className="sidebar-logout" onClick={sair}><LogOut size={18}/>Sair do sistema</button>
    </div>
  </>;

  return <>
    <header className="mobile-top">
      <button className="mobile-menu-button" aria-label="Abrir menu" onClick={()=>setMobileOpen(true)}><Menu size={22}/></button>
      <div className="mobile-brand"><div className="brand-mark small">S</div><div><strong>Sirlepan</strong><span>{current.label}</span></div></div>
      <button className="mobile-logout" aria-label="Sair" onClick={sair}><LogOut size={19}/></button>
    </header>
    {mobileOpen && <div className="mobile-drawer-backdrop" onClick={()=>setMobileOpen(false)}><aside className="mobile-drawer reference-drawer" onClick={e=>e.stopPropagation()}><button className="mobile-drawer-close" aria-label="Fechar menu" onClick={()=>setMobileOpen(false)}><X size={20}/></button><NavContent/></aside></div>}
    <div className="shell reference-shell">
      <aside className="sidebar reference-sidebar"><NavContent/></aside>
      <main className="main reference-main">
        <div className="reference-topline">
          <div><span className="reference-kicker">SIRLEPAN ERP</span><strong>{current.label}</strong></div>
          <div className="unit-pill"><Store size={16}/><span>Matriz + Resgate</span></div>
        </div>
        {children}
      </main>
    </div>
  </>;
}
