import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Create a new team. The creator becomes the owner and first member.
 * A user can only own/be active in one team at a time.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, color, avatar_url } = await req.json();
    if (!name || name.trim().length < 2) {
      return Response.json({ error: 'Nome do time inválido.' }, { status: 400 });
    }

    const svc = base44.asServiceRole;

    // Already in a team?
    const existing = await svc.entities.TeamMember.filter({ user_email: me.email, status: 'active' });
    if (existing.length > 0) {
      return Response.json({ error: 'Você já faz parte de um time. Saia antes de criar outro.' }, { status: 400 });
    }

    const team = await svc.entities.Team.create({
      name: name.trim(),
      owner_email: me.email,
      description: description?.trim() || '',
      color: color || 'gold',
      avatar_url: avatar_url || '',
      members_count: 1,
    });
    await svc.entities.TeamMember.create({
      team_id: team.id,
      user_email: me.email,
      user_name: me.full_name || me.email.split('@')[0],
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, team });
  } catch (error) {
    console.error('createTeam error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});