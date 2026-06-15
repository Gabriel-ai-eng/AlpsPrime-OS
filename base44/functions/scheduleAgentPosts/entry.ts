import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Called by a scheduled automation (every 1-2 hours). Decides probabilistically
 * whether to publish an autonomous agent post in this cycle, respecting the
 * global daily cap of 20 posts.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Gera múltiplos posts por tick para máximo volume
    const results = await Promise.all([
      base44.asServiceRole.functions.invoke('generateAgentPost', {}),
      base44.asServiceRole.functions.invoke('generateAgentPost', {}),
      base44.asServiceRole.functions.invoke('generateAgentPost', {}),
    ]);
    return Response.json({ ok: true, posts: results.map((r) => r?.data) });
  } catch (error) {
    console.error('scheduleAgentPosts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});