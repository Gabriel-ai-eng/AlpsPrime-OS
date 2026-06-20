# Configuração do Supabase — Login/Cadastro (Fase 1)

Esta é a **Fase 1** da migração do Base44 → Supabase: fazer o **login/cadastro**
e a **verificação de acesso pago (Hotmart)** funcionarem no Vercel.

> O resto do app (feed, perfil, IA, votação, etc.) ainda depende das antigas
> funções/tabelas do Base44 e será migrado nas próximas fases.

---

## 1. Variáveis de ambiente no Vercel

No painel do Vercel: **Project → Settings → Environment Variables**, adicione:

| Nome | Valor | Onde encontrar no Supabase |
|------|-------|----------------------------|
| `VITE_SUPABASE_URL` | URL do projeto (ex.: `https://xxxx.supabase.co`) | Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | chave **anon public** | Settings → API → Project API keys → `anon` `public` |

⚠️ **Nunca** coloque a chave `service_role` no frontend. No frontend só vai a `anon`.
A `service_role` (`SUPABASE_SERVICE_KEY`) fica **só** no webhook (`api/webhook-hotmart.js`).

Depois de adicionar, faça um **Redeploy** no Vercel (variáveis `VITE_` entram no build).

---

## 2. SQL para rodar no Supabase

No Supabase: **SQL Editor → New query**, cole e rode:

```sql
-- Tabela de acessos liberados (preenchida pelo webhook da Hotmart)
create table if not exists public.acessos_pagos (
  email        text primary key,
  ativo        boolean not null default false,
  transacao_id text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Mantém a tabela privada (só o webhook, via service_role, escreve/lê direto)
alter table public.acessos_pagos enable row level security;

-- Função segura que o app chama para saber se um e-mail tem acesso.
-- Retorna apenas true/false, sem expor a tabela.
create or replace function public.tem_acesso(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select ativo from public.acessos_pagos
       where email = lower(trim(p_email)) limit 1),
    false);
$$;

grant execute on function public.tem_acesso(text) to anon, authenticated;
```

---

## 3. Configurações de Auth no Supabase

Em **Authentication → Providers → Email**: deixe **Email** habilitado.

Você tem duas opções para o cadastro:

**Opção A (recomendada, mais simples):** desligar a confirmação por e-mail.
- Em **Authentication → Sign In / Providers → Email**, desligue
  **"Confirm email"**.
- Assim, ao criar a conta o usuário já entra direto (o acesso continua
  protegido pela compra na Hotmart). Não aparece tela de "código".

**Opção B:** manter a confirmação por código de 6 dígitos.
- Deixe **"Confirm email"** ligado.
- Em **Authentication → Email Templates → Confirm signup**, troque o link pelo
  código, usando `{{ .Token }}` no corpo do e-mail (em vez de `{{ .ConfirmationURL }}`).
- O app já tem a tela para digitar esse código.

> Dica: o mesmo vale para o template **Reset Password** (usar `{{ .Token }}`)
> se quiser a recuperação de senha por código.

---

## 4. Fluxo já implementado no código

- `src/api/supabaseClient.js` — cliente do Supabase (lê as variáveis acima).
- `src/lib/auth.js` — login, cadastro, código, recuperação de senha e
  verificação de acesso (`tem_acesso`).
- `src/lib/AuthContext.jsx` — sessão do usuário via Supabase.
- `src/components/access/AuthSection.jsx` — telas de entrar/criar conta.
- `src/components/access/HotmartGate.jsx` — bloqueia o app até o acesso ser liberado.

Depois de fazer os passos 1–3 e o Redeploy, o login/cadastro deve funcionar.

---

# Fase 2 — Tabelas de dados (feed, perfil, mensagens, etc.)

Esta fase recria as **38 entidades do Base44** como tabelas no Supabase e liga o
app a elas através de um **adaptador** (`src/api/entitiesAdapter.js`), que mantém
a mesma interface `base44.entities.X.filter/list/get/create/update/delete`. Por
isso os componentes do app **não precisaram ser reescritos um a um**.

## 5. Rodar o SQL das tabelas

