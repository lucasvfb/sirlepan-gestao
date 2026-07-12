"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

const links = [
  ["/", "Dashboard"],
  ["/compras", "Compras"],
  ["/produtos", "Produtos"],
  ["/fornecedores", "Fornecedores"],
  ["/relatorios", "Relatórios"],
  ["/configuracoes", "Configurações"]
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session && pathname !== "/login") {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    });
  }, [pathname, router]);

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) return <div className="empty">Carregando...</div>;

  return (
    <>
      <div className="mobile-top">
        <strong>Sirlepan Gestão</strong>
        <button className="button ghost" onClick={sair}>Sair</button>
      </div>

      <div className="shell">
        <aside className="sidebar">
          <div className="brand">Sirlepan Gestão</div>
          <div className="tag">Compras, custos e fornecedores</div>

          <nav className="nav">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                style={{ background: pathname === href ? "rgba(255,255,255,.13)" : undefined }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button className="button ghost" style={{ marginTop: 24, width: "100%" }} onClick={sair}>
            Sair
          </button>
        </aside>

        <main className="main">{children}</main>
      </div>
    </>
  );
}
