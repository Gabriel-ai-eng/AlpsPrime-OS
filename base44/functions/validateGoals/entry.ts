import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Validador automático das 20 metas + meta 21 (boas-vindas).
 * Roda como automação a cada 1h.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const me = await base44.auth.me().catch(() => null);
    if (me && me.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // ---- Load data ----
    const [
      users, posts, comments, follows, challenges,
      tags, trends, invites, teams, teamMembers, votes, commentLikes,
    ] = await Promise.all([
      svc.entities.User.list('-created_date', 2000),
      svc.entities.Post.list('-created_date', 5000),
      svc.entities.Comment.list('-created_date', 10000),
      svc.entities.Follow.list('-created_date', 5000),
      svc.entities.Challenge.list('-created_date', 5000),
      svc.entities.Tag.list('-created_date', 10000).catch(() => []),
      svc.entities.WeeklyTrend.list('-created_date', 50).catch(() => []),
      svc.entities.Invite.list('-created_date', 5000).catch(() => []),
      svc.entities.Team.list('-created_date', 1000).catch(() => []),
      svc.entities.TeamMember.list('-created_date', 5000).catch(() => []),
      svc.entities.Vote.list('-created_date', 10000).catch(() => []),
      svc.entities.CommentLike.list('-created_date', 10000).catch(() => []),
    ]);

    const existing = new Set(challenges.map((c) => `${c.user_email}|${c.challenge_id}`));
    const granted = [];

    const grant = async (email, goalId) => {
      const key = `${email}|${goalId}`;
      if (existing.has(key)) return;
      await svc.entities.Challenge.create({
        user_email: email,
        challenge_id: goalId,
        completed_at: new Date().toISOString(),
      });
      existing.add(key);
      granted.push({ email, goalId });
    };

    // ---- Indexes ----
    const postsByUser = {};
    posts.forEach((p) => { (postsByUser[p.author_email] ||= []).push(p); });

    const commentsByPost = {};
    comments.forEach((c) => { (commentsByPost[c.post_id] ||= []).push(c); });

    const commentsReceivedByUser = {};
    comments.forEach((c) => {
      const post = posts.find((p) => p.id === c.post_id);
      if (post) commentsReceivedByUser[post.author_email] = (commentsReceivedByUser[post.author_email] || 0) + 1;
    });

    const followersByUser = {};
    follows.forEach((f) => { (followersByUser[f.followed_email] ||= []).push(f); });

    const tagsByPost = {};
    tags.forEach((t) => { (tagsByPost[t.post_id] ||= []).push(t.tag); });

    const tagsByAuthor = {};
    tags.forEach((t) => { (tagsByAuthor[t.author_email] ||= new Set()).add(t.tag); });

    // ---------- META 1 — Mais comentários na semana ----------
    {
      const weekly = posts.filter((p) => new Date(p.created_date) >= d7);
      let top = null;
      weekly.forEach((p) => {
        const c = (commentsByPost[p.id] || []).filter((cm) => new Date(cm.created_date) >= d7).length;
        if (c >= 3 && (!top || c > top.c)) top = { p, c };
      });
      if (top) await grant(top.p.author_email, 1);
    }

    // ---------- META 2 — Mais novos seguidores em 7d ----------
    {
      const recent = follows.filter((f) => new Date(f.created_date) >= d7);
      const count = {};
      recent.forEach((f) => { count[f.followed_email] = (count[f.followed_email] || 0) + 1; });
      const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
      if (top && top[1] >= 3) await grant(top[0], 2);
    }

    // ---------- META 3 — 7 dias consecutivos ; META 19 — 30 dias ----------
    for (const email of Object.keys(postsByUser)) {
      const dates = new Set(
        postsByUser[email].map((p) => new Date(p.created_date).toISOString().slice(0, 10))
      );
      let maxStreak = 0, streak = 0;
      for (let i = 0; i < 60; i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        if (dates.has(d)) { streak++; maxStreak = Math.max(maxStreak, streak); }
        else streak = 0;
      }
      if (maxStreak >= 7) await grant(email, 3);
      if (maxStreak >= 30) await grant(email, 19);
    }

    // ---------- META 4 — Mais curtidas em 24h ----------
    {
      const daily = posts.filter((p) => new Date(p.created_date) >= d1);
      let top = null;
      daily.forEach((p) => {
        const l = p.likes_count || 0;
        if (l >= 10 && (!top || l > top.l)) top = { p, l };
      });
      if (top) await grant(top.p.author_email, 4);
    }

    // ---------- META 5 — 100+ comentários (lifetime) ----------
    for (const [email, count] of Object.entries(commentsReceivedByUser)) {
      if (count >= 100) await grant(email, 5);
    }

    // ---------- META 6 — Maior taxa curtidas/seguidor (mín 50) ----------
    {
      let top = null;
      for (const u of users) {
        const followers = (followersByUser[u.email] || []).length;
        if (followers < 50) continue;
        const wp = (postsByUser[u.email] || []).filter((p) => new Date(p.created_date) >= d7);
        const tl = wp.reduce((s, p) => s + (p.likes_count || 0), 0);
        const r = tl / followers;
        if (r > 0 && (!top || r > top.r)) top = { email: u.email, r };
      }
      if (top) await grant(top.email, 6);
    }

    // ---------- META 7 — Mais seguido entre <50 seguidores ----------
    {
      const recent = follows.filter((f) => new Date(f.created_date) >= d7);
      const newCount = {};
      recent.forEach((f) => { newCount[f.followed_email] = (newCount[f.followed_email] || 0) + 1; });
      let top = null;
      for (const [email, n] of Object.entries(newCount)) {
        const total = (followersByUser[email] || []).length;
        if (total >= 50) continue;
        if (n >= 3 && (!top || n > top.n)) top = { email, n };
      }
      if (top) await grant(top.email, 7);
    }

    // ---------- META 8 — Embaixador: 5 convidados que postaram ----------
    {
      // Find invites where invitee posted at least once → upgrade to "completed"
      for (const inv of invites) {
        if (!inv.invitee_email) continue;
        if (inv.status === 'completed') continue;
        const has = (postsByUser[inv.invitee_email] || []).length >= 1;
        if (has) {
          await svc.entities.Invite.update(inv.id, {
            status: 'completed',
            completed_at: new Date().toISOString(),
          });
          inv.status = 'completed';
        }
      }
      const completedByInviter = {};
      invites.forEach((inv) => {
        if (inv.invitee_email && inv.status === 'completed') {
          completedByInviter[inv.inviter_email] = (completedByInviter[inv.inviter_email] || 0) + 1;
        }
      });
      for (const [email, c] of Object.entries(completedByInviter)) {
        if (c >= 5) await grant(email, 8);
      }
    }

    // ---------- META 9 — Trend Setter: tag usada por 10+ usuários ----------
    {
      const tagAuthors = {};
      tags.forEach((t) => { (tagAuthors[t.tag] ||= new Set()).add(t.author_email); });
      // For each tag with 10+ distinct authors, grant the FIRST author who used it.
      for (const [tag, authors] of Object.entries(tagAuthors)) {
        if (authors.size < 10) continue;
        const firstUse = tags
          .filter((t) => t.tag === tag)
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))[0];
        if (firstUse) await grant(firstUse.author_email, 9);
      }
    }

    // ---------- META 10 — Melhor Dupla: 2+ membros do time, mesma tag, +100 curtidas combinadas ----------
    {
      const activeMembers = teamMembers.filter((m) => m.status === 'active');
      const teamByEmail = {};
      activeMembers.forEach((m) => { teamByEmail[m.user_email] = m.team_id; });
      // For each tag, group posts by team
      const byTagTeam = {};
      tags.forEach((t) => {
        const teamId = teamByEmail[t.author_email];
        if (!teamId) return;
        const post = posts.find((p) => p.id === t.post_id);
        if (!post) return;
        const key = `${teamId}|${t.tag}`;
        (byTagTeam[key] ||= []).push(post);
      });
      for (const [, postsInGroup] of Object.entries(byTagTeam)) {
        const distinctAuthors = new Set(postsInGroup.map((p) => p.author_email));
        if (distinctAuthors.size < 2) continue;
        const totalLikes = postsInGroup.reduce((s, p) => s + (p.likes_count || 0), 0);
        if (totalLikes >= 100) {
          for (const author of distinctAuthors) await grant(author, 10);
        }
      }
    }

    // ---------- META 11 — Storyteller: 5 posts em <24h ----------
    for (const email of Object.keys(postsByUser)) {
      const sorted = [...postsByUser[email]].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      let chain = 1, maxChain = 1;
      for (let i = 1; i < sorted.length; i++) {
        const diff = new Date(sorted[i].created_date) - new Date(sorted[i - 1].created_date);
        if (diff <= 24 * 60 * 60 * 1000) { chain++; maxChain = Math.max(maxChain, chain); }
        else chain = 1;
      }
      if (maxChain >= 5) await grant(email, 11);
    }

    // ---------- META 12 — Primeira Hora: top 10 a postar com a tag da trend (domingo 00-23h BRT) ----------
    {
      const activeTrend = trends.find((t) => t.active);
      if (activeTrend) {
        const start = new Date(activeTrend.starts_at);
        const sundayEnd = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        const trendPosts = tags
          .filter((t) => t.tag === activeTrend.tag)
          .map((t) => {
            const p = posts.find((pp) => pp.id === t.post_id);
            return p ? { ...p, _tagDate: t.created_date } : null;
          })
          .filter(Boolean)
          .filter((p) => new Date(p.created_date) >= start && new Date(p.created_date) <= sundayEnd)
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        const seen = new Set();
        const firstTen = [];
        for (const p of trendPosts) {
          if (seen.has(p.author_email)) continue;
          seen.add(p.author_email);
          firstTen.push(p);
          if (firstTen.length >= 10) break;
        }
        for (const p of firstTen) await grant(p.author_email, 12);
      }
    }

    // ---------- META 13 — Mais compartilhado na semana (mín 20) ----------
    {
      const weekly = posts.filter((p) => new Date(p.created_date) >= d7);
      let top = null;
      weekly.forEach((p) => {
        const s = p.shares_count || 0;
        if (s >= 20 && (!top || s > top.s)) top = { p, s };
      });
      if (top) await grant(top.p.author_email, 13);
    }

    // ---------- META 14 — Melhor Comentarista: top 5 comentários mais curtidos da semana ----------
    {
      const weeklyComments = comments.filter((c) => new Date(c.created_date) >= d7);
      const likesByComment = {};
      commentLikes.forEach((cl) => {
        likesByComment[cl.comment_id] = (likesByComment[cl.comment_id] || 0) + 1;
      });
      const ranked = weeklyComments
        .map((c) => ({ c, l: likesByComment[c.id] || 0 }))
        .filter((x) => x.l > 0)
        .sort((a, b) => b.l - a.l)
        .slice(0, 5);
      const winners = new Set(ranked.map((x) => x.c.author_email));
      for (const email of winners) await grant(email, 14);
    }

    // ---------- META 15 — Time Invencível: time completou 3 metas em equipe na semana ----------
    {
      // Team-goals = goals 9, 10, 13 (collaborative outcomes)
      const TEAM_GOAL_IDS = [9, 10, 13];
      const activeMembers = teamMembers.filter((m) => m.status === 'active');
      const teamByEmail = {};
      activeMembers.forEach((m) => { teamByEmail[m.user_email] = m.team_id; });
      const teamCompletions = {};
      challenges.forEach((c) => {
        if (!TEAM_GOAL_IDS.includes(c.challenge_id)) return;
        if (new Date(c.created_date) < d7) return;
        const teamId = teamByEmail[c.user_email];
        if (!teamId) return;
        (teamCompletions[teamId] ||= new Set()).add(c.challenge_id);
      });
      for (const [teamId, goalSet] of Object.entries(teamCompletions)) {
        if (goalSet.size >= 3) {
          const tm = activeMembers.filter((m) => m.team_id === teamId);
          for (const m of tm) await grant(m.user_email, 15);
        }
      }
    }

    // ---------- META 16 — Perfil completo: foto + bio + time + 1ª meta concluída ----------
    {
      const userGoalsCount = {};
      challenges.forEach((c) => { userGoalsCount[c.user_email] = (userGoalsCount[c.user_email] || 0) + 1; });
      const activeTeamByEmail = {};
      teamMembers.filter((m) => m.status === 'active').forEach((m) => { activeTeamByEmail[m.user_email] = true; });
      for (const u of users) {
        const hasPhoto = !!u.profile_picture_url;
        const hasBio = u.bio && u.bio.trim().length >= 3;
        const inTeam = !!activeTeamByEmail[u.email];
        const hasGoal = (userGoalsCount[u.email] || 0) >= 1;
        if (hasPhoto && hasBio && inTeam && hasGoal) await grant(u.email, 16);
      }
    }

    // ---------- META 17 — Madrugador: post 00-06h com 30+ curtidas ----------
    for (const p of posts) {
      const h = new Date(p.created_date).getHours();
      if (h >= 0 && h < 6 && (p.likes_count || 0) >= 30) {
        await grant(p.author_email, 17);
      }
    }

    // ---------- META 18 — Mais Criativo: vencedor da votação semanal ----------
    {
      // Group votes by round_id
      const byRound = {};
      votes.forEach((v) => { (byRound[v.round_id] ||= []).push(v); });
      for (const [roundId, roundVotes] of Object.entries(byRound)) {
        const tally = {};
        roundVotes.forEach((v) => { tally[v.post_id] = (tally[v.post_id] || 0) + 1; });
        const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
        if (!sorted.length) continue;
        const [winnerPostId] = sorted[0];
        const post = posts.find((p) => p.id === winnerPostId);
        if (post) await grant(post.author_email, 18);
      }
    }

    // ---------- META 21 — Boas-vindas (1º post) ----------
    for (const email of Object.keys(postsByUser)) {
      if ((postsByUser[email] || []).length >= 1) await grant(email, 21);
    }

    // ---------- META 20 — Primeiro a completar todas as outras 19 ----------
    {
      const fresh = await svc.entities.Challenge.list('-created_date', 5000);
      const userGoals = {};
      fresh.forEach((c) => { (userGoals[c.user_email] ||= new Set()).add(c.challenge_id); });
      const anyone20 = fresh.some((c) => c.challenge_id === 20);
      if (!anyone20) {
        let candidate = null;
        for (const [email, gset] of Object.entries(userGoals)) {
          const has19 = [...Array(19)].every((_, i) => gset.has(i + 1));
          if (!has19) continue;
          const myCompletions = fresh.filter((c) => c.user_email === email && c.challenge_id <= 19);
          const lastTs = Math.max(...myCompletions.map((c) => new Date(c.created_date).getTime()));
          if (!candidate || lastTs < candidate.ts) candidate = { email, ts: lastTs };
        }
        if (candidate) await grant(candidate.email, 20);
      }
    }

    return Response.json({
      ok: true,
      checked_users: users.length,
      granted_count: granted.length,
      granted,
    });
  } catch (error) {
    console.error('validateGoals error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});