No Supabase: **SQL Editor → New query**, cole **todo** o conteúdo do ficheiro
[`supabase/schema.sql`](supabase/schema.sql) (gerado automaticamente a partir dos
esquemas do Base44) e rode. Ele cria as 38 tabelas + a tabela de perfis
`usuarios`, com índices e segurança (RLS) ativada.

> O perfil do usuário fica na tabela **`usuarios`** (ligada ao login pelo `id`
> do Supabase Auth). Ele é criado automaticamente no primeiro acesso.

## 6. Observações importantes

- **Segurança (RLS):** por enquanto, cada tabela tem uma política permissiva
  (qualquer usuário logado pode ler/escrever). Isso faz o app voltar a funcionar
  rápido. Numa etapa de reforço, dá para apertar as regras por tabela usando as
  regras `rls` que já existem nos ficheiros `base44/entities/*.jsonc`.
- **Funções de servidor (Fase 3):** tudo que dependia de `base44.functions.invoke`
  (IA/Gemini, Mercado Pago, convites de equipe, upload de imagem, etc.) ainda
  **não funciona** — por ora essas chamadas só avisam no console e falham sem
  derrubar o app. Serão migradas na Fase 3.
- **Dados antigos:** o `schema.sql` cria a estrutura vazia. Se você exportou os
  dados do Base44, a importação para essas tabelas é um passo à parte.

## 7. O que foi implementado nesta fase

- `supabase/schema.sql` — as 38 tabelas + `usuarios` (gerado).
- `src/api/entityTables.js` — mapa Entidade → tabela.
- `src/api/entitiesAdapter.js` — adaptador de dados sobre o Supabase + `me`/`updateMe`.
- `src/api/base44Client.js` — agora usa o adaptador (Supabase) no lugar do Base44.

---

# Fase 3 — Funções de servidor (em andamento)

As antigas funções do Base44 (`base44.functions.invoke`) viram **funções
serverless no Vercel**, na pasta `api/`. O frontend chama `POST /api/fn/<nome>`
enviando o JWT do Supabase; o servidor valida e responde em JSON.

Arquitetura:
- `api/fn/[name].js` — ponte/despachante (valida o login e chama o handler).
- `api/_lib/handlers.js` — implementação de cada função.
- `api/_lib/admin.js` — Supabase com **service_role** (ignora RLS) + espelho do
  adaptador de entidades no servidor.
- `api/_lib/auth.js` — valida o token e carrega o perfil do usuário.

## 8. Variáveis de ambiente no Vercel (servidor)

Estas já devem existir (foram usadas no webhook); confirme e adicione as novas:

| Nome | Para quê |
|------|----------|
| `SUPABASE_URL` | mesmo URL do projeto (já usado pelo webhook) |
| `SUPABASE_SERVICE_KEY` | chave **service_role** (só no servidor; já usada pelo webhook) |
| `SUPABASE_STORAGE_BUCKET` | nome do bucket de imagens (ex.: `uploads`) |
| `GEMINI_API_KEY` | chave da API do Google Gemini (para o chat de IA) |

## 9. Storage (upload de imagens)

No Supabase: **Storage → New bucket** → crie um bucket **público** chamado
`uploads` (ou o nome que puser em `SUPABASE_STORAGE_BUCKET`). É ele que guarda
fotos de perfil/banner e mídias dos posts.

## 10. Funções já migradas nesta fase

`getUsersCount`, `listPublicUsers`, `getPublicProfile`, `uploadImageToSupabase`,
`askGemini`, `getVotingFeed`, `castVote`, `getVotingResults`.

## 11. Ainda faltam (próximas levas)

As demais ~48 funções (Mercado Pago/pagamentos, equipes/convites, mensagens e
notificações no servidor, conteúdo premium, geração de imagem DALL·E, agentes de
IA do feed, saques, etc.) ainda retornam **501** quando chamadas — o app não
quebra, mas esses recursos específicos ficam indisponíveis até serem migrados.
Cada uma é adicionada incrementalmente em `api/_lib/handlers.js`, seguindo o
mesmo padrão das já migradas.
