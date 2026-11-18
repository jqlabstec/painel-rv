/* =====================================================================
   GUERRILHA · Trade Claro
   Promotor: Combo → R$ por combo ativado (COMBO ATV), conforme a faixa
             Flex  → R$ por flex (FLEX), conforme a faixa, com TETO de R$ 1.200
             + VALORES D60 + CONTESTAÇÕES (valores lançados na folha)
   Perfil: REGIONAL + PERFIL da base → GERAL (SP1), RJ/ES, SP1 PLENO, SP1 SÊNIOR.
   Supervisor (pilares): Meta geral controle (flex) · Meta geral combo ·
             Gestão por HC controle · Gestão por HC combo · Conciliação · Turnover
   Fonte: aba "Guerrilha" (Modelos_de_RV) + "MODELO GESTORES" (folha_rv)
   ===================================================================== */
function perfilKey(perfil, regional){
  const s=norm(perfil)+' '+norm(regional||'');
  if(s.includes('SEN')||/\bSR\b/.test(s)) return 'SP1 SENIOR';
  if(s.includes('PLEN')||s.includes('PL3NO')||/\bPL\b/.test(s)) return 'SP1 PLENO';
  if(s.includes('RJ')||/\bES\b/.test(s)) return 'RJ/ES';
  return 'GERAL';
}
const lblQuebra = r=> r.ini===0&&r.fin===0? 'Sem quebra (0%)' : r.fin==null&&r.ini<0.001? 'Qualquer quebra' : faixaLbl(r,pctLbl);
const ROTULO_PERFIL = {'GERAL':'Geral · SP1','RJ/ES':'Geral · RJ/ES','SP1 PLENO':'SP1 Pleno','SP1 SENIOR':'SP1 Sênior'};

