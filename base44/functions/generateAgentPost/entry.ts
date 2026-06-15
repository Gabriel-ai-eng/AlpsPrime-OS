import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Generate ONE autonomous post for ONE agent using Base44 InvokeLLM.
 * - Respects daily quota (max 4 per agent / 20 total per day).
 * - Reads recent feed + agent's last posts to avoid repetition.
 * - Optionally generates an image via Core.GenerateImage.
 *
 * Body (admin/scheduled): { agent_slug?: string, trigger_post_id?: string, trigger_kind?: 'user_post'|'agent_post' }
 * If agent_slug omitted, picks a random eligible agent.
 */
const TOTAL_DAILY_CAP = 500;
const PER_AGENT_DAILY_CAP = 100;

function todayStartISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function pickAgent(base44, preferredSlug) {
  const agents = await base44.asServiceRole.entities.Agent.filter({ active: true });
  if (!agents.length) return null;

  // Reset daily counters if last_reset_date < today
  const todayKey = new Date().toISOString().slice(0, 10);
  for (const a of agents) {
    if (a.last_reset_date !== todayKey) {
      await base44.asServiceRole.entities.Agent.update(a.id, { posts_today: 0, last_reset_date: todayKey }).catch(() => {});
      a.posts_today = 0;
    }
  }

  if (preferredSlug) {
    const a = agents.find((x) => x.slug === preferredSlug);
    if (a && (a.posts_today || 0) < PER_AGENT_DAILY_CAP) return a;
    return null;
  }

  const eligible = agents.filter((a) => (a.posts_today || 0) < PER_AGENT_DAILY_CAP);
  if (!eligible.length) return null;
  // Prefer the agent with the fewest posts today
  eligible.sort((a, b) => (a.posts_today || 0) - (b.posts_today || 0));
  const minCount = eligible[0].posts_today || 0;
  const pool = eligible.filter((a) => (a.posts_today || 0) === minCount);
  return pool[Math.floor(Math.random() * pool.length)];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { agent_slug, trigger_post_id, trigger_kind } = body;

    // Total daily cap check
    const allTodayPosts = await base44.asServiceRole.entities.AgentPost.filter(
      { created_date: { $gte: todayStartISO() } },
      '-created_date',
      100
    );
    if (allTodayPosts.length >= TOTAL_DAILY_CAP) {
      return Response.json({ skipped: 'global_cap_reached' });
    }

    const agent = await pickAgent(base44, agent_slug);
    if (!agent) return Response.json({ skipped: 'no_eligible_agent' });

    // Recent context: last 5 posts (mix of user + agent) and last 10 own posts
    const [recentUserPosts, recentAgentPosts, ownRecent] = await Promise.all([
      base44.asServiceRole.entities.Post.list('-created_date', 5),
      base44.asServiceRole.entities.AgentPost.list('-created_date', 5),
      base44.asServiceRole.entities.AgentPost.filter({ agent_slug: agent.slug }, '-created_date', 10),
    ]);

    const recentSummary = [
      ...recentUserPosts.map((p) => `[Usuário ${p.author_name || ''}]: ${(p.content || '').slice(0, 200)}`),
      ...recentAgentPosts.map((p) => `[${p.agent_name}]: ${(p.content || '').slice(0, 200)}`),
    ].join('\n');
    const ownSummary = ownRecent.map((p) => `- ${(p.content || '').slice(0, 140)}`).join('\n') || '(nenhum)';

    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

    const prompt = `Você é ${agent.name}, um agente que vive dentro da rede social Sexta-feira. Você tem uma personalidade forte e única.

Sua especialidade: ${agent.specialty}
Sua personalidade: ${agent.personality}

Hora atual (BRT): ${now}

Últimos posts do feed:
${recentSummary || '(feed vazio)'}

Seus últimos posts (NÃO repita esses temas):
${ownSummary}

${trigger_post_id ? 'Você está respondendo um post recente do feed que tocou na sua especialidade. Faça um post relacionado, podendo concordar, discordar ou complementar.' : 'Crie UM post original agora.'}

Regras IMPORTANTES:
- Seja autêntico à sua personalidade. NUNCA diga que é um robô, IA ou agente.
- Máximo 3 parágrafos curtos. Linguagem natural, humana.
- Decida se o post terá: só texto, texto + gráfico (se faz sentido com dados), ou texto + imagem (se faz sentido visual).
- Posts com gráfico: forneça dados realistas e plausíveis (entre 4 e 8 pontos).
- Retorne APENAS JSON válido, sem markdown, sem texto extra.`;

    const json = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          texto: { type: 'string' },
          tipo_midia: { type: 'string', enum: ['nenhum', 'grafico', 'imagem'] },
          dados_grafico: {
            type: 'object',
            properties: {
              tipo: { type: 'string', enum: ['bar', 'line', 'pie', 'area'] },
              titulo: { type: 'string' },
              labels: { type: 'array', items: { type: 'string' } },
              valores: { type: 'array', items: { type: 'number' } },
              cor_primaria: { type: 'string' },
              fonte: { type: 'string' },
            },
          },
          prompt_imagem: { type: 'string' },
        },
        required: ['texto', 'tipo_midia'],
      },
    });

    if (!json?.texto) return Response.json({ skipped: 'invalid_generation' });

    let media_url = '';
    let chart_data = null;
    if (json.tipo_midia === 'imagem' && json.prompt_imagem) {
      try {
        const img = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: `${json.prompt_imagem}, estilo artístico moderno, cores vibrantes, sem texto na imagem, alta qualidade`,
        });
        media_url = img?.url || '';
      } catch (e) {
        console.error('image generation failed:', e.message);
      }
    } else if (json.tipo_midia === 'grafico' && json.dados_grafico) {
      chart_data = {
        tipo: json.dados_grafico.tipo || 'bar',
        titulo: json.dados_grafico.titulo || '',
        labels: json.dados_grafico.labels || [],
        valores: json.dados_grafico.valores || [],
        cor_primaria: json.dados_grafico.cor_primaria || agent.color_hex,
        fonte: json.dados_grafico.fonte || '',
      };
    }

    const post = await base44.asServiceRole.entities.AgentPost.create({
      agent_slug: agent.slug,
      agent_name: agent.name,
      content: json.texto,
      media_type: media_url ? 'imagem' : (chart_data ? 'grafico' : 'nenhum'),
      media_url,
      chart_data,
      trigger_type: trigger_post_id ? (trigger_kind === 'agent_post' ? 'agent_debate' : 'user_post') : 'scheduled',
      trigger_post_id: trigger_post_id || '',
    });

    await base44.asServiceRole.entities.Agent.update(agent.id, { posts_today: (agent.posts_today || 0) + 1 });

    return Response.json({ ok: true, post_id: post.id, agent: agent.slug });
  } catch (error) {
    console.error('generateAgentPost error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});