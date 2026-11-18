/* Tela de login: chave = 2 primeiras letras do nome + matrícula; ou chave master */
function viewLogin(){
  return `<div class="login"><div class="lwrap">
    <div class="brand"><div class="dot"><i></i></div><div><b>Meu RV</b><small>Chubb · CredSystem · AXS · Guerrilha</small></div></div>
    <div class="eyebrow">Remuneração variável</div>
    <h1 class="big">Seu resultado na palma da mão.</h1>
    <p class="lead">Quanto você vai receber, quanto vale cada venda, seus estornos e o que falta para a próxima faixa.</p>
    <form class="card lcard" id="flogin">
      <h3>Acessar meu painel</h3><p>Informe sua chave individual para abrir o ambiente da sua operação.</p>
      <label class="lb">Chave de acesso</label>
      <div class="key"><span>⚿</span><input id="chave" autocomplete="off" placeholder="EX: JO70231" autofocus></div>
      <div class="hint">Duas primeiras letras do nome + sua matrícula.</div>
      <button class="btn">Ver meu RV</button>
      <div class="err" id="lerr"></div>
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
    ${NUVEM.ativa&&!DB.hc.length&&!ERRO_NUVEM?`<div class="foot">Nenhuma apuração publicada ainda.</div>`:''}
    ${DB.demo?`<div class="foot" style="margin-top:18px">Ambiente com <b>dados de demonstração</b>. Teste: <b>JO70231</b> (AXS) · <b>${esc(demoKey('chubb'))}</b> (Chubb) · <b>${esc(demoKey('credsystem'))}</b> (CredSystem) · <b>${esc(demoKey('guerrilha'))}</b> (Guerrilha) ${NUVEM.ativa?'':` · master <b>${esc(DB.config.masterKey)}</b>`}</div>`:''}
  </div></div>`;
}
function demoKey(op){ const p=DB.hc.find(x=>opKey(x.op)===op&&cargoKey(x.cargo)==='promotor'&&x.mat!=='70231'); return p?loginKeyOf(p):''; }
function bindLogin(){
  $('#flogin').onsubmit=e=>{ e.preventDefault();
    const k=norm($('#chave').value).replace(/\s/g,'');
    if(!k){ $('#lerr').textContent='Digite sua chave.'; return; }
    if(!NUVEM.ativa && k===norm(DB.config.masterKey)){ SESSION={tipo:'master'}; UI.verComo=null; persistSession(); usarBaseMaster(); render(); return; }
    const p=DB.hc.find(x=>loginKeyOf(x)===k);
    if(!p){ $('#lerr').textContent='Chave não encontrada. Confira as letras do nome e a matrícula.'; return; }
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
