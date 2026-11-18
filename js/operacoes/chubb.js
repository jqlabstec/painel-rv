/* =====================================================================
   CHUBB · Seguros
   Promotor: faixa pela QUANTIDADE de seguros no mês (SEG CHUB) → valor por
             seguro (coluna "sem ABS", ou "com ABS" se ABS CHUBB > 0).
   Supervisor / Coordenador: bônus fixo pela produtividade (PROD SEG CHUBB).
   Líder (promotor com PERFIL = LÍDER): bônus pela própria faixa.
   Fonte: aba "Chubb" (Modelos_de_RV) + aba "MODELO GESTORES" (folha_rv)
   Folha de outubro: todos abaixo de 80 seguros → R$ 0, igual à planilha.
   ===================================================================== */
registrarOperacao('chubb', {
  nome:'Chubb', sub:'Seguros', c:'#1d3b8f', c2:'#0b1a4a', soft:'#e9eefc',
  aliases:['CHUBB'],

  indicadores: [
    {id:'seguros',    cargo:'promotor',    nome:'Seguros vendidos',          desc:'Valor por seguro conforme a faixa de quantidade do mês.'},
    {id:'abs',        cargo:'promotor',    nome:'Redutor por ABS',           desc:'Com ABS no mês, paga a coluna "com ABS" da tabela.'},
    {id:'lider',      cargo:'promotor',    nome:'Bônus líder',               desc:'Só para promotor com PERFIL = LÍDER.'},
    {id:'sup_prod',   cargo:'supervisor',  nome:'Produtividade da equipe',   desc:'Bônus fixo pela faixa de PROD SEG CHUBB.'},
    {id:'coord_prod', cargo:'coordenador', nome:'Produtividade da coordenação', desc:'Bônus fixo pela faixa de PROD SEG CHUBB.'},
  ],
  campos: {
    promotor:   [['SEG_CHUB','Seguros vendidos','n'],['ABS_CHUBB','ABS no mês','n']],
    supervisor: [['SEG_CHUB','Seguros da equipe','n'],['PROD_SEG_CHUBB','Produtividade','n1']],
    coordenador:[['SEG_CHUB','Seguros da coordenação','n'],['PROD_SEG_CHUBB','Produtividade','n1']],
  },

  regras: {
    baseFaixa: 'quantidade',               // 'quantidade' (seguros no mês) ou 'atingimento' (% da meta)
    promotor: [
      {ini:0,  fin:79,  s:0,  c:0},
      {ini:80, fin:99,  s:3,  c:2.4},
      {ini:100,fin:109, s:8,  c:3.2},
      {ini:110,fin:119, s:9,  c:6.4},
      {ini:120,fin:129, s:12, c:9.6},
      {ini:130,fin:139, s:14, c:11.2},
      {ini:140,fin:null,s:16, c:12.8},
    ],
    supervisor: [
      {ini:0,fin:79,v:0},{ini:80,fin:99,v:800},{ini:100,fin:119,v:1500},{ini:120,fin:139,v:2000},{ini:140,fin:null,v:2500}],
    coordenador: [   // planilha: 1000 · ×1,2 · ×1,25 · ×1,25
      {ini:0,fin:79,v:0},{ini:80,fin:99,v:1000},{ini:100,fin:119,v:1800},{ini:120,fin:139,v:2500},{ini:140,fin:null,v:3125}],
    lider: [
      {ini:0,fin:79,v:0},{ini:80,fin:99,v:80},{ini:100,fin:119,v:100},{ini:120,fin:null,v:150}],
  },

  calcularPromotor(p, vendas, ind, R, ctx){
    const qtd = FN(ind,'SEG_CHUB','SEG_CHUBB','SEGUROS') ?? sum(vendas,v=>v.qtd||1);
    const meta = FN(ind,'META','META_SEGUROS') || toNum(p.meta) || 0;
    const usaAt = R.baseFaixa==='atingimento' && meta>0;
    const base = usaAt ? qtd/meta*100 : qtd;
    const abs = ctx.A('abs') && ((FN(ind,'ABS_CHUBB','ABS')||0)>0 || ind.abs===true);
    const i = faixaIdx(R.promotor, base), f=i>=0?R.promotor[i]:null;
    const unit = f? (abs?f.c:f.s) : 0;
    const rv = qtd*unit;
    const nx=R.promotor[i+1];
    let dica='';
    if(nx){ const alvo = usaAt? Math.ceil(nx.ini/100*meta) : nx.ini; const falta=Math.max(0,alvo-qtd);
      dica=`Faltam <b>${N(falta)} seguro${falta===1?'':'s'}</b> para a próxima faixa. Aí <b>todos</b> passam a valer <b>${R$(abs?nx.c:nx.s)}</b> cada (premiação de ${R$(rv)} para ${R$((qtd+falta)*(abs?nx.c:nx.s))}).`; }
    const comps=[{ind:'seguros', label:'Premiação seguros', detail:`${N(qtd)} seguros × ${R$(unit)}${abs?' (com ABS)':''}`, valor:rv}];
    const faixas=[{ ind:'seguros', titulo:'Quanto vale cada seguro',
        desc:`O valor por seguro depende do ${usaAt?'% de atingimento da meta':'total de seguros'} no mês e vale para todos.${ctx.A('abs')?' Com ABS no mês, vale a coluna "com ABS".':''}`,
        kpis:[['Seguros no mês',N(qtd)],...(usaAt?[['Atingimento',pctLbl(base/100)]]:[]),['Valor por seguro',R$(unit)],...(ctx.A('abs')?[['ABS',abs?'Sim':'Não']]:[])],
        cols:[usaAt?'Atingimento da meta':'Seguros no mês','Sem ABS',...(ctx.A('abs')?['Com ABS']:[])],
        rows:R.promotor.map((r,k)=>({cells:[faixaLbl(r,v=>usaAt?v+'%':N(v)),R$(r.s),...(ctx.A('abs')?[R$(r.c)]:[])],you:k===i,nx:k===i+1})),
        dica, max:!nx }];
    if(norm(p.perfil).includes('LIDER') && R.lider){
      const il=faixaIdx(R.lider,qtd), fl=il>=0?R.lider[il]:{v:0};
      comps.push({ind:'lider', label:'Bônus líder', detail:`faixa ${il>=0?faixaLbl(R.lider[il]):'—'}`, valor:fl.v});
      faixas.push({ind:'lider', titulo:'Bônus líder', desc:'Bônus fixo do líder conforme a faixa do mês.', kpis:[['Bônus',R$(fl.v)]],
        cols:['Faixa','Bônus'], rows:R.lider.map((r,k)=>({cells:[faixaLbl(r),R$(r.v)],you:k===il,nx:k===il+1})), dica:'', max:!R.lider[il+1]});
    }
    return { qtdVendas:qtd, componentes:comps, faixas,
      vendasDet: vendas.map(v=>({...v, valorRv:(v.qtd||1)*unit, calc:`${N(v.qtd||1)} × ${R$(unit)}`})),
      estimaEstorno:e=>(e.qtd||1)*unit };
  },

  calcularGestor(p, cargo, timeRes, timeHC, row, R, ctx){
    const tab=R[cargo]; if(!tab) return null;
    const id = cargo==='supervisor'?'sup_prod':'coord_prod';
    const prod = FN(row,'PROD_SEG_CHUBB');
    const qtd = FN(row,'SEG_CHUB') ?? sum(timeRes,x=>x.qtdVendas||0);
    const base = prod ?? qtd;
    const i=faixaIdx(tab,base), f=i>=0?tab[i]:{v:0}, nx=tab[i+1];
    const nomeCargo = cargo==='supervisor'?'supervisão':'coordenação';
    return {
      componentes:[{ind:id, label:`Bônus ${nomeCargo}`, detail:`produtividade ${N(base,1)}`, valor:f.v}],
      faixas:[{ ind:id, titulo:`Bônus de ${nomeCargo}`, desc:'Bônus fixo pela produtividade de seguros da equipe (PROD SEG CHUBB).',
        kpis:[['Seguros da equipe',N(qtd)],['Produtividade',N(base,1)],['Bônus',R$(f.v)]],
        cols:['Produtividade','Bônus'], rows:tab.map((r,k)=>({cells:[faixaLbl(r),R$(r.v)],you:k===i,nx:k===i+1})),
        dica: nx?`Chegando a <b>${N(nx.ini)}</b> de produtividade, o bônus vai para <b>${R$(nx.v)}</b>.`:'', max:!nx }],
    };
  },

  telaRegras(R, tabela){
    return `<p>Promotor: faixa por ${R.baseFaixa==='atingimento'?'% de atingimento da meta':'quantidade de seguros'}, valor por seguro sem/com ABS. Gestores: produtividade (PROD SEG CHUBB).</p><div class="grid3">
      ${tabela('Promotores',['Faixa','Sem ABS','Com ABS'],R.promotor.map(r=>[faixaLbl(r),R$(r.s),R$(r.c)]))}
      ${tabela('Supervisores',['Produtividade','Bônus'],R.supervisor.map(r=>[faixaLbl(r),R$(r.v)]))}
      ${tabela('Coordenador',['Produtividade','Bônus'],R.coordenador.map(r=>[faixaLbl(r),R$(r.v)]))}
      ${tabela('Líder',['Faixa','Bônus'],R.lider.map(r=>[faixaLbl(r),R$(r.v)]))}</div>`;
  },
});
