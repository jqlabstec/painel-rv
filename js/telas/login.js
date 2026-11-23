/* =====================================================================
   Login unificado
   1. A pessoa escolhe a operação (ou ela já vem marcada pelo link: SITE/#claro-varejo, SITE/#chubb ...).
   2. Operações deste painel (Chubb, CredSystem, AXS, Guerrilha):
      chave = 2 primeiras letras do nome + matrícula → abre o ambiente aqui mesmo.
   3. Operações de outros painéis (js/portais.js): valida o formato da chave e
      abre o painel do colega com a chave no link (#chave=XXXX).
   ===================================================================== */
const LS_OP = 'painelrv.ultimaOp';

function opcoesLogin(){
  const internas = Object.entries(OPS).map(([id,o])=>({ id, nome:o.nome, sub:o.sub, cor:o.c, cor2:o.c2, soft:o.soft, interna:true,
    chave:'Duas primeiras letras do nome + sua matrícula.', exemplo:'JO70231' }));
  const externas = (window.RV_PORTAIS||[]).filter(p=>p.url).map(p=>({ ...p, soft:'#fdecee', interna:false }));
  return [...internas, ...externas];
}
function opLogin(){ return opcoesLogin().find(o=>o.id===UI.loginOp)||null; }
function opDoLink(){
  const h = decodeURIComponent((location.hash||'').replace(/^#/,'')).toLowerCase();
  const q = new URLSearchParams(location.search).get('op')||'';
  const alvo = (h.startsWith('op=')? h.slice(3) : h) || q.toLowerCase();
  if(!alvo) return null;
  const lista = opcoesLogin();
  return (lista.find(o=>o.id===alvo) || lista.find(o=>norm(o.nome).replace(/\s+/g,'-').toLowerCase()===alvo) || {}).id || null;
}
function iniciarOpLogin(){
  if(UI.loginOp) return;
  let ultima=null; try{ ultima=localStorage.getItem(LS_OP); }catch(e){}
  UI.loginOp = opDoLink() || (opcoesLogin().some(o=>o.id===ultima)? ultima : null);
}

function viewLogin(){
  iniciarOpLogin();
  const ops = opcoesLogin(), sel = opLogin();
  if(sel) tema({c:sel.cor, c2:sel.cor2, soft:sel.soft||'#f4f4f5'});
  return `<div class="login"><div class="lwrap">
    <div class="brand"><div class="dot"><i></i></div><div><b>Minha Premiação</b><small>Portal unificado das operações</small></div></div>
    <div class="eyebrow">Premiação</div>
    <h1 class="big">Seu resultado na palma da mão.</h1>
    <p class="lead">Escolha a sua operação e entre com a sua chave para ver quanto vai receber de premiação.</p>
    <form class="card lcard" id="flogin">
      <h3>Acessar meu painel</h3>
      <label class="lb">1 · Sua operação</label>
      <div class="opgrid">${ops.map(o=>`<button type="button" class="opbt ${sel&&sel.id===o.id?'on':''}" data-op="${esc(o.id)}" style="--oc:${o.cor}">
        <i style="background:${o.cor}"></i><span><b>${esc(o.nome)}</b><small>${esc(o.sub||'')}</small></span></button>`).join('')}</div>
      ${sel?`
      <label class="lb" style="margin-top:16px">2 · Chave de acesso</label>
      <div class="key"><span>⚿</span><input id="chave" autocomplete="off" placeholder="EX: ${esc(sel.exemplo)}" autofocus ${sel.interna?'':'maxlength="12"'}></div>
      <div class="hint">${esc(sel.chave)}</div>
      <button class="btn">${sel.interna?'Ver minha premiação':`Abrir painel ${esc(sel.nome)}`}</button>`
      :`<div class="hint" style="margin-top:12px">Toque na sua operação para continuar.</div>`}
      <div class="err" id="lerr"></div>
      <div id="lext"></div>
      <div class="foot">Seus dados não ficam salvos neste dispositivo.</div>
      ${NUVEM.ativa?`<div class="foot"><a href="#" id="abrirMaster">Acesso master</a></div>`:''}
    </form>
    ${NUVEM.ativa?`<form class="card lcard" id="fmaster" style="display:none;margin-top:12px">
      <h3>Acesso master</h3><p>Login criado no Supabase para quem importa e publica a apuração.</p>
      <label class="lb">E-mail</label><div class="key"><input id="memail" type="email" autocomplete="username" style="letter-spacing:0;text-transform:none;font-weight:600"></div>
      <label class="lb" style="margin-top:12px">Senha</label><div class="key"><input id="msenha" type="password" autocomplete="current-password" style="letter-spacing:.1em;text-transform:none"></div>
      <div style="height:14px"></div><button class="btn">Entrar como master</button>
      <div class="err" id="merr"></div>
    </form>`:''}
    ${ERRO_NUVEM?`<div class="foot" style="color:var(--bad)">${esc(ERRO_NUVEM)}</div>`:''}
    ${NUVEM.ativa&&!DB.hc.length&&!ERRO_NUVEM&&(!sel||sel.interna)?`<div class="foot">Nenhuma apuração publicada ainda.</div>`:''}
    ${DB.demo?`<div class="foot" style="margin-top:18px">Ambiente com <b>dados de demonstração</b>. Teste: <b>JO70231</b> (AXS) · <b>${esc(demoKey('chubb'))}</b> (Chubb) · <b>${esc(demoKey('credsystem'))}</b> (CredSystem) · <b>${esc(demoKey('guerrilha'))}</b> (Guerrilha) ${NUVEM.ativa?'':` · master <b>${esc(DB.config.masterKey)}</b>`}</div>`:''}
  </div></div>`;
}
function demoKey(op){ const p=DB.hc.find(x=>opKey(x.op)===op&&cargoKey(x.cargo)==='promotor'&&x.mat!=='70231'); return p?loginKeyOf(p):''; }

function abrirPainelExterno(sel, k){
  const destino = sel.url.replace(/#.*$/,'') + '#chave=' + encodeURIComponent(k);
  if(sel.aceitaChave){ location.assign(destino); return; }
  // painel do colega ainda não lê a chave do link: copia a chave e abre com um clique
  let copiado=false;
  try{ navigator.clipboard.writeText(k).then(()=>{ copiado=true; const c=$('#copiado'); if(c) c.textContent='Chave copiada ✓'; }).catch(()=>{}); }catch(e){}
  $('#lext').innerHTML = `<div class="extbox">
    <b>Sua premiação de ${esc(sel.nome)} fica em outro painel.</b>
    <p>Lá, cole a sua chave no campo de acesso:</p>
    <div class="extkey"><span>${esc(k)}</span><small id="copiado">${copiado?'Chave copiada ✓':''}</small></div>
    <a class="btn" href="${esc(destino)}" target="_top" rel="noopener">Abrir painel ${esc(sel.nome)} →</a>
  </div>`;
}

function bindLogin(){
  $$('[data-op]').forEach(b=>b.onclick=()=>{ UI.loginOp=b.dataset.op; try{ localStorage.setItem(LS_OP, UI.loginOp); }catch(e){} render(); });
  $('#flogin').onsubmit=e=>{ e.preventDefault();
    const sel=opLogin(); const campo=$('#chave');
    const k=norm(campo?campo.value:'').replace(/\s/g,'');
    $('#lerr').textContent=''; $('#lext').innerHTML='';
    if(!NUVEM.ativa && k && k===norm(DB.config.masterKey)){ SESSION={tipo:'master'}; UI.verComo=null; persistSession(); usarBaseMaster(); render(); return; }
    if(!sel){ $('#lerr').textContent='Escolha a sua operação.'; return; }
    if(!k){ $('#lerr').textContent='Digite sua chave.'; return; }
    if(!sel.interna){
      if(sel.formato && !new RegExp(sel.formato).test(k)){ $('#lerr').textContent=`Chave fora do formato. ${sel.chave}`; return; }
      abrirPainelExterno(sel, k); return;
    }
    const p=DB.hc.find(x=>loginKeyOf(x)===k);
    if(!p){ $('#lerr').textContent='Chave não encontrada. Confira as letras do nome e a matrícula.'; return; }
    const opP=opKey(p.op);
    if(opP!==sel.id){ $('#lerr').textContent=`Essa chave é da operação ${OPS[opP]?OPS[opP].nome:'outra'}. Selecione ${OPS[opP]?OPS[opP].nome:'a operação certa'} acima.`; return; }
    if(norm(p.status).includes('DESLIG')||norm(p.status).includes('INATIV')){ $('#lerr').textContent='Acesso inativo. Fale com sua supervisão.'; return; }
    SESSION={tipo:'colab',mat:p.mat}; UI.tab='resumo'; UI.vendasN=40; persistSession(); render();
  };
  $('#abrirMaster')&&($('#abrirMaster').onclick=e=>{ e.preventDefault(); const f=$('#fmaster'); f.style.display=f.style.display==='none'?'block':'none'; $('#memail').focus(); });
  $('#fmaster')&&($('#fmaster').onsubmit=async e=>{ e.preventDefault();
    const b=$('#fmaster button'); b.disabled=true; b.textContent='Entrando…'; $('#merr').textContent='';
    try{ await NUVEM.entrar($('#memail').value.trim(), $('#msenha').value); SESSION={tipo:'master'}; UI.verComo=null; persistSession(); usarBaseMaster(); render(); }
    catch(err){ $('#merr').textContent=err.message; b.disabled=false; b.textContent='Entrar como master'; }
  });
}
function persistSession(){ try{ sessionStorage.setItem('painelrv.sess',JSON.stringify(SESSION)); }catch(e){} }
function sair(){ const eraMaster=SESSION&&SESSION.tipo==='master'; SESSION=null; UI.verComo=null; try{ sessionStorage.removeItem('painelrv.sess'); }catch(e){} if(eraMaster){ NUVEM.sair(); usarBasePublicada(); } render(); }
