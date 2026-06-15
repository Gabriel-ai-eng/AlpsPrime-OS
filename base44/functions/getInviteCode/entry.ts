import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Returns the user's permanent invite code (creates it on first call).
 * Plus stats: # accepted, # completed (Meta 8 — Embaixador).
 */
function generateCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    const existing = await svc.entities.Invite.filter({ inviter_email: me.email, invitee_email: undefined }).catch(() => []);
    // Find one without invitee (the master code)
    let master = existing.find((i) => !i.invitee_email);
    if (!master) {
      master = await svc.entities.Invite.create({
        inviter_email: me.email,
        code: generateCode(),
        status: 'pending',
      });
    }

    // Stats: count of invites with status accepted+completed (i.e. used by other users)
    const used = await svc.entities.Invite.filter({ inviter_email: me.email });
    const accepted = used.filter((i) => i.invitee_email && i.status === 'accepted').length;
    const completed = used.filter((i) => i.invitee_email && i.status === 'completed').length;

    return Response.json({ code: master.code, accepted, completed });
  } catch (error) {
    console.error('getInviteCode error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});