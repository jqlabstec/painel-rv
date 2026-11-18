# Deploy gratuito: Render (site) + Supabase (dados)

O site é estático e só é publicado **uma vez**. Depois disso, a apuração de cada mês é publicada pelo botão **Publicar apuração** dentro do painel master, sem novo deploy.

---

## Parte 1 · Supabase (uns 10 minutos, uma vez só)

1. Crie uma conta em **supabase.com** → **New project**.
   - Nome: `painel-rv` · Região: **South America (São Paulo)** · anote a senha do banco (não vai usar no painel).
2. **SQL Editor** → **New query** → cole todo o conteúdo de `supabase/setup.sql` → **Run**.
   Deve aparecer "Success. No rows returned".
3. **Authentication → Users → Add user → Create new user**
   - E-mail e senha de quem vai publicar (você). Marque **Auto Confirm User**.
   - Pode criar mais de um master (um por pessoa).
4. **Authentication → Sign In / Providers** → desligue **Allow new users to sign up** → Save.
5. **Project Settings → API** (ou **Data API / API Keys**) e copie:
   - **Project URL** (ex.: `https://abcdefgh.supabase.co`)
   - a chave **anon public** (ou **publishable**). Não use a `service_role`/`secret`.
6. Abra `js/config.js` e cole:
   ```js
   window.RV_CONFIG = {
     supabaseUrl: 'https://abcdefgh.supabase.co',
     supabaseKey: 'COLE_AQUI_A_CHAVE_ANON',
   };
   ```

## Parte 2 · GitHub (uma vez)

1. Em **github.com** → **New repository** → nome `painel-rv` → **Create**.
2. Na página do repositório: **uploading an existing file** → arraste **o conteúdo** da pasta `painel-rv`
   (index.html, css/, js/, modelos/, supabase/, render.yaml…) → **Commit changes**.

## Parte 3 · Render (uma vez)

1. **render.com** → **New → Static Site** → conecte o GitHub e escolha `painel-rv`.
2. Configure:
   - **Build Command:** deixe em branco
   - **Publish Directory:** `.`
3. **Create Static Site**. Em 1 ou 2 minutos sai o endereço, tipo `https://painel-rv.onrender.com`.

## Todo mês

1. Abra o site → **Acesso master** (link embaixo do login) → e-mail e senha do Supabase.
2. **Indicadores do mês**: ajuste o que vale na competência.
3. **Importar bases → Folha de indicadores** → confira em **Visão geral** e **Conferência**.
4. Clique em **Publicar apuração** (topo). Pronto: promotores e supervisores já veem.

Enquanto você não publica, o que você importou fica só no seu navegador (rascunho).
Cada publicação fica guardada na tabela `rv_historico` do Supabase.

## Quando precisa de deploy de novo?

Só quando mudar o **código** (regras padrão em `js/operacoes/*.js`, telas, visual).
Basta subir o arquivo alterado no GitHub, e o Render publica sozinho.
Ajustes de faixa feitos pela aba **Regras** do master vão junto na publicação e **não** precisam de deploy.

## Segurança: o que fica protegido e o que não fica

- **Publicar** exige login master (e-mail e senha). Ninguém consegue alterar os dados sem ele.
- **Ler** a apuração é aberto: o site precisa disso para o promotor ver o RV com a chave dele.
  Quem souber usar as ferramentas do navegador consegue ver a base inteira.
  A chave do promotor (2 letras + matrícula) identifica, mas não é senha.
- Se precisar que cada promotor veja **só o próprio** RV com garantia, o próximo passo é dar login
  individual no Supabase e filtrar por pessoa no banco.
