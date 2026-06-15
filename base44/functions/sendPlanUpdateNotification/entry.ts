import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Admin-only function to send a plan update/feature notification to users.
 * Payload: { title, message, target_plans (array, e.g. ["free","pro","unlimited"] or null for all) }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { title, message, target_plans } = await req.json();
    if (!message) {
      return Response.json({ error: 'message is required' }, { status: 400 });
    }

    // Fetch all users that have plan updates enabled
    const allUsers = await svc.entities.User.list('-created_date', 500);
    const targets = allUsers.filter(u => {
      if (u.notify_plan_updates === false) return false;
      if (target_plans && target_plans.length > 0) {
        return target_plans.includes(u.plan || 'free');
      }
      return true;
    });

    const preview = title ? `${title}: ${message}` : message;

    const notifications = targets.map(u => ({
      recipient_email: u.email,
      actor_email: 'sexta-feira@system',
      actor_name: 'Sexta-feira',
      actor_avatar: '',
      type: 'welcome',
      post_preview: `🔔 ${preview}`,
      read: false,
    }));

    // Bulk create in batches of 50
    for (let i = 0; i < notifications.length; i += 50) {
      await svc.entities.Notification.bulkCreate(notifications.slice(i, i + 50));
    }

    return Response.json({ ok: true, sent: notifications.length });
  } catch (error) {
    console.error('sendPlanUpdateNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});