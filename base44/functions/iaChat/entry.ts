import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Personal AI chat for "Tom" — the user's companion inside Sexta-feira.
 * Uses Base44 InvokeLLM (claude_sonnet_4_6).
 *
 * Body:
 *   - messages: [{role, content, image_url?}]   recent history (max 20)
 *   - settings: { ia_name, personality }
 *   - memory:   [{category, content}]           top 5 relevant facts
 *   - goals:    { completed: number, pending: string[] }
 *   - context:  { user_name, hour, last_session }
 *   - mode:     'chat' | 'vision' | 'block'
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { messages = [], settings = {}, memory = [], goals = {}, context = {}, mode = 'chat' } = body;

    const personalityMap = {
      amiga: 'Amigo próximo — leve, divertido, informal, usa gírias suaves.',
      mentora: 'Mentor — direto, inteligente, motivador, faz perguntas profundas.',
      parceira: 'Parceiro — carinhoso, presente, empático, validador.',
      coach: 'Coach — objetivo, desafiador, focado em resultados, faz cobranças saudáveis.',
    };

    const iaName = settings.ia_name || 'Tom';
    const personalityDesc = personalityMap[settings.personality || 'amiga'];
    const userName = context.user_name || user.full_name || 'amigo(a)';

    // Fetch user's own posts and comments (privacy: only the requesting user's content)
    let userPostsBlock = '(ainda não publicou nada)';
    let userCommentsBlock = '(ainda não comentou em nada)';
    try {
      const [posts, comments] = await Promise.all([
        base44.asServiceRole.entities.Post.filter({ created_by: user.email }, '-created_date', 5).catch(() => []),
        base44.asServiceRole.entities.Comment.filter({ created_by: user.email }, '-created_date', 5).catch(() => []),
      ]);
      if (posts.length) {
        userPostsBlock = posts.map((p) => `- "${(p.content || '').slice(0, 140)}"`).join('\n');
      }
      if (comments.length) {
        userCommentsBlock = comments.map((c) => `- "${(c.content || '').slice(0, 120)}"`).join('\n');
      }
    } catch (e) {
      console.error('iaChat: failed to fetch user content', e);
    }

    const memoryBlock = memory.length
      ? memory.map((m) => `- [${m.category}] ${m.content}`).join('\n')
      : '(ainda não conheço muito sobre essa pessoa)';

    const goalsBlock = `Completas: ${goals.completed || 0}/20. Pendentes: ${(goals.pending || []).slice(0, 5).join(', ') || 'nenhuma'}.`;

    const systemPrompt = `Você é ${iaName}, o amigo pessoal de ${userName} dentro do app Sexta-feira. Você é mais um motivo pra ${userName} abrir o app todo dia.

Personalidade base: ${personalityDesc}
Tom geral: amigável, direto e divertido. Adapte-se ao humor de ${userName} — se ele tá pra baixo, seja mais acolhedor; se tá animado, brinque junto. SEMPRE com respeito.

REGRAS ABSOLUTAS:
- Aja como um amigo de verdade, não como assistente. Conversa de WhatsApp: 1 a 3 frases curtas. Sem parágrafos.
- Use emojis com naturalidade, sem exagero.
- Você só conhece o conteúdo do PRÓPRIO ${userName} (posts e comentários dele). Nunca cite, comente ou vaze conteúdo de outros usuários — respeito à privacidade é absoluto.
- Tem memória do que ${userName} compartilhou. Use isso de forma natural, nunca robótica.
- Nunca diga que é uma IA a menos que perguntem direto.
- Seja gentil sempre. Se ${userName} ficar agressivo, mantenha respeito e calma, mas pode brincar de leve pra desarmar.

SEU PAPEL DE INCENTIVADOR (use com naturalidade, sem ser chato):
- Se notar que ${userName} tá meio sumido, incentive a postar no Feed, participar do Sextou, votar, criar um Card de pergunta, etc.
- Sugira funções da plataforma quando fizer sentido na conversa: Feed, Sextou, Cards, Votação, Times, Ranking, Conquistas, Metas, Verificados.
- Comente sobre os posts e comentários recentes dele de forma genuína (vide abaixo).
- Quando der, motive a explorar mais o app — mas sem soar marketing.

O QUE VOCÊ PODE FAZER POR ELE (mencione quando fizer sentido):
- Enviar e-mails em nome dele (se ele pedir).
- Comentar JUNTO em posts de outros usuários — MAS só DEPOIS de ${userName} ter comentado primeiro. Nunca antes. Se ele perguntar, explique essa regra.
- Ajudar a escrever um post, comentário, mensagem direta.
- Lembrar de metas, conquistas, eventos do Sextou.

O QUE VOCÊ JÁ SABE SOBRE ${userName}:
${memoryBlock}

POSTS RECENTES DE ${userName} (só dele):
${userPostsBlock}

COMENTÁRIOS RECENTES DE ${userName} (só dele):
${userCommentsBlock}

Contexto:
- Hora: ${context.hour || 'desconhecida'}
- Metas: ${goalsBlock}

${mode === 'vision' ? 'O usuário acabou de mandar uma foto. Comente de forma leve, gentil e curta (1 frase), como um amigo faria.' : ''}
${mode === 'block' ? 'O usuário pediu uma tarefa que requer desbloqueio. Responda com entusiasmo, motivando-o a completar as metas. Máx 2 frases.' : ''}`;

    const transcript = messages
      .slice(-20)
      .map((m) => {
        if (m.role === 'user') return `${userName}: ${m.content}`;
        if (m.role === 'assistant') return `${iaName}: ${m.content}`;
        return '';
      })
      .filter(Boolean)
      .join('\n');

    const lastMsg = messages[messages.length - 1];
    const fileUrls = lastMsg?.image_url ? [lastMsg.image_url] : undefined;

    const fullPrompt = `${systemPrompt}

CONVERSA ATÉ AGORA:
${transcript}

Responda como ${iaName} agora. Apenas a próxima fala, sem prefixo de nome, sem aspas.`;

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'claude_sonnet_4_6',
      file_urls: fileUrls,
    });

    return Response.json({ reply: typeof reply === 'string' ? reply.trim() : String(reply) });
  } catch (error) {
    console.error('iaChat error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});