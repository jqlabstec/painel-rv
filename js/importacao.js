/* =====================================================================
   Importação das bases padrão (xlsx/csv via SheetJS, tudo no navegador).
   MAPAS: nomes de coluna aceitos para cada campo (sem acento, MAIÚSCULO, _).
   MODELOS: linhas de exemplo dos modelos baixáveis.
   ===================================================================== */
const MAPAS = {
  hc: { mat:['MATRICULA','MAT','RE','ID','CODIGO','CHAPA'], nome:['NOME','NOME_COMPLETO','COLABORADOR','PROMOTOR','FUNCIONARIO'], op:['OPERACAO','OP','CLIENTE','PROJETO'],
        cargo:['CARGO','FUNCAO'], sup:['SUPERVISOR','SUPERVISAO','SUP'], coord:['COORDENADOR','COORDENACAO','COORD'], equipe:['EQUIPE','TIME','TIPO_EQUIPE'],
        regiao:['REGIAO','PERFIL','REGIONAL','PRAÇA','PRACA','NIVEL'], meta:['META'], status:['STATUS','SITUACAO'] },
  vendas: { mat:['MATRICULA','MAT','RE','CHAPA','VENDEDOR'], data:['DATA','DATA_VENDA','DT_VENDA','DATA_ATIVACAO','DATA_APROVACAO'], produto:['PRODUTO','PLANO','DESCRICAO'],
        tipo:['TIPO','CATEGORIA','FAMILIA'], qtd:['QUANTIDADE','QTD','QTDE'], valor:['VALOR','VALOR_VENDA','VALOR_PLANO','PRODUCAO','VALOR_PRODUCAO','RECEITA'],
        port:['PORTABILIDADE','PORT'], marco:['MARCO','PAGAMENTO','PARCELA','D30_D60'], id:['ID','ID_VENDA','CONTRATO','LINHA','PROPOSTA','PEDIDO'], status:['STATUS','SITUACAO'] },
  estornos: { mat:['MATRICULA','MAT','RE','CHAPA'], dataVenda:['DATA_VENDA','DATA','DT_VENDA'], id:['ID','ID_VENDA','CONTRATO','LINHA','PROPOSTA'], produto:['PRODUTO','PLANO','TIPO'],
        qtd:['QUANTIDADE','QTD'], valor:['VALOR_ESTORNO','ESTORNO','VALOR_QUEBRA','VALOR'], valorVenda:['VALOR_VENDA','VALOR_PLANO'], motivo:['MOTIVO','TIPO_ESTORNO','OBS'] },
  indicadores: { mat:['MATRICULA','MAT','RE','CHAPA'], meta:['META'], abs:['ABS','ABSENTEISMO','FALTA','FALTAS'], ativacao:['ATIVACAO','PERC_ATIVACAO','%_ATIVACAO','ATIVACAO_%'],
        seguros:['SEGUROS','SEGURO','PERC_SEGUROS','%_SEGUROS'], assiduidade:['ASSIDUIDADE','PERC_ASSIDUIDADE','%_ASSIDUIDADE'] },
};
const COLUNAS_FOLHA = ['MÊS','MATRICULA','NOME','OPERACAO','CARGO','SUPERVISOR','COORDENADOR','REGIONAL','PERFIL','MENSALIDADES','META MENSALIDADES','%ICM MENSALIDADES','HC ORÇADO','FTE','%QUADRO','FTE ZERADOS','FTE ZERADOS <30 DIAS','META APROV','APROVADOS','ATIVIADOS','%ATIVADOS','SEGUROS CRED','%SEGUROS CRED','%ASSIDUIDADE','SEG CHUB','ABS CHUBB','PROD SEG CHUBB','COMBO ATV','FLEX','VALORES D60','CONTESTAÇÕES','QUEBRAS','META CONTROLE','META COMBO','%ICM CONTROLE','%ICM COMBO','HC %ICM 90% CONTROLE','HC %ICM 100% CONTROLE','HC %ICM 120% CONTROLE','HC %ICM 90% COMBO','HC %ICM 100% COMBO','HC %ICM 120% COMBO','%QUEBRA CONC. FINANCEIRA','% TURN OVER','PREMIACAO TTOAL'];
const exFolha = o=>Object.fromEntries(COLUNAS_FOLHA.map(c=>[c, o[c]??'']));
const MODELOS = {
  folha: [
    exFolha({'MÊS':'01/10/2026',MATRICULA:'900001',NOME:'PROMOTOR EXEMPLO GUERRILHA',OPERACAO:'Guerrilha',CARGO:'Promotor',SUPERVISOR:'SUPERVISORA EXEMPLO',COORDENADOR:'COORDENADORA EXEMPLO',REGIONAL:'RJ/ES',PERFIL:'GERAL','COMBO ATV':82,FLEX:137,'VALORES D60':0,'CONTESTAÇÕES':0,QUEBRAS:0}),
    exFolha({'MÊS':'01/10/2026',MATRICULA:'900002',NOME:'SUPERVISORA EXEMPLO',OPERACAO:'Guerrilha',CARGO:'Supervisor',SUPERVISOR:'SUPERVISORA EXEMPLO',COORDENADOR:'COORDENADORA EXEMPLO',REGIONAL:'RJ/ES',PERFIL:'SUPERVISOR','COMBO ATV':703,FLEX:1508,'META CONTROLE':1120,'META COMBO':513,'%ICM CONTROLE':1.3464,'%ICM COMBO':1.3665,'HC %ICM 100% COMBO':1,'HC %ICM 120% CONTROLE':12,'HC %ICM 120% COMBO':11,'%QUEBRA CONC. FINANCEIRA':0}),
    exFolha({'MÊS':'01/10/2026',MATRICULA:'900003',NOME:'PROMOTOR EXEMPLO AXS',OPERACAO:'AXS Energia',CARGO:'Promotor',SUPERVISOR:'SUPERVISOR AXS',COORDENADOR:'SUPERVISOR AXS',REGIONAL:'MG-AP',PERFIL:'HIGH PERFORMANCE',MENSALIDADES:4281.79}),
    exFolha({'MÊS':'01/10/2026',MATRICULA:'900004',NOME:'SUPERVISOR AXS',OPERACAO:'AXS Energia',CARGO:'Supervisor',SUPERVISOR:'SUPERVISOR AXS',COORDENADOR:'SUPERVISOR AXS',REGIONAL:'MG-AP',PERFIL:'SUPERVISOR',MENSALIDADES:30774.33,'META MENSALIDADES':37895,'%ICM MENSALIDADES':0.8121,FTE:10.97,'%QUADRO':1.097,'FTE ZERADOS':0,'FTE ZERADOS <30 DIAS':0}),
    exFolha({'MÊS':'01/10/2026',MATRICULA:'900005',NOME:'PROMOTOR EXEMPLO CRED',OPERACAO:'CredSystem',CARGO:'Promotor',SUPERVISOR:'OPEN BH',COORDENADOR:'OPEN BH',REGIONAL:'BH',PERFIL:'CONVENCIONAL',APROVADOS:331,ATIVIADOS:206,'%ATIVADOS':0.6224,'SEGUROS CRED':237,'%SEGUROS CRED':0.716,'%ASSIDUIDADE':0.9327}),
    exFolha({'MÊS':'01/10/2026',MATRICULA:'900006',NOME:'PROMOTOR EXEMPLO CHUBB',OPERACAO:'Chubb',CARGO:'Promotor',SUPERVISOR:'SUPERVISORA CHUBB',COORDENADOR:'COORDENADOR CHUBB',REGIONAL:'SALVADOR',PERFIL:'CONVENCIONAL','SEG CHUB':62,'ABS CHUBB':1}),
  ],
  hc: [{MATRICULA:'70231',NOME:'Jonas Quintela',OPERACAO:'AXS Energia',CARGO:'Promotor',SUPERVISOR:'Marina Lopes',COORDENADOR:'Ricardo Alves',EQUIPE:'Convencional',REGIAO:'',META:'',STATUS:'Ativo'},
       {MATRICULA:'50110',NOME:'Paula Mendes',OPERACAO:'Chubb',CARGO:'Supervisor',SUPERVISOR:'',COORDENADOR:'Sérgio Lima',EQUIPE:'',REGIAO:'',META:'',STATUS:'Ativo'}],
  vendas: [{MATRICULA:'70231',DATA:'15/10/2026',PRODUTO:'Contrato energia',TIPO:'',QUANTIDADE:1,VALOR:320.5,PORTABILIDADE:'N',MARCO:'',ID:'CT-0001',STATUS:'Pago'},
           {MATRICULA:'90012',DATA:'15/10/2026',PRODUTO:'Combo Claro 350MB',TIPO:'COMBO',QUANTIDADE:1,VALOR:149.9,PORTABILIDADE:'S',MARCO:'D30',ID:'LN-11999990000',STATUS:'Pago'},
           {MATRICULA:'90012',DATA:'15/10/2026',PRODUTO:'Flex Cartão',TIPO:'FLEX',QUANTIDADE:1,VALOR:'',PORTABILIDADE:'N',MARCO:'',ID:'LN-11999990001',STATUS:'Pago'}],
  estornos: [{MATRICULA:'70231',DATA_VENDA:'10/08/2026',ID:'CT-0001',PRODUTO:'Contrato energia',QUANTIDADE:1,VALOR_ESTORNO:'',VALOR_VENDA:320.5,MOTIVO:'Cancelamento'}],
  indicadores: [{MATRICULA:'30021',META:120,ABS:'N',ATIVACAO:'72%',SEGUROS:'41%',ASSIDUIDADE:'96%'}],
};
const hnorm = h=>norm(h).replace(/[^A-Z0-9%]+/g,'_').replace(/^_|_$/g,'');
function mapear(rows, tipo){
  if(!rows.length) return {itens:[], cols:{}};
  const heads = Object.keys(rows[0]); const mp=MAPAS[tipo]; const cols={};
  for(const [campo,al] of Object.entries(mp)){
    let h = heads.find(x=>al.includes(hnorm(x)));
    if(!h) h = heads.find(x=>al.some(a=>a.length>3 && hnorm(x).includes(a)));
    if(h) cols[campo]=h;
  }
  const itens = rows.map(r=>{ const o={}; for(const [c,h] of Object.entries(cols)) o[c]=r[h]; return o; });
  return {itens, cols};
}
function limpar(tipo, it){
  if(tipo==='hc') return { mat:String(it.mat??'').trim(), nome:String(it.nome??'').trim(), op:opKey(it.op), cargo:cargoKey(it.cargo), sup:String(it.sup??'').trim(), coord:String(it.coord??'').trim(),
    equipe:String(it.equipe??'').trim(), regiao:String(it.regiao??'').trim(), meta:toNum(it.meta)||'', status:String(it.status??'Ativo').trim() };
  if(tipo==='vendas') return { mat:String(it.mat??'').trim(), data:toDate(it.data), produto:String(it.produto??'').trim(), tipo:String(it.tipo??'').trim(),
    qtd:toNum(it.qtd)||1, valor:toNum(it.valor), port:toBool(it.port), marco:String(it.marco??'').trim(), id:String(it.id??'').trim(), status:String(it.status??'').trim() };
  if(tipo==='estornos') return { mat:String(it.mat??'').trim(), dataVenda:toDate(it.dataVenda), id:String(it.id??'').trim(), produto:String(it.produto??'').trim(),
    qtd:toNum(it.qtd)||1, valor:Math.abs(toNum(it.valor)), valorVenda:toNum(it.valorVenda), motivo:String(it.motivo??'').trim() };
  if(tipo==='indicadores') return { mat:String(it.mat??'').trim(), meta:toNum(it.meta)||'', abs: it.abs==null||it.abs===''?false:toBool(it.abs),
    ativacao:toFrac(it.ativacao), seguros:toFrac(it.seguros), assiduidade:toFrac(it.assiduidade) };
}
const STATUS_FORA = ['CANCEL','REPROV','NEGAD','PENDEN','RECUS'];
async function lerArquivo(file, tipo){
  const ehMat = h=>(MAPAS[tipo]||MAPAS.hc).mat.includes(hnorm(h))||hnorm(h).includes('MATRICULA');
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf,{type:'array',cellDates:false});
  // usa a primeira aba que tenha a coluna MATRICULA nas 20 primeiras linhas (ex.: aba "FOLHA RV")
  let ws=null, hi=-1, aoa=null;
  for(const nome of wb.SheetNames){
    const a = XLSX.utils.sheet_to_json(wb.Sheets[nome],{header:1,defval:'',raw:true});
    const i = a.slice(0,20).findIndex(r=>r.some(c=>ehMat(c)));
    if(i>=0){ ws=wb.Sheets[nome]; hi=i; aoa=a; break; }
  }
  if(!ws) throw new Error('Não encontrei a coluna MATRICULA em nenhuma aba do arquivo.');
  const hd=aoa[hi].map((h,k)=>String(h||('COL'+k)).trim());
  return aoa.slice(hi+1).filter(r=>r.some(c=>c!==''&&c!=null)).map(r=>Object.fromEntries(hd.map((h,k)=>[h,r[k]])));
}
async function importar(tipo, file, mes, substituir){
  if(tipo==='folha') return importarFolha(file, mes, substituir);
  const rows = await lerArquivo(file, tipo);
  const {itens, cols} = mapear(rows, tipo);
  if(!cols.mat) throw new Error('Não encontrei a coluna MATRICULA. Colunas lidas: '+Object.keys(rows[0]||{}).join(', '));
  let lista = itens.map((it,k)=>tipo==='indicadores'? {...linhaNormalizada(rows[k]), ...limpar(tipo,it)} : limpar(tipo,it)).filter(x=>x.mat);
  let foraStatus=0;
  if(tipo==='vendas'){ const n=lista.length; lista=lista.filter(v=>!STATUS_FORA.some(s=>norm(v.status).includes(s))); foraStatus=n-lista.length; }
  const log=[`Arquivo: ${file.name}`, `Linhas lidas: ${rows.length} · válidas: ${lista.length}`, `Colunas reconhecidas: ${Object.entries(cols).map(([c,h])=>c+'←"'+h+'"').join(', ')}`];
  if(foraStatus) log.push(`Ignoradas por status (cancelada/reprovada/pendente): ${foraStatus}`);
  if(tipo==='hc'){
    const semOp=lista.filter(x=>!x.op).length; if(semOp) log.push(`⚠ ${semOp} pessoa(s) sem operação reconhecida (use Chubb, CredSystem, AXS Energia ou Guerrilha).`);
    if(substituir) DB.hc=lista; else { const m=hcMap(); lista.forEach(x=>m[norm(x.mat)]=x); DB.hc=Object.values(m); }
    const dup={}; DB.hc.forEach(p=>{const k=loginKeyOf(p);(dup[k]=dup[k]||[]).push(p.nome)}); const d=Object.entries(dup).filter(([k,v])=>v.length>1);
    if(d.length) log.push(`⚠ Chaves de login repetidas: ${d.map(([k,v])=>k+' ('+v.join(', ')+')').join('; ')}`);
    log.push(`Base HC agora com ${DB.hc.length} pessoas.`);
  } else {
    DB.meses[mes] = DB.meses[mes] || {vendas:[],estornos:[],indicadores:[]};
    const alvo = DB.meses[mes];
    if(tipo==='indicadores' && !substituir){ const m={}; (alvo.indicadores||[]).forEach(x=>m[norm(x.mat)]=x); lista.forEach(x=>m[norm(x.mat)]=x); alvo.indicadores=Object.values(m); }
    else alvo[tipo] = substituir? lista : (alvo[tipo]||[]).concat(lista);
    alvo.importadoEm = new Date().toISOString();
    const hm=hcMap(); const sem=[...new Set(lista.filter(x=>!hm[norm(x.mat)]).map(x=>x.mat))];
    if(sem.length) log.push(`⚠ ${sem.length} matrícula(s) fora da base HC (não entram no cálculo): ${sem.slice(0,15).join(', ')}${sem.length>15?'…':''}`);
    log.push(`Competência ${mesNome(mes)}: ${alvo[tipo].length} registros de ${tipo}.`);
  }
  DB.demo=false; saveLocal();
  return log.join('\n');
}
function baixarModelo(tipo){
  const ws=XLSX.utils.json_to_sheet(MODELOS[tipo]); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,tipo.toUpperCase());
  XLSX.writeFile(wb,`modelo_${tipo}.xlsx`);
}
function baixar(nome, conteudo, tipo='application/json'){
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([conteudo],{type:tipo})); a.download=nome; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
}

