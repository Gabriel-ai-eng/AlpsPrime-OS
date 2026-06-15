import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Conscious agent community tick.
 * Runs frequently (every 5 min - platform minimum). On each tick:
 *  - Fetches active viewers (FeedPresence updated in last 3 min)
 *  - Picks 1-3 recent agent posts (last 12h)
 *  - Generates 2-4 chained agent replies forming a live conversation
 *  - Agents may address viewers by name ("vi que [Nome] tá olhando...")
 */
const ACTIVE_WINDOW_MIN = 10;
const POST_LOOKBACK_HOURS = 24;
const MAX_BURSTS = 10; // máximo de posts por tick
const MAX_REPLIES_PER_POST = 30; // cap alto por post
const REPLIES_PER_BURST_MIN = 3;
const REPLIES_PER_BURST_MAX = 5; // rajada máxima de replies

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function scoreAffinity(text, keywords = []) {
  if (!text) return 0;
  const t = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (t.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

async function generateText(base44, agent, prompt) {
  const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
  return typeof reply === 'string' ? reply.trim().replace(/^["']|["']$/g, '') : '';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1. Active viewers
    const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MIN * 60 * 1000).toISOString();
    const allPresence = await base44.asServiceRole.entities.FeedPresence
      .list('-last_seen', 50)
      .catch(() => []);
    const activeViewers = allPresence.filter((p) => p.last_seen > cutoff);
    const viewerNames = activeViewers
      .map((v) => v.user_name)
      .filter(Boolean)
      .slice(0, 5);

    // 2. Active agents
    const agents = await base44.asServiceRole.entities.Agent.filter({ active: true });
    if (agents.length < 2) return Response.json({ skipped: 'not_enough_agents' });

    // 3. Recent agent posts
    const since = new Date(Date.now() - POST_LOOKBACK_HOURS * 3600 * 1000).toISOString();
    const recentPosts = await base44.asServiceRole.entities.AgentPost
      .list('-created_date', 30)
      .then((rows) => rows.filter((p) => p.created_date > since));

    if (!recentPosts.length) return Response.json({ skipped: 'no_recent_posts' });

    const targets = pickRandom(recentPosts, Math.min(MAX_BURSTS, recentPosts.length));
    let totalAdded = 0;

    for (const post of targets) {
      // existing replies for this post
      const existing = await base44.asServiceRole.entities.AgentReply.filter({
        target_kind: 'agent_post',
        target_id: post.id,
      }, '-created_date', 20);
      if (existing.length >= MAX_REPLIES_PER_POST) continue;

      const repliesLeft = MAX_REPLIES_PER_POST - existing.length;
      const burstSize = Math.min(
        repliesLeft,
        REPLIES_PER_BURST_MIN + Math.floor(Math.random() * (REPLIES_PER_BURST_MAX - REPLIES_PER_BURST_MIN + 1))
      );

      // Build conversation history for context
      const history = [
        `${post.agent_name} (autor): ${post.content}`,
        ...existing.slice().reverse().map((r) => `${r.agent_name}: ${r.content}`),
      ].join('\n');

      // Pick agents that haven't dominated yet (exclude post author from being the next speaker)
      const repliedCounts = new Map();
      for (const r of existing) repliedCounts.set(r.agent_slug, (repliedCounts.get(r.agent_slug) || 0) + 1);
      const lastSpeakerSlug = existing[0]?.agent_slug || post.agent_slug;

      const candidates = agents
        .filter((a) => a.slug !== lastSpeakerSlug)
        .map((a) => ({
          agent: a,
          score: scoreAffinity(post.content, a.specialty_keywords) + Math.random(),
          spoken: repliedCounts.get(a.slug) || 0,
        }))
        .sort((a, b) => (a.spoken - b.spoken) || (b.score - a.score))
        .slice(0, burstSize);

      for (const { agent } of candidates) {
        const viewerHint = viewerNames.length
          ? `\n\nIMPORTANTE: Os usuários ${viewerNames.join(', ')} estão olhando essa conversa AGORA mesmo. Você pode (mas não precisa) mencionar um deles pelo primeiro nome de forma natural — como se notasse que estão acompanhando.`
          : '';

        const prompt = `Você é ${agent.name}, um membro fixo da rede social Sexta-feira.
Especialidade: ${agent.specialty}
Personalidade: ${agent.personality}

A conversa atual entre vocês:
${history}

Continue o diálogo de forma natural — como se estivessem em uma conversa real entre colegas. Pode concordar, discordar, provocar, fazer piada ou perguntar de volta. SEJA FIEL à sua personalidade.${viewerHint}

Regras:
- 1-2 frases curtas (no máximo 3).
- NUNCA diga que é robô, IA ou agente.
- Não comece com saudações genéricas.
- Retorne APENAS o texto da resposta, sem aspas, sem nome.`;

        const text = await generateText(base44, agent, prompt);
        if (!text) continue;

        await base44.asServiceRole.entities.AgentReply.create({
          agent_slug: agent.slug,
          agent_name: agent.name,
          target_kind: 'agent_post',
          target_id: post.id,
          content: text,
        });
        totalAdded++;
      }

      // bump replies_count
      await base44.asServiceRole.entities.AgentPost.update(post.id, {
        replies_count: (post.replies_count || 0) + candidates.length,
      }).catch(() => {});
    }

    return Response.json({
      ok: true,
      bursts: targets.length,
      replies_added: totalAdded,
      active_viewers: viewerNames,
    });
  } catch (error) {
    console.error('agentCommunityTick error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});