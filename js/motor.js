/* =====================================================================
   Motor de apuração (genérico). As regras de cada operação ficam em
   js/operacoes/*.js; aqui só orquestramos:
   promotores → gestores → estornos → remanescentes (saldo para o mês seguinte)

   Fontes de dados por competência (DB.meses['AAAA-MM']):
   - indicadores: uma linha por pessoa (folha consolidada). Gestor com mais de
     uma regional pode ter várias linhas: cada uma é apurada e os valores somam.
   - vendas / estornos: detalhe opcional, venda a venda.
   ===================================================================== */
let CACHE={};
function mesesDisponiveis(){ return Object.keys(DB.meses).sort(); }
function hcMap(){ const m={}; DB.hc.forEach(p=>m[norm(p.mat)]=p); return m; }

function apurar(mes){
  if(CACHE[mes]) return CACHE[mes];
  const meses = mesesDisponiveis().filter(m=>m<=mes);
  let rem = {};             // saldo negativo carregado por matrícula
  let out = null;
  for(const m of meses){ out = apurarMes(m, rem); rem = {}; Object.values(out.pessoas).forEach(r=>{ if(r.saldoProx>0) rem[r.mat]=r.saldoProx; }); CACHE[m]=out; }
  return out || {mes, pessoas:{}};
}

const REF_TOTAL = ['PREMIACAO_TTOAL','PREMIACAO_TOTAL','RV_TOTAL','TOTAL_RV'];   // total calculado na planilha (conferência)

function apurarMes(mes, remPrev){
  const dados = DB.meses[mes]||{vendas:[],estornos:[],indicadores:[]};
  const R = DB.config.rules;
  const by = (arr)=>{ const m={}; (arr||[]).forEach(x=>{ const k=norm(x.mat); (m[k]=m[k]||[]).push(x); }); return m; };
  const V=by(dados.vendas), E=by(dados.estornos), IL=by(dados.indicadores);
  const I={}; Object.entries(IL).forEach(([k,l])=>I[k]=l[0]);
  const ctxs={}; const ctx=op=>ctxs[op]||(ctxs[op]=ctxIndicadores(op,mes));
  const pessoas={};
  // 1) promotores
  DB.hc.forEach(p=>{
    if(cargoKey(p.cargo)!=='promotor') return;
    const k=norm(p.mat), op=opKey(p.op); if(!op||!CALC[op]) return;
    const vendas=(V[k]||[]), ind=I[k]||{};
    const calc = CALC[op](p, vendas, ind, R[op], ctx(op));
    pessoas[k]=finalizar(p, op, mes, calc, E[k]||[], remPrev[k]||0, ctx(op), IL[k]);
  });
  // 2) supervisores e coordenadores (bônus de equipe)
  DB.hc.forEach(p=>{
    const cg=cargoKey(p.cargo); if(cg==='promotor') return;
    const k=norm(p.mat), op=opKey(p.op); if(!op) return;
    const campo = cg==='supervisor'?'sup':'coord';
    const time = DB.hc.filter(x=>cargoKey(x.cargo)==='promotor' && opKey(x.op)===op && (norm(x[campo])===norm(p.nome)||norm(x[campo])===k));
    const calc = calcGestor(p, op, cg, time, pessoas, IL[k]||[], R[op], ctx(op));
    pessoas[k]=finalizar(p, op, mes, calc, E[k]||[], remPrev[k]||0, ctx(op), IL[k]);
  });
  return {mes, pessoas};
}

function finalizar(p, op, mes, calc, estornos, rem, ctx, linhas){
  // indicador desligado no mês não entra no total nem aparece para o colaborador
  const comps = (calc.componentes||[]).filter(c=>!c.ind || ctx.A(c.ind));
  const faixas = (calc.faixas||[]).filter(f=>!f.ind || ctx.A(f.ind));
  const est = estornos.map(e=>{ const v = e.valor>0? e.valor : (calc.estimaEstorno? calc.estimaEstorno(e):0); return {...e, valorCalc:v, estimado:!(e.valor>0)}; });
  const estComp = sum(est,e=>e.valorCalc);
  const bruto = sum(comps,c=>c.valor);
  let final = bruto - estComp - rem, saldoProx=0;
  if(final<0){ saldoProx=-final; final=0; }
  const refs = (linhas||[]).map(l=>FN(l,...REF_TOTAL)).filter(v=>v!==undefined);
  return { mat:norm(p.mat), nome:p.nome, op, cargo:cargoKey(p.cargo), sup:p.sup, coord:p.coord, equipe:p.equipe, regiao:p.regiao,
           regional:p.regional, perfil:p.perfil, status:p.status, mes, bruto, estComp, rem, final, saldoProx, estornos:est,
           ref: refs.length? sum(refs) : null, ind:(linhas||[])[0]||{}, linhas:linhas||[], ...calc, componentes:comps, faixas };
}

/* Gestor (supervisor/coordenador): usa a regra da operação se existir.
   Várias linhas na folha (ex.: supervisora com 2 regionais) → apura cada uma e soma. */
function calcGestor(p, op, cg, time, pessoas, linhas, R, ctx){
  const tm = time.map(x=>pessoas[norm(x.mat)]).filter(Boolean);
  const base = { qtdVendas:sum(tm,x=>x.qtdVendas||0), vendasDet:[], estimaEstorno:()=>0,
    time:tm.map(x=>({mat:x.mat,nome:x.nome,qtd:x.qtdVendas,final:x.final,bruto:x.bruto,est:x.estComp})) };
  if(!GESTOR[op]) return {...base, componentes:[{label:'Bônus de gestão', detail:'sem regra cadastrada para esta operação', valor:0}], faixas:[]};
  const rows = linhas.length? linhas : [{}];
  const partes = rows.map(row=>{
    const reg = F(row,'REGIONAL');
    const timeReg = rows.length>1 && reg ? time.filter(x=>norm(x.regional||x.regiao)===norm(reg)) : time;
    const tmReg = timeReg.map(x=>pessoas[norm(x.mat)]).filter(Boolean);
    return { reg, r: GESTOR[op](p, cg, tmReg, timeReg, row, R, ctx) };
  }).filter(x=>x.r);
  if(!partes.length) return {...base, componentes:[{label:'Bônus de gestão', detail:'sem regra para este cargo', valor:0}], faixas:[]};
  if(partes.length===1) return {...base, ...partes[0].r};
  return {...base,
    componentes: partes.flatMap(({reg,r})=>(r.componentes||[]).map(c=>({...c, label:`${c.label} · ${reg}`}))),
    faixas: partes.flatMap(({reg,r})=>(r.faixas||[]).map(f=>({...f, titulo:`${f.titulo} · ${reg}`}))) };
}
