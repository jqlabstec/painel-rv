/* Ambiente do colaborador (promotor, supervisor, coordenador) — tema da operação */
function viewColab(p){
  const op=opKey(p.op), O=OPS[op];
  const r = UI.mes? apurar(UI.mes).pessoas[norm(p.mat)] : null;
  const gestor = cargoKey(p.cargo)!=='promotor';
  const temVendas = r && (r.vendasDet||[]).length>0;
  const tabs = gestor? [['resumo','Resumo'],['metrica','Métrica de premiação'],['equipe','Minha equipe'],['estornos','Estornos']] : [['resumo','Resumo'],['metrica','Métrica de premiação'],['vendas',temVendas?'Vendas':'Meus indicadores'],['estornos','Estornos']];
  const head = `<div class="top"><div class="topin">
      <div class="brand"><div class="dot"><i></i></div><div><b>Minha Premiação · ${esc(O.nome)}</b><small style="color:var(--c)">Ambiente ${esc(O.nome)} · ${esc(O.sub)}</small></div></div>
      ${mesSelect()}
      ${UI.verComo?`<button class="btn sm ghost" id="voltarMaster">← Voltar ao master</button>`:`<button class="btn sm ghost" id="sair">Sair</button>`}
    </div><div class="tabs">${tabs.map(([k,l])=>`<button class="tab ${UI.tab===k?'on':''}" data-go="${k}">${l}</button>`).join('')}</div></div>`;
  if(!r) return head+`<main><div class="empty">Ainda não há apuração publicada para você.</div></main>`;
  const primeiro = p.nome.split(' ')[0];
  const comp = r.componentes;
  const vendasOk = (r.vendasDet||[]);
  let h = `<main>${DB.demo?`<div class="demo">Dados de demonstração. Os valores são fictícios.</div>`:''}
    <div class="hello">Olá, ${esc(primeiro)} 👋</div>
    <div class="name">${esc(p.nome)}</div>
    <div class="meta">${p.sup&&norm(p.sup)!==norm(p.nome)?`<span>Supervisão <b>${esc(p.sup)}</b></span>`:''}${p.coord&&norm(p.coord)!==norm(p.nome)?`<span>Coordenação <b>${esc(p.coord)}</b></span>`:''}<span>Matrícula <b>${esc(p.mat)}</b></span></div>
    <div class="chips"><span class="chip c">${esc(O.nome)}</span><span class="chip">${esc({promotor:'Promotor',supervisor:'Supervisor',coordenador:'Coordenador'}[cargoKey(p.cargo)])}</span>${(p.perfil||p.equipe)&&!['SUPERVISOR','COORDENADOR'].includes(norm(p.perfil))?`<span class="chip">${esc(p.perfil||p.equipe)}</span>`:''}${(p.regional||p.regiao)?`<span class="chip">${esc(p.regional||p.regiao)}</span>`:''}<span class="chip g">${esc(p.status||'Ativo')}</span></div>
    <div class="note"><div class="cal">${mesCurto(UI.mes).split('/')[0]}<b>${mesCurto(UI.mes).split('/')[1]}</b></div><div>Você está vendo a <b>apuração da premiação de ${mesNome(UI.mes)}</b>: vendas apuradas e estornos lançados nesta competência. Saldos negativos de meses anteriores entram como estorno remanescente.
      <div class="chips" style="margin:8px 0 0">${indicadoresDoCargo(op,cargoKey(p.cargo),UI.mes).map(d=>`<span class="chip c">${esc(d.nome)}</span>`).join('')}</div></div></div>`;
  // HERO
  const tot = Math.max(r.bruto,0.01);
  h += `<section id="resumo" class="hero"><div class="l">
      <div class="lbl">VALOR A RECEBER · PREMIAÇÃO FINAL</div>
      <div class="val num"><small>R$</small>${N(r.final,2)}</div>
      <div class="sub">${r.oficial?`Valor oficial da apuração de ${mesNome(UI.mes)}`:`Apuração de ${mesNome(UI.mes)}`}</div>
      <div class="stack">${comp.map((c,k)=>`<i style="width:${Math.max(0,c.valor)/tot*100}%;background:${['#fff','rgba(255,255,255,.65)','rgba(255,255,255,.4)','rgba(255,255,255,.25)'][k%4]}"></i>`).join('')}</div>
      <div class="leg">${comp.filter(c=>c.valor>0).map(c=>`<span>${esc(c.label)} ${R$(c.valor)}</span>`).join('')}<span style="color:#fecaca">Estornos e quebras ${R$(r.estComp+r.rem)}</span></div>
      ${r.saldoProx>0?`<div class="sub" style="margin-top:12px;background:rgba(0,0,0,.2);padding:8px 10px;border-radius:10px">Os estornos passaram da sua premiação. <b>${R$(r.saldoProx)}</b> serão descontados na próxima apuração.</div>`:''}
    </div><div class="r">
      ${comp.map(c=>`<div class="ln"><div><b>${esc(c.label)}</b><small>${esc(c.detail)}</small></div><div class="v num">${R$(c.valor)}</div></div>`).join('')}
      <div class="ln"><div><b>Premiação do mês</b><small>antes dos estornos</small></div><div class="v num">${R$(r.bruto)}</div></div>
      <div class="ln"><div><b>Estornos e quebras da competência</b><small>${r.quebras&&!r.estornos.some(e=>e.jaDescontado)?`quebras ${R$(r.quebras)} · `:''}${r.estornos.filter(e=>!e.jaDescontado).length} lançamento(s) em ${mesNome(UI.mes)}</small></div><div class="v neg num">-${R$(r.estComp)}</div></div>
      <div class="ln"><div><b>Estornos remanescentes</b><small>saldo da apuração de ${mesNome(mesAnterior(UI.mes))}</small></div><div class="v neg num">-${R$(r.rem)}</div></div>
      <div class="ln tot"><div><b>Premiação final</b><small>apuração de ${mesNome(UI.mes)}</small></div><div class="v num">${R$(r.final)}</div></div>
    </div></section>`;
  // MÉTRICA
  h += `<section class="sec" id="metrica"><div class="eyebrow">Métrica de premiação</div><h2>Como a sua premiação é calculada</h2><p>${r.oficial?`O valor a receber vem da planilha oficial de apuração da ${esc(O.nome)}. Abaixo, a sua posição em cada faixa pelas regras do mês.`:`As mesmas regras da planilha de apuração da ${esc(O.nome)}, com a sua posição em cada faixa.`}</p>
    ${r.faixas.map(f=>`<div class="blk"><h3>${esc(f.titulo)}</h3><div class="d">${esc(f.desc)}</div>
      <div class="kpis">${f.kpis.map(([l,v])=>`<div class="kpi"><small>${esc(l)}</small><b class="num">${esc(v)}</b></div>`).join('')}</div>
      <div class="tblwrap"><table class="ft"><thead><tr>${f.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>
      ${f.rows.map(rw=>`<tr class="${rw.you?'you':rw.nx?'nx':''}">${rw.cells.map((c,k)=>`<td class="num">${esc(c)}${k===0&&rw.you?'<span class="youtag">VOCÊ</span>':''}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>
      ${f.dica?`<div class="tip">↗ ${f.dica}</div>`:f.max?`<div class="tip max">★ Você está na faixa máxima. Mandou bem!</div>`:''}
    </div>`).join('') || '<div class="blk"><div class="d">Sem regras de cálculo para este cargo nesta operação.</div></div>'}
  </section>`;
  // VENDAS ou EQUIPE
  if(gestor){
    const t=(r.time||[]).slice().sort((a,b)=>b.final-a.final); const mx=Math.max(1,...t.map(x=>x.final));
    h += blocoIndicadores(op, cargoKey(p.cargo), r, 'indicadores-gestor');
    h += `<section class="sec" id="equipe"><div class="eyebrow">Equipe</div><h2>Minha equipe</h2><p>Premiação final de cada promotor na apuração de ${mesNome(UI.mes)}.</p>
      <div class="blk"><div class="kpis"><div class="kpi"><small>Promotores</small><b>${t.length}</b></div><div class="kpi"><small>Produção da equipe</small><b class="num">${op==='axs'?R$0(r.producao):N(r.qtdVendas)}</b></div><div class="kpi"><small>Premiação da equipe</small><b class="num">${R$(sum(t,x=>x.final))}</b></div><div class="kpi"><small>Estornos da equipe</small><b class="num neg">${R$(sum(t,x=>x.est))}</b></div></div>
      <table class="dt rk"><thead><tr><th>#</th><th>Promotor</th><th class="r">Produção</th><th style="width:30%"></th><th class="r">Premiação final</th></tr></thead><tbody>
      ${t.map((x,k)=>`<tr><td><span class="medal ${k<3?'m'+(k+1):''}">${k+1}</span></td><td>${esc(x.nome)}</td><td class="r num">${N(x.qtd)}</td><td><div class="bar"><i style="width:${x.final/mx*100}%;background:var(--c)"></i></div></td><td class="r num"><b>${R$(x.final)}</b></td></tr>`).join('')||'<tr><td colspan=5 class="empty">Nenhum promotor vinculado a você na base HC.</td></tr>'}
      </tbody></table></div></section>`;
  } else if(!temVendas){
    h += blocoIndicadores(op, 'promotor', r, 'vendas');
  } else {
    const tv=sum(vendasOk,v=>v.valorRv);
    const ord=vendasOk.slice().sort((a,b)=>String(b.data).localeCompare(String(a.data)));
    h += `<section class="sec" id="vendas"><div class="eyebrow">Vendas</div><h2>Quanto vale cada venda</h2><p>Vendas apuradas em ${mesNome(UI.mes)} e quanto cada uma gerou na sua premiação.</p>
      <div class="blk"><div class="kpis"><div class="kpi"><small>Lançamentos</small><b>${N(vendasOk.length)}</b></div><div class="kpi"><small>Quantidade</small><b>${N(r.qtdVendas)}</b></div><div class="kpi"><small>Premiação gerada</small><b class="num">${R$(tv)}</b></div></div>
      <div class="list">${ord.slice(0,UI.vendasN).map(v=>`<div class="it"><div><b>${esc(v.produto||'Venda')}${v.port?'<span class="tg g">PORTABILIDADE</span>':''}${v.marco?`<span class="tg">${esc(v.marco)}</span>`:''}</b><small>${fmtData(v.data)}${v.id?' · '+esc(v.id):''} · ${esc(v.calc)}</small></div><div class="v pos num" style="font-weight:800">+${R$(v.valorRv)}</div></div>`).join('')||'<div class="empty">Nenhuma venda nesta apuração.</div>'}</div>
      ${ord.length>UI.vendasN?`<div class="more"><button class="btn sm ghost" id="maisV">Mostrar mais ${Math.min(50,ord.length-UI.vendasN)} de ${ord.length-UI.vendasN}</button></div>`:''}
      </div></section>`;
  }
  // ESTORNOS
  const grp={}; r.estornos.forEach(e=>{ const k=e.quebra?'quebras':((e.dataVenda||'').slice(0,7)||'sem data'); (grp[k]=grp[k]||[]).push(e); });
  const tituloGrp = k=> k==='quebras'? 'QUEBRAS DO MÊS' : k==='sem data'? 'VENDAS COM DATA NÃO INFORMADA' : 'VENDAS DE '+mesNome(k).toUpperCase();
  h += `<section class="sec" id="estornos"><div class="eyebrow">Estornos</div><h2>O que foi descontado</h2><p>Vendas canceladas, inadimplentes ou quebras, e saldos de apurações anteriores.</p>
    <div class="blk"><div class="kpis"><div class="kpi"><small>Da competência</small><b class="neg num">-${R$(r.estComp)}</b></div><div class="kpi"><small>Remanescentes</small><b class="neg num">-${R$(r.rem)}</b></div><div class="kpi"><small>Total descontado</small><b class="neg num">-${R$(r.estComp+r.rem)}</b></div></div>
    ${Object.keys(grp).sort((a,b)=>a==='quebras'?-1:b==='quebras'?1:b.localeCompare(a)).map(k=>`<div style="display:flex;justify-content:space-between;margin:14px 0 4px;font-size:10px;font-weight:800;letter-spacing:.08em;color:var(--mut)"><span>${tituloGrp(k)} · ${grp[k].length}</span><span class="neg">-${R$(sum(grp[k],e=>e.valorCalc))}</span></div>
      <div class="list">${grp[k].map(e=>`<div class="it"><div><b>${esc(e.produto||'Venda')}</b><small>${esc(e.motivo||'Estorno')}${e.id?' · '+esc(e.id):''}${e.dataVenda?' · venda em '+fmtData(e.dataVenda):''}${e.estimado&&!e.quebra?' · valor calculado pela regra':''}${e.jaDescontado?' · já descontada no total oficial':''}</small></div><div class="neg num" style="font-weight:800">-${R$(e.valorCalc)}</div></div>`).join('')}</div>`).join('')}
    ${r.rem>0?`<div style="margin:14px 0 4px;font-size:10px;font-weight:800;letter-spacing:.08em;color:var(--mut)">SALDO DE APURAÇÕES ANTERIORES</div><div class="list"><div class="it"><div><b>Estorno remanescente</b><small>Apuração de ${mesNome(mesAnterior(UI.mes))} · estorno que não coube na premiação daquela apuração</small></div><div class="neg num" style="font-weight:800">-${R$(r.rem)}</div></div></div>`:''}
    ${!r.estornos.length&&!r.rem?'<div class="empty">Nenhum estorno nesta apuração. 🎉</div>':''}
    </div></section>
    <div class="foot" style="margin-top:30px">Base atualizada em ${new Date(DB.atualizadoEm).toLocaleString('pt-BR')}. Dúvidas ou contestações: fale com sua supervisão.</div></main>`;
  return head+h;
}
function bindColab(){
  $('#sair')&&($('#sair').onclick=sair);
  $('#voltarMaster')&&($('#voltarMaster').onclick=()=>{UI.verComo=null;render();window.scrollTo(0,0)});
  $('#selMes')&&($('#selMes').onchange=e=>{UI.mes=e.target.value;render()});
  $$('[data-go]').forEach(b=>b.onclick=()=>{UI.tab=b.dataset.go; $$('[data-go]').forEach(x=>x.classList.toggle('on',x===b)); const el=document.getElementById(b.dataset.go); el&&window.scrollTo({top:el.getBoundingClientRect().top+scrollY-110,behavior:'smooth'}); });
  $('#maisV')&&($('#maisV').onclick=()=>{UI.vendasN+=50;const y=scrollY;render();scrollTo(0,y)});
}

/* Indicadores ligados para o cargo no mês (painel "Indicadores do mês" do master) */
function indicadoresDoCargo(op, cargo, mes){ const at=indicadoresAtivos(op,mes); return (IND_DEF[op]||[]).filter(d=>d.cargo===cargo && at[d.id]!==false); }
function fmtCampo(v,f){ if(v===undefined) return '—'; if(f==='r$') return R$(toNum(v)); if(f==='%') return pctLbl(toFrac(v)); if(f==='n1') return N(toNum(v),1); if(f==='n2') return N(toNum(v),2); return N(toNum(v)); }
/* Bloco "Meus indicadores": valores da folha importada (uma caixa por regional, se houver mais de uma linha) */
function blocoIndicadores(op, cargo, r, id){
  const campos=(CAMPOS[op]||{})[cargo]||[];
  const linhas=(r.linhas||[]).length? r.linhas : [];
  if(!campos.length || !linhas.length) return id==='vendas'? `<section class="sec" id="vendas"><div class="eyebrow">Indicadores</div><h2>Meus indicadores</h2><div class="blk"><div class="empty">Sem indicadores importados para ${mesNome(UI.mes)}.</div></div></section>` : '';
  return `<section class="sec" id="${id}"><div class="eyebrow">Indicadores</div><h2>${cargo==='promotor'?'Meus indicadores':'Indicadores da equipe'}</h2><p>Números da apuração de ${mesNome(UI.mes)} usados no cálculo.</p>
    ${linhas.map(l=>`<div class="blk">${linhas.length>1?`<h3 style="margin-bottom:10px">${esc(F(l,'REGIONAL')||'')}</h3>`:''}<div class="kpis">${campos.filter(([k])=>F(l,k)!==undefined).map(([k,lbl,f])=>`<div class="kpi"><small>${esc(lbl)}</small><b class="num">${fmtCampo(F(l,k),f)}</b></div>`).join('')}</div></div>`).join('')}
  </section>`;
}
