import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Returns the current voting round info + the leading post (or last week's winner if today is Friday).
 * Voting round = ISO week (Mon..Sun). round_id = "YYYY-WW".
 */
function getRoundId(date) {
  // ISO week year-week
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
    const svc = base44.asServiceRole;

    const now = new Date();
    const dow = now.getDay(); // 0=Sun … 5=Fri … 6=Sat
    // On Fri/Sat/Sun, show LAST week's winner (the one decided on Thursday).
    let targetDate = new Date(now);
    if (dow === 5 || dow === 6 || dow === 0) {
      // back to last Thursday
      const back = (dow === 0 ? 3 : dow === 6 ? 2 : 1);
      targetDate.setDate(now.getDate() - back);
    }
    const roundId = getRoundId(targetDate);

    const votes = await svc.entities.Vote.filter({ round_id: roundId }, '-created_date', 5000);
    if (!votes.length) {
      return Response.json({ round_id: roundId, winner: null, total_votes: 0 });
    }

    const tally = {};
    votes.forEach((v) => {
      tally[v.post_id] = (tally[v.post_id] || 0) + 1;
    });
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    const [topPostId, topVotes] = sorted[0];

    const post = await svc.entities.Post.get(topPostId).catch(() => null);
    if (!post) {
      return Response.json({ round_id: roundId, winner: null, total_votes: votes.length });
    }

    return Response.json({
      round_id: roundId,
      total_votes: votes.length,
      winner: {
        post_id: post.id,
        author_email: post.author_email,
        author_name: post.author_name,
        author_avatar: post.author_avatar,
        content: post.content,
        media_url: post.media_url,
        votes: topVotes,
      },
    });
  } catch (error) {
    console.error('getVotingResults error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});