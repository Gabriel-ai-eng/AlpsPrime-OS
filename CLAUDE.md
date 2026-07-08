# AlpsPrime-OS

App web (React + Vite) com backend em **Supabase** e deploy na **Vercel**.
Domínio de produção: `https://alpsprime.com.br`.

## Fluxo de trabalho com Git (preferência do dono do projeto)

O dono **autorizou** que toda alteração vá **direto para a branch `main`**, sem
Pull Request e sem ele precisar abrir o GitHub. A Vercel publica a partir da
`main`, então ele acompanha o resultado pelo site em produção
(`alpsprime.com.br`).

Por isso, ao concluir qualquer mudança:

1. Fazer commit das alterações com mensagem clara.
2. Mesclar/enviar **direto para `main`** e dar `git push` para a `origin/main`.
3. Antes de enviar código de frontend para a `main`, rodar `npm run build` para
   garantir que não está quebrado (a `main` é produção).
4. Não criar Pull Request a menos que seja explicitamente pedido.

## Acesso / pagamento (Hotmart)

- Fluxo: tela `Welcome` (comprar) → pagar na Hotmart com o mesmo e-mail → login →
  `HotmartGate` verifica via `checkMyAccess` (entidade `AuthorizedAccess`).
- Webhook da Hotmart aponta para a função `hotmartWebhook`.
- Variáveis de ambiente necessárias (na Vercel):
  - `HOTMART_CHECKOUT_URL` — link do checkout (usado pelo botão "Comprar"; sem ela
    o botão fica desabilitado).
  - `HOTMART_HOTTOK` — Hottok do webhook da Hotmart (valida e libera o acesso).

### Segurança do acesso (não é só o HotmartGate)

O `HotmartGate` no frontend é apenas a "cortina" visual. Como o app fala DIRETO
com o Supabase pela chave pública (anon), o bloqueio de verdade está no BANCO,
via **Row Level Security (RLS)** — ver `supabase/migrations/0001_rls_paywall_lockdown.sql`.

Regras:
- Todas as tabelas de conteúdo têm RLS ligada com a política `acesso_pago_all`:
  só lê/grava quem está **logado E com acesso pago** (função `pode_acessar()` =
  admin fixo **ou** `tem_acesso(email)` = ativo em `acessos_pagos`).
- `acessos_pagos` e `authorized_access` têm RLS **sem política** — só a service
  key (webhook) e a função `tem_acesso` (SECURITY DEFINER) acessam.
- Ao criar QUALQUER tabela nova de conteúdo, **ligue RLS e crie a política**
  seguindo o mesmo padrão, senão ela nasce aberta para não-pagantes.
- Admins: mantidos em `pode_acessar()` no banco **e** em `ADMIN_EMAILS`
  (`src/lib/branding.js`) — os dois precisam bater.
