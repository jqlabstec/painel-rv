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

const MOTIVO_QUEBRA = 'Quebra lançada na folha';
/* Quebras: coluna QUEBRAS (R$) da folha, positiva ou negativa, vira desconto do mês */
function quebrasDaFolha(mat, linhas){
  return (linhas||[]).map(l=>Math.abs(FN(l,'QUEBRAS','QUEBRA','VALOR_QUEBRAS')||0)).filter(v=>v>=0.005)
    .map((v,i,a)=>({mat, dataVenda:'', id:'', produto:'Quebra', qtd:1, valor:v, valorVenda:0, motivo:MOTIVO_QUEBRA, quebra:true}));
}
/* Componentes da planilha oficial: colunas de prêmio da operação + ajuste até fechar a PREMIACAO TTOAL */
function componentesPlanilha(op, cargo, linhas){
  const def=COLS_PREMIO[op]||{}, cols=def[cargo]||[], rot=(def.rotulo||{})[cargo]||'Premiação apurada';
  const out=[];
  linhas.forEach(l=>{
    const tot=FN(l,...REF_TOTAL); if(tot===undefined || Math.abs(tot)<0.005) return;   // regional sem valor na planilha: nada a detalhar
    const reg = linhas.length>1? ' · '+(F(l,'REGIONAL')||'') : '';
    let soma=0;
    cols.forEach(([k,lbl,ind])=>{ const v=FN(l,k); if(v){ out.push({ind, label:lbl+reg, detail:'planilha oficial', valor:v, oficial:true}); soma+=v; } });
    const resto=tot-soma;
    if(Math.abs(resto)>=0.005) out.push({label:(soma?'Ajuste da planilha':rot)+reg, detail:soma?'diferença até o total oficial':'planilha oficial', valor:resto, oficial:true});
  });
  if(!out.length) out.push({label:rot, detail:'planilha oficial', valor:0, oficial:true});
  return out;
}

function finalizar(p, op, mes, calc, estornos, rem, ctx, linhas){
  const cargo = cargoKey(p.cargo);
  // indicador desligado no mês não entra no cálculo nem aparece para o colaborador
  const compsCalc = (calc.componentes||[]).filter(c=>!c.ind || ctx.A(c.ind));
  const faixas = (calc.faixas||[]).filter(f=>!f.ind || ctx.A(f.ind));
  const brutoCalc = sum(compsCalc,c=>c.valor);
  const refs = (linhas||[]).map(l=>FN(l,...REF_TOTAL)).filter(v=>v!==undefined);
  const ref = refs.length? sum(refs) : null;
  const oficial = fontePremiacao(mes)==='planilha' && ref!=null;
  const comps = oficial? componentesPlanilha(op, cargo, linhas) : compsCalc;
  const bruto = oficial? ref : brutoCalc;
  // estornos: base de estornos + quebras da folha (as antigas, gravadas na importação, são trocadas pelas da folha)
  const todos = estornos.filter(e=>e.motivo!==MOTIVO_QUEBRA).concat(quebrasDaFolha(norm(p.mat), linhas));
  const jaNaPlanilha = oficial && DB.config.planilhaDescontaQuebras;
  const est = todos.map(e=>{ const v = e.valor>0? e.valor : (calc.estimaEstorno? calc.estimaEstorno(e):0);
    return {...e, valorCalc:v, estimado:!(e.valor>0), quebra:e.motivo===MOTIVO_QUEBRA, jaDescontado: jaNaPlanilha && e.motivo===MOTIVO_QUEBRA}; });
  const estComp = sum(est.filter(e=>!e.jaDescontado),e=>e.valorCalc);
  const quebras = sum(est.filter(e=>e.quebra),e=>e.valorCalc);
  let final = bruto - estComp - rem, saldoProx=0;
  if(final<0){ saldoProx=-final; final=0; }
  return { mat:norm(p.mat), nome:p.nome, op, cargo, sup:p.sup, coord:p.coord, equipe:p.equipe, regiao:p.regiao,
           regional:p.regional, perfil:p.perfil, status:p.status, mes, bruto, brutoCalc, estComp, quebras, rem, final, saldoProx, estornos:est,
           ref, oficial, ind:(linhas||[])[0]||{}, linhas:linhas||[], ...calc, componentes:comps, componentesCalc:compsCalc, faixas };
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
