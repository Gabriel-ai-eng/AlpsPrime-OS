import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Leave the team you are currently active in. The owner cannot leave;
 * they must delete the team instead (action=delete).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { team_id, action } = await req.json();
    if (!team_id) return Response.json({ error: 'team_id required' }, { status: 400 });

    const svc = base44.asServiceRole;
    const team = await svc.entities.Team.get(team_id);
    if (!team) return Response.json({ error: 'Time não encontrado.' }, { status: 404 });

    if (action === 'delete') {
      if (team.owner_email !== me.email) {
        return Response.json({ error: 'Apenas o dono pode excluir o time.' }, { status: 403 });
      }
      const members = await svc.entities.TeamMember.filter({ team_id });
      for (const m of members) await svc.entities.TeamMember.delete(m.id);
      await svc.entities.Team.delete(team_id);
      return Response.json({ ok: true, deleted: true });
    }

    if (team.owner_email === me.email) {
      return Response.json({ error: 'O dono não pode sair. Exclua o time.' }, { status: 400 });
    }

    const my = await svc.entities.TeamMember.filter({ team_id, user_email: me.email, status: 'active' });
    if (!my.length) return Response.json({ error: 'Você não está nesse time.' }, { status: 400 });

    await svc.entities.TeamMember.update(my[0].id, { status: 'left' });
    const activeCount = (await svc.entities.TeamMember.filter({ team_id, status: 'active' })).length;
    await svc.entities.Team.update(team_id, { members_count: activeCount });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('leaveTeam error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});