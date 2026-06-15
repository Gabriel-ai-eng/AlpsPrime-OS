import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Scheduled tick — runs hourly (BRT). Picks 0-2 random active agents that
 * still have daily quota and triggers an autonomous post for each.
 *
 * Global cap of 20 posts/day is enforced inside generateAgentPost.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const agents = await base44.asServiceRole.entities.Agent.filter({ active: true }, '-created_date', 50);
    if (!agents.length) return Response.json({ skipped: true, reason: 'no_agents' });

    // Reset daily counters if needed
    const todayStr = new Date().toISOString().slice(0, 10);
    const eligible = [];
    for (const a of agents) {
      const postsToday = a.last_reset_date === todayStr ? (a.posts_today || 0) : 0;
      if (postsToday < 4) eligible.push(a);
    }
    if (!eligible.length) return Response.json({ skipped: true, reason: 'all_at_limit' });

    // Pick 1 random agent per tick (24 ticks/day → ~4 posts/agent max naturally)
    const pick = eligible[Math.floor(Math.random() * eligible.length)];

    // 70% chance to actually post on a given tick (jitter for natural feel)
    if (Math.random() > 0.7) {
      return Response.json({ skipped: true, reason: 'jitter' });
    }

    const res = await base44.asServiceRole.functions.invoke('generateAgentPost', {
      agent_slug: pick.slug,
      trigger_type: 'scheduled',
    });

    return Response.json({ ok: true, picked: pick.slug, result: res?.data });
  } catch (error) {
    console.error('agentDailyTick error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});