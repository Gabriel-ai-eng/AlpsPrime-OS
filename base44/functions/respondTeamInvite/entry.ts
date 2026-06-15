import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Accept or decline a team invite. The user can only be active in one team at a time.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { team_member_id, action } = await req.json();
    if (!team_member_id || !['accept', 'decline'].includes(action)) {
      return Response.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    const tm = await svc.entities.TeamMember.get(team_member_id);
    if (!tm) return Response.json({ error: 'Convite não encontrado.' }, { status: 404 });
    if (tm.user_email !== me.email) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (tm.status !== 'invited') return Response.json({ error: 'Convite já respondido.' }, { status: 400 });

    if (action === 'decline') {
      await svc.entities.TeamMember.update(team_member_id, { status: 'left' });
      return Response.json({ ok: true, status: 'declined' });
    }

    // Accept: must not be active in another team
    const others = await svc.entities.TeamMember.filter({ user_email: me.email, status: 'active' });
    if (others.length > 0) {
      return Response.json({ error: 'Você já participa de outro time. Saia antes de aceitar.' }, { status: 400 });
    }

    await svc.entities.TeamMember.update(team_member_id, {
      status: 'active',
      user_name: me.full_name || me.email.split('@')[0],
      joined_at: new Date().toISOString(),
    });

    // Update team count
    const team = await svc.entities.Team.get(tm.team_id);
    if (team) {
      const activeCount = (await svc.entities.TeamMember.filter({ team_id: tm.team_id, status: 'active' })).length;
      await svc.entities.Team.update(tm.team_id, { members_count: activeCount });
    }

    return Response.json({ ok: true, status: 'accepted' });
  } catch (error) {
    console.error('respondTeamInvite error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});