import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Returns aggregated profile analytics for the authenticated user.
 * - Plan-gated: free users get 403
 * - Pro: last 7 days only
 * - Unlimited: full history
 *
 * Privacy: returns ONLY aggregates. No individual visitor emails or names are exposed.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const plan = user.plan || 'free';
    if (plan !== 'pro' && plan !== 'unlimited') {
      return Response.json({ error: 'Plano Pro ou Unlimited necessário' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    // Cutoff: 7 days for Pro, all history for Unlimited
    const cutoffMs = plan === 'pro' ? 7 * 24 * 60 * 60 * 1000 : null;
    const cutoffDate = cutoffMs ? new Date(Date.now() - cutoffMs) : null;

    const allVisits = await svc.entities.ProfileVisit.filter(
      { profile_email: user.email },
      '-created_date',
      5000
    );

    const visits = (cutoffDate
      ? allVisits.filter((v) => new Date(v.created_date) >= cutoffDate)
      : allVisits
    ).filter((v) => !v.is_self);

    const totalVisits = visits.length;
    const uniqueVisitors = new Set(visits.map((v) => v.visitor_email).filter(Boolean)).size;

    const durations = visits.map((v) => v.duration_seconds || 0).filter((d) => d > 0);
    const avgDurationSec = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    // Source breakdown
    const sourceCounts = {};
    for (const v of visits) {
      const s = v.source || 'direct';
      sourceCounts[s] = (sourceCounts[s] || 0) + 1;
    }

    // Top post (most clicked)
    const postCounts = {};
    for (const v of visits) {
      if (v.post_clicked_id) {
        postCounts[v.post_clicked_id] = (postCounts[v.post_clicked_id] || 0) + 1;
      }
    }
    let topPost = null;
    const topPostId = Object.keys(postCounts).sort((a, b) => postCounts[b] - postCounts[a])[0];
    if (topPostId) {
      try {
        const post = await svc.entities.Post.get(topPostId);
        if (post) {
          topPost = {
            id: post.id,
            content: post.content?.slice(0, 100),
            media_url: post.media_url,
            media_type: post.media_type,
            click_count: postCounts[topPostId],
          };
        }
      } catch {
        // post may have been deleted
      }
    }

    // Daily timeline (last 7 days for both plans, just for chart)
    const days = 7;
    const timeline = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const count = allVisits.filter((v) => {
        const d = new Date(v.created_date);
        return d >= day && d < next && !v.is_self;
      }).length;
      timeline.push({
        date: day.toISOString().slice(0, 10),
        count,
      });
    }

    return Response.json({
      plan,
      window: plan === 'pro' ? '7d' : 'all',
      totals: {
        total_visits: totalVisits,
        unique_visitors: uniqueVisitors,
        avg_duration_seconds: avgDurationSec,
      },
      sources: sourceCounts,
      top_post: topPost,
      timeline,
    });
  } catch (error) {
    console.error('getProfileAnalytics error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});