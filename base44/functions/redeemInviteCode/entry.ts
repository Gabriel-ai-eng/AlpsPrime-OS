import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Called by an invitee to register that they joined via someone's invite code.
 * Status flows: pending -> accepted (here) -> completed (when they post — done by validateGoals).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await req.json();
    if (!code) return Response.json({ error: 'code required' }, { status: 400 });

    const svc = base44.asServiceRole;
    const matches = await svc.entities.Invite.filter({ code: code.trim().toUpperCase() });
    const master = matches.find((m) => !m.invitee_email);
    if (!master) return Response.json({ error: 'Código inválido.' }, { status: 404 });
    if (master.inviter_email === me.email) {
      return Response.json({ error: 'Você não pode usar o próprio código.' }, { status: 400 });
    }

    // Already redeemed by someone?
    const already = matches.find((m) => m.invitee_email === me.email);
    if (already) return Response.json({ error: 'Você já usou um convite.' }, { status: 400 });

    // Create a child Invite row recording the relationship
    await svc.entities.Invite.create({
      inviter_email: master.inviter_email,
      invitee_email: me.email,
      code: master.code,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('redeemInviteCode error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});