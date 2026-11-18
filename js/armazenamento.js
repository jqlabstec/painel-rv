/* =====================================================================
   Armazenamento: tudo em um único JSON, sem banco relacional.
   - Modo nuvem (js/config.js preenchido): a apuração publicada fica no Supabase.
     Colaboradores sempre leem a versão publicada. O master trabalha num
     rascunho no próprio navegador e clica em "Publicar apuração".
   - Modo local (config em branco): lê rv.json da pasta do site.
   ===================================================================== */
let DB = null;            // { versao, atualizadoEm, demo, config, hc:[], meses:{ 'AAAA-MM': {vendas,estornos,indicadores,importadoEm} } }
let DB_PUBLICADO = null;  // cópia do que os colaboradores veem
let PUBLICADO = null;     // { em, por, versaoDados } da última publicação
let RASCUNHO = null;      // base local do master, se for mais nova que a publicada
let ERRO_NUVEM = null;
const LS='painelrv.db.v1';

function emptyDB(){ return { versao:1, atualizadoEm:new Date().toISOString(), demo:false, config:clone(DEFAULT_CONFIG), hc:[], meses:{} }; }
function saveLocal(){ DB.atualizadoEm=new Date().toISOString(); try{ localStorage.setItem(LS, JSON.stringify(DB)); }catch(e){ console.warn('localStorage indisponível',e); } CACHE={}; }
function prepararDB(db){
  if(db.demo && (db.config||{}).versaoRegras!==VERSAO_REGRAS) db=gerarDemo();
  db.config = Object.assign(clone(DEFAULT_CONFIG), db.config||{});
  // regras salvas de uma versão antiga do painel são trocadas pelas novas tabelas padrão
  if(db.config.versaoRegras!==VERSAO_REGRAS){ db.config.rules=clone(DEFAULT_RULES); db.config.versaoRegras=VERSAO_REGRAS; }
  db.config.rules = Object.assign(clone(DEFAULT_RULES), db.config.rules||{});
  db.config.indicadores = db.config.indicadores||{};
  return db;
}
async function loadDB(){
  let pub=null, local=null;
  if(NUVEM.ativa){
    try{ const r=await NUVEM.ler(); if(r&&r.data){ pub=r.data; PUBLICADO={em:r.atualizado_em, por:r.atualizado_por, versaoDados:r.data.atualizadoEm}; } }
    catch(e){ ERRO_NUVEM=e.message; }
  } else {
    try{ const r=await fetch('rv.json',{cache:'no-store'}); if(r.ok){ pub=await r.json(); PUBLICADO={em:pub.atualizadoEm, por:'rv.json', versaoDados:pub.atualizadoEm}; } }catch(e){}
  }
  try{ const s=localStorage.getItem(LS); if(s) local=JSON.parse(s); }catch(e){}
  if(!pub) pub = NUVEM.ativa ? emptyDB() : (local||gerarDemo());
  DB_PUBLICADO = prepararDB(pub);
  RASCUNHO = local && (!PUBLICADO || new Date(local.atualizadoEm) > new Date(PUBLICADO.versaoDados)) ? prepararDB(local) : null;
  DB = clone(DB_PUBLICADO);
  // sem nuvem, o navegador do master continua vendo a própria base mais nova (comportamento anterior)
  if(!NUVEM.ativa && RASCUNHO) DB = RASCUNHO;
}
/* Master entra: trabalha no rascunho local se ele for mais novo que o publicado */
function usarBaseMaster(){
  try{ const s=localStorage.getItem(LS); if(s){ const l=JSON.parse(s); if(!PUBLICADO || new Date(l.atualizadoEm)>new Date(PUBLICADO.versaoDados)) DB=prepararDB(l); } }catch(e){}
  CACHE={};
}
/* Sai do master: volta para o que os colaboradores veem */
function usarBasePublicada(){ if(NUVEM.ativa){ DB=clone(DB_PUBLICADO); CACHE={}; } }
function temAlteracaoNaoPublicada(){ return !PUBLICADO || new Date(DB.atualizadoEm) > new Date(PUBLICADO.versaoDados); }
async function publicarApuracao(){
  const r = await NUVEM.publicar(DB);
  PUBLICADO = {em:r.em, por:r.por, versaoDados:DB.atualizadoEm};
  DB_PUBLICADO = clone(DB); RASCUNHO = DB;
  return r;
}
