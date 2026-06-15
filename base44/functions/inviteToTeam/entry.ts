import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Invite a user (by email) to your team. Owner only.
 * Creates a TeamMember row with status="invited" and a Notification for the invitee.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { team_id, invitee_email } = await req.json();
    if (!team_id || !invitee_email) {
      return Response.json({ error: 'team_id e invitee_email são obrigatórios.' }, { status: 400 });
    }
    const target = invitee_email.trim().toLowerCase();
    if (target === me.email.toLowerCase()) {
      return Response.json({ error: 'Você não pode convidar a si mesmo.' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    const team = await svc.entities.Team.get(team_id);
    if (!team) return Response.json({ error: 'Time não encontrado.' }, { status: 404 });
    if (team.owner_email !== me.email) {
      return Response.json({ error: 'Apenas o dono do time pode convidar.' }, { status: 403 });
    }

    // Already invited or member?
    const existing = await svc.entities.TeamMember.filter({ team_id, user_email: target });
    if (existing.length > 0 && existing[0].status !== 'left') {
      return Response.json({ error: 'Esse usuário já foi convidado ou já é membro.' }, { status: 400 });
    }

    await svc.entities.TeamMember.create({
      team_id,
      user_email: target,
      user_name: target.split('@')[0],
      role: 'member',
      status: 'invited',
    });

    // Notify the invitee
    await svc.entities.Notification.create({
      recipient_email: target,
      actor_email: me.email,
      actor_name: me.full_name || me.email.split('@')[0],
      actor_avatar: me.profile_picture_url || '',
      type: 'follow',
      message_preview: `Convidou você para o time "${team.name}"`,
    }).catch(() => {});

    return Response.json({ ok: true });
  } catch (error) {
    console.error('inviteToTeam error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});