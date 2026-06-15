import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Admin-only: define the weekly trend (Sunday → Saturday).
 * Deactivates any previous active trend.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me || me.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { tag, title, description } = await req.json();
    if (!tag) return Response.json({ error: 'tag required' }, { status: 400 });

    const svc = base44.asServiceRole;
    // Deactivate previous
    const actives = await svc.entities.WeeklyTrend.filter({ active: true });
    for (const t of actives) await svc.entities.WeeklyTrend.update(t.id, { active: false });

    const now = new Date();
    // Find Sunday 00:00 BRT (this week)
    const dow = now.getUTCDay();
    const start = new Date(now);
    start.setUTCDate(now.getUTCDate() - dow);
    start.setUTCHours(3, 0, 0, 0); // 00:00 BRT
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);

    const trend = await svc.entities.WeeklyTrend.create({
      tag: tag.trim().toLowerCase().replace(/^#/, ''),
      title: title || '',
      description: description || '',
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      active: true,
    });

    return Response.json({ ok: true, trend });
  } catch (error) {
    console.error('setWeeklyTrend error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});