"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export default function ConfiguracaoPage() {
  const [status, setStatus] = useState("Verificando...");
  const config = getSupabasePublicConfig();

  useEffect(() => {
    async function verificar() {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("lojas").select("id").limit(1);
        if (error) throw error;
        setStatus("Conexão com o Supabase funcionando.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Falha na conexão.");
      }
    }
    verificar();
  }, []);

  return (
    <main className="login-page">
      <section className="login-box">
        <h1>Diagnóstico</h1>
        <p><strong>URL:</strong> {config.url}</p>
        <p><strong>Chave pública:</strong> {config.key ? "Encontrada" : "Não encontrada"}</p>
        <div className={config.key ? "badge" : "error"}>{status}</div>
        <p><Link href="/login">Voltar para o login</Link></p>
      </section>
    </main>
  );
}
