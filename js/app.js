/* =====================================================================
   App: estado de sessão/tela, roteamento entre login, colaborador e master.
   ===================================================================== */
let SESSION = null;       // { tipo:'master'|'colab', mat }
let UI = { mes:null, tab:'resumo', mtab:'geral', op:'todas', busca:'', sort:{k:'final',d:-1}, vendasN:40, verComo:null };

function tema(t){ const r=document.documentElement.style; r.setProperty('--c',t.c); r.setProperty('--c2',t.c2); r.setProperty('--soft',t.soft); }
function render(){
  const app=$('#app');
  if(!SESSION){ tema(MASTER_THEME); app.innerHTML=viewLogin(); bindLogin(); return; }
  const ms=mesesDisponiveis(); if(!UI.mes||!DB.meses[UI.mes]) UI.mes=ms[ms.length-1]||null;
  if(SESSION.tipo==='master' && !UI.verComo){ tema(MASTER_THEME); app.innerHTML=viewMaster(); bindMaster(); return; }
  const mat = UI.verComo || SESSION.mat;
  const p = hcMap()[norm(mat)]; if(!p){ SESSION=null; render(); return; }
  tema(OPS[opKey(p.op)]||MASTER_THEME);
  app.innerHTML=viewColab(p); bindColab();
}

/* Seletor de competência (usado nas duas telas) */
function mesSelect(){
  const ms=mesesDisponiveis().slice().reverse();
  if(!ms.length) return `<span class="pill">Sem apuração</span>`;
  return `<span class="pill">▦ Apuração <select id="selMes">${ms.map(m=>`<option value="${m}" ${m===UI.mes?'selected':''}>${mesCurto(m)}</option>`).join('')}</select></span>`;
}

/* ---------- Início ---------- */
(async function(){
  await loadDB();
  try{ const s=sessionStorage.getItem('painelrv.sess'); if(s) SESSION=JSON.parse(s); }catch(e){}
  if(SESSION&&SESSION.tipo==='master'){ if(NUVEM.ativa&&!NUVEM.logado()) SESSION=null; else usarBaseMaster(); }
  render();
})();
