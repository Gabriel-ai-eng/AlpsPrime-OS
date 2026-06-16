# AlpsPrime-OS

App Base44 (ID `69e44004c1822ff0840cc105`). Subdomínio publicado:
`https://lush-nutriflow-daily-track.base44.app`.

## Fluxo de trabalho com Git (preferência do dono do projeto)

O dono **autorizou** que toda alteração vá **direto para a branch `main`**, sem
Pull Request e sem ele precisar abrir o GitHub. O Base44 publica a partir da
`main`, então ele acompanha o resultado pelo preview do Base44.

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
- Variáveis de ambiente necessárias no Base44:
  - `HOTMART_CHECKOUT_URL` — link do checkout (usado pelo botão "Comprar"; sem ela
    o botão fica desabilitado).
  - `HOTMART_HOTTOK` — Hottok do webhook da Hotmart (valida e libera o acesso).
