"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./fornecedores.css";

type Fornecedor = {
  id: string;
  nome: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  ativo: boolean;
};

export default function FornecedoresPage() {
  const [lista, setLista] = useState<Fornecedor[]>([]);
  const [busca, setBusca] = useState("");
  const [nome, setNome] = useState("");
  const [fantasia, setFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("fornecedores").select("id,nome,nome_fantasia,cnpj,telefone,whatsapp,email,ativo").order("nome");
      if (error) throw error;
      setLista(data ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar os fornecedores.");
    }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter(f => [f.nome, f.nome_fantasia ?? "", f.cnpj ?? ""].some(v => v.toLowerCase().includes(termo)));
  }, [lista, busca]);

  function limpar() {
    setNome(""); setFantasia(""); setCnpj(""); setTelefone(""); setWhatsapp(""); setEmail(""); setEditandoId(null);
  }

  function editar(f: Fornecedor) {
    setNome(f.nome); setFantasia(f.nome_fantasia ?? ""); setCnpj(f.cnpj ?? ""); setTelefone(f.telefone ?? "");
    setWhatsapp(f.whatsapp ?? ""); setEmail(f.email ?? ""); setEditandoId(f.id); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(""); setAviso("");
    if (!nome.trim()) return setErro("Informe o nome do fornecedor.");
    setSalvando(true);
    try {
      const supabase = createClient();
      const payload = {
        nome: nome.trim(),
        nome_fantasia: fantasia.trim() || null,
        cnpj: cnpj.trim() || null,
        telefone: telefone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null
      };
      const r = editandoId
        ? await supabase.from("fornecedores").update(payload).eq("id", editandoId)
        : await supabase.from("fornecedores").insert(payload);
      if (r.error) throw r.error;
      setAviso(editandoId ? "Fornecedor atualizado com sucesso." : "Fornecedor cadastrado com sucesso.");
      limpar(); await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o fornecedor.");
    } finally { setSalvando(false); }
  }

  async function alternar(f: Fornecedor) {
    const supabase = createClient();
    const { error } = await supabase.from("fornecedores").update({ ativo: !f.ativo }).eq("id", f.id);
    if (error) setErro(error.message); else carregar();
  }

  return (
    <main className="fornecedores-page">
      <header className="fornecedores-topo">
        <div><Link href="/">← Dashboard</Link><Link className="sair-link" href="/logout">Sair</Link><h1>Fornecedores</h1><p>Centralize os contatos e os dados de quem abastece a Sirlepan.</p></div>
        <div className="contador">{lista.filter(f => f.ativo).length} ativos</div>
      </header>

      <section className="fornecedor-card">
        <h2>{editandoId ? "Editar fornecedor" : "Novo fornecedor"}</h2>
        <form className="fornecedor-form" onSubmit={salvar}>
          <label>Razão social/nome<input value={nome} onChange={e => setNome(e.target.value)} /></label>
          <label>Nome fantasia<input value={fantasia} onChange={e => setFantasia(e.target.value)} /></label>
          <label>CNPJ<input value={cnpj} onChange={e => setCnpj(e.target.value)} /></label>
          <label>Telefone<input value={telefone} onChange={e => setTelefone(e.target.value)} /></label>
          <label>WhatsApp<input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} /></label>
          <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <div className="form-acoes">
            {editandoId && <button type="button" className="cancelar" onClick={limpar}>Cancelar</button>}
            <button className="salvar" disabled={salvando}>{salvando ? "Salvando..." : editandoId ? "Atualizar" : "Cadastrar"}</button>
          </div>
        </form>
        {erro && <div className="mensagem erro">{erro}</div>}
        {aviso && <div className="mensagem sucesso">{aviso}</div>}
      </section>

      <section className="fornecedor-card">
        <div className="lista-topo"><h2>Fornecedores cadastrados</h2><input className="busca" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar fornecedor..." /></div>
        <div className="tabela-wrap">
          <table>
            <thead><tr><th>Fornecedor</th><th>CNPJ</th><th>Telefone</th><th>WhatsApp</th><th>E-mail</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {filtrados.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.nome_fantasia || f.nome}</strong><small>{f.nome_fantasia ? f.nome : ""}</small></td>
                  <td>{f.cnpj || "—"}</td><td>{f.telefone || "—"}</td><td>{f.whatsapp || "—"}</td><td>{f.email || "—"}</td>
                  <td><span className={`status ${f.ativo ? "ativo" : "inativo"}`}>{f.ativo ? "Ativo" : "Inativo"}</span></td>
                  <td className="acoes-tabela"><button onClick={() => editar(f)}>Editar</button><button onClick={() => alternar(f)}>{f.ativo ? "Desativar" : "Ativar"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtrados.length && <div className="vazio">Nenhum fornecedor encontrado.</div>}
        </div>
      </section>
    </main>
  );
}
