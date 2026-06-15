import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Função admin — sincroniza acesso com Hotmart:
 *  - Quem NÃO comprou (não está em AuthorizedAccess ativo) e não é admin:
 *      → recebe e-mail "você tem 7 dias para comprar, senão tudo será apagado"
 *      → o perfil é MANTIDO na plataforma (o HotmartGate já bloqueia o acesso)
 *  - Quem COMPROU:
 *      → recebe e-mail de agradecimento
 *
 * Payload:
 *  { dryRun?: boolean }   // se true, NÃO envia e-mails — só retorna a contagem
 *
 * Apenas admins podem invocar.
 */

const CHECKOUT_URL = Deno.env.get('HOTMART_CHECKOUT_URL') ||
  'https://pay.hotmart.com/G105845926J?sck=HOTMART_PRODUCT_PAGE&off=ncqx25bh';

const FROM_NAME = 'Sexta-feira';

const buildRemovedEmail = (name) => ({
  subject: 'Você tem 7 dias para garantir seu acesso à Sexta-feira ⏳',
  body: `
<div style="font-family:Inter,Arial,sans-serif;background:#FBFAF6;padding:32px 16px;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #EFE7D2;border-radius:20px;padding:32px;">
    <h1 style="font-family:'Playfair Display',serif;font-size:28px;margin:0 0 8px;background:linear-gradient(135deg,#E8C77A,#A8852E);-webkit-background-clip:text;background-clip:text;color:transparent;">Olá${name ? ', ' + name : ''} 👋</h1>
    <p style="font-size:15px;line-height:1.6;color:#4a4a4a;margin:0 0 16px;">
      A <strong>Sexta-feira</strong> agora é um produto pago — um acesso vitalício único por apenas <strong>R$ 19,90</strong>.
    </p>
    <p style="font-size:15px;line-height:1.6;color:#4a4a4a;margin:0 0 16px;">
      Seu perfil continua salvo na plataforma, mas você precisa adquirir o acesso para voltar a usar.
    </p>
    <div style="background:#FFF7E6;border:1px solid #E8C77A;border-radius:14px;padding:16px 18px;margin:20px 0;">
      <p style="margin:0;font-size:14px;line-height:1.6;color:#7a5a10;">
        ⏳ <strong>Você tem 7 dias</strong> para garantir seu acesso. Após esse prazo, seu perfil, posts, comentários, mensagens e tudo mais serão <strong>apagados permanentemente</strong> da plataforma.
      </p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${CHECKOUT_URL}" style="display:inline-block;background:linear-gradient(135deg,#E8C77A,#C9A24F,#A8852E);color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;font-size:15px;">
        Garantir meu acesso por R$ 19,90
      </a>
    </div>
    <p style="font-size:13px;line-height:1.6;color:#888;margin:16px 0 0;">
      Importante: use o mesmo e-mail desta conta na hora de comprar — assim seu acesso é liberado automaticamente e você não perde nada do que já construiu por aqui.
    </p>
    <p style="font-size:13px;line-height:1.6;color:#888;margin:16px 0 0;">
      Te esperamos ✨<br/>Equipe Sexta-feira
    </p>
  </div>
</div>`.trim(),
});

const buildWelcomeEmail = (name) => ({
  subject: 'Parabéns! Seu acesso à Sexta-feira está liberado 🎉',
  body: `
<div style="font-family:Inter,Arial,sans-serif;background:#FBFAF6;padding:32px 16px;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #EFE7D2;border-radius:20px;padding:32px;">
    <h1 style="font-family:'Playfair Display',serif;font-size:28px;margin:0 0 8px;background:linear-gradient(135deg,#E8C77A,#A8852E);-webkit-background-clip:text;background-clip:text;color:transparent;">Parabéns${name ? ', ' + name : ''}! 🎉</h1>
    <p style="font-size:15px;line-height:1.6;color:#4a4a4a;margin:0 0 16px;">
      Obrigado por adquirir seu acesso à <strong>Sexta-feira</strong>! Estamos muito felizes em ter você com a gente. Seu acesso é vitalício e tudo já está liberado:
    </p>
    <ul style="font-size:14px;line-height:1.8;color:#4a4a4a;margin:0 0 20px;padding-left:20px;">
      <li>Feed, Sextou, Cards e Votação</li>
      <li>Sexta-feira IA, Arena e PlayLab</li>
      <li>Mensagens diretas, ranking e conquistas</li>
    </ul>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://sextafeira.app" style="display:inline-block;background:linear-gradient(135deg,#E8C77A,#C9A24F,#A8852E);color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;font-size:15px;">
        Entrar na plataforma
      </a>
    </div>
    <p style="font-size:13px;line-height:1.6;color:#888;margin:16px 0 0;">
      Qualquer dúvida, é só responder este e-mail. Boas-vindas oficiais ✨<br/>Equipe Sexta-feira
    </p>
  </div>
</div>`.trim(),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me || me.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dryRun = false } = await req.json().catch(() => ({}));

    // 1) Lista todos os usuários e todos os acessos ativos
    const [users, accesses] = await Promise.all([
      base44.asServiceRole.entities.User.list('', 5000),
      base44.asServiceRole.entities.AuthorizedAccess.filter({ status: 'active' }, '', 5000),
    ]);

    const paidEmails = new Set(
      (accesses || []).map((a) => (a.email || '').trim().toLowerCase()).filter(Boolean)
    );

    const toRemove = [];
    const toThank = [];

    for (const u of users) {
      const email = (u.email || '').trim().toLowerCase();
      if (!email) continue;
      if (u.role === 'admin') continue; // admins ficam
      if (paidEmails.has(email)) {
        toThank.push(u);
      } else {
        toRemove.push(u);
      }
    }

    console.log('[syncAccessAndCleanup]', {
      total: users.length,
      toRemove: toRemove.length,
      toThank: toThank.length,
      dryRun,
    });

    if (dryRun) {
      return Response.json({
        dryRun: true,
        totalUsers: users.length,
        toRemove: toRemove.length,
        toThank: toThank.length,
        removeEmails: toRemove.map((u) => u.email),
        thankEmails: toThank.map((u) => u.email),
      });
    }

    let warned = 0;
    let warnEmailErrors = 0;
    let thanked = 0;
    let thankEmailErrors = 0;

    // 2) Envia e-mail de aviso (7 dias) aos não-pagantes — NÃO deleta os perfis
    for (const u of toRemove) {
      const { subject, body } = buildRemovedEmail(u.full_name || '');
      try {
        await base44.integrations.Core.SendEmail({
          from_name: FROM_NAME,
          to: u.email,
          subject,
          body,
        });
        warned++;
      } catch (e) {
        warnEmailErrors++;
        console.error('[syncAccessAndCleanup] email warn fail', u.email, e.message);
      }
    }

    // 3) Envia e-mail de agradecimento aos pagantes
    for (const u of toThank) {
      const { subject, body } = buildWelcomeEmail(u.full_name || '');
      try {
        await base44.integrations.Core.SendEmail({
          from_name: FROM_NAME,
          to: u.email,
          subject,
          body,
        });
        thanked++;
      } catch (e) {
        thankEmailErrors++;
        console.error('[syncAccessAndCleanup] email thank fail', u.email, e.message);
      }
    }

    return Response.json({
      ok: true,
      totalUsers: users.length,
      warned,
      warnEmailErrors,
      thanked,
      thankEmailErrors,
    });
  } catch (error) {
    console.error('[syncAccessAndCleanup] error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});