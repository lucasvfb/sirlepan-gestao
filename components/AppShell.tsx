"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes,
  Building2,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardList,
  Factory,
  FileBarChart,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  Settings,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let ativo = true;
    async function verificarSessao() {
      if (!supabaseConfigured()) {
        if (ativo) {
          setErro("As variáveis do Supabase não foram configuradas na Vercel.");
          setLoading(false);
        }
        return;
      }
      try {
        const resultado = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, rejeitar) =>
            setTimeout(
              () => rejeitar(new Error("O Supabase demorou demais para responder.")),
              8000
            )
          ),
        ]);
        if (!ativo) return;
        if (!resultado.data.session) {
          router.replace("/login");
          return;
        }
        setLoading(false);
      } catch (error) {
        if (!ativo) return;
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível verificar a sessão."
        );
        setLoading(false);
      }
    }
    verificarSessao();
    return () => {
      ativo = false;
    };
  }, [pathname, router]);

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="boot-screen">
        <div className="boot-mark">S</div>
        <div className="boot-copy">
          <strong>ERP Sirlepan</strong>
          <span>Preparando sua área de gestão...</span>
        </div>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="login-page">
        <section className="login-box">
          <div className="login-marca">S</div>
          <span className="eyebrow">ERP Sirlepan</span>
          <h1>Não foi possível abrir o sistema</h1>
          <div className="notice error">{erro}</div>
          <button
            className="button"
            style={{ width: "100%" }}
            onClick={() => router.replace("/login")}
          >
            Ir para o login
          </button>
        </section>
      </main>
    );
  }

  const current = links.find((item) => item.href === pathname) ?? links[0];

  const NavContent = () => (
    <>
      <div className="sidebar-brand">
        <div className="brand-mark">S</div>
        <div>
          <div className="brand">Sirlepan</div>
          <div className="tag">ERP de Gestão</div>
        </div>
      </div>

      <div className="sidebar-context">
        <Store size={16} />
        <div>
          <span>Operação</span>
          <strong>Matriz + Resgate</strong>
        </div>
      </div>

      <nav className="nav" aria-label="Navegação principal">
        <span className="nav-label">GESTÃO</span>
        {links.slice(0, 9).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={active ? "active" : ""}>
              <Icon size={18} strokeWidth={active ? 2.3 : 1.9} />
              <span>{label}</span>
              {active && <ChevronRight className="nav-chevron" size={16} />}
            </Link>
          );
        })}

        <span className="nav-label nav-label-secondary">ANÁLISE & SISTEMA</span>
        {links.slice(9).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={active ? "active" : ""}>
              <Icon size={18} strokeWidth={active ? 2.3 : 1.9} />
              <span>{label}</span>
              {active && <ChevronRight className="nav-chevron" size={16} />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-dot" />
          <div>
            <strong>Sistema online</strong>
            <span>Dados sincronizados</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={sair}>
          <LogOut size={17} />
          Sair do ERP
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="mobile-top">
        <button
          className="mobile-menu-button"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>
        <div className="mobile-brand">
          <div className="brand-mark small">S</div>
          <div>
            <strong>ERP Sirlepan</strong>
            <span>{current.label}</span>
          </div>
        </div>
        <button className="mobile-logout" aria-label="Sair" onClick={sair}>
          <LogOut size={19} />
        </button>
      </header>

      {mobileOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileOpen(false)}>
          <aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <button
              className="mobile-drawer-close"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      <div className="shell">
        <aside className="sidebar">
          <NavContent />
        </aside>

        <main className="main">
          <div className="page-context-bar">
            <div className="page-context-icon">
              <current.icon size={18} />
            </div>
            <span>ERP Sirlepan</span>
            <ChevronRight size={14} />
            <strong>{current.label}</strong>
          </div>
          {children}
        </main>
      </div>
    </>
  );
}
