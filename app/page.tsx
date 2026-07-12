"use client";
import {useEffect,useMemo,useState} from "react";
import AppShell from "@/components/AppShell";
import {supabase} from "@/lib/supabase";

type Compra={id:string;data_compra:string;valor_total:number;fornecedores:{nome:string}|null;lojas:{nome:string}|null};
type Produto={id:string;ativo:boolean;preco_custo_atual:number;preco_venda:number};
type Historico={id:string;variacao_percentual:number|null;preco_anterior:number|null;preco_novo:number;produtos:{nome:string}|null};

const brl=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);

export default function Dashboard(){
  const[compras,setCompras]=useState<Compra[]>([]);
  const[produtos,setProdutos]=useState<Produto[]>([]);
  const[fornecedores,setFornecedores]=useState(0);
  const[historico,setHistorico]=useState<Historico[]>([]);
  const[erro,setErro]=useState("");

  useEffect(()=>{(async()=>{
    try{
      const inicio=new Date();inicio.setDate(1);
      const[c,p,f,h]=await Promise.all([
        supabase.from("compras").select("id,data_compra,valor_total,fornecedores(nome),lojas(nome)").gte("data_compra",inicio.toISOString().slice(0,10)).order("data_compra",{ascending:false}),
        supabase.from("produtos").select("id,ativo,preco_custo_atual,preco_venda"),
        supabase.from("fornecedores").select("id",{count:"exact",head:true}).eq("ativo",true),
        supabase.from("historico_precos").select("id,variacao_percentual,preco_anterior,preco_novo,produtos(nome)").order("data_registro",{ascending:false}).limit(100)
      ]);
      const falha=c.error||p.error||f.error||h.error;if(falha)throw falha;
      setCompras((c.data??[]) as unknown as Compra[]);
      setProdutos((p.data??[]) as Produto[]);
      setFornecedores(f.count??0);
      setHistorico((h.data??[]) as unknown as Historico[]);
    }catch(e){setErro(e instanceof Error?e.message:"Erro ao carregar o dashboard.")}
  })()},[]);

  const total=useMemo(()=>compras.reduce((s,c)=>s+Number(c.valor_total||0),0),[compras]);
  const margem=useMemo(()=>{
    const validos=produtos.filter(p=>Number(p.preco_custo_atual)>0&&Number(p.preco_venda)>0);
    return validos.length?validos.reduce((s,p)=>s+((Number(p.preco_venda)-Number(p.preco_custo_atual))/Number(p.preco_custo_atual))*100,0)/validos.length:0;
  },[produtos]);
  const aumentos=[...historico].filter(h=>Number(h.variacao_percentual||0)>0).sort((a,b)=>Number(b.variacao_percentual||0)-Number(a.variacao_percentual||0)).slice(0,5);

  return <AppShell>
    <div className="topbar"><div><h1>Visão geral</h1><div className="subtitle">Acompanhe compras, custos e margens da Sirlepan.</div></div></div>
    {erro&&<div className="notice error">{erro}</div>}
    <section className="grid4">
      <div className="card"><div className="metric-label">Compras no mês</div><div className="metric-value">{brl(total)}</div><div className="metric-note">{compras.length} lançamento(s)</div></div>
      <div className="card"><div className="metric-label">Produtos ativos</div><div className="metric-value">{produtos.filter(p=>p.ativo).length}</div><div className="metric-note">Itens disponíveis</div></div>
      <div className="card"><div className="metric-label">Fornecedores ativos</div><div className="metric-value">{fornecedores}</div><div className="metric-note">Cadastrados na base</div></div>
      <div className="card"><div className="metric-label">Margem média</div><div className="metric-value">{margem.toFixed(1)}%</div><div className="metric-note">Com base nos preços atuais</div></div>
    </section>
    <section className="section"><div className="section-head"><h2>Compras recentes</h2></div><div className="table-wrap">
      <table className="table"><thead><tr><th>Data</th><th>Fornecedor</th><th>Loja</th><th>Total</th></tr></thead><tbody>
        {compras.slice(0,8).map(c=><tr key={c.id}><td>{new Date(`${c.data_compra}T12:00:00`).toLocaleDateString("pt-BR")}</td><td>{c.fornecedores?.nome??"—"}</td><td>{c.lojas?.nome??"—"}</td><td><strong>{brl(Number(c.valor_total))}</strong></td></tr>)}
      </tbody></table>{!compras.length&&<div className="empty">Nenhuma compra registrada.</div>}
    </div></section>
    <section className="section"><div className="section-head"><h2>Produtos com maior aumento</h2></div><div className="card">
      {aumentos.map(h=><div key={h.id} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #eee7e2"}}>
        <div><strong>{h.produtos?.nome??"Produto"}</strong><div className="metric-note">{brl(Number(h.preco_anterior||0))} → {brl(Number(h.preco_novo))}</div></div>
        <strong style={{color:"#a2233e"}}>+{Number(h.variacao_percentual||0).toFixed(1)}%</strong>
      </div>)}{!aumentos.length&&<div className="empty">Sem variações registradas.</div>}
    </div></section>
  </AppShell>
}
