"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event: FormEvent) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const { configured } = getSupabasePublicConfig();
      if (!configured) throw new Error("A chave pública do Supabase não foi configurada.");

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) throw error;
      if (!data.session) throw new Error("O Supabase não retornou uma sessão de acesso.");

      await new Promise((resolve) => setTimeout(resolve, 300));
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      const destino = redirect && redirect.startsWith("/") ? redirect : "/";
      window.location.assign(destino);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar. Confira o e-mail e a senha."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-box">
        <div className="login-marca">S</div>
        <span className="eyebrow">Gestão interna</span>
        <h1>ERP Sirlepan</h1>
        <p>Controle as duas unidades em uma única operação, com dados centralizados e acesso seguro.</p>

        <form className="form" onSubmit={entrar}>
          <div>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
          </div>

          {erro && <div className="notice error">{erro}</div>}

          <button className="button login-botao" disabled={carregando}>
            <LockKeyhole size={16} />
            {carregando ? "Validando acesso..." : "Entrar no ERP"}
          </button>
        </form>

        <div className="login-security">
          <ShieldCheck size={16} />
          <div>
            <strong>Acesso administrativo protegido</strong>
            <span>Sessão autenticada e dados protegidos por políticas de acesso.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
