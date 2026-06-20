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
