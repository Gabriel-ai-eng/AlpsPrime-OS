import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Cast a vote for a post. Voting is open only on Thursdays (BRT, day 4).
 * One vote per user per round. Users can change their vote (replace).
 * round_id = ISO year-week.
 */
function getRoundId(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { post_id } = body;
    if (!post_id) return Response.json({ error: 'post_id required' }, { status: 400 });

    // Check that today is Thursday (BRT). BRT = UTC-3
    const now = new Date();
    const brtHour = (now.getUTCHours() - 3 + 24) % 24;
    const brtDay = (now.getUTCDay() + (now.getUTCHours() < 3 ? -1 : 0) + 7) % 7;
    if (brtDay !== 4) {
      return Response.json({ error: 'A votação só fica aberta às quintas-feiras.' }, { status: 403 });
    }

    const roundId = getRoundId(now);
    const svc = base44.asServiceRole;

    // Cannot vote on your own post
    const post = await svc.entities.Post.get(post_id).catch(() => null);
    if (!post) return Response.json({ error: 'Post não encontrado' }, { status: 404 });
    if (post.author_email === me.email) {
      return Response.json({ error: 'Você não pode votar no próprio post.' }, { status: 400 });
    }

    const existing = await svc.entities.Vote.filter({ voter_email: me.email, round_id: roundId });
    if (existing.length > 0) {
      // Replace vote
      await svc.entities.Vote.update(existing[0].id, { post_id });
    } else {
      await svc.entities.Vote.create({ post_id, voter_email: me.email, round_id: roundId });
    }

    return Response.json({ ok: true, round_id: roundId, brt_hour: brtHour });
  } catch (error) {
    console.error('castVote error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});