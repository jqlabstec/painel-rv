/* =====================================================================
   PAINEL RV · núcleo
   Registro das operações + utilidades usadas por todos os arquivos.
   Ordem de carga (index.html): nucleo → operacoes/* → armazenamento →
   motor → importacao → demo → telas/* → app
   ===================================================================== */

/* ---------- Registro de operações ----------
   Cada arquivo em js/operacoes/ chama registrarOperacao(chave, def) com:
   - nome, sub, c, c2, soft  → nome e cores do ambiente
   - aliases                 → como a operação aparece nas planilhas (MAIÚSCULO, sem acento)
   - regras                  → tabelas de faixas (padrão; o master pode editar)
   - calcularPromotor(p, vendas, ind, R) → { qtdVendas, componentes, vendasDet, faixas, estimaEstorno, ... }
   - calcularGestor(p, cargo, timeRes, timeHC, I, R) (opcional) → bônus de supervisor/coordenador
   - telaRegras(R, tabela)   → HTML das tabelas na aba "Regras" do master
   - indicadores             → lista dos indicadores que o master liga/desliga por mês
                               [{id, cargo:'promotor'|'supervisor'|'coordenador', nome, desc, padrao}]
   - campos                  → colunas da folha mostradas ao colaborador {promotor:[[COLUNA,rótulo,formato]], supervisor:[...]}
*/
const OPS = {};            // metadados de cada operação
const DEFAULT_RULES = {};  // regras padrão por operação
const CALC = {};           // cálculo do promotor por operação
const GESTOR = {};         // cálculo de supervisor/coordenador por operação
const TELA_REGRAS = {};    // tabelas exibidas na aba Regras
const IND_DEF = {};        // indicadores disponíveis por operação
const CAMPOS = {};         // colunas da folha exibidas por cargo
const COLS_PREMIO = {};    // colunas de prêmio da planilha oficial, por cargo
const MASTER_THEME = { c:'#18181b', c2:'#3f3f46', soft:'#f4f4f5' };
const VERSAO_REGRAS = 2;   // suba quando mudar regras padrão: força a recarga das tabelas salvas
const DEFAULT_CONFIG = { masterKey:'MASTER2026', versaoRegras:VERSAO_REGRAS, rules: DEFAULT_RULES, indicadores:{} };

function registrarOperacao(chave, def){
  OPS[chave] = { nome:def.nome, sub:def.sub, c:def.c, c2:def.c2, soft:def.soft, aliases:def.aliases||[] };
  DEFAULT_RULES[chave] = def.regras;
  CALC[chave] = def.calcularPromotor;
  if(def.calcularGestor) GESTOR[chave] = def.calcularGestor;
  if(def.telaRegras) TELA_REGRAS[chave] = def.telaRegras;
  IND_DEF[chave] = def.indicadores||[];
  CAMPOS[chave] = def.campos||{};
  COLS_PREMIO[chave] = def.colunasPremio||{};
}

/* ---------- Indicadores ativos por competência ----------
   DB.config.indicadores = { 'AAAA-MM': { op: { idIndicador: true|false } } }
   Um mês sem configuração herda o último mês configurado antes dele; sem nenhum, vale o padrão. */
function origemIndicadores(op, mes){
  const cfg=(DB&&DB.config.indicadores)||{};
  const ms=Object.keys(cfg).filter(m=>m<=mes && cfg[m] && cfg[m][op]).sort();
  return ms.length? ms[ms.length-1] : null;
}
function indicadoresAtivos(op, mes){
  const base=Object.fromEntries((IND_DEF[op]||[]).map(i=>[i.id, i.padrao!==false]));
  const o=origemIndicadores(op, mes);
  if(o) Object.assign(base, DB.config.indicadores[o][op]);
  return base;
}
function ctxIndicadores(op, mes){ const at=indicadoresAtivos(op,mes); return { mes, ativos:at, A:id=>at[id]!==false }; }

/* ---------- Fonte da premiação por competência ----------
   'planilha' → vale a PREMIACAO TTOAL da folha importada (oficial, vai para pagamento)
   'calculo'  → vale o cálculo da ferramenta pelos indicadores
   DB.config.fonte = { 'AAAA-MM': 'planilha'|'calculo' }. Sem escolha: planilha, se o mês tiver a coluna. */
