/* Ambiente master: visão geral, ranking, folha, importação, regras e dados */
function linhasMaster(){
  if(!UI.mes) return [];
  const ps=Object.values(apurar(UI.mes).pessoas);
  return ps.filter(r=>UI.op==='todas'||r.op===UI.op);
}
function viewMaster(){
  const tabs=[['geral','Visão geral'],['ranking','Ranking'],['folha','Folha de premiação'],['conferencia','Conferência'],['indicadores','Indicadores do mês'],['importar','Importar bases'],['regras','Regras'],['dados','Dados (backup)']];
  const head=`<div class="top"><div class="topin">
      <div class="brand"><div class="dot"><i></i></div><div><b>Painel de Premiação · Master</b><small>Todas as operações</small></div></div>
      <select class="in" id="selOp" style="padding:6px 10px;font-size:12px"><option value="todas">Todas as operações</option>${Object.entries(OPS).map(([k,o])=>`<option value="${k}" ${UI.op===k?'selected':''}>${o.nome}</option>`).join('')}</select>
      ${mesSelect()}${NUVEM.ativa?blocoPublicar():''}<button class="btn sm ghost" id="sair">Sair</button>
    </div><div class="tabs">${tabs.map(([k,l])=>`<button class="tab ${UI.mtab===k?'on':''}" data-mt="${k}">${l}</button>`).join('')}</div></div>`;
  let body='';
  const demo = DB.demo?`<div class="demo">Você está vendo <b>dados de demonstração</b>. Importe suas bases em "Importar bases" para substituir.</div>`:'';
  if(NUVEM.ativa && temAlteracaoNaoPublicada() && DB.hc.length) body+=`<div class="demo" style="background:#fffbeb;border-color:#fde68a;color:#92400e">Há alterações que os colaboradores ainda não veem. Confira e clique em <b>Publicar apuração</b>, no topo.</div>`;
  if(['geral','folha','conferencia','ranking'].includes(UI.mtab) && UI.mes) body+=blocoFonte();
  if(UI.mtab==='geral') body+=mGeral();
  if(UI.mtab==='ranking') body+=mRanking();
  if(UI.mtab==='folha') body+=mFolha();
  if(UI.mtab==='importar') body+=mImportar();
  if(UI.mtab==='regras') body+=mRegras();
  if(UI.mtab==='dados') body+=mDados();
  if(UI.mtab==='indicadores') body+=mIndicadores();
  if(UI.mtab==='conferencia') body+=mConferencia();
  return head+`<main>${demo}${body}</main>`;
}
function mGeral(){
  if(!UI.mes) return `<div class="empty">Nenhuma apuração ainda. Comece por <b>Importar bases</b>.</div>`;
  const L=linhasMaster(); const prom=L.filter(r=>r.cargo==='promotor');
  const T={final:sum(L,r=>r.final),bruto:sum(L,r=>r.bruto),est:sum(L,r=>r.estComp),rem:sum(L,r=>r.rem),saldo:sum(L,r=>r.saldoProx)};
  const pagos=L.filter(r=>r.final>0).length;
  // comparação com mês anterior
  const ant = DB.meses[mesAnterior(UI.mes)]? Object.values(apurar(mesAnterior(UI.mes)).pessoas).filter(r=>UI.op==='todas'||r.op===UI.op) : null;
  const var_ = ant? (T.final/Math.max(1,sum(ant,r=>r.final))-1) : null;
  apurar(UI.mes);
  const porOp = Object.entries(OPS).filter(([k])=>UI.op==='todas'||UI.op===k).map(([k,o])=>{ const x=L.filter(r=>r.op===k); return {k,o,n:x.filter(r=>r.cargo==='promotor').length,final:sum(x,r=>r.final),bruto:sum(x,r=>r.bruto),est:sum(x,r=>r.estComp)+sum(x,r=>r.rem),fat:sum(x,r=>r.faturamento||0),vendas:sum(x.filter(r=>r.cargo==='promotor'),r=>r.qtdVendas||0),zer:x.filter(r=>r.cargo==='promotor'&&r.bruto===0).length}; });
  const mx=Math.max(1,...porOp.map(x=>x.bruto));
  const top=prom.slice().sort((a,b)=>b.final-a.final).slice(0,5);
  // distribuição por faixa
  return `<div class="eyebrow">Apuração ${mesNome(UI.mes)}</div><h2 style="font-size:28px;letter-spacing:-.03em;margin:4px 0 14px">Quanto estou pagando de premiação</h2>
  <div class="hero" style="grid-template-columns:1fr 1.3fr"><div class="l">
    <div class="lbl">PREMIAÇÃO FINAL A PAGAR</div><div class="val num"><small>R$</small>${N(T.final,2)}</div>
    <div class="sub">${pagos} pessoa(s) com premiação · ${UI.op==='todas'?'todas as operações':OPS[UI.op].nome}${var_!=null?` · <b>${var_>=0?'▲':'▼'} ${P(Math.abs(var_))}</b> vs ${mesNome(mesAnterior(UI.mes))}`:''}</div>
    <div class="stack"><i style="width:${T.final/Math.max(1,T.bruto)*100}%;background:#fff"></i><i style="width:${(T.est+T.rem)/Math.max(1,T.bruto)*100}%;background:#f87171"></i></div>
    <div class="leg"><span>Pago ${P(T.final/Math.max(1,T.bruto))}</span><span style="color:#fca5a5">Estornado ${P((T.est+T.rem)/Math.max(1,T.bruto))}</span></div>
  </div><div class="r">
    <div class="ln"><div><b>Premiação bruta</b><small>antes dos estornos</small></div><div class="v num">${R$(T.bruto)}</div></div>
    <div class="ln"><div><b>Estornos e quebras da competência</b><small>${sum(L,r=>r.estornos.filter(e=>!e.jaDescontado).length)} lançamentos · quebras ${R$(sum(L,r=>r.quebras||0))}</small></div><div class="v neg num">-${R$(T.est)}</div></div>
    <div class="ln"><div><b>Estornos remanescentes</b><small>saldos de ${mesNome(mesAnterior(UI.mes))}</small></div><div class="v neg num">-${R$(T.rem)}</div></div>
    <div class="ln"><div><b>Saldo a carregar</b><small>estorno maior que a premiação, desconta no próximo mês</small></div><div class="v num">${R$(T.saldo)}</div></div>
    <div class="ln tot"><div><b>Premiação final a pagar</b><small>${mesNome(UI.mes)}</small></div><div class="v num">${R$(T.final)}</div></div>
  </div></div>
  <section class="sec"><div class="eyebrow">Por operação</div><h2>Onde está a premiação</h2><p>Bruto, estornos e final de cada ambiente. Barra: premiação bruta (cheio) e parte estornada (vermelho).</p>
  <div class="grid2">${porOp.map(x=>`<div class="opc" style="--oc:${x.o.c}"><h4><span>${x.o.nome}</span><span style="color:var(--mut);font-weight:600">${x.n} promotores</span></h4>
    <div class="big num">${R$(x.final)}</div>
    <div class="bar" style="margin:8px 0;display:flex"><i style="width:${(x.bruto-x.est)/mx*100}%;background:${x.o.c};border-radius:0"></i><i style="width:${x.est/mx*100}%;background:#f87171;border-radius:0"></i></div>
    <div class="rows"><div><span>Premiação bruta</span><b class="num">${R$(x.bruto)}</b></div><div><span>Estornos (comp. + remanescentes)</span><b class="num neg">-${R$(x.est)}</b></div>
    <div><span>Vendas / aprovações / produção</span><b class="num">${N(x.vendas)}</b></div><div><span>Premiação média por promotor</span><b class="num">${R$(x.final/Math.max(1,x.n))}</b></div>
    <div><span>Promotores sem premiação (abaixo da faixa)</span><b>${x.zer}</b></div>
    ${x.k==='credsystem'?`<div><span>Faturamento premiação (cliente)</span><b class="num">${R$(x.fat)}</b></div><div><span>Margem premiação (fat. − repasse)</span><b class="num pos">${R$(x.fat-x.bruto)}</b></div>`:''}</div></div>`).join('')}</div></section>
  <section class="sec"><div class="eyebrow">Destaques</div><h2>Top 5 do mês</h2><p>Maiores premiações finais entre promotores.</p>
  <div class="blk">${rankTable(top)}</div></section>`;
}
function rankTable(lista){
  const mx=Math.max(1,...lista.map(x=>x.final));
  return `<table class="dt rk"><thead><tr><th>#</th><th>Promotor</th><th>Operação</th><th class="r">Vendas</th><th class="r">Estornos</th><th style="width:22%"></th><th class="r">Premiação final</th></tr></thead><tbody>
  ${lista.map((x,k)=>`<tr data-ver="${esc(x.mat)}"><td><span class="medal ${k<3?'m'+(k+1):''}">${k+1}</span></td><td><b>${esc(x.nome)}</b><br><small style="color:var(--mut)">${esc(x.sup||'')}</small></td><td><span class="sw" style="background:${OPS[x.op].c}"></span>${OPS[x.op].nome}</td><td class="r num">${x.op==='axs'?R$0(x.producao):N(x.qtdVendas)}</td><td class="r num neg">${x.estComp+x.rem?'-'+R$(x.estComp+x.rem):'—'}</td><td><div class="bar"><i style="width:${x.final/mx*100}%;background:${OPS[x.op].c}"></i></div></td><td class="r num"><b>${R$(x.final)}</b></td></tr>`).join('')||'<tr><td colspan=7 class="empty">Sem dados</td></tr>'}
  </tbody></table>`;
}
function mRanking(){
  const L=linhasMaster().filter(r=>r.cargo==='promotor').sort((a,b)=>b.final-a.final);
  const est=L.slice().sort((a,b)=>(b.estComp+b.rem)-(a.estComp+a.rem)).filter(x=>x.estComp+x.rem>0).slice(0,10);
  return `<div class="eyebrow">Ranking · ${mesNome(UI.mes||'2026-01')}</div><h2 style="font-size:28px;letter-spacing:-.03em;margin:4px 0 4px">Premiação por promotor</h2><p style="color:var(--mut);margin:0 0 14px;font-size:12px">Clique em um promotor para abrir o painel dele como ele vê.</p>
  <div class="blk">${rankTable(L)}</div>
  <section class="sec"><div class="eyebrow">Atenção</div><h2>Quem mais estornou</h2><p>Top 10 em valor de estornos e quebras (competência + remanescentes).</p>
  <div class="blk"><table class="dt"><thead><tr><th>Promotor</th><th>Operação</th><th class="r">Lançamentos</th><th class="r">Premiação bruta</th><th class="r">Estornos</th><th class="r">% do bruto</th></tr></thead><tbody>
  ${est.map(x=>`<tr data-ver="${esc(x.mat)}"><td><b>${esc(x.nome)}</b></td><td>${OPS[x.op].nome}</td><td class="r">${x.estornos.length}</td><td class="r num">${R$(x.bruto)}</td><td class="r num neg">-${R$(x.estComp+x.rem)}</td><td class="r">${x.bruto?P((x.estComp+x.rem)/x.bruto):'—'}</td></tr>`).join('')||'<tr><td colspan=6 class="empty">Nenhum estorno.</td></tr>'}
  </tbody></table></div></section>`;
}
function mFolha(){
  let L=linhasMaster();
  const q=norm(UI.busca); if(q) L=L.filter(r=>norm(r.nome+' '+r.mat+' '+r.sup).includes(q));
  const {k,d}=UI.sort; L.sort((a,b)=>{const x=a[k],y=b[k]; return (typeof x==='number'?x-y:String(x).localeCompare(String(y)))*d;});
  const cols=[['mat','Matrícula'],['nome','Nome'],['op','Operação'],['cargo','Cargo'],['sup','Supervisor'],['bruto','Premiação bruta',1],['estComp','Estornos',1],['rem','Remanesc.',1],['final','Premiação final',1],['saldoProx','Saldo próx.',1]];
  return `<div class="row" style="justify-content:space-between;margin-bottom:12px"><div><div class="eyebrow">Folha de premiação · ${UI.mes?mesNome(UI.mes):''}</div><h2 style="font-size:24px;margin:4px 0 0">${L.length} pessoas · ${R$(sum(L,r=>r.final))}</h2></div>
    <div class="row"><input class="in" id="busca" placeholder="Buscar nome, matrícula, supervisor" value="${esc(UI.busca)}" style="min-width:240px"><button class="btn sm" id="expFolha">Exportar Excel</button></div></div>
  <div class="scroll"><table class="dt"><thead><tr>${cols.map(([k,l,n])=>`<th class="${n?'r':''}" data-sort="${k}">${l}${UI.sort.k===k?(UI.sort.d>0?' ▲':' ▼'):''}</th>`).join('')}</tr></thead><tbody>
  ${L.map(r=>`<tr data-ver="${esc(r.mat)}"><td>${esc(r.mat)}</td><td><b>${esc(r.nome)}</b></td><td><span class="sw" style="background:${OPS[r.op].c}"></span>${OPS[r.op].nome}</td><td>${r.cargo}</td><td>${esc(r.sup||'')}</td><td class="r num">${R$(r.bruto)}</td><td class="r num neg">${r.estComp?'-'+R$(r.estComp):'—'}</td><td class="r num neg">${r.rem?'-'+R$(r.rem):'—'}</td><td class="r num"><b>${R$(r.final)}</b></td><td class="r num">${r.saldoProx?R$(r.saldoProx):'—'}</td></tr>`).join('')}
  </tbody></table></div>`;
}
function mImportar(){
  const mesPadrao = UI.impMes || UI.mes || new Date().toISOString().slice(0,7);
  const M = DB.meses[mesPadrao]||{};
  const card=(t,tit,desc,cnt)=>`<div class="up"><h4>${tit}</h4><p>${desc}</p>
    <div class="row"><input type="file" accept=".xlsx,.xls,.csv" data-imp="${t}" style="font-size:12px;max-width:100%"><button class="btn sm ghost" data-mod="${t}">Baixar modelo</button></div>
    <div class="cnt" style="margin-top:8px">${cnt}</div></div>`;
  return `<div class="eyebrow">Importação</div><h2 style="font-size:28px;letter-spacing:-.03em;margin:4px 0 4px">Subir as bases de apuração</h2>
  <p style="color:var(--mut);margin:0 0 14px;font-size:12px;line-height:1.6">Importou, calculou. As colunas são reconhecidas pelo nome (aceita variações como MAT, QTD, VALOR_PLANO). Use os modelos para garantir. ${NUVEM.ativa?'Depois de conferir, clique em <b>Publicar apuração</b>, no topo: os colaboradores passam a ver na hora.':'Depois, vá em <b>Dados (JSON)</b> e baixe o <b>premiacao.json</b> para publicar para os promotores.'}</p>
  <div class="blk"><div class="row"><b>Competência da apuração:</b><input type="month" class="in" id="impMes" value="${mesPadrao}"><label class="row" style="gap:6px;font-size:12px"><input type="checkbox" id="subst" checked> Substituir os dados existentes (desmarque para somar)</label></div></div>
  <div class="up destaque">${card('folha','★ Folha de indicadores (modelo consolidado) · recomendado','A planilha da folha consolidada: uma linha por pessoa com MÊS, MATRICULA, NOME, OPERACAO, CARGO, SUPERVISOR, COORDENADOR, REGIONAL, PERFIL e os indicadores de cada operação. Monta a base HC e os indicadores do mês de uma vez. Pode subir o arquivo inteiro: a aba com MATRICULA é encontrada sozinha. A coluna PREMIACAO TTOAL, se vier, aparece na aba Conferência.',`${DB.hc.length} pessoas na base · ${(M.indicadores||[]).length} linhas de indicadores em ${mesNome(mesPadrao)}`).replace('<div class="up">','<div>')}</div>
  <div class="eyebrow" style="margin:18px 0 8px">Bases detalhadas (opcional, venda a venda)</div>
  <div class="grid2">
    ${card('hc','1 · Base HC','Quem é quem: matrícula, nome, operação, cargo, supervisor, coordenador, equipe (AXS: Convencional/HP), região (Guerrilha: GERAL, RJ/ES, SP1 PLENO, SP1 SENIOR), meta. Vale para todos os meses.',`${DB.hc.length} pessoas na base`)}
    ${card('vendas','2 · Base de vendas','Uma linha por venda (ou por dia com QUANTIDADE). Chubb: vendas · CredSystem: aprovações · AXS: VALOR da produção · Guerrilha: TIPO COMBO/FLEX, VALOR do plano, MARCO D30/D60, PORTABILIDADE S/N.',`${(M.vendas||[]).length} lançamentos em ${mesNome(mesPadrao)}`)}
    ${card('estornos','3 · Estornos e quebras','Vendas canceladas/inadimplentes lançadas nesta competência. Se VALOR_ESTORNO vier vazio, o sistema calcula pela regra da faixa do mês.',`${(M.estornos||[]).length} estornos em ${mesNome(mesPadrao)}`)}
    ${card('indicadores','4 · Indicadores (manual)','Meta e ABS (Chubb), % Ativação, % Seguros e % Assiduidade (CredSystem). Aceita 72, 0,72 ou 72%.',`${(M.indicadores||[]).length} linhas em ${mesNome(mesPadrao)}`)}
  </div>
  <div class="log" id="log" style="${UI.log?'':'display:none'}">${esc(UI.log||'')}</div>`;
}
function mRegras(){
  const R=DB.config.rules;
  const tabela=(tit,cols,rows)=>`<div class="blk"><h3>${tit}</h3><div style="height:10px"></div><div class="tblwrap"><table class="ft sm"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td class="num">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  let h=`<div class="eyebrow">Regras de premiação</div><h2 style="font-size:28px;letter-spacing:-.03em;margin:4px 0 4px">Tabelas em uso</h2><p style="color:var(--mut);margin:0 0 14px;font-size:12px">Padrão em js/operacoes/*.js. Para ajustar só neste ambiente, edite o JSON abaixo e salve (recalcula na hora e vai junto na publicação).</p>`;
  for(const [k,o] of Object.entries(OPS)){
    if(UI.op!=='todas'&&UI.op!==k) continue;
    h+=`<div class="sec" style="margin-top:18px"><h2 style="color:${o.c}">${o.nome}</h2>${TELA_REGRAS[k]&&R[k]?TELA_REGRAS[k](R[k],tabela):'<p>Sem tabela.</p>'}</div>`;
  }
  h+=`<div class="sec"><h2>Editar regras (JSON)</h2><p>${NUVEM.ativa?`Master conectado: <b>${esc(NUVEM.email()||'')}</b>`:`Chave master atual: <b>${esc(DB.config.masterKey)}</b>`}</p><div class="blk">
    ${NUVEM.ativa?'':`<div class="row" style="margin-bottom:10px"><input class="in" id="novaChave" placeholder="Nova chave master"><button class="btn sm" id="salvaChave">Trocar chave master</button></div>`}
    <textarea class="in" id="rulesTxt">${esc(JSON.stringify(R,null,1))}</textarea>
    <div class="row" style="margin-top:10px"><button class="btn sm" id="salvaRegras">Salvar regras</button><button class="btn sm ghost" id="resetRegras">Voltar ao padrão</button><span id="rmsg" style="font-size:12px"></span></div></div></div>`;
  return h;
}
function mDados(){
  const ms=mesesDisponiveis();
  return `<div class="eyebrow">Armazenamento</div><h2 style="font-size:28px;letter-spacing:-.03em;margin:4px 0 4px">Arquivo de dados (premiacao.json)</h2>
  <p style="color:var(--mut);margin:0 0 14px;font-size:12px;line-height:1.6">Tudo fica em um único JSON: base HC, indicadores e vendas de cada competência, regras e indicadores ligados por mês.<br>
  ${NUVEM.ativa?`<b>Publicação:</b> você trabalha num rascunho neste navegador; o botão <b>Publicar apuração</b> grava no Supabase e os colaboradores veem na hora. Cada publicação fica guardada no histórico do Supabase (tabela rv_historico). ${PUBLICADO?`Última publicação: ${new Date(PUBLICADO.em).toLocaleString('pt-BR')} por ${esc(PUBLICADO.por||'')}.`:'Nada publicado ainda.'} Baixar o JSON aqui serve de backup.`
  :`<b>Modo local:</b> importe as bases → baixe o premiacao.json → coloque na pasta do site → publique de novo. Para publicar sem deploy, preencha js/config.js com o Supabase (veja DEPLOY.md).`}</p>
  <div class="grid3">
    <div class="blk"><h3>Base atual</h3><div class="d">${DB.hc.length} pessoas · ${ms.length} competência(s): ${ms.map(mesCurto).join(', ')||'—'}<br>Atualizado em ${new Date(DB.atualizadoEm).toLocaleString('pt-BR')}${DB.demo?'<br><b>Demonstração</b>':''}</div>
      <div class="row"><button class="btn sm" id="dlJson">Baixar premiacao.json</button><button class="btn sm ghost" id="cpJson">Copiar JSON</button></div></div>
    <div class="blk"><h3>Carregar premiacao.json</h3><div class="d">Abre um premiacao.json salvo (backup ou de outro computador).</div><input type="file" accept=".json" id="upJson" style="font-size:12px"></div>
    <div class="blk"><h3>Competências</h3><div class="d">Apagar uma competência importada errada.</div>
      <div class="row"><select class="in" id="delMesSel">${ms.map(m=>`<option value="${m}">${mesNome(m)}</option>`).join('')}</select><button class="btn sm danger" id="delMes">Apagar</button></div></div>
    <div class="blk"><h3>Recomeçar</h3><div class="d">Limpa tudo neste navegador (mantém as regras).</div><div class="row"><button class="btn sm danger" id="zerar">Zerar base</button><button class="btn sm ghost" id="demo">Carregar demonstração</button></div></div>
  </div><div id="dmsg" style="font-size:12px;margin-top:8px"></div>`;
}
function confirmar(msg, ok){
  const d=document.createElement('div'); d.className='modal';
  d.innerHTML=`<div class="card" style="max-width:420px"><h3 style="margin:0 0 8px">Confirmar</h3><p style="color:var(--mut);font-size:13px">${msg}</p><div class="row" style="justify-content:flex-end"><button class="btn sm ghost" data-x>Cancelar</button><button class="btn sm" data-ok>Confirmar</button></div></div>`;
  document.body.appendChild(d); d.querySelector('[data-x]').onclick=()=>d.remove(); d.querySelector('[data-ok]').onclick=()=>{d.remove();ok()};
}
function bindMaster(){
  $('#sair').onclick=sair;
  $('#selMes')&&($('#selMes').onchange=e=>{UI.mes=e.target.value;render()});
  $('#selOp').onchange=e=>{UI.op=e.target.value;render()};
  $$('[data-mt]').forEach(b=>b.onclick=()=>{UI.mtab=b.dataset.mt;render();scrollTo(0,0)});
  $$('[data-ver]').forEach(tr=>tr.onclick=()=>{UI.verComo=tr.dataset.ver;UI.vendasN=40;render();scrollTo(0,0)});
  $$('[data-sort]').forEach(th=>th.onclick=()=>{const k=th.dataset.sort; UI.sort = UI.sort.k===k?{k,d:-UI.sort.d}:{k,d:-1}; render();});
  const b=$('#busca'); if(b){ b.oninput=e=>{UI.busca=e.target.value; clearTimeout(b._t); b._t=setTimeout(()=>{render(); const nb=$('#busca'); nb.focus(); nb.setSelectionRange(nb.value.length,nb.value.length);},250);}; }
  $('#expFolha')&&($('#expFolha').onclick=()=>{
    const rows=linhasMaster().map(r=>({MATRICULA:r.mat,NOME:r.nome,OPERACAO:OPS[r.op].nome,CARGO:r.cargo,SUPERVISOR:r.sup,COORDENADOR:r.coord,QTD_VENDAS:r.qtdVendas,
      ...Object.fromEntries(r.componentes.map(c=>[c.label.toUpperCase(),+c.valor.toFixed(2)])),FONTE:r.oficial?'PLANILHA':'CALCULO',PREMIACAO_BRUTA:+r.bruto.toFixed(2),QUEBRAS:+(r.quebras||0).toFixed(2),ESTORNOS:+r.estComp.toFixed(2),REMANESCENTE:+r.rem.toFixed(2),PREMIACAO_FINAL:+r.final.toFixed(2),SALDO_PROX_MES:+r.saldoProx.toFixed(2)}));
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'FOLHA PREMIACAO'); XLSX.writeFile(wb,`folha_premiacao_${UI.mes}.xlsx`);
  });
  // importar
  $('#impMes')&&($('#impMes').onchange=e=>{UI.impMes=e.target.value;render()});
  $$('[data-mod]').forEach(x=>x.onclick=()=>baixarModelo(x.dataset.mod));
  $$('[data-imp]').forEach(inp=>inp.onchange=async()=>{
    const f=inp.files[0]; if(!f) return; const mes=$('#impMes').value; if(!mes){UI.log='Escolha a competência.';render();return;}
    if(DB.demo){ const regras=DB.config; DB=emptyDB(); DB.config=regras; }
    try{ const r=await importar(inp.dataset.imp,f,mes,$('#subst').checked); const txt=typeof r==='string'?r:r.log; const m2=(r&&r.mes)||mes;
      UI.log=(UI.log?UI.log+'\n\n':'')+'['+inp.dataset.imp.toUpperCase()+'] '+txt; UI.impMes=m2; UI.mes=m2; }
    catch(err){ UI.log=(UI.log?UI.log+'\n\n':'')+'ERRO: '+err.message; }
    render(); const lg=$('#log'); if(lg) lg.scrollTop=lg.scrollHeight;
  });
  // regras
  $('#salvaRegras')&&($('#salvaRegras').onclick=()=>{ try{ DB.config.rules=JSON.parse($('#rulesTxt').value); saveLocal(); $('#rmsg').textContent='Regras salvas e apurações recalculadas.'; }catch(e){ $('#rmsg').textContent='JSON inválido: '+e.message; } });
  $('#resetRegras')&&($('#resetRegras').onclick=()=>confirmar('Voltar todas as regras ao padrão da planilha Modelos_de_RV?',()=>{DB.config.rules=clone(DEFAULT_RULES);saveLocal();render();}));
  $('#salvaChave')&&($('#salvaChave').onclick=()=>{ const v=norm($('#novaChave').value).replace(/\s/g,''); if(v.length<6){$('#rmsg').textContent='Use pelo menos 6 caracteres.';return;} DB.config.masterKey=v; saveLocal(); render(); });
  // dados
  $('#dlJson')&&($('#dlJson').onclick=()=>baixar('premiacao.json',JSON.stringify(DB)));
  $('#cpJson')&&($('#cpJson').onclick=async()=>{ try{ await navigator.clipboard.writeText(JSON.stringify(DB)); $('#dmsg').textContent='JSON copiado. Cole em um arquivo rv.json.'; }catch(e){ $('#dmsg').textContent='Não consegui copiar neste navegador.'; } });
  $('#upJson')&&($('#upJson').onchange=async e=>{ try{ const j=JSON.parse(await e.target.files[0].text()); if(!j.hc||!j.meses) throw new Error('arquivo não parece um backup do painel'); DB=j; DB.config=Object.assign(clone(DEFAULT_CONFIG),j.config||{}); saveLocal(); UI.mes=null; render(); }catch(err){ $('#dmsg').textContent='Erro: '+err.message; } });
  $('#delMes')&&($('#delMes').onclick=()=>{ const m=$('#delMesSel').value; if(!m) return; confirmar(`Apagar a competência ${mesNome(m)}? Vendas, estornos e indicadores desse mês saem da base.`,()=>{ delete DB.meses[m]; saveLocal(); UI.mes=null; render(); }); });
  $('#zerar')&&($('#zerar').onclick=()=>confirmar('Apagar HC e todas as competências deste navegador? As regras são mantidas.',()=>{ const c=DB.config; DB=emptyDB(); DB.config=c; saveLocal(); UI.mes=null; render(); }));
  bindIndicadores(); bindConferencia();
  $$('[data-fonte]').forEach(b=>b.onclick=()=>{ DB.config.fonte=DB.config.fonte||{}; DB.config.fonte[UI.mes]=b.dataset.fonte; saveLocal(); render(); });
  $('#qDesc')&&($('#qDesc').onchange=e=>{ DB.config.planilhaDescontaQuebras=e.target.checked; saveLocal(); render(); });
  $('#publicar')&&($('#publicar').onclick=()=>confirmar(`Publicar a base atual para todos os colaboradores?<br><br>${DB.hc.length} pessoas · competências: ${mesesDisponiveis().map(mesCurto).join(', ')||'—'}.<br>A versão anterior fica guardada no histórico.`, async()=>{
    const b=$('#publicar'); b.disabled=true; b.textContent='Publicando…';
    try{ await publicarApuracao(); render(); aviso('Apuração publicada. Os colaboradores já veem.'); }
    catch(err){ render(); aviso(err.message, true); }
  }));
  $('#demo')&&($('#demo').onclick=()=>confirmar('Substituir a base atual pelos dados de demonstração?',()=>{ const c=DB.config; DB=gerarDemo(); DB.config=c; saveLocal(); UI.mes=null; render(); }));
}

/* ---------- Indicadores do mês: o master escolhe o que é avaliado ---------- */
function mIndicadores(){
  const mes = UI.indMes || UI.mes || new Date().toISOString().slice(0,7);
  const op = UI.indOp || (UI.op!=='todas'?UI.op:Object.keys(OPS)[0]);
  const O=OPS[op], at=indicadoresAtivos(op,mes), orig=origemIndicadores(op,mes);
  const proprio = orig===mes;
  const cargos=[['promotor','Promotor'],['supervisor','Supervisor'],['coordenador','Coordenador']];
  const defs=IND_DEF[op]||[];
  const status = proprio? `<span class="chip c">Configuração própria de ${mesNome(mes)}</span>`
    : orig? `<span class="chip">Herdando de ${mesNome(orig)}</span>` : `<span class="chip">Padrão da operação</span>`;
  return `<div class="eyebrow">Indicadores do mês</div><h2 style="font-size:28px;letter-spacing:-.03em;margin:4px 0 4px">O que vale nesta competência</h2>
  <p style="color:var(--mut);margin:0 0 14px;font-size:12px;line-height:1.6">Ligue só os indicadores que entram na premiação do mês. O que estiver desligado não soma na premiação e não aparece para o promotor nem para o supervisor. Um mês sem configuração usa a do último mês configurado.</p>
  <div class="blk"><div class="row" style="justify-content:space-between">
    <div class="row"><b>Competência</b><input type="month" class="in" id="indMes" value="${mes}"></div>
    <div class="row">${Object.entries(OPS).map(([k,o])=>`<button class="tab opbtn ${k===op?'on':''}" data-indop="${k}" style="${k===op?`background:${o.c};border-color:${o.c}`:''}">${o.nome}</button>`).join('')}</div>
  </div><div class="row" style="margin-top:12px">${status}
    ${proprio?`<button class="btn sm ghost" id="indHerdar">Remover configuração deste mês</button>`:''}
    <button class="btn sm ghost" id="indPadrao">Voltar ao padrão</button></div></div>
  ${cargos.map(([cg,lbl])=>{ const l=defs.filter(d=>d.cargo===cg); if(!l.length) return '';
    return `<div class="sec" style="margin-top:20px"><h2 style="font-size:17px">${lbl}</h2><div class="grid3">
    ${l.map(d=>`<label class="indc ${at[d.id]!==false?'on':''}" style="--oc:${O.c}">
      <input type="checkbox" data-ind="${d.id}" ${at[d.id]!==false?'checked':''}>
      <span class="sw2"><i></i></span>
      <span class="tx"><b>${esc(d.nome)}</b><small>${esc(d.desc||'')}</small></span></label>`).join('')}
    </div></div>`; }).join('')}
  <div class="sec" style="margin-top:22px"><h2 style="font-size:17px">Como o colaborador vai ver em ${mesNome(mes)}</h2>
  <div class="grid2">${cargos.filter(([cg])=>defs.some(d=>d.cargo===cg)).map(([cg,lbl])=>`<div class="blk"><h3>${lbl}</h3><div class="chips" style="margin-top:10px">
    ${defs.filter(d=>d.cargo===cg).map(d=>at[d.id]!==false?`<span class="chip c">${esc(d.nome)}</span>`:`<span class="chip off">${esc(d.nome)}</span>`).join('')}</div></div>`).join('')}</div></div>`;
}
function salvarIndicadores(op, mes, mapa){
  DB.config.indicadores = DB.config.indicadores||{};
  DB.config.indicadores[mes] = DB.config.indicadores[mes]||{};
  DB.config.indicadores[mes][op] = mapa;
  saveLocal(); render();
}
function bindIndicadores(){
  if(UI.mtab!=='indicadores') return;
  const mes=()=>$('#indMes').value, op=UI.indOp || (UI.op!=='todas'?UI.op:Object.keys(OPS)[0]);
  $('#indMes').onchange=e=>{UI.indMes=e.target.value;render()};
  $$('[data-indop]').forEach(b=>b.onclick=()=>{UI.indOp=b.dataset.indop;render()});
  $$('[data-ind]').forEach(cb=>cb.onchange=()=>{ const m=indicadoresAtivos(op,mes()); m[cb.dataset.ind]=cb.checked; salvarIndicadores(op,mes(),m); });
  $('#indPadrao').onclick=()=>salvarIndicadores(op,mes(),Object.fromEntries((IND_DEF[op]||[]).map(i=>[i.id,i.padrao!==false])));
  $('#indHerdar')&&($('#indHerdar').onclick=()=>{ delete DB.config.indicadores[mes()][op]; saveLocal(); render(); });
}

/* ---------- Conferência: ferramenta × total da planilha (PREMIACAO TTOAL) ---------- */
function mConferencia(){
  if(!UI.mes) return `<div class="empty">Nenhuma apuração ainda.</div>`;
  const L=linhasMaster().filter(r=>r.ref!=null);
  if(!L.length) return `<div class="empty">Esta competência não tem a coluna PREMIACAO TTOAL. Importe a folha consolidada com essa coluna para conferir.</div>`;
  const dif=r=>r.brutoCalc-r.ref;
  const ok=L.filter(r=>Math.abs(dif(r))<0.01), nok=L.filter(r=>Math.abs(dif(r))>=0.01).sort((a,b)=>Math.abs(dif(b))-Math.abs(dif(a)));
  const lista = UI.confTodos? [...nok,...ok] : nok;
  return `<div class="eyebrow">Conferência · ${mesNome(UI.mes)}</div><h2 style="font-size:28px;letter-spacing:-.03em;margin:4px 0 4px">Ferramenta × planilha</h2>
  <p style="color:var(--mut);margin:0 0 14px;font-size:12px">Compara o cálculo da ferramenta pelos indicadores (antes de estornos e quebras) com a coluna PREMIACAO TTOAL da folha. Serve para achar diferenças de regra; o que vale para pagamento é o escolhido em "Premiação exibida". Clique numa linha para ver o cálculo.</p>
  <div class="kpis"><div class="kpi"><small>Pessoas conferidas</small><b>${L.length}</b></div><div class="kpi"><small>Batem</small><b class="pos">${ok.length}</b></div><div class="kpi"><small>Divergem</small><b class="${nok.length?'neg':''}">${nok.length}</b></div>
  <div class="kpi"><small>Total planilha</small><b class="num">${R$(sum(L,r=>r.ref))}</b></div><div class="kpi"><small>Total ferramenta</small><b class="num">${R$(sum(L,r=>r.brutoCalc))}</b></div></div>
  <div class="row" style="margin-bottom:10px"><label class="row" style="gap:6px;font-size:12px"><input type="checkbox" id="confTodos" ${UI.confTodos?'checked':''}> Mostrar também quem bate</label></div>
  <div class="scroll"><table class="dt"><thead><tr><th>Nome</th><th>Operação</th><th>Cargo</th><th>Perfil / regional</th><th class="r">Planilha</th><th class="r">Ferramenta</th><th class="r">Diferença</th><th>Composição na ferramenta</th></tr></thead><tbody>
  ${lista.map(r=>{const d=dif(r); return `<tr data-ver="${esc(r.mat)}"><td><b>${esc(r.nome)}</b></td><td><span class="sw" style="background:${OPS[r.op].c}"></span>${OPS[r.op].nome}</td><td>${r.cargo}</td><td>${esc([r.perfil,r.regional].filter(Boolean).join(' · '))}</td>
    <td class="r num">${R$(r.ref)}</td><td class="r num">${R$(r.brutoCalc)}</td><td class="r num ${Math.abs(d)<0.01?'pos':'neg'}">${Math.abs(d)<0.01?'✓':(d>0?'+':'')+R$(d)}</td>
    <td style="white-space:normal;min-width:260px;color:var(--mut)">${(r.componentesCalc||r.componentes).filter(c=>c.valor).map(c=>`${esc(c.label)} ${R$(c.valor)}`).join(' · ')||'—'}</td></tr>`}).join('')||'<tr><td colspan=8 class="empty">Tudo batendo. 🎉</td></tr>'}
  </tbody></table></div>`;
}
function bindConferencia(){ $('#confTodos')&&($('#confTodos').onchange=e=>{UI.confTodos=e.target.checked;render()}); }

/* ---------- Publicação (modo nuvem) ---------- */
function blocoPublicar(){
  const pend = temAlteracaoNaoPublicada();
  const quando = PUBLICADO? new Date(PUBLICADO.em).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '';
  return `<span class="pubst ${pend?'pend':''}">${pend?'● Não publicado':`✓ Publicado ${quando}`}</span><button class="btn sm" id="publicar" ${DB.hc.length?'':'disabled'}>Publicar apuração</button>`;
}
function aviso(msg, erro){
  const d=document.createElement('div'); d.className='toast'+(erro?' err':''); d.textContent=msg; document.body.appendChild(d);
  setTimeout(()=>d.classList.add('on'),10); setTimeout(()=>{d.classList.remove('on'); setTimeout(()=>d.remove(),300)}, erro?7000:3500);
}

/* ---------- Premiação exibida: planilha oficial × cálculo da ferramenta ---------- */
function blocoFonte(){
  const tem=mesTemPlanilha(UI.mes), f=fontePremiacao(UI.mes);
  const L=Object.values(apurar(UI.mes).pessoas);
  const semRef=L.filter(r=>r.ref==null).length;
  return `<div class="blk fonte"><div class="row" style="justify-content:space-between;gap:14px">
    <div style="min-width:240px;flex:1"><b>Premiação exibida em ${mesNome(UI.mes)}</b>
      <div class="d" style="margin:4px 0 0">${f==='planilha'
        ? `Vale o total da <b>planilha oficial</b> (coluna PREMIACAO TTOAL), menos quebras e estornos. É o que os colaboradores veem e o que vai para pagamento.${semRef?` ${semRef} pessoa(s) sem valor na planilha usam o cálculo.`:''}`
        : tem? 'Vale o <b>cálculo da ferramenta</b> pelos indicadores. A planilha oficial fica só na aba Conferência.'
             : 'Esta competência não tem a coluna PREMIACAO TTOAL: vale o cálculo da ferramenta.'}</div></div>
    <div class="seg">
      <button data-fonte="planilha" class="${f==='planilha'?'on':''}" ${tem?'':'disabled'}>Planilha oficial</button>
      <button data-fonte="calculo" class="${f==='calculo'?'on':''}">Cálculo da ferramenta</button>
    </div></div>
    ${f==='planilha'?`<label class="row" style="gap:6px;font-size:12px;margin-top:10px"><input type="checkbox" id="qDesc" ${DB.config.planilhaDescontaQuebras?'checked':''}> A PREMIACAO TTOAL da planilha já vem com as quebras descontadas (não descontar de novo)</label>`:''}
  </div>`;
}
