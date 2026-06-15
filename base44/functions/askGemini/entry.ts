import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'prompt is required (string)' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Retry up to 3 times on 503/429 (high demand / rate limit)
    let response;
    let lastErrText = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      if (response.ok) break;
      lastErrText = await response.text();
      console.error(`Gemini API error (attempt ${attempt + 1}):`, response.status, lastErrText);
      if (response.status !== 503 && response.status !== 429) break;
      // exponential backoff: 800ms, 1600ms
      await new Promise(r => setTimeout(r, 800 * Math.pow(2, attempt)));
    }

    if (!response.ok) {
      let errorMsg;
      if (response.status === 503) {
        errorMsg = 'O modelo está com alta demanda no momento. Tente novamente em alguns segundos.';
      } else if (response.status === 429) {
        errorMsg = 'Limite de requisições atingido. Aguarde cerca de 30 segundos e tente novamente.';
      } else {
        errorMsg = `Gemini API error: ${response.status}`;
      }
      return Response.json({ error: errorMsg }, { status: 500 });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return Response.json({ text });
  } catch (error) {
    console.error('askGemini error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});