const REF_TOTAL = ['PREMIACAO_TTOAL','PREMIACAO_TOTAL','RV_TOTAL','TOTAL_RV'];
function mesTemPlanilha(mes){ return ((DB.meses[mes]||{}).indicadores||[]).some(l=>F(l,...REF_TOTAL)!==undefined); }
function fontePremiacao(mes){
  const f=((DB&&DB.config.fonte)||{})[mes];
  if(f==='calculo') return 'calculo';
  return mesTemPlanilha(mes)? 'planilha' : 'calculo';
}

/* ---------- Leitura de campos da folha (colunas normalizadas: MAIÚSCULO, sem acento, _ ) ---------- */
function F(ind, ...keys){ if(!ind) return undefined; for(const k of keys){ const v=ind[k]; if(v!==undefined&&v!==null&&v!==''&&v!=='-') return v; } return undefined; }
function FN(ind, ...keys){ const v=F(ind,...keys); return v===undefined? undefined : toNum(v); }
function FP(ind, ...keys){ const v=F(ind,...keys); return v===undefined? undefined : toFrac(v); }

/* ---------- Utilidades gerais ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').trim().toUpperCase();
const R$ = v=>(+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const R$0 = v=>(+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const N = (v,d=0)=>(+v||0).toLocaleString('pt-BR',{maximumFractionDigits:d,minimumFractionDigits:d});
const P = (v,d=1)=>((+v||0)*100).toLocaleString('pt-BR',{maximumFractionDigits:d})+'%';
const clone = o=>JSON.parse(JSON.stringify(o));
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const mesNome = m=>{const [y,mm]=m.split('-');return `${MESES[+mm-1]}/${y}`};
const mesCurto = m=>{const [y,mm]=m.split('-');return `${MESES[+mm-1].slice(0,3).toUpperCase()}/${y.slice(2)}`};
const mesAnterior = m=>{let [y,mm]=m.split('-').map(Number);mm--;if(!mm){mm=12;y--}return `${y}-${String(mm).padStart(2,'0')}`};
function toNum(v){
  if(typeof v==='number') return v;
  if(v==null||v==='') return 0;
  let s=String(v).replace(/[R$\s%]/g,'');
  if(s.includes(',')) s=s.replace(/\./g,'').replace(',','.');
  const n=parseFloat(s); return isNaN(n)?0:n;
}
function toFrac(v){ // aceita 0,72 / 72 / "72%"
  if(v==null||v==='') return null;
  const n=toNum(v);
  if(typeof v==='string'&&v.includes('%')) return n/100;
  return n>5? n/100 : n;   // 0,72 · 1,31 (131%) · 72 · "72%"
}
function toBool(v){ const s=norm(v); return ['S','SIM','Y','YES','1','TRUE','X','VERDADEIRO'].includes(s) || (toNum(v)>0 && !isNaN(parseFloat(v))); }
function toDate(v){
  if(v==null||v==='') return '';
  if(typeof v==='number'){ const d=new Date(Math.round((v-25569)*864e5)); return d.toISOString().slice(0,10); }
  if(v instanceof Date) return v.toISOString().slice(0,10);
  const s=String(v).trim(); let m;
  if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/))){ let y=+m[3]; if(y<100)y+=2000; return `${y}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`; }
  if((m=s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return m[0];
  return s;
}
const fmtData = d=>{ if(!d) return ''; const m=String(d).match(/^(\d{4})-(\d{2})-(\d{2})/); return m?`${m[3]}/${m[2]}/${m[1].slice(2)}`:d; };
function opKey(v){
  const s=norm(v), k=String(v||'').toLowerCase();
  if(OPS[k]) return k;
  for(const [key,o] of Object.entries(OPS)) if((o.aliases||[]).some(a=>s===a||s.includes(a))) return key;
  return '';
}
function cargoKey(v){ const s=norm(v); if(s.includes('COORD')) return 'coordenador'; if(s.includes('SUPERV')) return 'supervisor'; return 'promotor'; }
const loginKeyOf = p=>norm(p.nome).replace(/[^A-Z]/g,'').slice(0,2)+norm(p.mat).replace(/\s/g,'');
function faixaIdx(tab,x){ let i=-1; tab.forEach((r,k)=>{ if(x>=r.ini-1e-9) i=k; }); return i; }
const faixaLbl = (r,fmt=v=>N(v))=> r.fin==null? `${fmt(r.ini)} ou mais` : `${fmt(r.ini)} a ${fmt(r.fin)}`;
const pctLbl = v=>((v*100).toLocaleString('pt-BR',{maximumFractionDigits:1}))+'%';
const sum = (a,f)=>a.reduce((s,x)=>s+(f?f(x):x),0);
