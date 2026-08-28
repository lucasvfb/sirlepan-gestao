"use client";
import {useEffect,useState} from "react";
import AppShell from "@/components/AppShell";
import {supabase,supabaseConfigured} from "@/lib/supabase";

type Unit={id:string;name:string;type:string;address:string|null;active:boolean};
export default function Configuracao(){
 const[units,setUnits]=useState<Unit[]>([]),[backup,setBackup]=useState(0),[status,setStatus]=useState("Verificando..."),[erro,setErro]=useState("");
 useEffect(()=>{(async()=>{try{if(!supabaseConfigured()){setStatus("Variáveis do Supabase ausentes.");return}const[u,b]=await Promise.all([supabase.from("erp_units").select("id,name,type,address,active").order("name"),supabase.from("erp_legacy_backup").select("id",{count:"exact",head:true})]);const f=u.error||b.error;if(f)throw f;setUnits((u.data??[]) as Unit[]);setBackup(b.count??0);setStatus("Conexão com o ERP funcionando.")}catch(e){setErro(e instanceof Error?e.message:"Falha no diagnóstico.");setStatus("Falha na conexão.")}})()},[]);
 return <AppShell><div className="topbar"><div><h1>Configurações</h1><div className="subtitle">Diagnóstico, unidades e proteção do legado.</div></div></div>{erro&&<div className="notice error">{erro}</div>}
 <section className="grid4"><div className="card"><div className="metric-label">Banco</div><div className="metric-value" style={{fontSize:22}}>{status}</div></div><div className="card"><div className="metric-label">Unidades</div><div className="metric-value">{units.length}</div></div><div className="card"><div className="metric-label">Backups legados</div><div className="metric-value">{backup}</div><div className="metric-note">Dados antigos preservados fora da operação ativa</div></div></section>
 <section className="section"><div className="section-head"><h2>Unidades configuradas</h2></div><div className="table-wrap"><table className="table"><thead><tr><th>Unidade</th><th>Tipo</th><th>Endereço</th><th>Status</th></tr></thead><tbody>{units.map(u=><tr key={u.id}><td><strong>{u.name}</strong></td><td>{u.type==="production"?"Produção":"Revenda"}</td><td>{u.address||"—"}</td><td>{u.active?"Ativa":"Inativa"}</td></tr>)}</tbody></table></div></section>
 <div className="notice success">O ERP opera em uma base limpa. O sistema anterior permanece arquivado para consulta histórica e não participa dos totais do ERP.</div></AppShell>
}
