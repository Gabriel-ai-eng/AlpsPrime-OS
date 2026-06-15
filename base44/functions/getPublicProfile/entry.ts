import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const email = body?.email;
    if (!email) {
      return Response.json({ error: 'email is required' }, { status: 400 });
    }

    const list = await base44.asServiceRole.entities.User.filter({ email });
    const u = list?.[0];
    if (!u) {
      return Response.json({ profile: null });
    }

    // Return only public-safe fields
    const profile = {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      username: u.username,
      bio: u.bio,
      location: u.location,
      website: u.website,
      profile_picture_url: u.profile_picture_url,
      profile_banner_url: u.profile_banner_url,
      ranking_display_name: u.ranking_display_name,
      show_in_ranking: u.show_in_ranking,
      created_date: u.created_date,
      plan: u.plan || 'free',
      bio_links: Array.isArray(u.bio_links) ? u.bio_links : [],
    };

    return Response.json({ profile });
  } catch (error) {
    console.error('getPublicProfile error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});