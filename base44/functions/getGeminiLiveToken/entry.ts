import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Retorna um token efêmero da Gemini Live API para uso no frontend.
 * Se a API de tokens efêmeros não estiver disponível, retorna a própria
 * GEMINI_API_KEY apenas para usuários autenticados.
 *
 * Endpoint oficial de tokens efêmeros (quando disponível):
 * POST https://generativelanguage.googleapis.com/v1beta/auth/tokens
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Tenta gerar um token efêmero (válido por ~30 minutos).
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1alpha/auth/tokens?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expire_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            new_session_expire_time: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
            uses: 1,
          }),
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data?.name) {
          return Response.json({ token: data.name, type: 'ephemeral' });
        }
      }
    } catch (e) {
      console.warn('Ephemeral token not available, falling back to API key:', e.message);
    }

    // Fallback: retorna a API key (usuário já está autenticado no app).
    return Response.json({ token: apiKey, type: 'api_key' });
  } catch (error) {
    console.error('getGeminiLiveToken error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});