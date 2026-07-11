"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (error) throw error;

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      window.location.href =
        redirect && redirect.startsWith("/") ? redirect : "/";
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
        <h1>Sirlepan Gestão</h1>
        <p>Acesso restrito à equipe autorizada.</p>

        <form className="form" onSubmit={entrar}>
          <div>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={event => setSenha(event.target.value)}
              required
            />
          </div>

          {erro && <div className="error">{erro}</div>}

          <button className="button login-botao" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <small className="login-ajuda">
          Os usuários são cadastrados pelo administrador no Supabase.
        </small>
      </section>
    </main>
  );
}
