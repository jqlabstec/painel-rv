/* =====================================================================
   AXS ENERGIA
   Promotor: % sobre as MENSALIDADES do mês, pela tabela do PERFIL
             (CONVENCIONAL ou HIGH PERFORMANCE).
   Supervisor (por regional): prêmio pelo %ICM de mensalidades
             + bônus de quadro (R$/HC × 10 HCs) − R$ 100 por FTE zerado.
             GATILHO: sem prêmio de %ICM, o supervisor não recebe nada.
   Fonte: aba "Axs Energia" (Modelos_de_RV) + "MODELO GESTORES" (folha_rv)
   ===================================================================== */
registrarOperacao('axs', {
  nome:'AXS Energia', sub:'Energia', c:'#d9600c', c2:'#8a3604', soft:'#fdf0e6',
  aliases:['AXS','XS ENERGIA','ENERGIA','XS'],

  indicadores: [
    {id:'producao',    cargo:'promotor',   nome:'Mensalidades (produção)', desc:'% sobre as mensalidades do mês, pela tabela do perfil.'},
    {id:'icm_receita', cargo:'supervisor', nome:'% ICM mensalidades',      desc:'Prêmio pelo atingimento da meta de mensalidades da regional.'},
    {id:'quadro',      cargo:'supervisor', nome:'% Quadro preenchido',     desc:'R$ por HC (base 10 HCs) conforme o % do quadro.'},
    {id:'deflator',    cargo:'supervisor', nome:'Deflator de FTE zerado',  desc:'Desconta R$ 100 por FTE zerado.'},
  ],
  campos: {
    promotor:   [['MENSALIDADES','Mensalidades no mês','r$']],
    supervisor: [['MENSALIDADES','Mensalidades','r$'],['META_MENSALIDADES','Meta','r$'],['%ICM_MENSALIDADES','% ICM','%'],['FTE','FTE','n2'],['%QUADRO','% Quadro','%'],['FTE_ZERADOS_30_DIAS','FTE zerados','n2']],
  },

  regras: {
    convencional: [
      {ini:2500,fin:2999,p:.048},{ini:3000,fin:3499,p:.055},{ini:3500,fin:3999,p:.06},{ini:4000,fin:4499,p:.065},
      {ini:4500,fin:4999,p:.085},{ini:5000,fin:5499,p:.138},{ini:5500,fin:5999,p:.168},{ini:6000,fin:6499,p:.178},
      {ini:6500,fin:6999,p:.208},{ini:7000,fin:7499,p:.22},{ini:7500,fin:null,p:.23}],
    hp: [
      {ini:2800,fin:3499.99,p:0},{ini:3500,fin:3999.99,p:0},{ini:4000,fin:4999,p:.15},{ini:5000,fin:5999,p:.15},
      {ini:6000,fin:6999,p:.2},{ini:7000,fin:7999,p:.2},{ini:8000,fin:8999,p:.2},{ini:9000,fin:9999,p:.2},
      {ini:10000,fin:10999,p:.228},{ini:11000,fin:11999,p:.24},{ini:12000,fin:null,p:.25}],
    // regionais em que o HIGH PERFORMANCE é pago pela tabela convencional (ex.: ['MG-AP1','MG-AP2'])
    regionaisTabelaConvencional: [],
    supervisor: {
      icm:    [{ini:0,fin:.6999,v:0},{ini:.7,fin:.7999,v:400},{ini:.8,fin:.8999,v:800},{ini:.9,fin:.9999,v:1600},{ini:1,fin:null,v:2400}],
      quadro: [{ini:0,fin:.6999,v:0},{ini:.7,fin:.7999,v:20},{ini:.8,fin:.8999,v:40},{ini:.9,fin:null,v:60}],
      hcBaseQuadro: 10,
      deflatorPorFteZerado: 100,
      gatilhoIcm: true,
    },
  },

  calcularPromotor(p, vendas, ind, R, ctx){
    const perfil = norm(p.perfil||p.equipe);
    const hp = (perfil.includes('HIGH')||perfil==='HP') && !(R.regionaisTabelaConvencional||[]).map(norm).includes(norm(p.regional||p.regiao));
    const tab = hp?R.hp:R.convencional;
    const base = FN(ind,'MENSALIDADES','PRODUCAO') ?? sum(vendas,v=>v.valor||0);
    const i=faixaIdx(tab,base), f=i>=0?tab[i]:{p:0};
    const rv = base*f.p;
    const nx = tab.slice(i+1).find(r=>r.p>f.p);
    return { qtdVendas:vendas.length||null, producao:base,
      componentes:[{ind:'producao', label:'RV mensalidades', detail:`${R$(base)} × ${pctLbl(f.p)}`, valor:rv}],
      vendasDet: vendas.map(v=>({...v, valorRv:(v.valor||0)*f.p, calc:`${R$(v.valor||0)} × ${pctLbl(f.p)}`})),
      faixas:[{ ind:'producao', titulo:`Mensalidades: qual % você recebe (${hp?'High Performance':'Convencional'})`,
        desc:'O percentual depende do total de mensalidades do mês e vale sobre o total.',
        kpis:[['Mensalidades no mês',R$(base)],['% aplicado',pctLbl(f.p)],['RV',R$(rv)]],
        cols:['Mensalidades no mês','% sobre o total'],
        rows:tab.map((r,k)=>({cells:[faixaLbl(r,v=>R$0(v)),pctLbl(r.p)],you:k===i,nx:nx&&r===nx})),
        dica: nx?`Faltam <b>${R$(nx.ini-base)}</b> em mensalidades para chegar a ${R$0(nx.ini)}. Aí o % sobe para <b>${pctLbl(nx.p)}</b> (RV de ${R$(rv)} para ${R$(nx.ini*nx.p)}).`:'', max:!nx }],
      estimaEstorno:e=>(e.valorVenda||0)*f.p };
  },

  calcularGestor(p, cargo, timeRes, timeHC, row, R, ctx){
    const S=R.supervisor; if(cargo!=='supervisor'||!S) return null;
    const mens = FN(row,'MENSALIDADES') ?? sum(timeRes,x=>x.producao||0);
    const meta = FN(row,'META_MENSALIDADES')||0;
    const icm = FP(row,'%ICM_MENSALIDADES') ?? (meta? mens/meta : 0);
    const fte = FN(row,'FTE');
    const quadro = FP(row,'%QUADRO') ?? (fte!=null? fte/S.hcBaseQuadro : undefined);
    const zerados = FN(row,'FTE_ZERADOS_30_DIAS','FTE_ZERADOS')||0;
    const i=faixaIdx(S.icm,icm), fi=i>=0?S.icm[i]:{v:0}, nx=S.icm[i+1];
    const iq=quadro==null?-1:faixaIdx(S.quadro,quadro), fq=iq>=0?S.quadro[iq]:{v:0};
    const premIcm = ctx.A('icm_receita')? fi.v : 0;
    const premQuadro = ctx.A('quadro')? fq.v*S.hcBaseQuadro : 0;
    const defl = ctx.A('deflator')? -zerados*S.deflatorPorFteZerado : 0;
    const comps=[
      {ind:'icm_receita', label:'Prêmio % ICM mensalidades', detail:`${R$(mens)} de ${R$(meta)} (${pctLbl(icm)})`, valor:premIcm},
      {ind:'quadro', label:'Bônus quadro', detail:quadro==null?'indicador não enviado':`${pctLbl(quadro)} do quadro → ${R$(fq.v)}/HC × ${S.hcBaseQuadro}`, valor:premQuadro},
      {ind:'deflator', label:'Deflator FTE zerado', detail:`${N(zerados,2)} FTE × ${R$(S.deflatorPorFteZerado)}`, valor:defl}];
    if(S.gatilhoIcm && ctx.A('icm_receita') && premIcm===0){
      comps.forEach(c=>{ if(c.ind!=='icm_receita' && c.valor){ c.detail+=' · não pago: sem prêmio de %ICM'; c.valor=0; } });
    } else {
      const t=sum(comps,c=>c.valor); if(t<0) comps.push({label:'Ajuste (mínimo zero)', detail:'o deflator não deixa o RV negativo', valor:-t});
    }
    return { producao:mens, componentes:comps,
      faixas:[
        { ind:'icm_receita', titulo:'% ICM de mensalidades', desc:`Prêmio pelo atingimento da meta de mensalidades.${S.gatilhoIcm?' Sem este prêmio, os demais itens não são pagos.':''}`,
          kpis:[['Mensalidades',R$(mens)],['Meta',R$(meta)],['% ICM',pctLbl(icm)],['Prêmio',R$(fi.v)]],
          cols:['% ICM','Prêmio'], rows:S.icm.map((r,k)=>({cells:[faixaLbl(r,pctLbl),R$(r.v)],you:k===i,nx:k===i+1})),
          dica: nx&&meta?`Faltam <b>${R$(nx.ini*meta-mens)}</b> em mensalidades para ${pctLbl(nx.ini)} e prêmio de <b>${R$(nx.v)}</b>.`:'', max:!nx },
        { ind:'quadro', titulo:'% Quadro de HCs preenchido', desc:`R$ por HC conforme o % do quadro, sobre a base de ${S.hcBaseQuadro} HCs.`,
          kpis:[['% Quadro',quadro==null?'—':pctLbl(quadro)],['FTE',fte==null?'—':N(fte,2)],['Bônus',R$(fq.v*S.hcBaseQuadro)]],
          cols:['% Quadro','R$ por HC','Bônus'], rows:S.quadro.map((r,k)=>({cells:[faixaLbl(r,pctLbl),R$(r.v),R$(r.v*S.hcBaseQuadro)],you:k===iq,nx:k===iq+1})), dica:'', max:false }],
    };
  },

  telaRegras(R, tabela){
    const S=R.supervisor||{};
    return `<p>Promotor: % sobre as mensalidades do mês.${(R.regionaisTabelaConvencional||[]).length?` HP pago pela tabela convencional em: ${R.regionaisTabelaConvencional.join(', ')}.`:''} Supervisor: %ICM + quadro − deflator.</p><div class="grid3">
      ${tabela('Promotor · Convencional',['Mensalidades','%'],R.convencional.map(r=>[faixaLbl(r,R$0),pctLbl(r.p)]))}
      ${tabela('Promotor · High Performance',['Mensalidades','%'],R.hp.map(r=>[faixaLbl(r,R$0),pctLbl(r.p)]))}
      <div>${S.icm?tabela('Supervisor · % ICM',['% ICM','Prêmio'],S.icm.map(r=>[faixaLbl(r,pctLbl),R$(r.v)])):''}
      ${S.quadro?tabela(`Supervisor · % Quadro (× ${S.hcBaseQuadro} HCs)`,['% Quadro','R$/HC'],S.quadro.map(r=>[faixaLbl(r,pctLbl),R$(r.v)])):''}
      <p style="font-size:12px;color:var(--mut)">Deflator: −${R$(S.deflatorPorFteZerado)} por FTE zerado.</p></div></div>`;
  },
});