/* ---------- Folha consolidada (modelo "FOLHA RV") ----------
   Uma linha por pessoa por mês. Serve ao mesmo tempo de base HC e de indicadores.
   Colunas de identificação: MÊS, MATRICULA, NOME, OPERACAO, CARGO, SUPERVISOR, COORDENADOR, REGIONAL, PERFIL.
   Todas as demais colunas viram indicadores do mês (nome normalizado: MAIÚSCULO, sem acento, espaços → _).
   PREMIACAO TTOAL (se vier) é guardada só para a aba Conferência.
   QUEBRAS (R$, positivo ou negativo) é descontada como estorno do mês (o motor lê direto da folha). */
const ID_FOLHA = ['MES','MATRICULA','NOME','OPERACAO','CARGO','SUPERVISOR','COORDENADOR','REGIONAL','PERFIL'];
function linhaNormalizada(r){ const o={}; for(const [h,v] of Object.entries(r||{})) o[hnorm(h)]=v; return o; }
function mesDaCelula(v){ const d=toDate(v); const m=String(d).match(/^(\d{4})-(\d{2})/); return m? `${m[1]}-${m[2]}` : ''; }
async function importarFolha(file, mesPadrao, substituir){
  const rows = (await lerArquivo(file,'hc')).map(linhaNormalizada);
  if(!rows.length) throw new Error('Arquivo sem linhas.');
  const faltam = ['MATRICULA','NOME','OPERACAO','CARGO'].filter(c=>!(c in rows[0]));
  if(faltam.length) throw new Error('Faltam colunas: '+faltam.join(', '));
  const log=[`Arquivo: ${file.name}`, `Linhas lidas: ${rows.length}`];
  const pessoas={}, porMes={}, semOp=[];
  rows.forEach(r=>{
    let mat=String(r.MATRICULA??'').trim(); const nome=String(r.NOME??'').trim();
    if(!nome) return;
    if(!mat||mat==='-'||mat==='0') mat=hnorm(nome);            // vaga sem matrícula (ex.: OPEN BH)
    const op=opKey(r.OPERACAO); if(!op){ semOp.push(nome); return; }
    const mes = mesDaCelula(r.MES) || mesPadrao;
    if(!pessoas[norm(mat)]) pessoas[norm(mat)]={ mat, nome, op, cargo:cargoKey(r.CARGO), sup:String(r.SUPERVISOR??'').trim(), coord:String(r.COORDENADOR??'').trim(),
      regional:String(r.REGIONAL??'').trim(), perfil:String(r.PERFIL??'').trim(), equipe:String(r.PERFIL??'').trim(), regiao:String(r.REGIONAL??'').trim(), meta:'', status:'Ativo' };
    const ind={mat}; for(const [k,v] of Object.entries(r)) if(!['MES','MATRICULA','NOME','OPERACAO','CARGO','SUPERVISOR','COORDENADOR'].includes(k)) ind[k]=v;
    (porMes[mes]=porMes[mes]||[]).push(ind);
  });
  const novos=Object.values(pessoas);
  const ops=[...new Set(novos.map(p=>p.op))];
  if(substituir) DB.hc = DB.hc.filter(p=>!ops.includes(opKey(p.op))).concat(novos);
  else { const m=hcMap(); novos.forEach(x=>m[norm(x.mat)]=x); DB.hc=Object.values(m); }
  for(const [mes,lista] of Object.entries(porMes)){
    DB.meses[mes] = DB.meses[mes] || {vendas:[],estornos:[],indicadores:[]};
    const alvo=DB.meses[mes];
    const mats=new Set(lista.map(x=>norm(x.mat)));
    alvo.indicadores = (substituir? (alvo.indicadores||[]).filter(x=>!ops.includes(opKey((hcMap()[norm(x.mat)]||{}).op))) : (alvo.indicadores||[]).filter(x=>!mats.has(norm(x.mat)))).concat(lista);
    alvo.estornos = (alvo.estornos||[]).filter(e=>!(e.motivo==='Quebra lançada na folha' && mats.has(norm(e.mat))));
    const quebras = lista.filter(x=>Math.abs(toNum(x.QUEBRAS))>=0.005);
    alvo.importadoEm=new Date().toISOString();
    log.push(`Competência ${mesNome(mes)}: ${lista.length} linhas de indicadores${quebras.length?` · ${quebras.length} pessoa(s) com quebra (descontada da premiação final)`:''}.`);
  }
  const cont={}; novos.forEach(p=>{ const k=OPS[p.op].nome+' · '+p.cargo; cont[k]=(cont[k]||0)+1; });
  log.push('Pessoas por operação/cargo: '+Object.entries(cont).map(([k,v])=>`${k}: ${v}`).join(' | '));
  if(semOp.length) log.push(`⚠ ${semOp.length} linha(s) com OPERACAO não reconhecida: ${semOp.slice(0,8).join(', ')}`);
  const dup={}; DB.hc.forEach(p=>{const k=loginKeyOf(p);(dup[k]=dup[k]||[]).push(p.nome)}); const d=Object.entries(dup).filter(([k,v])=>v.length>1);
  if(d.length) log.push(`⚠ Chaves de login repetidas: ${d.slice(0,6).map(([k,v])=>k+' ('+v.join(', ')+')').join('; ')}`);
  const meses=Object.keys(porMes).sort();
  DB.demo=false; saveLocal();
  return {log:log.join('\n'), mes:meses[meses.length-1]};
}
