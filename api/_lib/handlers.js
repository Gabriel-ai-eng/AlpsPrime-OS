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

  // --- Geração de imagem (tela ImageGen) ---
  async generateDalle({ body }) {
    const { prompt, size = '1024x1024', quality = 'standard', style = 'vivid' } = body || {};
    if (!prompt || typeof prompt !== 'string') {
      const e = new Error('prompt is required (string)'); e.status = 400; throw e;
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) { const e = new Error('OPENAI_API_KEY not configured'); e.status = 500; throw e; }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size, quality, style }),
    });
    if (!response.ok) {
      const t = await response.text();
      console.error('DALL-E error:', response.status, t);
      const e = new Error(`DALL-E API error: ${response.status}`); e.status = 500; throw e;
    }
    const data = await response.json();
    const url = data?.data?.[0]?.url;
    if (!url) { const e = new Error('No image URL returned by DALL-E'); e.status = 500; throw e; }
    return { url, revised_prompt: data?.data?.[0]?.revised_prompt || prompt };
  },

  // --- Analytics do perfil (tela Profile, planos Pro/Unlimited) ---
  async getProfileAnalytics({ user }) {
    const plan = user.plan || 'free';
    if (plan !== 'pro' && plan !== 'unlimited') {
      const e = new Error('Plano Pro ou Unlimited necessário'); e.status = 403; throw e;
    }
    const cutoffDate = plan === 'pro' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null;
    const allVisits = await entities.ProfileVisit.filter({ profile_email: user.email }, '-created_date', 5000);
    const visits = (cutoffDate ? allVisits.filter((v) => new Date(v.created_date) >= cutoffDate) : allVisits)
      .filter((v) => !v.is_self);

    const durations = visits.map((v) => v.duration_seconds || 0).filter((d) => d > 0);
    const sourceCounts = {};
    const postCounts = {};
    for (const v of visits) {
      sourceCounts[v.source || 'direct'] = (sourceCounts[v.source || 'direct'] || 0) + 1;
      if (v.post_clicked_id) postCounts[v.post_clicked_id] = (postCounts[v.post_clicked_id] || 0) + 1;
    }
    let topPost = null;
    const topPostId = Object.keys(postCounts).sort((a, b) => postCounts[b] - postCounts[a])[0];
    if (topPostId) {
      const post = await entities.Post.get(topPostId).catch(() => null);
      if (post) topPost = { id: post.id, content: post.content?.slice(0, 100), media_url: post.media_url, media_type: post.media_type, click_count: postCounts[topPostId] };
    }
    const timeline = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - i);
      const next = new Date(day); next.setDate(next.getDate() + 1);
      timeline.push({
        date: day.toISOString().slice(0, 10),
        count: allVisits.filter((v) => { const d = new Date(v.created_date); return d >= day && d < next && !v.is_self; }).length,
      });
    }
    return {
      plan,
      window: plan === 'pro' ? '7d' : 'all',
      totals: {
        total_visits: visits.length,
        unique_visitors: new Set(visits.map((v) => v.visitor_email).filter(Boolean)).size,
        avg_duration_seconds: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
      },
      sources: sourceCounts,
      top_post: topPost,
      timeline,
    };
  },

  // --- Tradução de perfil Unlimited (tela Profile) ---
  async translateProfileContent({ body }) {
    const SUPPORTED = { en: 'English', es: 'Spanish (Español)', fr: 'French (Français)', de: 'German (Deutsch)', it: 'Italian (Italiano)', pt: 'Portuguese (Português)', ja: 'Japanese (日本語)', zh: 'Chinese (中文)' };
    const { profile_email, target_lang, items } = body || {};
    if (!profile_email || !target_lang || !Array.isArray(items)) {
      const e = new Error('profile_email, target_lang and items are required'); e.status = 400; throw e;
    }
    if (!SUPPORTED[target_lang]) { const e = new Error('Unsupported language'); e.status = 400; throw e; }

    const owners = await entities.User.filter({ email: profile_email });
    const owner = owners?.[0];
    if (!owner) { const e = new Error('Profile not found'); e.status = 404; throw e; }
    if (owner.plan !== 'unlimited') { const e = new Error('Translation only available for Unlimited profiles'); e.status = 403; throw e; }

    const cleanItems = items.map((it) => ({ id: String(it?.id ?? ''), text: String(it?.text ?? '').trim() }))
      .filter((it) => it.id && it.text).slice(0, 60);
    if (cleanItems.length === 0) return { translations: {} };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { const e = new Error('Missing GEMINI_API_KEY'); e.status = 500; throw e; }

    const prompt = `You are a professional translator. Translate each item below into ${SUPPORTED[target_lang]}.
Rules:
- Return ONLY valid JSON: { "translations": { "<id>": "<translated text>", ... } }
- Preserve emojis, hashtags, mentions (@user), URLs and line breaks.
- Keep tone, register and casual style natural for native speakers.
- Do NOT add explanations or quotes around values.
- If an item is already in the target language, return it unchanged.

Items:
${JSON.stringify(cleanItems)}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } }),
    });
    if (!res.ok) { const e = new Error('Translation service error'); e.status = 500; throw e; }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed = {};
    try { parsed = JSON.parse(text); } catch { parsed = {}; }
    return { translations: parsed.translations || {} };
  },

  // --- Curtir comentário (feed) ---
  async likeComment({ user, body }) {
    const comment_id = body?.comment_id;
    if (!comment_id) { const e = new Error('comment_id required'); e.status = 400; throw e; }
    const comment = await entities.Comment.get(comment_id).catch(() => null);
    if (!comment) { const e = new Error('Comentário não encontrado.'); e.status = 404; throw e; }

    const existing = await entities.CommentLike.filter({ comment_id, user_email: user.email });
    if (existing.length) {
      await entities.CommentLike.delete(existing[0].id);
      return { ok: true, liked: false };
    }
    await entities.CommentLike.create({ comment_id, user_email: user.email, comment_author_email: comment.author_email });
    return { ok: true, liked: true };
  },

  // --- Comunicado para todos (admin, tela Settings) ---
  async broadcastNotification({ user, body }) {
    if (!user || user.role !== 'admin') { const e = new Error('Unauthorized'); e.status = 401; throw e; }
    const type = body?.type;
    const title = String(body?.title || '').trim();
    const text = String(body?.body || '').trim();
    if (type !== 'update' && type !== 'app') { const e = new Error('Tipo inválido. Use "update" ou "app".'); e.status = 400; throw e; }
    if (!title) { const e = new Error('O título é obrigatório.'); e.status = 400; throw e; }

    const users = await entities.User.list('-created_date', 5000);
    let sent = 0;
    for (const u of users) {
      if (!u.email) continue;
      try {
        await entities.Notification.create({
          recipient_email: u.email,
          actor_email: 'sexta-feira@system',
          actor_name: title,
          actor_avatar: '',
          type,
          post_preview: text,
          read: false,
        });
        sent++;
      } catch (e) { console.error('broadcast falhou para', u.email, e.message); }
    }
    return { ok: true, sent, total: users.length };
  },

  // --- Excluir conta (tela Settings) ---
  async deleteMyAccount({ user }) {
    const email = user.email;
    const delBy = async (entity, filter) => {
      let records = [];
      try { records = await entities[entity].filter(filter, '-created_date', 1000); } catch { records = []; }
      for (const r of records) {
        try { await entities[entity].delete(r.id); } catch (e) { console.error(`del ${entity} ${r.id}:`, e?.message); }
      }
    };
    await delBy('Post', { author_email: email });
    await delBy('Comment', { author_email: email });
    await delBy('PostInteraction', { user_email: email });
    await delBy('Follow', { follower_email: email });
    await delBy('Follow', { followed_email: email });
    await delBy('DirectMessage', { sender_email: email });
    await delBy('DirectMessage', { receiver_email: email });
    await delBy('Notification', { recipient_email: email });
    await delBy('Notification', { actor_email: email });
    await delBy('Challenge', { user_email: email });
    await delBy('UserStats', { user_email: email });
    await delBy('UsageHistory', { created_by: email });
    await delBy('Conversation', { created_by: email });

    try { await entities.User.delete(user.id); } catch (e) {
      console.error('del usuarios:', e?.message);
      const err = new Error('Não foi possível excluir a conta. Tente novamente.'); err.status = 500; throw err;
    }
    // Remove também o login do Supabase Auth
    try { await admin.auth.admin.deleteUser(user.id); } catch (e) { console.error('del auth user:', e?.message); }
    return { ok: true };
  },
};
