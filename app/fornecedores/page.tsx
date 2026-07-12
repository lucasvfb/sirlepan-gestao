"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import AppShell from "@/components/AppShell";
import {supabase} from "@/lib/supabase";

type F={id:string;nome:string;nome_fantasia:string|null;cnpj:string|null;telefone:string|null;whatsapp:string|null;email:string|null;cidade:string|null;observacoes:string|null;ativo:boolean};

export default function Fornecedores(){
  const[lista,setLista]=useState<F[]>([]);const[busca,setBusca]=useState("");const[id,setId]=useState<string|null>(null);
  const[nome,setNome]=useState("");const[fantasia,setFantasia]=useState("");const[cnpj,setCnpj]=useState("");const[telefone,setTelefone]=useState("");const[whatsapp,setWhatsapp]=useState("");const[email,setEmail]=useState("");const[cidade,setCidade]=useState("");const[observacoes,setObservacoes]=useState("");
  const[msg,setMsg]=useState("");const[erro,setErro]=useState("");

  async function carregar(){const{data,error}=await supabase.from("fornecedores").select("id,nome,nome_fantasia,cnpj,telefone,whatsapp,email,cidade,observacoes,ativo").order("nome");if(error)throw error;setLista((data??[]) as F[])}
  useEffect(()=>{carregar().catch(e=>setErro(e instanceof Error?e.message:"Erro ao carregar fornecedores."))},[]);
  const filtrados=useMemo(()=>lista.filter(f=>[f.nome,f.nome_fantasia??"",f.cnpj??"",f.cidade??"",f.whatsapp??""].join(" ").toLowerCase().includes(busca.toLowerCase())),[lista,busca]);
  function limpar(){setId(null);setNome("");setFantasia("");setCnpj("");setTelefone("");setWhatsapp("");setEmail("");setCidade("");setObservacoes("")}
  function editar(f:F){setId(f.id);setNome(f.nome);setFantasia(f.nome_fantasia??"");setCnpj(f.cnpj??"");setTelefone(f.telefone??"");setWhatsapp(f.whatsapp??"");setEmail(f.email??"");setCidade(f.cidade??"");setObservacoes(f.observacoes??"");window.scrollTo({top:0,behavior:"smooth"})}
  async function salvar(e:FormEvent){e.preventDefault();setErro("");setMsg("");const payload={nome:nome.trim(),nome_fantasia:fantasia.trim()||null,cnpj:cnpj.trim()||null,telefone:telefone.trim()||null,whatsapp:whatsapp.trim()||null,email:email.trim()||null,cidade:cidade.trim()||null,observacoes:observacoes.trim()||null};const r=id?await supabase.from("fornecedores").update(payload).eq("id",id):await supabase.from("fornecedores").insert(payload);if(r.error){setErro(r.error.message);return}setMsg(id?"Fornecedor atualizado.":"Fornecedor cadastrado.");limpar();await carregar()}
  async function alternar(f:F){const{error}=await supabase.from("fornecedores").update({ativo:!f.ativo}).eq("id",f.id);if(error)setErro(error.message);else await carregar()}

  return <AppShell>
    <div className="topbar"><div><h1>Fornecedores</h1><div className="subtitle">Contatos e dados de quem abastece a Sirlepan.</div></div></div>
    <section className="form-card"><h2>{id?"Editar fornecedor":"Novo fornecedor"}</h2><form onSubmit={salvar}>
      <div className="form-grid">
        <label>Razão social/nome<input value={nome} onChange={e=>setNome(e.target.value)} required/></label>
        <label>Nome fantasia<input value={fantasia} onChange={e=>setFantasia(e.target.value)}/></label>
        <label>CNPJ<input value={cnpj} onChange={e=>setCnpj(e.target.value)}/></label>
        <label>Cidade<input value={cidade} onChange={e=>setCidade(e.target.value)}/></label>
        <label>Telefone<input value={telefone} onChange={e=>setTelefone(e.target.value)}/></label>
        <label>WhatsApp<input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)}/></label>
        <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      </div>
      <label style={{marginTop:14}}>Observações<textarea value={observacoes} onChange={e=>setObservacoes(e.target.value)}/></label>
      {erro&&<div className="notice error">{erro}</div>}{msg&&<div className="notice success">{msg}</div>}
      <div className="actions">{id&&<button type="button" className="button ghost" onClick={limpar}>Cancelar</button>}<button className="button">Salvar</button></div>
    </form></section>
    <section className="section"><div className="section-head"><h2>Fornecedores cadastrados</h2><input style={{maxWidth:380}} value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Pesquisar fornecedor..."/></div>
      <div className="table-wrap"><table className="table"><thead><tr><th>Fornecedor</th><th>CNPJ</th><th>Cidade</th><th>WhatsApp</th><th>E-mail</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {filtrados.map(f=><tr key={f.id}><td><strong>{f.nome_fantasia||f.nome}</strong><div className="metric-note">{f.nome_fantasia?f.nome:""}</div></td><td>{f.cnpj||"—"}</td><td>{f.cidade||"—"}</td><td>{f.whatsapp||"—"}</td><td>{f.email||"—"}</td><td><span className={`badge ${f.ativo?"ok":"bad"}`}>{f.ativo?"Ativo":"Inativo"}</span></td><td><div style={{display:"flex",gap:8}}><button className="button secondary" onClick={()=>editar(f)}>Editar</button><button className="button ghost" onClick={()=>alternar(f)}>{f.ativo?"Desativar":"Ativar"}</button></div></td></tr>)}
      </tbody></table>{!filtrados.length&&<div className="empty">Nenhum fornecedor encontrado.</div>}</div>
    </section>
  </AppShell>
}
