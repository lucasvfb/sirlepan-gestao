"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import AppShell from "@/components/AppShell";
import {supabase} from "@/lib/supabase";

type O={id:string;nome:string};
type P=O&{unidade:string;preco_custo_atual:number};
type I={produto_id:string;quantidade:number;unidade:string;valor_unitario:number};
type C={id:string;data_compra:string;numero_documento:string|null;valor_total:number;status:string;fornecedor_id:string|null;loja_id:string;fornecedores:{nome:string}|null;lojas:{nome:string}|null};
const vazio:I={produto_id:"",quantidade:1,unidade:"UN",valor_unitario:0};
const brl=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);

export default function Compras(){
  const[lojas,setLojas]=useState<O[]>([]),[fornecedores,setFornecedores]=useState<O[]>([]),[produtos,setProdutos]=useState<P[]>([]),[compras,setCompras]=useState<C[]>([]);
  const[loja,setLoja]=useState(""),[fornecedor,setFornecedor]=useState(""),[data,setData]=useState(new Date().toISOString().slice(0,10)),[documento,setDocumento]=useState(""),[frete,setFrete]=useState(0),[desconto,setDesconto]=useState(0),[itens,setItens]=useState<I[]>([{...vazio}]);
  const[fLoja,setFLoja]=useState(""),[fFornecedor,setFFornecedor]=useState(""),[fInicio,setFInicio]=useState(""),[fFim,setFFim]=useState(""),[busca,setBusca]=useState("");
  const[msg,setMsg]=useState(""),[erro,setErro]=useState(""),[salvando,setSalvando]=useState(false);

  async function carregarBase(){
    const[l,f,p]=await Promise.all([
      supabase.from("lojas").select("id,nome").eq("ativa",true).order("nome"),
      supabase.from("fornecedores").select("id,nome").eq("ativo",true).order("nome"),
      supabase.from("produtos").select("id,nome,unidade,preco_custo_atual").eq("ativo",true).order("nome")
    ]);
    const falha=l.error||f.error||p.error;if(falha)throw falha;
    setLojas(l.data??[]);setFornecedores(f.data??[]);setProdutos((p.data??[]) as P[]);
    if(!loja&&l.data?.[0])setLoja(l.data[0].id);
  }

  async function carregarCompras(){
    let q=supabase.from("compras").select("id,data_compra,numero_documento,valor_total,status,fornecedor_id,loja_id,fornecedores(nome),lojas(nome)").order("data_compra",{ascending:false}).limit(200);
    if(fLoja)q=q.eq("loja_id",fLoja);if(fFornecedor)q=q.eq("fornecedor_id",fFornecedor);if(fInicio)q=q.gte("data_compra",fInicio);if(fFim)q=q.lte("data_compra",fFim);
    const{data,error}=await q;if(error)throw error;setCompras((data??[]) as unknown as C[]);
  }

  useEffect(()=>{Promise.all([carregarBase(),carregarCompras()]).catch(e=>setErro(e instanceof Error?e.message:"Erro ao carregar compras."))},[]);

  const subtotal=useMemo(()=>itens.reduce((s,i)=>s+Number(i.quantidade||0)*Number(i.valor_unitario||0),0),[itens]);
  const total=Math.max(0,subtotal+frete-desconto);
  const filtradas=useMemo(()=>compras.filter(c=>[c.numero_documento??"",c.fornecedores?.nome??"",c.lojas?.nome??""].join(" ").toLowerCase().includes(busca.toLowerCase())),[compras,busca]);

  function alterar(indice:number,campo:keyof I,valor:string|number){
    setItens(lista=>lista.map((item,i)=>{if(i!==indice)return item;const novo={...item,[campo]:valor} as I;if(campo==="produto_id"){const p=produtos.find(p=>p.id===valor);if(p){novo.unidade=p.unidade||"UN";novo.valor_unitario=Number(p.preco_custo_atual||0)}}return novo}));
  }

  function limpar(){setFornecedor("");setDocumento("");setFrete(0);setDesconto(0);setItens([{...vazio}]);setData(new Date().toISOString().slice(0,10))}

  async function salvar(e:FormEvent){
    e.preventDefault();setErro("");setMsg("");
    const validos=itens.filter(i=>i.produto_id&&i.quantidade>0);
    if(!loja||!fornecedor||!validos.length){setErro("Selecione loja, fornecedor e ao menos um produto.");return}
    setSalvando(true);
    try{
      const{data:compra,error}=await supabase.from("compras").insert({loja_id:loja,fornecedor_id:fornecedor,numero_documento:documento.trim()||null,data_compra:data,valor_produtos:subtotal,valor_frete:frete,valor_desconto:desconto,valor_total:total,status:"paga"}).select("id").single();
      if(error)throw error;
      const r=await supabase.from("itens_compra").insert(validos.map(i=>({compra_id:compra.id,produto_id:i.produto_id,quantidade:i.quantidade,unidade:i.unidade,valor_unitario:i.valor_unitario,valor_total:i.quantidade*i.valor_unitario})));
      if(r.error){await supabase.from("compras").delete().eq("id",compra.id);throw r.error}
      setMsg("Compra registrada com sucesso.");limpar();await carregarCompras();
    }catch(e){setErro(e instanceof Error?e.message:"Erro ao salvar compra.")}finally{setSalvando(false)}
  }

  async function excluir(c:C){
    if(!window.confirm(`Excluir a compra ${c.numero_documento||"sem número"}?`))return;
    const{error}=await supabase.from("compras").delete().eq("id",c.id);
    if(error)setErro(error.message);else{setMsg("Compra excluída.");await carregarCompras()}
  }

  return <AppShell>
    <div className="topbar"><div><h1>Compras</h1><div className="subtitle">Cadastre notas e consulte os lançamentos.</div></div><div className="card"><div className="metric-label">Total da nova compra</div><div className="metric-value">{brl(total)}</div></div></div>
    <form onSubmit={salvar}>
      <section className="form-card"><h2>Dados da compra</h2><div className="form-grid">
        <label>Loja<select value={loja} onChange={e=>setLoja(e.target.value)}><option value="">Selecione</option>{lojas.map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></label>
        <label>Fornecedor<select value={fornecedor} onChange={e=>setFornecedor(e.target.value)}><option value="">Selecione</option>{fornecedores.map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></label>
        <label>Data<input type="date" value={data} onChange={e=>setData(e.target.value)}/></label>
        <label>Número da nota<input value={documento} onChange={e=>setDocumento(e.target.value)}/></label>
      </div></section>
      <section className="form-card"><div className="section-head"><h2>Produtos</h2><button type="button" className="button secondary" onClick={()=>setItens(a=>[...a,{...vazio}])}>+ Adicionar produto</button></div>
        {itens.map((it,i)=><div className="form-grid" key={i} style={{marginBottom:12}}>
          <label>Produto<select value={it.produto_id} onChange={e=>alterar(i,"produto_id",e.target.value)}><option value="">Selecione</option>{produtos.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
          <label>Quantidade<input type="number" min="0.001" step="0.001" value={it.quantidade} onChange={e=>alterar(i,"quantidade",Number(e.target.value))}/></label>
          <label>Unidade<input value={it.unidade} onChange={e=>alterar(i,"unidade",e.target.value.toUpperCase())}/></label>
          <label>Valor unitário<input type="number" min="0" step="0.01" value={it.valor_unitario} onChange={e=>alterar(i,"valor_unitario",Number(e.target.value))}/></label>
          <div><div className="metric-label">Subtotal</div><strong>{brl(it.quantidade*it.valor_unitario)}</strong></div>
          <button type="button" className="button ghost" onClick={()=>setItens(a=>a.length===1?[{...vazio}]:a.filter((_,x)=>x!==i))}>Remover</button>
        </div>)}
      </section>
      <section className="form-card"><div className="form-grid"><label>Frete<input type="number" min="0" step="0.01" value={frete} onChange={e=>setFrete(Number(e.target.value))}/></label><label>Desconto<input type="number" min="0" step="0.01" value={desconto} onChange={e=>setDesconto(Number(e.target.value))}/></label></div>
        {erro&&<div className="notice error">{erro}</div>}{msg&&<div className="notice success">{msg}</div>}
        <div className="actions"><button type="button" className="button ghost" onClick={limpar}>Limpar</button><button className="button" disabled={salvando}>{salvando?"Salvando...":"Registrar compra"}</button></div>
      </section>
    </form>
    <section className="section"><div className="section-head"><h2>Compras cadastradas</h2></div>
      <div className="form-card"><div className="form-grid">
        <label>Loja<select value={fLoja} onChange={e=>setFLoja(e.target.value)}><option value="">Todas</option>{lojas.map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></label>
        <label>Fornecedor<select value={fFornecedor} onChange={e=>setFFornecedor(e.target.value)}><option value="">Todos</option>{fornecedores.map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></label>
        <label>Data inicial<input type="date" value={fInicio} onChange={e=>setFInicio(e.target.value)}/></label>
        <label>Data final<input type="date" value={fFim} onChange={e=>setFFim(e.target.value)}/></label>
      </div><div className="actions"><button type="button" className="button ghost" onClick={()=>{setFLoja("");setFFornecedor("");setFInicio("");setFFim("");setBusca("");setTimeout(carregarCompras,0)}}>Limpar filtros</button><button type="button" className="button" onClick={()=>carregarCompras().catch(e=>setErro(e.message))}>Aplicar filtros</button></div></div>
      <div className="section-head"><input style={{maxWidth:380}} value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Pesquisar nota, loja ou fornecedor..."/></div>
      <div className="table-wrap"><table className="table"><thead><tr><th>Data</th><th>Nota</th><th>Fornecedor</th><th>Loja</th><th>Status</th><th>Total</th><th>Ações</th></tr></thead><tbody>
        {filtradas.map(c=><tr key={c.id}><td>{new Date(`${c.data_compra}T12:00:00`).toLocaleDateString("pt-BR")}</td><td>{c.numero_documento||"—"}</td><td>{c.fornecedores?.nome||"—"}</td><td>{c.lojas?.nome||"—"}</td><td><span className="badge ok">{c.status}</span></td><td><strong>{brl(Number(c.valor_total))}</strong></td><td><button className="button ghost" onClick={()=>excluir(c)}>Excluir</button></td></tr>)}
      </tbody></table>{!filtradas.length&&<div className="empty">Nenhuma compra encontrada.</div>}</div>
    </section>
  </AppShell>
}
