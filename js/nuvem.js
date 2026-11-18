/* =====================================================================
   Nuvem (Supabase) via REST, sem biblioteca extra.
   - ler():      apuração publicada (tabela rv_publicado, linha id = 1). Leitura pública.
   - entrar():   login master com e-mail e senha (Supabase Auth).
   - publicar(): grava a base atual na tabela. Só funciona com login master.
   Tabelas e permissões: veja supabase/setup.sql
   ===================================================================== */
const NUVEM = (()=>{
  const C = window.RV_CONFIG||{};
  const url = String(C.supabaseUrl||'').trim().replace(/\/+$/,'');
  const key = String(C.supabaseKey||'').trim();
  const ativa = !!(url && key);
  const TK = 'painelrv.master.token';
  let token = null;
  try{ token = JSON.parse(sessionStorage.getItem(TK)||'null'); }catch(e){}
  const guardar = ()=>{ try{ token? sessionStorage.setItem(TK,JSON.stringify(token)) : sessionStorage.removeItem(TK); }catch(e){} };
  const cab = (comLogin)=>({ 'apikey':key, 'Content-Type':'application/json', ...(comLogin&&token?{'Authorization':'Bearer '+token.access_token}:{}) });

  async function ler(){
    const r = await fetch(`${url}/rest/v1/rv_publicado?id=eq.1&select=data,atualizado_em,atualizado_por`, {headers:cab(false), cache:'no-store'});
    if(!r.ok) throw new Error(`Não consegui ler a apuração publicada (erro ${r.status}).`);
    const j = await r.json();
    return j[0]||null;
  }
  async function entrar(email, senha){
    const r = await fetch(`${url}/auth/v1/token?grant_type=password`, {method:'POST', headers:cab(false), body:JSON.stringify({email, password:senha})});
    const j = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(r.status===400? 'E-mail ou senha incorretos.' : (j.error_description||j.msg||`Erro ${r.status} no login.`));
    token = { access_token:j.access_token, refresh_token:j.refresh_token, expira:Date.now()+(j.expires_in||3600)*1000, email };
    guardar(); return token;
  }
  async function renovar(){
    if(!token) throw new Error('Entre de novo como master para publicar.');
    if(Date.now() < token.expira-60000) return;
    const r = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {method:'POST', headers:cab(false), body:JSON.stringify({refresh_token:token.refresh_token})});
    const j = await r.json().catch(()=>({}));
    if(!r.ok){ token=null; guardar(); throw new Error('Sua sessão expirou. Saia e entre de novo como master.'); }
    token = {...token, access_token:j.access_token, refresh_token:j.refresh_token, expira:Date.now()+(j.expires_in||3600)*1000};
    guardar();
  }
  async function publicar(data){
    await renovar();
    const agora = new Date().toISOString();
    const r = await fetch(`${url}/rest/v1/rv_publicado?on_conflict=id`, {method:'POST',
      headers:{...cab(true), 'Prefer':'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({id:1, data, atualizado_em:agora, atualizado_por:token.email})});
    if(!r.ok){
      const t = await r.text().catch(()=>'');
      throw new Error(r.status===401||r.status===403? 'Sem permissão para publicar. Confira o usuário master no Supabase.' : `Erro ao publicar (${r.status}): ${t.slice(0,180)}`);
    }
    return {em:agora, por:token.email};
  }
  function sairNuvem(){ token=null; guardar(); }
  return { ativa, ler, entrar, publicar, sair:sairNuvem, logado:()=>!!token, email:()=>token&&token.email };
})();
