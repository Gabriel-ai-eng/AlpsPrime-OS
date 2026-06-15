import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Endpoint público (chamado pelo botão no email do admin).
 * Marca o saque como "paid" se o token bater com o registrado.
 * Retorna uma página HTML simples confirmando ou rejeitando.
 */
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const id = url.searchParams.get('id');

    console.log('[confirmWithdrawal] called with id:', id, 'token:', token?.slice(0, 8) + '...');

    if (!token || !id) {
      return htmlResponse(errorPage('Link inválido', 'Parâmetros ausentes.'));
    }

    const base44 = createClientFromRequest(req);

    let withdrawal;
    try {
      withdrawal = await base44.asServiceRole.entities.Withdrawal.get(id);
    } catch (err) {
      console.error('[confirmWithdrawal] Withdrawal.get failed:', err.message);
      return htmlResponse(errorPage('Saque não encontrado', 'Este saque não existe ou foi removido.'));
    }

    if (!withdrawal) {
      return htmlResponse(errorPage('Saque não encontrado', 'Este saque não existe ou foi removido.'));
    }

    if (withdrawal.confirm_token !== token) {
      console.error('[confirmWithdrawal] token mismatch');
      return htmlResponse(errorPage('Token inválido', 'Este link de confirmação não é válido.'));
    }

    if (withdrawal.status === 'paid') {
      return htmlResponse(successPage(withdrawal, true));
    }

    try {
      await base44.asServiceRole.entities.Withdrawal.update(id, {
        status: 'paid',
        confirmed_at: new Date().toISOString(),
        notes: 'Confirmado manualmente pelo administrador.',
      });
      console.log('[confirmWithdrawal] updated to paid:', id);
    } catch (err) {
      console.error('[confirmWithdrawal] Withdrawal.update failed:', err.message);
      return htmlResponse(errorPage('Erro ao atualizar', err.message));
    }

    return htmlResponse(successPage(withdrawal, false));
  } catch (error) {
    console.error('[confirmWithdrawal] fatal:', error.message);
    return htmlResponse(errorPage('Erro', error.message));
  }
});

function htmlResponse(html) {
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function basePage(content) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Confirmação de saque — Sexta-feira 1.0</title></head>
  <body style="margin:0;background:#0a0a0a;color:#fff;font-family:-apple-system,Segoe UI,Roboto,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
    <div style="max-width:480px;width:100%;background:#111;border:1px solid #D4AF37;border-radius:16px;padding:32px;text-align:center;">
      ${content}
    </div>
  </body></html>`;
}

function successPage(w, already) {
  const amount = (w.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return basePage(`
    <div style="font-size:48px;margin-bottom:8px;">✅</div>
    <h1 style="color:#22c55e;margin:0 0 8px;font-size:22px;">${already ? 'Já estava confirmado' : 'Pagamento confirmado!'}</h1>
    <p style="color:#ccc;margin:0 0 20px;font-size:14px;">
      ${already ? 'Este saque já havia sido marcado como pago.' : 'O saque foi marcado como <strong style="color:#22c55e;">Pago</strong> no histórico do usuário.'}
    </p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:16px;text-align:left;font-size:13px;color:#ccc;">
      <p style="margin:4px 0;"><span style="color:#888;">Usuário:</span> ${escapeHtml(w.user_name || w.user_email)}</p>
      <p style="margin:4px 0;"><span style="color:#888;">Email:</span> ${escapeHtml(w.user_email)}</p>
      <p style="margin:4px 0;"><span style="color:#888;">Chave PIX:</span> <span style="font-family:monospace;color:#D4AF37;">${escapeHtml(w.pix_key)}</span></p>
      <p style="margin:4px 0;"><span style="color:#888;">Valor:</span> <strong style="color:#D4AF37;">${amount}</strong></p>
    </div>
  `);
}

function errorPage(title, msg) {
  return basePage(`
    <div style="font-size:48px;margin-bottom:8px;">⚠️</div>
    <h1 style="color:#ef4444;margin:0 0 8px;font-size:22px;">${escapeHtml(title)}</h1>
    <p style="color:#ccc;margin:0;font-size:14px;">${escapeHtml(msg)}</p>
  `);
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}