registrarOperacao('guerrilha', {
  nome:'Guerrilha', sub:'Trade Claro', c:'#c8102e', c2:'#7a0618', soft:'#fdecee',
  aliases:['GUERRILHA','GUERR','CLARO'],

  indicadores: [
    {id:'combo',        cargo:'promotor',   nome:'Combo ativado',          desc:'R$ por combo conforme a faixa de quantidade do perfil.'},
    {id:'flex',         cargo:'promotor',   nome:'Flex',                   desc:'R$ por flex conforme a faixa, com teto mensal.'},
    {id:'d60',          cargo:'promotor',   nome:'Valores D60',            desc:'Valor de D60 lançado na folha.'},
    {id:'contestacoes', cargo:'promotor',   nome:'Contestações',           desc:'Valores de contestação aprovados, lançados na folha.'},
    {id:'meta_controle',cargo:'supervisor', nome:'% Meta geral controle',  desc:'Prêmio pelo %ICM de controle (flex) da equipe.'},
    {id:'meta_combo',   cargo:'supervisor', nome:'% Meta geral combo',     desc:'Prêmio pelo %ICM de combo da equipe.'},
    {id:'gestao_hc_controle', cargo:'supervisor', nome:'Gestão por HC · controle', desc:'Quantos HCs bateram 90/100/120% da meta individual de controle.'},
    {id:'gestao_hc_combo',    cargo:'supervisor', nome:'Gestão por HC · combo',    desc:'Quantos HCs bateram 90/100/120% da meta individual de combo.'},
    {id:'conciliacao',  cargo:'supervisor', nome:'Conciliação financeira', desc:'Prêmio se a quebra na conciliação financeira for zero.'},
    {id:'turnover',     cargo:'supervisor', nome:'% Turnover',             desc:'Prêmio pelo turnover da equipe (coluna % TURN OVER).', padrao:false},
  ],
  campos: {
    promotor:   [['COMBO_ATV','Combos ativados','n'],['FLEX','Flex','n'],['VALORES_D60','Valores D60','r$'],['CONTESTACOES','Contestações','r$']],
    supervisor: [['COMBO_ATV','Combos da equipe','n'],['FLEX','Flex da equipe','n'],['META_CONTROLE','Meta controle','n'],['META_COMBO','Meta combo','n'],
                 ['%ICM_CONTROLE','% ICM controle','%'],['%ICM_COMBO','% ICM combo','%'],['%QUEBRA_CONC_FINANCEIRA','% Quebra conciliação','%']],
  },

  regras: {
    tetoFlex: 1200,
    perfis: {
      'GERAL':      { combo:[{ini:30,fin:44,un:.35,d60:.15,d60p:.165},{ini:45,fin:59,un:.7,d60:.3,d60p:.33},{ini:60,fin:null,un:1.05,d60:.45,d60p:.495}],
                      flex: [{ini:45,fin:64,rec:5,car:7,recP:6,carP:8},{ini:65,fin:84,rec:6,car:8,recP:7,carP:9},{ini:85,fin:null,rec:7,car:9,recP:8,carP:10}] },
      'RJ/ES':      { combo:[{ini:30,fin:44,un:.35,d60:.15,d60p:.165},{ini:45,fin:59,un:.7,d60:.3,d60p:.33},{ini:60,fin:null,un:1.05,d60:.45,d60p:.495}],
                      flex: [{ini:30,fin:54,rec:5,car:7,recP:6,carP:8},{ini:55,fin:74,rec:6,car:8,recP:7,carP:9},{ini:75,fin:null,rec:7,car:9,recP:8,carP:10}] },
      'SP1 PLENO':  { combo:[{ini:35,fin:54,un:.35,d60:.15,d60p:.165},{ini:55,fin:69,un:.7,d60:.3,d60p:.33},{ini:70,fin:null,un:1.05,d60:.45,d60p:.495}],
                      flex: [{ini:55,fin:79,rec:5,car:7,recP:6,carP:8},{ini:80,fin:99,rec:6,car:8,recP:7,carP:9},{ini:100,fin:null,rec:7,car:9,recP:8,carP:10}] },
      'SP1 SENIOR': { combo:[{ini:45,fin:64,un:.35,d60:.15,d60p:.165},{ini:65,fin:79,un:.7,d60:.3,d60p:.33},{ini:80,fin:null,un:1.05,d60:.45,d60p:.495}],
                      flex: [{ini:65,fin:94,rec:5,car:7,recP:6,carP:8},{ini:95,fin:114,rec:6,car:8,recP:7,carP:9},{ini:115,fin:null,rec:7,car:9,recP:8,carP:10}] },
    },
    supervisor: {
      metaControle: [{ini:0,fin:.8999,v:0},{ini:.9,fin:.9999,v:220},{ini:1,fin:1.1999,v:352},{ini:1.2,fin:null,v:440}],
      metaCombo:    [{ini:0,fin:.8999,v:0},{ini:.9,fin:.9999,v:110},{ini:1,fin:1.1999,v:176},{ini:1.2,fin:null,v:220}],
      gestaoHC:     [{faixa:'90%',col:'90%',controle:495,combo:220},{faixa:'100%',col:'100%',controle:792,combo:352},{faixa:'120%',col:'120%',controle:990,combo:440}],
      hcOrcado: 10,              // usado só se não houver promotores vinculados ao supervisor na base
      conciliacao:  [{ini:0,fin:0,v:150},{ini:.0001,fin:null,v:0}],
      turnover:     [{ini:0,fin:.05,v:110},{ini:.0501,fin:.07,v:88},{ini:.0701,fin:.10,v:55},{ini:.1001,fin:null,v:0}],
    },
  },

  calcularPromotor(p, vendas, ind, R, ctx){
    const pk=perfilKey(p.perfil||p.regiao, p.regional), T=R.perfis[pk]||R.perfis.GERAL;
    const isFlex=v=>norm(v.tipo+' '+v.produto).includes('FLEX');
    const combos=vendas.filter(v=>!isFlex(v)), flex=vendas.filter(isFlex);
    const qC = FN(ind,'COMBO_ATV','COMBOS') ?? sum(combos.filter(v=>!norm(v.marco).includes('60')),v=>v.qtd||1);
    const qF = FN(ind,'FLEX') ?? sum(flex,v=>v.qtd||1);
    const iC=faixaIdx(T.combo,qC), fC=iC>=0?T.combo[iC]:null;
    const iF=faixaIdx(T.flex,qF), fF=iF>=0?T.flex[iF]:null;
    const det=[];
    let rvC=0, rvF=0, rvD60=0;
    if(F(ind,'COMBO_ATV','COMBOS')!==undefined) rvC = qC*(fC?fC.un:0);
    else combos.forEach(v=>{ const d60=norm(v.marco).includes('60'); const u=fC?(d60?(v.port?fC.d60p:fC.d60):fC.un):0; const val=u*(v.qtd||1); if(d60) rvD60+=val; else rvC+=val;
      det.push({...v, valorRv:val, calc:`${N(v.qtd||1)} × ${R$(u)} (${d60?'d60'+(v.port?' c/ port':''):'d30'})`}); });
    if(F(ind,'FLEX')!==undefined) rvF = qF*(fF?fF.rec:0);
    else flex.forEach(v=>{ const car=norm(v.tipo+' '+v.produto).includes('CART'); const u=fF?fF[(car?'car':'rec')+(v.port?'P':'')]:0; const val=u*(v.qtd||1); rvF+=val;
      det.push({...v, valorRv:val, calc:`${N(v.qtd||1)} × ${R$(u)} (${car?'Cartão':'Recarga'}${v.port?' c/ port':''})`}); });
    const semTeto=rvF; if(R.tetoFlex && rvF>R.tetoFlex) rvF=R.tetoFlex;
    const d60 = FN(ind,'VALORES_D60') ?? rvD60;
    const contest = FN(ind,'CONTESTACOES')||0;
    det.sort((a,b)=>String(b.data).localeCompare(String(a.data)));
    const nxC=T.combo[iC+1], nxF=T.flex[iF+1];
    return { qtdVendas:qC+qF, componentes:[
        {ind:'combo', label:'Premiação Combo', detail:`${N(qC)} combos × ${R$(fC?fC.un:0)}`, valor:rvC},
        {ind:'flex', label:'Premiação Flex', detail:`${N(qF)} flex × ${R$(fF?fF.rec:0)}${semTeto>rvF?` · teto de ${R$(R.tetoFlex)}`:''}`, valor:rvF},
        {ind:'d60', label:'Valores D60', detail:'lançados na apuração', valor:d60},
        {ind:'contestacoes', label:'Contestações', detail:'valores aprovados', valor:contest}],
      vendasDet:det,
      faixas:[
        { ind:'combo', titulo:`Combo: quanto vale cada combo (${ROTULO_PERFIL[pk]})`, desc:'O valor por combo depende da quantidade de combos ativados no mês e vale para todos.',
          kpis:[['Combos no mês',N(qC)],['Valor por combo',R$(fC?fC.un:0)],['Premiação Combo',R$(rvC)]],
          cols:['Combos no mês','Valor por combo'], rows:T.combo.map((r,k)=>({cells:[faixaLbl(r),R$(r.un)],you:k===iC,nx:k===iC+1})),
          dica: nxC?`Faltam <b>${N(nxC.ini-qC)} combos</b> para a próxima faixa: todos passam a valer <b>${R$(nxC.un)}</b>.`:'', max:!nxC },
        { ind:'flex', titulo:`Flex: quanto vale cada flex (${ROTULO_PERFIL[pk]})`, desc:`Valor por flex conforme a quantidade no mês, limitado a ${R$(R.tetoFlex)} no mês.`,
          kpis:[['Flex no mês',N(qF)],['Valor por flex',R$(fF?fF.rec:0)],['Premiação Flex',R$(rvF)]],
          cols:['Flex no mês','Valor por flex'], rows:T.flex.map((r,k)=>({cells:[faixaLbl(r),R$(r.rec)],you:k===iF,nx:k===iF+1})),
          dica: semTeto>rvF?`Você bateu o teto de ${R$(R.tetoFlex)} de Flex no mês.`: nxF?`Faltam <b>${N(nxF.ini-qF)} flex</b> para a próxima faixa: todos passam a valer <b>${R$(nxF.rec)}</b>.`:'', max:!nxF }],
      estimaEstorno:e=>{ if(norm(e.produto).includes('FLEX')) return (fF?fF.rec:0)*(e.qtd||1); return (fC?fC.un:0)*(e.qtd||1); } };
  },

  calcularGestor(p, cargo, timeRes, timeHC, row, R, ctx){
    const S=R.supervisor; if(cargo!=='supervisor'||!S) return null;
    const flex=FN(row,'FLEX') ?? 0, combo=FN(row,'COMBO_ATV') ?? 0;
    const mC=FN(row,'META_CONTROLE')||0, mB=FN(row,'META_COMBO')||0;
    const icmC = FP(row,'%ICM_CONTROLE') ?? (mC? flex/mC : 0);
    const icmB = FP(row,'%ICM_COMBO') ?? (mB? combo/mB : 0);
    const nHC = timeHC.length || S.hcOrcado;
    const hcs = tipo => S.gestaoHC.map(g=>({...g, n: FN(row,`HC_%ICM_${g.col}_${tipo}`)||0}));
    const hcC=hcs('CONTROLE'), hcB=hcs('COMBO');
    const gC = sum(hcC,g=>g.n*g.controle)/nHC, gB = sum(hcB,g=>g.n*g.combo)/nHC;
    const iC=faixaIdx(S.metaControle,icmC), iB=faixaIdx(S.metaCombo,icmB);
    const quebra = FP(row,'%QUEBRA_CONC_FINANCEIRA') ?? 0;
    const iQ=faixaIdx(S.conciliacao,quebra);
    const turn = FP(row,'%TURN_OVER','%TURNOVER','TURNOVER');
    const iT = turn==null?-1:faixaIdx(S.turnover,turn);
    const v=(t,i)=>i>=0?t[i].v:0;
    const tabHC=(tipo,lista)=>({cols:['HCs em','Prêmio por HC','HCs','Valor'], rows:lista.map(g=>({cells:[g.faixa,R$(g[tipo]),N(g.n),R$(g.n*g[tipo]/nHC)],you:g.n>0,nx:false}))});
    return {
      componentes:[
        {ind:'meta_controle', label:'% Meta geral controle', detail:`${N(flex)} de ${N(mC)} (${pctLbl(icmC)})`, valor:v(S.metaControle,iC)},
        {ind:'meta_combo', label:'% Meta geral combo', detail:`${N(combo)} de ${N(mB)} (${pctLbl(icmB)})`, valor:v(S.metaCombo,iB)},
        {ind:'gestao_hc_controle', label:'Gestão por HC · controle', detail:`${hcC.map(g=>`${N(g.n)} em ${g.faixa}`).join(' · ')} ÷ ${nHC} HCs`, valor:gC},
        {ind:'gestao_hc_combo', label:'Gestão por HC · combo', detail:`${hcB.map(g=>`${N(g.n)} em ${g.faixa}`).join(' · ')} ÷ ${nHC} HCs`, valor:gB},
        {ind:'conciliacao', label:'Conciliação financeira', detail:`quebra de ${pctLbl(quebra)}`, valor:v(S.conciliacao,iQ)},
        {ind:'turnover', label:'% Turnover', detail:turn==null?'indicador não enviado':pctLbl(turn), valor:v(S.turnover,iT)}],
      faixas:[
        { ind:'meta_controle', titulo:'% Meta geral controle (flex)', desc:'Prêmio pelo atingimento da meta de controle da equipe.',
          kpis:[['Flex da equipe',N(flex)],['Meta',N(mC)],['% ICM',pctLbl(icmC)],['Prêmio',R$(v(S.metaControle,iC))]],
          cols:['% ICM','Prêmio'], rows:S.metaControle.map((r,k)=>({cells:[faixaLbl(r,pctLbl),R$(r.v)],you:k===iC,nx:k===iC+1})),
          dica: S.metaControle[iC+1]&&mC?`Faltam <b>${N(Math.ceil(S.metaControle[iC+1].ini*mC)-flex)} flex</b> para o próximo prêmio (${R$(S.metaControle[iC+1].v)}).`:'', max:!S.metaControle[iC+1] },
        { ind:'meta_combo', titulo:'% Meta geral combo', desc:'Prêmio pelo atingimento da meta de combo da equipe.',
          kpis:[['Combos da equipe',N(combo)],['Meta',N(mB)],['% ICM',pctLbl(icmB)],['Prêmio',R$(v(S.metaCombo,iB))]],
          cols:['% ICM','Prêmio'], rows:S.metaCombo.map((r,k)=>({cells:[faixaLbl(r,pctLbl),R$(r.v)],you:k===iB,nx:k===iB+1})),
          dica: S.metaCombo[iB+1]&&mB?`Faltam <b>${N(Math.ceil(S.metaCombo[iB+1].ini*mB)-combo)} combos</b> para o próximo prêmio (${R$(S.metaCombo[iB+1].v)}).`:'', max:!S.metaCombo[iB+1] },
        { ind:'gestao_hc_controle', titulo:'Gestão por HC · controle', desc:`Cada HC que bate a meta individual vale o prêmio da faixa; o total é dividido pelos ${nHC} HCs da equipe.`,
          kpis:[['HCs da equipe',N(nHC)],['Prêmio',R$(gC)]], ...tabHC('controle',hcC), dica:'', max:false },
        { ind:'gestao_hc_combo', titulo:'Gestão por HC · combo', desc:`Cada HC que bate a meta individual vale o prêmio da faixa; o total é dividido pelos ${nHC} HCs da equipe.`,
          kpis:[['HCs da equipe',N(nHC)],['Prêmio',R$(gB)]], ...tabHC('combo',hcB), dica:'', max:false },
        { ind:'conciliacao', titulo:'Conciliação financeira', desc:'Prêmio quando não há quebra na conciliação financeira.',
          kpis:[['% Quebra',pctLbl(quebra)],['Prêmio',R$(v(S.conciliacao,iQ))]],
          cols:['% Quebra','Prêmio'], rows:S.conciliacao.map((r,k)=>({cells:[lblQuebra(r),R$(r.v)],you:k===iQ,nx:false})), dica:'', max:false },
        { ind:'turnover', titulo:'% Turnover', desc:'Prêmio pelo turnover da equipe no mês.',
          kpis:[['% Turnover',turn==null?'—':pctLbl(turn)],['Prêmio',R$(v(S.turnover,iT))]],
          cols:['% Turnover','Prêmio'], rows:S.turnover.map((r,k)=>({cells:[faixaLbl(r,pctLbl),R$(r.v)],you:k===iT,nx:false})), dica:'', max:false }],
    };
  },

  telaRegras(R, tabela){
    const S=R.supervisor||{};
    const perfis = Object.entries(R.perfis).map(([k,T])=>`<div class="blk perfil">
      <h3>${ROTULO_PERFIL[k]||k}</h3>
      <div class="lbl-mini">Combo · R$ por combo</div>
      <div class="tblwrap"><table class="ft sm"><thead><tr><th>Combos</th><th>Valor</th><th>D60</th><th>D60 port.</th></tr></thead><tbody>${T.combo.map(r=>`<tr><td>${faixaLbl(r)}</td><td>${R$(r.un)}</td><td>${R$(r.d60)}</td><td>${R$(r.d60p)}</td></tr>`).join('')}</tbody></table></div>
      <div class="lbl-mini">Flex · R$ por flex</div>
      <div class="tblwrap"><table class="ft sm"><thead><tr><th>Flex</th><th>Recarga</th><th>Cartão</th><th>Rec. port.</th><th>Cart. port.</th></tr></thead><tbody>${T.flex.map(r=>`<tr><td>${faixaLbl(r)}</td><td>${R$(r.rec)}</td><td>${R$(r.car)}</td><td>${R$(r.recP)}</td><td>${R$(r.carP)}</td></tr>`).join('')}</tbody></table></div>
    </div>`).join('');
    return `<p>Promotor: Combo e Flex em R$ por unidade conforme a faixa do perfil. Teto de Flex: ${R$(R.tetoFlex)}/mês. D60 e contestações vêm da folha.</p>
      <div class="grid-perfis">${perfis}</div>
      <h3 style="margin:18px 0 8px">Supervisor · pilares</h3><div class="grid3">
      ${S.metaControle?tabela('% Meta geral controle',['% ICM','Prêmio'],S.metaControle.map(r=>[faixaLbl(r,pctLbl),R$(r.v)])):''}
      ${S.metaCombo?tabela('% Meta geral combo',['% ICM','Prêmio'],S.metaCombo.map(r=>[faixaLbl(r,pctLbl),R$(r.v)])):''}
      ${S.gestaoHC?tabela('Gestão por HC (por HC, ÷ HCs da equipe)',['Meta individual','Controle','Combo'],S.gestaoHC.map(g=>[g.faixa,R$(g.controle),R$(g.combo)])):''}
      ${S.conciliacao?tabela('Conciliação financeira',['% Quebra','Prêmio'],S.conciliacao.map(r=>[lblQuebra(r),R$(r.v)])):''}
      ${S.turnover?tabela('% Turnover',['Faixa','Prêmio'],S.turnover.map(r=>[faixaLbl(r,pctLbl),R$(r.v)])):''}</div>`;
  },
});
