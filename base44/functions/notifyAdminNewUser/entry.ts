import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = 'alpsprimestudios@gmail.com';
// How far back to look on each run (slightly larger than the schedule interval to avoid gaps).
const LOOKBACK_MINUTES = 10;

/**
 * Scheduled automation: runs every ~5 min.
 * Detects newly registered users (created in the last LOOKBACK_MINUTES)
 * and emails the admin once per user (deduplicated via a marker Notification).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const cutoff = new Date(Date.now() - LOOKBACK_MINUTES * 60 * 1000);
    const allUsers = await svc.entities.User.list('-created_date', 50);

    const recent = allUsers.filter((u) => {
      if (!u.created_date) return false;
      return new Date(u.created_date) >= cutoff;
    });

    if (recent.length === 0) {
      return Response.json({ ok: true, notified: 0 });
    }

    const { accessToken } = await svc.connectors.getConnection('gmail');

    // Find an admin to use as sender for the welcome DM (cached once per run)
    const admins = await svc.entities.User.filter({ role: 'admin' }, '-created_date', 1);
    const dmSenderEmail = admins[0]?.email || ADMIN_EMAIL;

    let notifiedCount = 0;
    for (const u of recent) {
      // --- Welcome DM to the new user (deduped via its own marker) ---
      try {
        const dmMarker = await svc.entities.Notification.filter({
          recipient_email: u.email,
          actor_email: 'sexta-feira@system',
          type: 'welcome_dm',
        }, '-created_date', 1);

        if (dmMarker.length === 0 && u.email !== dmSenderEmail) {
          const firstName = (u.full_name || '').split(' ')[0] || 'amigo(a)';
          const conversationKey = [dmSenderEmail, u.email].sort().join('|');
          const dmContent = `Oi ${firstName}! 👋 Seja muito bem-vindo(a) à Sexta-feira!

Aqui você vai encontrar uma comunidade exclusiva, com Feed, Sextou, Cards, Votação, Arena e muito mais.

Algumas dicas pra começar:
• Faça seu primeiro post no Feed
• Complete suas metas pra subir no ranking
• Participe da votação e do Sextou da semana

Qualquer dúvida, é só me responder por aqui. Boa jornada! 🎉`;

          await svc.entities.DirectMessage.create({
            sender_email: dmSenderEmail,
            receiver_email: u.email,
            content: dmContent,
            conversation_key: conversationKey,
            read: false,
          });

          await svc.entities.Notification.create({
            recipient_email: u.email,
            actor_email: 'sexta-feira@system',
            actor_name: 'Sexta-feira',
            type: 'welcome_dm',
            post_preview: 'Welcome DM sent',
            read: true,
          });
        }
      } catch (dmErr) {
        console.error('Welcome DM failed for', u.email, dmErr.message);
      }

      // Dedup: have we already sent the admin notification for this user?
      const marker = await svc.entities.Notification.filter({
        recipient_email: ADMIN_EMAIL,
        actor_email: u.email,
        type: 'welcome',
      }, '-created_date', 1);

      if (marker.length > 0) continue;

      const userName = u.full_name || 'Sem nome';
      const userEmail = u.email;
      const signupAt = new Date(u.created_date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const totalUsers = String(allUsers.length);

      const subject = `🎉 Novo cadastro na Sexta-feira: ${userName}`;
      const html = buildEmailHtml({ userName, userEmail, signupAt, totalUsers });
      const rawMessage = buildRawMime({ to: ADMIN_EMAIL, subject, html });

      const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: rawMessage }),
      });

      if (!gmailRes.ok) {
        const errText = await gmailRes.text();
        console.error('Gmail send failed for', userEmail, gmailRes.status, errText);
        continue;
      }

      // Save dedup marker
      await svc.entities.Notification.create({
        recipient_email: ADMIN_EMAIL,
        actor_email: userEmail,
        actor_name: userName,
        type: 'welcome',
        post_preview: `Novo cadastro: ${userName} (${userEmail})`,
        read: true,
      });

      notifiedCount++;
    }

    return Response.json({ ok: true, notified: notifiedCount, scanned: recent.length });
  } catch (error) {
    console.error('notifyAdminNewUser error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildEmailHtml({ userName, userEmail, signupAt, totalUsers }) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#0a0a0a; color:#fff; padding:32px; max-width:560px; margin:0 auto; border-radius:16px; border:1px solid #D4AF37;">
      <h2 style="color:#D4AF37; margin:0 0 8px; font-size:22px;">🎉 Novo usuário cadastrado!</h2>
      <p style="color:#999; margin:0 0 24px; font-size:13px;">Sexta-feira 1.0 — Notificação de admin</p>

      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:12px; padding:20px; margin-bottom:20px;">
        <table style="width:100%; border-collapse:collapse; color:#fff; font-size:14px;">
          <tr><td style="padding:6px 0; color:#999; width:40%;">Nome</td><td style="padding:6px 0; font-weight:600;">${escapeHtml(userName)}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">E-mail</td><td style="padding:6px 0; color:#D4AF37;">${escapeHtml(userEmail)}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Data e hora</td><td style="padding:6px 0;">${escapeHtml(signupAt)}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Total de usuários</td><td style="padding:6px 0; font-weight:700; color:#D4AF37;">${escapeHtml(totalUsers)}</td></tr>
        </table>
      </div>

      <p style="color:#666; font-size:11px; text-align:center; margin:16px 0 0;">
        Notificação automática enviada pelo sistema da Sexta-feira.
      </p>
    </div>
  `;
}

function buildRawMime({ to, subject, html }) {
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

  const utf8Html = new TextEncoder().encode(html);
  const bodyB64 = base64FromBytes(utf8Html);

  const fullMessage = `${headers}\r\n\r\n${bodyB64}`;
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