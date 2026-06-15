import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPPORTED = {
  en: 'English',
  es: 'Spanish (Español)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  it: 'Italian (Italiano)',
  pt: 'Portuguese (Português)',
  ja: 'Japanese (日本語)',
  zh: 'Chinese (中文)',
};

/**
 * Translate Unlimited-creator profile content (bio, post texts, bio link titles)
 * into the requested target language using Gemini.
 *
 * Body: { profile_email, target_lang, items: [{id, text}] }
 *  - profile_email is the OWNER of the profile being viewed
 *  - target_lang is one of SUPPORTED keys (e.g. "en")
 *  - items is the list of strings to translate, each tagged with an id
 *
 * Auth: any authenticated user can request translation for an Unlimited profile.
 * Free/Pro profiles are not translatable (returns 403).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile_email, target_lang, items } = await req.json();
    if (!profile_email || !target_lang || !Array.isArray(items)) {
      return Response.json({ error: 'profile_email, target_lang and items are required' }, { status: 400 });
    }
    if (!SUPPORTED[target_lang]) {
      return Response.json({ error: 'Unsupported language' }, { status: 400 });
    }

    // Verify the profile owner is on the Unlimited plan
    const owners = await base44.asServiceRole.entities.User.filter({ email: profile_email });
    const owner = owners?.[0];
    if (!owner) return Response.json({ error: 'Profile not found' }, { status: 404 });
    if (owner.plan !== 'unlimited') {
      return Response.json({ error: 'Translation only available for Unlimited profiles' }, { status: 403 });
    }

    const cleanItems = items
      .map((it) => ({ id: String(it?.id ?? ''), text: String(it?.text ?? '').trim() }))
      .filter((it) => it.id && it.text)
      .slice(0, 60); // safety cap

    if (cleanItems.length === 0) {
      return Response.json({ translations: {} });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) return Response.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });

    const prompt = `You are a professional translator. Translate each item below into ${SUPPORTED[target_lang]}.
Rules:
- Return ONLY valid JSON: { "translations": { "<id>": "<translated text>", ... } }
- Preserve emojis, hashtags, mentions (@user), URLs and line breaks.
- Keep tone, register and casual style natural for native speakers.
- Do NOT add explanations or quotes around values.
- If an item is already in the target language, return it unchanged.

Items:
${JSON.stringify(cleanItems)}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini translate error:', res.status, errText);
      return Response.json({ error: 'Translation service error' }, { status: 500 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse Gemini response:', text);
    }

    return Response.json({ translations: parsed.translations || {} });
  } catch (error) {
    console.error('translateProfileContent error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});