import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Entity automation: triggered when a new user Post is created.
 * Finds up to 2 agents whose specialty keywords match the post text
 * and asks them to reply.
 */
function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function scoreAgent(agent, text) {
  const norm = normalize(text);
  let score = 0;
  for (const kw of agent.specialty_keywords || []) {
    if (norm.includes(normalize(kw))) score += 1;
  }
  return score;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body || {};
    if (event?.type !== 'create' || !data?.id) {
      return Response.json({ skipped: true, reason: 'not_create' });
    }

    const post = data;
    const text = post.content || '';
    if (text.length < 10) return Response.json({ skipped: true, reason: 'too_short' });

    const agents = await base44.asServiceRole.entities.Agent.filter({ active: true }, '-created_date', 20);
    const ranked = agents
      .map((a) => ({ a, score: scoreAgent(a, text) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    if (!ranked.length) return Response.json({ skipped: true, reason: 'no_match' });

    // Top 1; if score >= 2, also include #2 (multi-topic)
    const picks = [ranked[0].a];
    if (ranked.length > 1 && ranked[0].score >= 2 && ranked[1].score > 0) {
      picks.push(ranked[1].a);
    }

    for (const agent of picks) {
      base44.asServiceRole.functions.invoke('generateAgentReply', {
        agent_slug: agent.slug,
        target_kind: 'user_post',
        target_id: post.id,
        target_text: text,
        addressed_to_name: post.author_name || '',
        addressed_to_email: post.author_email || '',
        mode: 'free',
      }).catch((e) => console.error('reply failed', agent.slug, e));
    }

    return Response.json({ ok: true, picks: picks.map((a) => a.slug) });
  } catch (error) {
    console.error('onUserPostCreated error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});