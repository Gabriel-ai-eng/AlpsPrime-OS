# AlpsPrime-OS

Aplicativo web (React + Vite) com backend em **Supabase** e deploy na **Vercel**.
Domínio de produção: `https://alpsprime.com.br`.

## Rodar localmente

**Pré-requisitos:**

1. Clonar o repositório
2. Entrar na pasta do projeto
3. Instalar dependências: `npm install`
4. Criar um arquivo `.env.local` com as variáveis de ambiente

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_public
```

Rodar o app: `npm run dev`

## Publicar

O deploy é feito pela **Vercel** a partir da branch `main`. Qualquer push para a
`main` dispara um novo deploy automático em produção (`alpsprime.com.br`).

Antes de enviar para a `main`, rode `npm run build` para garantir que o build
não está quebrado.
