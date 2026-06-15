import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Generate a pixel-art sprite from a user-uploaded photo using OpenAI gpt-image-1.
 * Receives: { photo_url: string }
 * Returns: { sprite_url: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { photo_url } = await req.json();
    if (!photo_url) return Response.json({ error: 'photo_url required' }, { status: 400 });

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return Response.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });

    const prompt = `Convert this person's face into a pixel art character sprite for a 2D retro game. 64x64 pixel art style, 16-bit aesthetic, clear chunky pixels, plain transparent or single-color background, full body facing forward, simple cartoon style, vibrant colors. The character should be a small standing figure, head + body + legs visible.`;

    // Download photo and forward to OpenAI image edit
    const photoRes = await fetch(photo_url);
    if (!photoRes.ok) return Response.json({ error: 'failed to fetch photo' }, { status: 400 });
    const photoBlob = await photoRes.blob();

    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('prompt', prompt);
    form.append('size', '1024x1024');
    form.append('image', photoBlob, 'photo.png');

    const aiRes = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('OpenAI image edit failed:', errText);
      return Response.json({ error: 'sprite generation failed' }, { status: 500 });
    }

    const aiData = await aiRes.json();
    const b64 = aiData?.data?.[0]?.b64_json;
    if (!b64) return Response.json({ error: 'no sprite returned' }, { status: 500 });

    // Upload generated PNG to Base44 storage
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const file = new File([bytes], `sprite_${Date.now()}.png`, { type: 'image/png' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    return Response.json({ sprite_url: file_url });
  } catch (error) {
    console.error('generatePixelSprite error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});