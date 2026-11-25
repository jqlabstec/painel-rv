/* =====================================================================
   CREDSYSTEM · Cartões
   Promotor: APROVADOS × repasse da faixa + bônus fixo de % Ativação,
             % Seguros e % Assiduidade.
             GATILHO: abaixo de 80 aprovações não paga nada (nem os bônus).
   Supervisor: bônus pelo % da META APROV × (1 + ajuste de % ativação + ajuste de % seguros).
   "Fat. RV" = quanto o cliente paga (usado no master para a margem).
   Fonte: aba "CredSytem" (Modelos_de_RV) + "MODELO GESTORES" (folha_rv)
   ===================================================================== */
registrarOperacao('credsystem', {
  nome:'CredSystem', sub:'Cartões', c:'#0f7a4f', c2:'#064e32', soft:'#e7f6ee',
  aliases:['CREDSYSTEM','CREDSYTEM','CRED'],

  indicadores: [
    {id:'aprovacoes',   cargo:'promotor',   nome:'Aprovações',       desc:'Valor por aprovação conforme a faixa. Abaixo de 80 aprovações nada é pago.'},
    {id:'ativacao',     cargo:'promotor',   nome:'% Ativação',       desc:'Bônus fixo pela faixa de ativados ÷ aprovados.'},
    {id:'seguros',      cargo:'promotor',   nome:'% Seguros',        desc:'Bônus fixo pela faixa de seguros ÷ aprovados.'},
    {id:'assiduidade',  cargo:'promotor',   nome:'% Assiduidade',    desc:'Bônus fixo pela faixa de assiduidade.'},
    {id:'sup_aprov',    cargo:'supervisor', nome:'Meta de aprovações', desc:'Bônus pelo % da meta de aprovações da equipe.'},
    {id:'sup_ativacao', cargo:'supervisor', nome:'% Ativação (ajuste)', desc:'Aumenta ou reduz o bônus de aprovações (−20% a +30%).'},
    {id:'sup_seguros',  cargo:'supervisor', nome:'% Seguros (ajuste)',  desc:'Aumenta o bônus de aprovações (até +30%).'},
  ],
  campos: {
    promotor:   [['APROVADOS','Aprovações','n'],['ATIVIADOS','Ativados','n'],['%ATIVADOS','% Ativação','%'],['SEGUROS_CRED','Seguros','n'],['%SEGUROS_CRED','% Seguros','%'],['%ASSIDUIDADE','% Assiduidade','%']],
    supervisor: [['META_APROV','Meta de aprovações','n'],['APROVADOS','Aprovações','n'],['%ATIVADOS','% Ativação','%'],['%SEGUROS_CRED','% Seguros','%']],
  },

  colunasPremio: {
    promotor: [['RV_APROVACAO','Aprovações','aprovacoes'],['RV_ATIVADO','Bônus ativação','ativacao'],['RV_SEGURO','Bônus seguros','seguros'],['RV_ASSIDUIDADE','Bônus assiduidade','assiduidade']],
    rotulo: { promotor:'Premiação CredSystem', supervisor:'Premiação supervisão' },
  },

  regras: {
    gatilhoAprovacoes: true,   // abaixo da 1ª faixa paga de aprovações, zera tudo
    aprovacoes: [
      {ini:0,fin:79,fat:0,rep:0},{ini:80,fin:99,fat:2.64,rep:1.7},{ini:100,fin:124,fat:3.11,rep:2},{ini:125,fin:null,fat:5.44,rep:3.5}],
    ativacao: [
      {ini:0,fin:.6499,fat:0,rep:0},{ini:.65,fin:.6999,fat:139.83,rep:90},{ini:.70,fin:.7499,fat:163.13,rep:105},{ini:.75,fin:null,fat:194.2,rep:125}],
    seguros: [
      {ini:0,fin:.3499,fat:0,rep:0},{ini:.35,fin:.3999,fat:69.91,rep:45},{ini:.40,fin:.4999,fat:100.99,rep:65},{ini:.50,fin:null,fat:124.29,rep:80}],
    assiduidade: [
      {ini:0,fin:.8999,fat:0,rep:0},{ini:.90,fin:.9499,fat:77.68,rep:50},{ini:.95,fin:.9999,fat:116.52,rep:75},{ini:1,fin:null,fat:155.36,rep:100}],
    supervisor: {
      aprovacoes: [{ini:0,fin:.8999,v:0},{ini:.9,fin:.9999,v:400},{ini:1,fin:1.0999,v:800},{ini:1.1,fin:null,v:1200}],
      ativacao:   [{ini:0,fin:.5,aj:-.2},{ini:.51,fin:.6499,aj:0},{ini:.65,fin:.6999,aj:.1},{ini:.7,fin:.7999,aj:.2},{ini:.8,fin:null,aj:.3}],
      seguros:    [{ini:0,fin:.3999,aj:0},{ini:.4,fin:.4999,aj:.1},{ini:.5,fin:.5999,aj:.15},{ini:.6,fin:.6999,aj:.2},{ini:.7,fin:null,aj:.3}],
    },
  },

  calcularPromotor(p, vendas, ind, R, ctx){
    const apr = FN(ind,'APROVADOS','APROVACOES') ?? sum(vendas,v=>v.qtd||1);
    const ativados = FN(ind,'ATIVIADOS','ATIVADOS');
    const iA=faixaIdx(R.aprovacoes,apr), fA=iA>=0?R.aprovacoes[iA]:{fat:0,rep:0};
    const minimo = (R.aprovacoes.find(r=>r.rep>0)||{ini:0}).ini;
    const travado = R.gatilhoAprovacoes && ctx.A('aprovacoes') && apr<minimo;
    const comp=[{ind:'aprovacoes', label:'Aprovações', detail:`${N(apr)} × ${R$(fA.rep)}`, valor:apr*fA.rep}];
    let fat = apr*fA.fat;
    const blocos=[];
    const nxA=R.aprovacoes[iA+1];
    blocos.push({ ind:'aprovacoes', titulo:'Aprovações: quanto vale cada uma',
      desc:`O valor por aprovação depende do total de aprovações no mês e vale para todas.${R.gatilhoAprovacoes?` Abaixo de ${minimo} aprovações, nenhum indicador é pago.`:''}`,
      kpis:[['Aprovações',N(apr)],['Repasse por aprovação',R$(fA.rep)],['Premiação aprovações',R$(apr*fA.rep)]],
      cols:['Aprovações no mês','Repasse por aprovação'],
      rows:R.aprovacoes.map((r,k)=>({cells:[faixaLbl(r),R$(r.rep)],you:k===iA,nx:k===iA+1})),
      dica: nxA?`Faltam <b>${N(nxA.ini-apr)} aprovações</b> para a próxima faixa: todas passam a valer <b>${R$(nxA.rep)}</b>${travado?' e os bônus de ativação, seguros e assiduidade são liberados':''}.`:'', max:!nxA });
    const vals = {
      ativacao: FP(ind,'%ATIVADOS','ativacao') ?? (ativados!=null&&apr? ativados/apr : undefined),
      seguros:  FP(ind,'%SEGUROS_CRED','seguros') ?? (FN(ind,'SEGUROS_CRED')!=null&&apr? FN(ind,'SEGUROS_CRED')/apr : undefined),
      assiduidade: FP(ind,'%ASSIDUIDADE','assiduidade'),
    };
    [['ativacao','% Ativação','Bônus ativação'],['seguros','% Seguros','Bônus seguros'],['assiduidade','% Assiduidade','Bônus assiduidade']].forEach(([key,lbl,bl])=>{
      const val = vals[key]; const tab=R[key];
      const i = val==null? -1 : faixaIdx(tab,val), f=i>=0?tab[i]:{fat:0,rep:0};
      comp.push({ind:key, label:bl, detail: val==null?'indicador não enviado':`${pctLbl(val)} → ${R$(f.rep)}`, valor:f.rep});
      fat += f.fat;
      const nx=tab[i+1];
      blocos.push({ ind:key, titulo:lbl, desc:`Bônus fixo conforme o ${lbl.toLowerCase()} do mês.`,
        kpis:[[lbl, val==null?'—':pctLbl(val)],['Bônus',R$(travado?0:f.rep)]],
        cols:[lbl,'Bônus'], rows:tab.map((r,k)=>({cells:[faixaLbl(r,pctLbl),R$(r.rep)],you:k===i,nx:k===i+1})),
        dica: val!=null&&nx?`Chegando a <b>${pctLbl(nx.ini)}</b> o bônus sobe para <b>${R$(nx.rep)}</b>.`:'', max:val!=null&&!nx });
    });
    if(travado){ comp.forEach(c=>{ if(c.valor){ c.detail+=` · travado: abaixo de ${minimo} aprovações`; c.valor=0; } }); fat=0; }
    return { qtdVendas:apr, componentes:comp, faturamento:fat,
      vendasDet: vendas.map(v=>({...v, valorRv:(v.qtd||1)*fA.rep, calc:`${N(v.qtd||1)} × ${R$(fA.rep)}`})),
      faixas:blocos, estimaEstorno:e=>(e.qtd||1)*fA.rep };
  },

  calcularGestor(p, cargo, timeRes, timeHC, row, R, ctx){
    if(cargo!=='supervisor'||!R.supervisor) return null;
    const S=R.supervisor;
    const apr = FN(row,'APROVADOS') ?? sum(timeRes,x=>x.qtdVendas||0);
    const meta = FN(row,'META_APROV')||0;
    const at = meta? apr/meta : 0;
    const ativ = FP(row,'%ATIVADOS') ?? (FN(row,'ATIVIADOS')!=null&&apr? FN(row,'ATIVIADOS')/apr : undefined);
    const seg  = FP(row,'%SEGUROS_CRED') ?? (FN(row,'SEGUROS_CRED')!=null&&apr? FN(row,'SEGUROS_CRED')/apr : undefined);
    const i=faixaIdx(S.aprovacoes,at), f=i>=0?S.aprovacoes[i]:{v:0}, nx=S.aprovacoes[i+1];
    const ia=ativ==null?-1:faixaIdx(S.ativacao,ativ), aa=ia>=0?S.ativacao[ia].aj:0;
    const is=seg==null?-1:faixaIdx(S.seguros,seg), as=is>=0?S.seguros[is].aj:0;
    const baseV = ctx.A('sup_aprov')? f.v : 0;
    return {
      componentes:[
        {ind:'sup_aprov', label:'Bônus meta de aprovações', detail:meta?`${N(apr)} de ${N(meta)} (${pctLbl(at)})`:'META APROV não enviada', valor:baseV},
        {ind:'sup_ativacao', label:'Ajuste % ativação', detail:ativ==null?'indicador não enviado':`${pctLbl(ativ)} → ${aa>=0?'+':''}${pctLbl(aa)}`, valor:baseV*aa},
        {ind:'sup_seguros', label:'Ajuste % seguros', detail:seg==null?'indicador não enviado':`${pctLbl(seg)} → +${pctLbl(as)}`, valor:baseV*as}],
      faixas:[
        { ind:'sup_aprov', titulo:'Meta de aprovações da equipe', desc:'Bônus pelo % da meta de aprovações. Os ajustes de ativação e seguros incidem sobre este valor.',
          kpis:[['Aprovações',N(apr)],['Meta',meta?N(meta):'—'],['Atingimento',pctLbl(at)],['Bônus base',R$(f.v)]],
          cols:['% da meta','Bônus'], rows:S.aprovacoes.map((r,k)=>({cells:[faixaLbl(r,pctLbl),R$(r.v)],you:k===i,nx:k===i+1})),
          dica: nx&&meta?`Faltam <b>${N(Math.ceil(nx.ini*meta)-apr)} aprovações</b> para ${pctLbl(nx.ini)} da meta e bônus base de <b>${R$(nx.v)}</b>.`:'', max:!nx },
        { ind:'sup_ativacao', titulo:'% Ativação (ajuste do bônus)', desc:'Percentual somado ou descontado do bônus de aprovações.',
          kpis:[['% Ativação',ativ==null?'—':pctLbl(ativ)],['Ajuste',pctLbl(aa)]],
          cols:['% Ativação','Ajuste'], rows:S.ativacao.map((r,k)=>({cells:[faixaLbl(r,pctLbl),(r.aj>0?'+':'')+pctLbl(r.aj)],you:k===ia,nx:k===ia+1})), dica:'', max:false },
        { ind:'sup_seguros', titulo:'% Seguros (ajuste do bônus)', desc:'Percentual somado ao bônus de aprovações.',
          kpis:[['% Seguros',seg==null?'—':pctLbl(seg)],['Ajuste','+'+pctLbl(as)]],
          cols:['% Seguros','Ajuste'], rows:S.seguros.map((r,k)=>({cells:[faixaLbl(r,pctLbl),'+'+pctLbl(r.aj)],you:k===is,nx:k===is+1})), dica:'', max:false }],
    };
  },

  telaRegras(R, tabela){
    const S=R.supervisor||{};
    return `<p>Promotor: unitário Fat. premiação (o que o cliente paga) × repasse. ${R.gatilhoAprovacoes?'Gatilho: abaixo da 1ª faixa de aprovações, nada é pago.':''}</p><div class="grid3">
      ${tabela('Aprovações',['Faixa','Fat. premiação','Repasse'],R.aprovacoes.map(r=>[faixaLbl(r),R$(r.fat),R$(r.rep)]))}
      ${[['ativacao','% Ativação'],['seguros','% Seguros'],['assiduidade','% Assiduidade']].map(([k,t])=>tabela(t,['Faixa','Fat. premiação','Repasse'],R[k].map(r=>[faixaLbl(r,pctLbl),R$(r.fat),R$(r.rep)]))).join('')}
      ${S.aprovacoes?tabela('Supervisor · meta de aprovações',['% da meta','Bônus'],S.aprovacoes.map(r=>[faixaLbl(r,pctLbl),R$(r.v)])):''}
      ${S.ativacao?tabela('Supervisor · ajuste % ativação',['Faixa','Ajuste'],S.ativacao.map(r=>[faixaLbl(r,pctLbl),pctLbl(r.aj)])):''}
      ${S.seguros?tabela('Supervisor · ajuste % seguros',['Faixa','Ajuste'],S.seguros.map(r=>[faixaLbl(r,pctLbl),'+'+pctLbl(r.aj)])):''}</div>`;
  },
});
