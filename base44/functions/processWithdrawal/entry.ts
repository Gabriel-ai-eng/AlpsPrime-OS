import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = 'alpsprimestudios@gmail.com';

/**
 * Cria uma solicitação de saque PIX (status: pending) e envia um email
 * via Gmail API para o administrador, com botão "Confirmar pagamento" que
 * marca o saque como "paid" no histórico do usuário.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, pix_key } = await req.json();
    const numericAmount = parseFloat(amount);

    if (!numericAmount || numericAmount <= 0) {
      return Response.json({ error: 'Valor inválido' }, { status: 400 });
    }
    if (!pix_key || pix_key.trim().length < 3) {
      return Response.json({ error: 'Chave PIX inválida' }, { status: 400 });
    }

    // Saldo: 1 BRL por meta concluída - saques já solicitados (pending/processing/paid)
    const completions = await base44.asServiceRole.entities.Challenge.filter({ user_email: user.email }, '-created_date', 1000);
    const earned = completions.length * 1;

    const allWithdrawals = await base44.asServiceRole.entities.Withdrawal.filter({ user_email: user.email }, '-created_date', 500);
    const reserved = allWithdrawals
      .filter((w) => ['pending', 'processing', 'paid'].includes(w.status))
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    const balance = earned - reserved;
    if (numericAmount > balance) {
      return Response.json({ error: 'Saldo insuficiente' }, { status: 400 });
    }

    // Token único para o botão de confirmação no email
    const confirmToken = crypto.randomUUID() + '-' + crypto.randomUUID();

    const userName = user.ranking_display_name || user.full_name || 'Usuário';
    const requestedAt = new Date();

    const withdrawal = await base44.asServiceRole.entities.Withdrawal.create({
      user_email: user.email,
      user_name: userName,
      amount: numericAmount,
      method: 'pix',
      pix_key: pix_key.trim(),
      status: 'pending',
      confirm_token: confirmToken,
    });

    // URL pública do botão de confirmação
    const appId = Deno.env.get('BASE44_APP_ID');
    const confirmUrl = `https://app.base44.com/api/apps/${appId}/functions/confirmWithdrawal?token=${encodeURIComponent(confirmToken)}&id=${withdrawal.id}`;

    const formattedAmount = numericAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedDate = requestedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const subject = `💰 Saque PIX de ${formattedAmount} — ${userName}`;
    const html = buildEmailHtml({
      userName,
      userEmail: user.email,
      pixKey: pix_key.trim(),
      formattedAmount,
      formattedDate,
      withdrawalId: withdrawal.id,
      confirmUrl,
    });

    // Envia via Gmail API (conector autorizado)
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const rawMessage = buildRawMime({
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawMessage }),
    });

    if (!gmailRes.ok) {
      const errText = await gmailRes.text();
      console.error('Gmail send failed:', gmailRes.status, errText);
      return Response.json({ error: 'Falha ao enviar email ao administrador.' }, { status: 500 });
    }

    return Response.json({
      status: 'pending',
      message: 'Solicitação enviada. Você receberá o PIX assim que for confirmado pelo administrador.',
    });
  } catch (error) {
    console.error('processWithdrawal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildEmailHtml({ userName, userEmail, pixKey, formattedAmount, formattedDate, withdrawalId, confirmUrl }) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#0a0a0a; color:#fff; padding:32px; max-width:560px; margin:0 auto; border-radius:16px; border:1px solid #D4AF37;">
      <h2 style="color:#D4AF37; margin:0 0 8px; font-size:22px;">💰 Nova solicitação de saque PIX</h2>
      <p style="color:#999; margin:0 0 24px; font-size:13px;">Sexta-feira 1.0 — Painel administrativo</p>

      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:12px; padding:20px; margin-bottom:24px;">
        <table style="width:100%; border-collapse:collapse; color:#fff; font-size:14px;">
          <tr><td style="padding:6px 0; color:#999; width:40%;">Nome do usuário</td><td style="padding:6px 0; font-weight:600;">${escapeHtml(userName)}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">E-mail de cadastro</td><td style="padding:6px 0;">${escapeHtml(userEmail)}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Chave PIX</td><td style="padding:6px 0; font-family:monospace; color:#D4AF37;">${escapeHtml(pixKey)}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Valor</td><td style="padding:6px 0; font-weight:700; font-size:18px; color:#D4AF37;">${formattedAmount}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Data e horário</td><td style="padding:6px 0;">${formattedDate}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">ID do saque</td><td style="padding:6px 0; font-family:monospace; font-size:11px;">${withdrawalId}</td></tr>
        </table>
      </div>

      <p style="color:#ccc; font-size:13px; margin:0 0 16px;">
        Após realizar o PIX manualmente para a chave acima, clique no botão abaixo
        para marcar o saque como <strong style="color:#22c55e;">Pago</strong> no histórico do usuário.
      </p>

      <div style="text-align:center; margin:28px 0;">
        <a href="${confirmUrl}"
           style="display:inline-block; background:linear-gradient(135deg,#F4D06F,#D4AF37,#B8860B); color:#0a0a0a; font-weight:700; text-decoration:none; padding:14px 32px; border-radius:12px; font-size:15px;">
          ✓ Confirmar pagamento
        </a>
      </div>

      <p style="color:#666; font-size:11px; text-align:center; margin:16px 0 0;">
        Este botão é único e só pode ser usado uma vez. Não compartilhe este email.
      </p>
    </div>
  `;
}

/**
 * Constrói uma mensagem MIME RFC 2822 codificada em base64url para a Gmail API.
 * Usa codificação RFC 2047 no Subject para suportar emojis/acentos,
 * e quoted-printable simples no body HTML (UTF-8).
 */
function buildRawMime({ to, subject, html }) {
  // Subject: RFC 2047 (B-encoding em UTF-8) para suportar emojis/acentos
  const utf8Subject = new TextEncoder().encode(subject);
  const subjectB64 = base64FromBytes(utf8Subject);
  const encodedSubject = `=?UTF-8?B?${subjectB64}?=`;

  const headers = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ].join('\r\n');

  // Corpo HTML codificado em base64 (UTF-8 bytes)
  const utf8Html = new TextEncoder().encode(html);
  const bodyB64 = base64FromBytes(utf8Html);

  const fullMessage = `${headers}\r\n\r\n${bodyB64}`;

  // A mensagem inteira para a Gmail API: base64url
  const fullBytes = new TextEncoder().encode(fullMessage);
  return base64FromBytes(fullBytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64FromBytes(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}