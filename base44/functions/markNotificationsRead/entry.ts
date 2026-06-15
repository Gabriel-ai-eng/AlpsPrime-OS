import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Marks notifications as read.
 * Accepts: { ids?: string[], all?: boolean }
 * - If all=true: marks ALL unread notifications of the current user as read.
 * - If ids: marks only the specified ids (must belong to the current user).
 *
 * Uses service role because Notifications are created by other users,
 * and per-user RLS may prevent the recipient from updating them directly.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { ids, all } = body || {};

    const svc = base44.asServiceRole;
    let targets = [];

    if (all) {
      targets = await svc.entities.Notification.filter(
        { recipient_email: me.email, read: false },
        '-created_date',
        500
      );
    } else if (Array.isArray(ids) && ids.length > 0) {
      const fetched = await Promise.all(ids.map((id) => svc.entities.Notification.get(id).catch(() => null)));
      // Only touch notifications that belong to the current user
      targets = fetched.filter((n) => n && n.recipient_email === me.email && !n.read);
    } else {
      return Response.json({ error: 'Provide "ids" or "all: true"' }, { status: 400 });
    }

    await Promise.all(targets.map((n) => svc.entities.Notification.update(n.id, { read: true })));
    return Response.json({ ok: true, updated: targets.length });
  } catch (error) {
    console.error('markNotificationsRead error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});