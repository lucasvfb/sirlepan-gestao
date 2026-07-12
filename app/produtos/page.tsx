"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import AppShell from "@/components/AppShell";
import {supabase} from "@/lib/supabase";

type Categoria={id:string;nome:string};
type Produto={id:string;nome:string;marca:string|null;unidade:string;preco_custo_atual:number;preco_venda:number;ativo:boolean;categoria_id:string|null;categorias:{nome:string}|null};
type Historico={produto_id:string;preco_novo:number};

const brl=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);

export default function Produtos(){
  const[lista,setLista]=useState<Produto[]>([]);
  const[categorias,setCategorias]=useState<Categoria[]>([]);
  const[historico,setHistorico]=useState<Historico[]>([]);
  const[busca,setBusca]=useState("");
  const[editandoId,setEditandoId]=useState<string|null>(null);
  const[nome,setNome]=useState("");
  const[marca,setMarca]=useState("");
  const[unidade,setUnidade]=useState("UN");
  const[categoria,setCategoria]=useState("");
  const[precoVenda,setPrecoVenda]=useState(0);
  const[msg,setMsg]=useState("");
  const[erro,setErro]=useState("");

  async function carregar(){
    const[p,c,h]=await Promise.all([
      supabase.from("produtos").select("id,nome,marca,unidade,preco_custo_atual,preco_venda,ativo,categoria_id,categorias(nome)").order("nome"),
      supabase.from("categorias").select("id,nome").eq("ativa",true).order("nome"),
      supabase.from("historico_precos").select("produto_id,preco_novo").limit(5000)
    ]);
    const falha=p.error||c.error||h.error;if(falha)throw falha;
    setLista((p.data??[]) as unknown as Produto[]);
    setCategorias(c.data??[]);
    setHistorico((h.data??[]) as Historico[]);
  }

  useEffect(()=>{carregar().catch(e=>setErro(e instanceof Error?e.message:"Erro ao carregar produtos."))},[]);

  const filtrados=useMemo(()=>{
    const termo=busca.toLowerCase();
    return lista.filter(p=>[p.nome,p.marca??"",p.categorias?.nome??"",p.unidade].join(" ").toLowerCase().includes(termo));
  },[lista,busca]);

  function stats(id:string,custo:number){
    const precos=historico.filter(h=>h.produto_id===id).map(h=>Number(h.preco_novo));
    if(!precos.length)return{medio:custo,menor:custo,maior:custo};
    return{medio:precos.reduce((a,b)=>a+b,0)/precos.length,menor:Math.min(...precos),maior:Math.max(...precos)};
  }

  function limpar(){setEditandoId(null);setNome("");setMarca("");setUnidade("UN");setCategoria("");setPrecoVenda(0)}

  function editar(p:Produto){
    setEditandoId(p.id);setNome(p.nome);setMarca(p.marca??"");setUnidade(p.unidade);setCategoria(p.categoria_id??"");setPrecoVenda(Number(p.preco_venda||0));window.scrollTo({top:0,behavior:"smooth"});
  }

  async function salvar(e:FormEvent){
    e.preventDefault();setErro("");setMsg("");
    const payload={nome:nome.trim(),marca:marca.trim()||null,unidade:unidade.toUpperCase(),categoria_id:categoria||null,preco_venda:Number(precoVenda||0)};
    const r=editandoId?await supabase.from("produtos").update(payload).eq("id",editandoId):await supabase.from("produtos").insert(payload);
    if(r.error){setErro(r.error.message);return}
    setMsg(editandoId?"Produto atualizado.":"Produto cadastrado.");limpar();await carregar();
  }

  async function alternar(p:Produto){
    const{error}=await supabase.from("produtos").update({ativo:!p.ativo}).eq("id",p.id);
    if(error)setErro(error.message);else await carregar();
  }

  return <AppShell>
    <div className="topbar"><div><h1>Produtos</h1><div className="subtitle">Custo atual, média, menor preço, maior preço e margem.</div></div></div>
    <section className="form-card"><h2>{editandoId?"Editar produto":"Novo produto"}</h2><form onSubmit={salvar}>
      <div className="form-grid">
        <label>Nome<input value={nome} onChange={e=>setNome(e.target.value)} required/></label>
        <label>Marca<input value={marca} onChange={e=>setMarca(e.target.value)}/></label>
        <label>Categoria<select value={categoria} onChange={e=>setCategoria(e.target.value)}><option value="">Sem categoria</option>{categorias.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
        <label>Unidade<input value={unidade} onChange={e=>setUnidade(e.target.value)}/></label>
        <label>Preço de venda<input type="number" min="0" step="0.01" value={precoVenda} onChange={e=>setPrecoVenda(Number(e.target.value))}/></label>
      </div>
      {erro&&<div className="notice error">{erro}</div>}{msg&&<div className="notice success">{msg}</div>}
      <div className="actions">{editandoId&&<button type="button" className="button ghost" onClick={limpar}>Cancelar</button>}<button className="button">Salvar</button></div>
    </form></section>
    <section className="section"><div className="section-head"><h2>Produtos cadastrados</h2><input style={{maxWidth:380}} value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Pesquisar produto..."/></div>
      <div className="table-wrap"><table className="table"><thead><tr><th>Produto</th><th>Categoria</th><th>Custo atual</th><th>Médio</th><th>Menor</th><th>Maior</th><th>Venda</th><th>Margem</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {filtrados.map(p=>{const custo=Number(p.preco_custo_atual||0),venda=Number(p.preco_venda||0),margem=custo>0?((venda-custo)/custo)*100:0,s=stats(p.id,custo);return <tr key={p.id}>
          <td><strong>{p.nome}</strong><div className="metric-note">{p.marca||p.unidade}</div></td><td>{p.categorias?.nome??"—"}</td><td>{brl(custo)}</td><td>{brl(s.medio)}</td><td>{brl(s.menor)}</td><td>{brl(s.maior)}</td><td>{brl(venda)}</td><td>{margem.toFixed(1)}%</td><td><span className={`badge ${p.ativo?"ok":"bad"}`}>{p.ativo?"Ativo":"Inativo"}</span></td>
          <td><div style={{display:"flex",gap:8}}><button className="button secondary" onClick={()=>editar(p)}>Editar</button><button className="button ghost" onClick={()=>alternar(p)}>{p.ativo?"Desativar":"Ativar"}</button></div></td>
        </tr>})}
      </tbody></table>{!filtrados.length&&<div className="empty">Nenhum produto encontrado.</div>}</div>
    </section>
  </AppShell>
}
