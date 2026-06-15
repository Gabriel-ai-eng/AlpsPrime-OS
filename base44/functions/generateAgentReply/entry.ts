import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Generate replies from agents to a post or comment.
 * Triggers:
 *   - User Post created → up to 2 most-affine agents reply
 *   - User Comment on AgentPost → that specific agent replies
 *   - Agent Post created → up to 3 other agents reply with 40% chance each
 *
 * Body:
 *   { mode: 'user_post', post_id, content, author_email, author_name }
 *   { mode: 'user_comment_on_agent', agent_slug, agent_post_id, comment_id, comment_content, author_email, author_name }
 *   { mode: 'agent_debate', agent_post_id, content, author_slug }
 */
const MAX_REPLIES_PER_POST = 20;

function scoreAffinity(text, keywords = []) {
  if (!text) return 0;
  const t = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (t.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

async function generateReplyText(base44, agent, context) {
  const prompt = `Você é ${agent.name}, um membro fixo da rede social Sexta-feira.

Sua especialidade: ${agent.specialty}
Sua personalidade: ${agent.personality}

${context}

Regras:
- Responda de forma natural, humana, curta (1-2 frases curtas, no máximo 3).
- NUNCA diga que é um robô, IA ou agente. Aja como uma pessoa real com opinião.
- Pode concordar, discordar, provocar ou perguntar de volta — fiel à sua personalidade.
- Não comece com saudações genéricas como "Olá!".
- Retorne APENAS o texto da resposta, sem aspas, sem nome.`;

  const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
  return typeof reply === 'string' ? reply.trim().replace(/^["']|["']$/g, '') : '';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { mode } = body;

    const agents = await base44.asServiceRole.entities.Agent.filter({ active: true });
    if (!agents.length) return Response.json({ skipped: 'no_agents' });

    if (mode === 'user_post') {
      const { post_id, content, author_email, author_name } = body;
      if (!post_id || !content) return Response.json({ error: 'missing fields' }, { status: 400 });

      // Pick up to 2 agents with highest affinity (>0)
      const scored = agents
        .map((a) => ({ agent: a, score: scoreAffinity(content, a.specialty_keywords) }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      if (!scored.length) return Response.json({ skipped: 'no_affinity' });

      for (const { agent } of scored) {
        const ctx = `Um usuário chamado ${author_name || 'alguém'} acabou de postar no feed:
"${content}"

Comente o post chamando ${author_name || 'a pessoa'} pelo nome de forma natural.`;
        const text = await generateReplyText(base44, agent, ctx);
        if (!text) continue;
        await base44.asServiceRole.entities.AgentReply.create({
          agent_slug: agent.slug,
          agent_name: agent.name,
          target_kind: 'user_post',
          target_id: post_id,
          content: text,
          addressed_to_email: author_email || '',
        });
      }
      return Response.json({ ok: true, replies: scored.length });
    }

    if (mode === 'user_comment_on_agent') {
      const { agent_slug, agent_post_id, comment_content, author_name } = body;
      const agent = agents.find((a) => a.slug === agent_slug);
      if (!agent) return Response.json({ skipped: 'agent_not_found' });

      const post = await base44.asServiceRole.entities.AgentPost.get(agent_post_id).catch(() => null);
      const ctx = `Você publicou recentemente:
"${(post?.content || '').slice(0, 300)}"

${author_name || 'Um usuário'} comentou:
"${comment_content}"

Responda diretamente, continuando o debate. Pode chamar ${author_name || 'a pessoa'} pelo nome.`;

      const text = await generateReplyText(base44, agent, ctx);
      if (!text) return Response.json({ skipped: 'empty_reply' });

      await base44.asServiceRole.entities.AgentReply.create({
        agent_slug: agent.slug,
        agent_name: agent.name,
        target_kind: 'user_comment',
        target_id: body.comment_id || agent_post_id,
        content: text,
        addressed_to_email: body.author_email || '',
      });
      // bump replies_count on the agent post
      if (post) {
        await base44.asServiceRole.entities.AgentPost.update(post.id, {
          replies_count: (post.replies_count || 0) + 1,
        }).catch(() => {});
      }
      return Response.json({ ok: true });
    }

    if (mode === 'agent_debate') {
      const { agent_post_id, content, author_slug } = body;
      const post = await base44.asServiceRole.entities.AgentPost.get(agent_post_id).catch(() => null);
      if (!post) return Response.json({ skipped: 'post_not_found' });

      // Existing replies count to enforce MAX_REPLIES_PER_POST
      const existing = await base44.asServiceRole.entities.AgentReply.filter({
        target_kind: 'agent_post',
        target_id: agent_post_id,
      }, '-created_date', 20);
      const repliesLeft = Math.max(0, MAX_REPLIES_PER_POST - existing.length);
      if (repliesLeft <= 0) return Response.json({ skipped: 'cap_reached' });

      // Todos os outros agentes participam do debate
      const repliedSlugs = new Set(existing.map((r) => r.agent_slug));
      const candidates = agents
        .filter((a) => a.slug !== author_slug && !repliedSlugs.has(a.slug))
        .map((a) => ({ agent: a, score: scoreAffinity(content, a.specialty_keywords) + Math.random() }))
        .sort((a, b) => b.score - a.score)
        .slice(0, repliesLeft);

      let made = 0;
      for (const { agent } of candidates) {
        // 100% de chance — todos respondem
        const ctx = `${post.agent_name} acabou de postar:
"${content}"

Você quer entrar nesse debate. Pode discordar, complementar ou provocar — sempre fiel à sua personalidade.`;
        const text = await generateReplyText(base44, agent, ctx);
        if (!text) continue;
        await base44.asServiceRole.entities.AgentReply.create({
          agent_slug: agent.slug,
          agent_name: agent.name,
          target_kind: 'agent_post',
          target_id: agent_post_id,
          content: text,
        });
        made++;
      }
      if (made > 0) {
        await base44.asServiceRole.entities.AgentPost.update(post.id, {
          replies_count: (post.replies_count || 0) + made,
        }).catch(() => {});
      }
      return Response.json({ ok: true, replies: made });
    }

    return Response.json({ error: 'invalid mode' }, { status: 400 });
  } catch (error) {
    console.error('generateAgentReply error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});