import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Returns the candidate posts for this week's voting round + my current vote (if any).
 * Candidates: posts created in the last 7 days, sorted by likes_count.
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

    const svc = base44.asServiceRole;
    const now = new Date();
    const roundId = getRoundId(now);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const allPosts = await svc.entities.Post.list('-likes_count', 200);

    // Build a set of authors who have OPTED OUT of the voting (voting_opt_in === false)
    const allUsers = await svc.entities.User.list('-created_date', 5000);
    const optedOutEmails = new Set(
      allUsers.filter((u) => u.voting_opt_in === false).map((u) => u.email)
    );

    const candidates = allPosts
      .filter((p) => new Date(p.created_date) >= sevenDaysAgo)
      .filter((p) => !p.is_premium) // public posts only
      .filter((p) => !optedOutEmails.has(p.author_email)) // respect opt-out
      .slice(0, 30);

    const allVotes = await svc.entities.Vote.filter({ round_id: roundId }, '-created_date', 5000);
    const counts = {};
    allVotes.forEach((v) => { counts[v.post_id] = (counts[v.post_id] || 0) + 1; });

    const myVote = allVotes.find((v) => v.voter_email === me.email);

    // BRT day check
    const brtDay = (now.getUTCDay() + (now.getUTCHours() < 3 ? -1 : 0) + 7) % 7;
    const isVotingDay = brtDay === 4; // Thursday

    return Response.json({
      round_id: roundId,
      is_voting_day: isVotingDay,
      my_vote_post_id: myVote?.post_id || null,
      candidates: candidates.map((p) => ({
        id: p.id,
        author_email: p.author_email,
        author_name: p.author_name,
        author_avatar: p.author_avatar,
        author_plan: p.author_plan,
        content: p.content,
        media_url: p.media_url,
        media_type: p.media_type,
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        votes: counts[p.id] || 0,
        created_date: p.created_date,
      })),
    });
  } catch (error) {
    console.error('getVotingFeed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});