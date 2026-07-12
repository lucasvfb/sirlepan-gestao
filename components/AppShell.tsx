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
  const [erro, setErro] = useState("");

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
          )
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
    return <div className="empty">Carregando...</div>;
  }

  if (erro) {
    return (
      <main className="login-page">
        <section className="login-box">
          <div className="logo-circle">S</div>
          <h1 style={{ marginTop: 16 }}>Não foi possível abrir o sistema</h1>
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

  return (
    <>
      <div className="mobile-top">
        <strong>Sirlepan Gestão</strong>
        <button className="button ghost" onClick={sair}>
          Sair
        </button>
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
                style={{
                  background:
                    pathname === href ? "rgba(255,255,255,.13)" : undefined
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            className="button ghost"
            style={{ marginTop: 24, width: "100%" }}
            onClick={sair}
          >
            Sair
          </button>
        </aside>

        <main className="main">{children}</main>
      </div>
    </>
  );
}
