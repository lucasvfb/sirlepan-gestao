"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, CircleDollarSign, FileDown, FileText, Plus, Send, TriangleAlert } from "lucide-react";
import AppShell from "@/components/AppShell";
import "./cotacoes.css";

type QuoteItem={name:string;qty:number;unit:string;tiago?:number;vilario?:number;valter?:number;warning?:string};
const items:QuoteItem[]=[
{name:"Fubá",qty:4,unit:"Saco 25 kg",tiago:71.25,valter:69.99},
{name:"Goiabada",qty:4,unit:"Balde",tiago:33.95,vilario:33,valter:36.69},
{name:"Pasta Dinó",qty:4,unit:"Unidade"},
{name:"Zarpan",qty:4,unit:"Unidade"},
{name:"Fermento químico",qty:10,unit:"Unidade — confirmar peso",tiago:15.49,vilario:27.9,valter:23.85,warning:"Apresentação ainda não confirmada"},
{name:"Corogema",qty:2,unit:"Unidade",vilario:40,valter:24.09},
{name:"Creme de cebola",qty:4,unit:"kg",vilario:38,valter:37.74},
{name:"Creme de batata",qty:4,unit:"kg",vilario:28.9,valter:32.883},
{name:"Queijo ralado",qty:3,unit:"kg",vilario:51,valter:52.239},
{name:"Óleo de soja",qty:40,unit:"Unidade (2 caixas c/20)",tiago:7.4,valter:9.25},
];
const money=(v?:number)=>v==null?"—":new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const suppliers=[["Tiago Reis","tiago"],["Vilário","vilario"],["Valter","valter"]] as const;
export default function Cotacoes(){
 const [tab,setTab]=useState<"comparativo"|"solicitacao">("comparativo");
 const comparable=items.filter(x=>!x.warning);
 const savings=useMemo(()=>comparable.reduce((sum,item)=>{const values=suppliers.map(([,k])=>item[k]).filter((v):v is number=>typeof v==="number");return values.length>1?sum+(Math.max(...values)-Math.min(...values))*item.qty:sum},0),[]);
 const pending=items.filter(x=>!suppliers.some(([,k])=>typeof x[k]==="number")||x.warning).length;
 const best=(item:QuoteItem)=>{if(item.warning)return "";const offers=suppliers.map(([name,k])=>({name,value:item[k]})).filter(x=>typeof x.value==="number") as {name:string;value:number}[];if(!offers.length)return "";return offers.sort((a,b)=>a.value-b.value)[0].name};
 return <AppShell>
  <div className="quote-hero"><div><span className="eyebrow">COMPRAS · COTAÇÕES</span><h1>Cotação COT-2026-0001</h1><p>Compare propostas, trate pendências e transforme os vencedores em ordens de compra.</p></div><div className="quote-actions"><Link className="button" href="/cotacoes/nova"><Plus size={17}/> Nova cotação</Link><Link className="button ghost" href="/cotacoes/solicitacao"><FileText size={17}/> Solicitação</Link><button className="button" onClick={()=>window.print()}><FileDown size={17}/> PDF / Imprimir</button></div></div>
  <section className="quote-metrics"><div className="card metric-card primary"><div className="metric-label">Itens solicitados</div><div className="metric-value">{items.length}</div><div className="metric-note">Cotação em andamento</div></div><div className="card metric-card"><div className="metric-label">Fornecedores</div><div className="metric-value">3</div><div className="metric-note">Tiago, Vilário e Valter</div></div><div className="card metric-card"><div className="metric-label">Pendências</div><div className="metric-value">{pending}</div><div className="metric-note">Sem preço ou apresentação divergente</div></div><div className="card metric-card"><div className="metric-label">Economia potencial</div><div className="metric-value">{money(savings)}</div><div className="metric-note">Entre ofertas comparáveis</div></div></section>
  <div className="quote-tabs"><button className={tab==="comparativo"?"active":""} onClick={()=>setTab("comparativo")}>Comparativo</button><button className={tab==="solicitacao"?"active":""} onClick={()=>setTab("solicitacao")}>Resumo da solicitação</button></div>
  {tab==="comparativo"?<section className="section"><div className="section-head"><div><h2>Comparativo de preços</h2><div className="subtitle">O menor preço só é marcado quando unidade e apresentação são comparáveis.</div></div><Link className="button" href="/cotacoes/ordem"><CheckCircle2 size={17}/> Aprovar e gerar ordem</Link></div><div className="table-wrap"><table className="table quote-table"><thead><tr><th>Produto</th><th>Qtd.</th><th>Apresentação</th>{suppliers.map(([n])=><th key={n}>{n}</th>)}<th>Melhor opção</th></tr></thead><tbody>{items.map(item=>{const winner=best(item);return <tr key={item.name} className={item.warning?"needs-review":""}><td><strong>{item.name}</strong>{item.warning&&<span className="row-warning"><TriangleAlert size={13}/>{item.warning}</span>}</td><td>{item.qty}</td><td>{item.unit}</td>{suppliers.map(([n,k])=><td key={n} className={winner===n?"best-price":""}>{money(item[k])}</td>)}<td>{winner?<span className="winner"><CheckCircle2 size={14}/>{winner}</span>:<span className="pending">Pendente</span>}</td></tr>})}</tbody></table></div></section>:<section className="section request-summary"><div><span className="eyebrow">SOLICITAÇÃO</span><h2>Lista enviada aos fornecedores</h2><p>O documento não exibe preços concorrentes. Cada fornecedor recebe apenas os itens, quantidades e campos necessários para responder.</p></div><div className="request-list">{items.map((x,i)=><div key={x.name}><span>{String(i+1).padStart(2,"0")}</span><strong>{x.name}</strong><small>{x.qty} × {x.unit}</small></div>)}</div></section>}
  <section className="quote-flow"><div><Send size={18}/><strong>Próxima etapa</strong><span>Enviar solicitação por WhatsApp ou e-mail e registrar o retorno.</span></div><div><CircleDollarSign size={18}/><strong>Depois</strong><span>Aprovar vencedores e gerar uma ordem de compra por fornecedor.</span></div><div><Plus size={18}/><strong>Banco futuro</strong><span>Estrutura preparada para persistência multiempresa sem alterar o Supabase atual.</span></div></section>
 </AppShell>
}