import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);

    // Return only public-safe fields
    const publicUsers = (users || []).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      username: u.username,
      bio: u.bio,
      profile_picture_url: u.profile_picture_url,
      ranking_display_name: u.ranking_display_name,
      plan: u.plan || 'free',
    }));

    return Response.json({ users: publicUsers });
  } catch (error) {
    console.error('listPublicUsers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});