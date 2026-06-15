import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Returns the user's active team (if any), all members, and any pending invites for them.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;

    // Active team
    const myActive = await svc.entities.TeamMember.filter({ user_email: me.email, status: 'active' });
    let team = null;
    let members = [];
    if (myActive.length) {
      team = await svc.entities.Team.get(myActive[0].team_id).catch(() => null);
      if (team) {
        members = await svc.entities.TeamMember.filter({ team_id: team.id, status: 'active' });
      }
    }

    // Pending invites for me
    const invitesRaw = await svc.entities.TeamMember.filter({ user_email: me.email, status: 'invited' });
    const invites = [];
    for (const inv of invitesRaw) {
      const t = await svc.entities.Team.get(inv.team_id).catch(() => null);
      if (t) invites.push({ team_member_id: inv.id, team: t });
    }

    return Response.json({ team, members, invites });
  } catch (error) {
    console.error('getMyTeam error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});