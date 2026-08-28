"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import AppShell from "@/components/AppShell";
import {supabase} from "@/lib/supabase";

type Supplier={id:string;name:string;document:string|null;contact:string|null;average_term_days:number;notes:string|null;active:boolean};
export default function Fornecedores(){
 const[list,setList]=useState<Supplier[]>([]),[search,setSearch]=useState("");const[name,setName]=useState(""),[document,setDocument]=useState(""),[contact,setContact]=useState(""),[term,setTerm]=useState(0),[notes,setNotes]=useState(""),[msg,setMsg]=useState(""),[erro,setErro]=useState("");
 async function load(){const{data,error}=await supabase.from("erp_suppliers").select("id,name,document,contact,average_term_days,notes,active").order("name");if(error)throw error;setList((data??[]) as Supplier[])}
 useEffect(()=>{load().catch(e=>setErro(e.message))},[]);
 const filtered=useMemo(()=>list.filter(x=>[x.name,x.document||"",x.contact||""].join(" ").toLowerCase().includes(search.toLowerCase())),[list,search]);
 async function save(e:FormEvent){e.preventDefault();setErro("");const{error}=await supabase.from("erp_suppliers").insert({name,document:document||null,contact:contact||null,average_term_days:term,notes:notes||null});if(error)setErro(error.message);else{setMsg("Fornecedor cadastrado.");setName("");setDocument("");setContact("");setTerm(0);setNotes("");await load()}}
 async function toggle(s:Supplier){const{error}=await supabase.from("erp_suppliers").update({active:!s.active}).eq("id",s.id);if(error)setErro(error.message);else await load()}
 return <AppShell><div className="topbar"><div><h1>Fornecedores</h1><div className="subtitle">Cadastro para compras e análise de prazo.</div></div></div>{erro&&<div className="notice error">{erro}</div>}{msg&&<div className="notice success">{msg}</div>}
 <form className="form-card" onSubmit={save}><h2>Novo fornecedor</h2><div className="form-grid"><label>Nome<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>CNPJ/CPF<input value={document} onChange={e=>setDocument(e.target.value)}/></label><label>Contato<input value={contact} onChange={e=>setContact(e.target.value)}/></label><label>Prazo médio (dias)<input type="number" min="0" value={term} onChange={e=>setTerm(Number(e.target.value))}/></label></div><label style={{marginTop:14}}>Observações<textarea value={notes} onChange={e=>setNotes(e.target.value)}/></label><div className="actions"><button className="button">Cadastrar fornecedor</button></div></form>
 <section className="section"><div className="section-head"><h2>Fornecedores cadastrados</h2><input style={{maxWidth:380}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar..."/></div><div className="table-wrap"><table className="table"><thead><tr><th>Fornecedor</th><th>Documento</th><th>Contato</th><th>Prazo</th><th>Status</th><th>Ação</th></tr></thead><tbody>{filtered.map(s=><tr key={s.id}><td><strong>{s.name}</strong></td><td>{s.document||"—"}</td><td>{s.contact||"—"}</td><td>{s.average_term_days||0} dias</td><td>{s.active?"Ativo":"Inativo"}</td><td><button className="button ghost" onClick={()=>toggle(s)}>{s.active?"Desativar":"Ativar"}</button></td></tr>)}</tbody></table>{!filtered.length&&<div className="empty">Nenhum fornecedor cadastrado.</div>}</div></section></AppShell>
}
