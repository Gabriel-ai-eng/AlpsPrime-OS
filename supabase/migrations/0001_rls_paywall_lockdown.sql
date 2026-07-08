-- ============================================================================
-- RLS · Reforço do paywall no BANCO (não só no frontend)
-- ============================================================================
-- Problema que isto resolve:
--   O frontend fala DIRETO com o Supabase usando a chave pública (anon), que
--   fica embutida no JavaScript do site — qualquer pessoa consegue lê-la. Com
--   as tabelas SEM Row Level Security, um usuário que NÃO pagou (ou nem logou)
--   podia chamar a API REST do Supabase direto (ex.: /rest/v1/post) e ler/gravar
--   todo o conteúdo, ignorando a tela de "Acesso restrito" (HotmartGate), que é
--   apenas visual.
--
-- Solução: ligar RLS em todas as tabelas de conteúdo e só liberar leitura/escrita
--   para quem está LOGADO e COM ACESSO PAGO (ou é admin). A verdade do acesso
--   continua vindo de `acessos_pagos` (preenchida pelo webhook da Hotmart) via a
--   função `tem_acesso`.
--
-- Aplicada em produção em 2026-07-08. Este arquivo documenta a migração.
-- ============================================================================

-- 1) O requisitante atual pode acessar? admin fixo OU e-mail com acesso ativo.
--    SECURITY DEFINER para enxergar `acessos_pagos` mesmo com RLS ligada nela.
create or replace function public.pode_acessar()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    lower(trim(auth.jwt() ->> 'email')) in
      ('gabrieloliveirasoares124@gmail.com', 'apexprimestudios30@gmail.com')
    or public.tem_acesso(auth.jwt() ->> 'email'),
    false
  );
$$;

revoke all on function public.pode_acessar() from public;
grant execute on function public.pode_acessar() to anon, authenticated;

-- 2) Tabelas de CONTEÚDO: liga RLS + política única (só pago/admin faz tudo).
--    Requisitante anônimo (deslogado) não tem política => negado por padrão.
do $$
declare
  t text;
  content_tables text[] := array[
    'agent','agent_post','agent_reaction','agent_reply','card_answer','challenge',
    'comment','comment_like','conversation','direct_message','feed_presence','follow',
    'ia_memory','ia_message','ia_settings','invite','marketplace_agent','notification',
    'playlab_character','playlab_session','playlab_world','post','post_interaction',
    'profile_visit','question_card','reaction','tag','team','team_member','time_capsules',
    'uploaded_file','usage_history','user_stats','usuarios'
  ];
begin
  foreach t in array content_tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists acesso_pago_all on public.%I', t);
    execute format(
      'create policy acesso_pago_all on public.%I for all to authenticated ' ||
      'using (public.pode_acessar()) with check (public.pode_acessar())', t);
  end loop;
end $$;

-- 3) Tabelas SENSÍVEIS (lista de compradores): liga RLS SEM política.
--    Só a service key (webhook) e funções SECURITY DEFINER (tem_acesso)
--    conseguem ler/escrever; anon/authenticated ficam totalmente bloqueados.
alter table public.acessos_pagos enable row level security;
alter table public.authorized_access enable row level security;

-- ----------------------------------------------------------------------------
-- OBS.: as tabelas de jogo (armor_game_state, fkw_*) já tinham RLS própria
-- (por dono via auth.uid()) e NÃO são tocadas aqui.
-- ----------------------------------------------------------------------------
