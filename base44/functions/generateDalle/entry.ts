import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DALLE_ENDPOINT = 'https://api.openai.com/v1/images/generations';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, size = '1024x1024', quality = 'standard', style = 'vivid' } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'prompt is required (string)' }, { status: 400 });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch(DALLE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,      // '1024x1024' | '1792x1024' | '1024x1792'
        quality,   // 'standard' | 'hd'
        style,     // 'vivid' | 'natural'
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DALL-E API error:', response.status, errText);
      return Response.json({ error: `DALL-E API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const url = data?.data?.[0]?.url;
    const revisedPrompt = data?.data?.[0]?.revised_prompt || prompt;

    if (!url) {
      return Response.json({ error: 'No image URL returned by DALL-E' }, { status: 500 });
    }

    return Response.json({ url, revised_prompt: revisedPrompt });
  } catch (error) {
    console.error('generateDalle error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});