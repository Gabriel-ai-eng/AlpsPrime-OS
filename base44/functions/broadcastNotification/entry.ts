import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Admin-only: cria uma notificação (comunicado) para TODOS os usuários.
 * Tipos suportados: 'update' (atualização) e 'app' (novo web app).
 * Body esperado: { type: 'update' | 'app', title: string, body?: string }
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    // Apenas admin pode disparar comunicados para todos
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const type = payload?.type;
    const title = String(payload?.title || '').trim();
    const body = String(payload?.body || '').trim();

    if (type !== 'update' && type !== 'app') {
      return Response.json({ error: 'Tipo inválido. Use "update" ou "app".' }, { status: 400 });
    }
    if (!title) {
      return Response.json({ error: 'O título é obrigatório.' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    const users = await svc.entities.User.list();

    let sent = 0;
    const BATCH = 25;
    for (let i = 0; i < users.length; i += BATCH) {
      const slice = users.slice(i, i + BATCH);
      await Promise.all(
        slice.map((u) => {
          if (!u.email) return Promise.resolve();
          return svc.entities.Notification.create({
            recipient_email: u.email,
            actor_email: 'sexta-feira@system',
            actor_name: title,
            actor_avatar: '',
            type,
            post_preview: body,
            read: false,
          })
            .then(() => {
              sent++;
            })
            .catch((e) => {
              console.error('broadcast create failed for', u.email, e.message);
            });
        })
      );
    }

    return Response.json({ ok: true, sent, total: users.length });
  } catch (error) {
    console.error('broadcastNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
