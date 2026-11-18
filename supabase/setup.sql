-- =====================================================================
-- Painel RV · estrutura no Supabase
-- Rode uma vez em: Supabase → SQL Editor → New query → cole tudo → Run
-- =====================================================================

-- 1) Apuração publicada: uma única linha (id = 1) com a base inteira em JSON
create table if not exists public.rv_publicado (
  id             int primary key default 1 check (id = 1),
  data           jsonb not null,
  atualizado_em  timestamptz not null default now(),
  atualizado_por text
);

-- 2) Histórico: cada publicação guarda uma cópia (para voltar atrás se precisar)
create table if not exists public.rv_historico (
  id            bigserial primary key,
  data          jsonb not null,
  publicado_em  timestamptz not null default now(),
  publicado_por text
);

create or replace function public.rv_guardar_historico()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.rv_historico (data, publicado_em, publicado_por)
  values (new.data, new.atualizado_em, new.atualizado_por);
  return new;
end $$;

drop trigger if exists rv_historico_trg on public.rv_publicado;
create trigger rv_historico_trg
  after insert or update on public.rv_publicado
  for each row execute function public.rv_guardar_historico();

-- 3) Permissões (RLS)
--    Qualquer visitante do site LÊ a apuração publicada (é assim que o promotor vê o RV dele).
--    Só usuário logado (o master, criado por você no painel do Supabase) PUBLICA.
alter table public.rv_publicado enable row level security;
alter table public.rv_historico enable row level security;

drop policy if exists "rv leitura publica" on public.rv_publicado;
create policy "rv leitura publica" on public.rv_publicado
  for select to anon, authenticated using (true);

drop policy if exists "rv master insere" on public.rv_publicado;
create policy "rv master insere" on public.rv_publicado
  for insert to authenticated with check (true);

drop policy if exists "rv master atualiza" on public.rv_publicado;
create policy "rv master atualiza" on public.rv_publicado
  for update to authenticated using (true) with check (true);

drop policy if exists "rv historico master" on public.rv_historico;
create policy "rv historico master" on public.rv_historico
  for select to authenticated using (true);

-- IMPORTANTE: desligue o cadastro aberto em
-- Authentication → Sign In / Providers → "Allow new users to sign up" = OFF
-- Assim, só os usuários que você criar à mão conseguem publicar.
