import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Entity automation: triggered on User.create
 * Sends a personalized AI-generated welcome notification
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const payload = await req.json().catch(() => ({}));
    const userData = payload?.data;
    if (!userData?.email) {
      return Response.json({ ok: false, error: 'no user email in payload' });
    }

    // Avoid duplicates
    const existing = await svc.entities.Notification.filter({
      recipient_email: userData.email,
      type: 'welcome',
    }, '-created_date', 5);

    if (existing.length > 0) {
      return Response.json({ ok: true, skipped: true });
    }

    const firstName = (userData.full_name || userData.email.split('@')[0]).split(' ')[0];

    // Generate a unique, personalized welcome message via AI
    const aiResponse = await svc.integrations.Core.InvokeLLM({
      prompt: `Você é a Sexta-feira, uma assistente de IA brasileira moderna, animada e acolhedora. 
Crie uma mensagem de boas-vindas curta, única e personalizada para um novo usuário chamado "${firstName}" que acabou de entrar na plataforma Sexta-feira.
A mensagem deve ter no máximo 2 frases, ser calorosa, encorajadora e diferente das convencionais. 
Use emojis com moderação. Escreva em português brasileiro.
Não mencione nome de produtos ou planos. Apenas dê uma mensagem de boas-vindas pessoal e motivadora.`,
    });

    const welcomeMsg = typeof aiResponse === 'string' ? aiResponse : (aiResponse?.text || `Bem-vindo(a) à Sexta-feira, ${firstName}! 🎉 Estamos felizes em ter você aqui.`);

    await svc.entities.Notification.create({
      recipient_email: userData.email,
      actor_email: 'sexta-feira@system',
      actor_name: 'Sexta-feira',
      actor_avatar: '',
      type: 'welcome',
      post_preview: welcomeMsg,
      read: false,
    });

    return Response.json({ ok: true, notified: userData.email });
  } catch (error) {
    console.error('welcomeNewUser error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});