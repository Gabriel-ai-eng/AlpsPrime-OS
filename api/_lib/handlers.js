import { admin, entities } from './admin.js';

// round_id = ISO ano-semana (usado na votação)
function getRoundId(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}

const publicUserFields = (u) => ({
  id: u.id,
  email: u.email,
  full_name: u.full_name,
  username: u.username,
  bio: u.bio,
  location: u.location,
  website: u.website,
  profile_picture_url: u.profile_picture_url,
  profile_banner_url: u.profile_banner_url,
  ranking_display_name: u.ranking_display_name,
  show_in_ranking: u.show_in_ranking,
  created_date: u.created_date,
  plan: u.plan || 'free',
  bio_links: Array.isArray(u.bio_links) ? u.bio_links : [],
});

// Funções que NÃO exigem login (ex.: contagem mostrada na tela de Welcome).
export const PUBLIC_FUNCTIONS = new Set(['getUsersCount']);

export const handlers = {
  async getUsersCount() {
    const { count, error } = await admin
      .from('usuarios')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return { count: count || 0 };
  },

  async listPublicUsers() {
    const users = await entities.User.list('-created_date', 500);
    return { users: (users || []).map(publicUserFields) };
  },

  async getPublicProfile({ body }) {
    const email = body?.email;
    if (!email) { const e = new Error('email is required'); e.status = 400; throw e; }
    const list = await entities.User.filter({ email });
    const u = list?.[0];
    return { profile: u ? publicUserFields(u) : null };
  },

  async uploadImageToSupabase({ user, body }) {
    const { image_url, file_name } = body || {};
    if (!image_url) { const e = new Error('image_url is required'); e.status = 400; throw e; }
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

    const imgRes = await fetch(image_url);
    if (!imgRes.ok) { const e = new Error('Failed to fetch source image'); e.status = 502; throw e; }
    const contentType = imgRes.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    const ext = (contentType.split('/')[1] || 'png').split(';')[0];
    const safeName = (file_name || `img-${Date.now()}`).replace(/[^a-z0-9-_]/gi, '_');
    const path = `${String(user.email).replace(/[^a-z0-9]/gi, '_')}/${safeName}-${Date.now()}.${ext}`;

    const { error: upErr } = await admin.storage
      .from(bucket)
      .upload(path, buffer, { contentType, upsert: true });
    if (upErr) { const e = new Error(`Supabase upload failed: ${upErr.message}`); e.status = 500; throw e; }

    const { data } = admin.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, path };
  },

  async askGemini({ body }) {
    const prompt = body?.prompt;
    if (!prompt || typeof prompt !== 'string') {
      const e = new Error('prompt is required (string)'); e.status = 400; throw e;
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { const e = new Error('GEMINI_API_KEY not configured'); e.status = 500; throw e; }

    const endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    let response, lastErr = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (response.ok) break;
      lastErr = await response.text();
      if (response.status !== 503 && response.status !== 429) break;
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
    }
    if (!response.ok) {
      let msg;
      if (response.status === 503) msg = 'O modelo está com alta demanda. Tente novamente em alguns segundos.';
      else if (response.status === 429) msg = 'Limite de requisições atingido. Aguarde ~30 segundos.';
      else msg = `Gemini API error: ${response.status}`;
      const e = new Error(msg); e.status = 500; throw e;
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { text };
  },

  async getVotingFeed({ user }) {
    const now = new Date();
    const roundId = getRoundId(now);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const allPosts = await entities.Post.list('-likes_count', 200);
    const allUsers = await entities.User.list('-created_date', 5000);
    const optedOut = new Set(allUsers.filter((u) => u.voting_opt_in === false).map((u) => u.email));

    const candidates = allPosts
      .filter((p) => new Date(p.created_date) >= sevenDaysAgo)
      .filter((p) => !p.is_premium)
      .filter((p) => !optedOut.has(p.author_email))
      .slice(0, 30);

    const allVotes = await entities.Vote.filter({ round_id: roundId }, '-created_date', 5000);
    const counts = {};
    allVotes.forEach((v) => { counts[v.post_id] = (counts[v.post_id] || 0) + 1; });
    const myVote = allVotes.find((v) => v.voter_email === user.email);

    const brtDay = (now.getUTCDay() + (now.getUTCHours() < 3 ? -1 : 0) + 7) % 7;
    const isVotingDay = brtDay === 4;

    return {
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
    };
  },

  async castVote({ user, body }) {
    const post_id = body?.post_id;
    if (!post_id) { const e = new Error('post_id required'); e.status = 400; throw e; }

    const now = new Date();
    const brtDay = (now.getUTCDay() + (now.getUTCHours() < 3 ? -1 : 0) + 7) % 7;
    if (brtDay !== 4) { const e = new Error('A votação só fica aberta às quintas-feiras.'); e.status = 403; throw e; }

    const roundId = getRoundId(now);
    const post = await entities.Post.get(post_id).catch(() => null);
    if (!post) { const e = new Error('Post não encontrado'); e.status = 404; throw e; }
    if (post.author_email === user.email) { const e = new Error('Você não pode votar no próprio post.'); e.status = 400; throw e; }

    const existing = await entities.Vote.filter({ voter_email: user.email, round_id: roundId });
    if (existing.length > 0) await entities.Vote.update(existing[0].id, { post_id });
    else await entities.Vote.create({ post_id, voter_email: user.email, round_id: roundId });

    return { ok: true, round_id: roundId };
  },

  async getVotingResults() {
    const now = new Date();
    const dow = now.getDay();
    let targetDate = new Date(now);
    if (dow === 5 || dow === 6 || dow === 0) {
      const back = dow === 0 ? 3 : dow === 6 ? 2 : 1;
      targetDate.setDate(now.getDate() - back);
    }
    const roundId = getRoundId(targetDate);

    const votes = await entities.Vote.filter({ round_id: roundId }, '-created_date', 5000);
    if (!votes.length) return { round_id: roundId, winner: null, total_votes: 0 };

    const tally = {};
    votes.forEach((v) => { tally[v.post_id] = (tally[v.post_id] || 0) + 1; });
    const [topPostId, topVotes] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];

    const post = await entities.Post.get(topPostId).catch(() => null);
    if (!post) return { round_id: roundId, winner: null, total_votes: votes.length };

    return {
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
    };
  },
};
