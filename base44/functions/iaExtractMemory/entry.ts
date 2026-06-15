import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Extract durable facts about the user from recent conversation
 * and store them in IAMemory. Called every ~6 user messages.
 *
 * Body: { messages: [{role, content}] }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages = [] } = await req.json();
    const transcript = messages
      .slice(-12)
      .map((m) => `${m.role === 'user' ? 'Usuário' : 'IA'}: ${m.content}`)
      .join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analise a conversa abaixo entre uma IA pessoal e seu usuário. Extraia fatos DURÁVEIS e ÚTEIS sobre o usuário (nome, profissão, relacionamentos, gostos, rotina, problemas, objetivos). Ignore conversa fiada.

Conversa:
${transcript}

Retorne até 3 fatos. Se não houver nada relevante, retorne lista vazia.`,
      response_json_schema: {
        type: 'object',
        properties: {
          facts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['trabalho', 'relacionamento', 'saude', 'humor', 'interesses', 'rotina', 'outro'],
                },
                content: { type: 'string' },
                relevance: { type: 'number' },
              },
              required: ['category', 'content'],
            },
          },
        },
      },
    });

    const facts = result?.facts || [];
    if (facts.length) {
      await Promise.all(
        facts.map((f) =>
          base44.entities.IAMemory.create({
            user_email: user.email,
            category: f.category,
            content: f.content,
            relevance: f.relevance || 3,
          }).catch(() => null)
        )
      );
    }

    return Response.json({ saved: facts.length });
  } catch (error) {
    console.error('iaExtractMemory error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});