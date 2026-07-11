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
      window.location.href = "/";
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-box">
        <h1>Sirlepan Gestão</h1>
        <p>Entre para acessar compras, produtos e fornecedores.</p>

        <form className="form" onSubmit={entrar}>
          <div>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="senha">Senha</label>
            <input id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          {erro && <div className="error">{erro}</div>}
          <button className="button" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
