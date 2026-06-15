import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_CREDITS = {
  pro: 2000,
  unlimited: 999999,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { payment_id, plan_id } = await req.json();

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('MP status error:', JSON.stringify(data));
      return Response.json({ error: data.message }, { status: 500 });
    }

    // If approved, activate plan on the user
    if (data.status === 'approved') {
      const credits = PLAN_CREDITS[plan_id] || 0;
      await base44.asServiceRole.entities.User.update(user.id, {
        plan: plan_id,
        credits,
        plan_activated_at: new Date().toISOString(),
        last_payment_id: String(payment_id),
      });
    }

    return Response.json({ status: data.status, status_detail: data.status_detail });
  } catch (error) {
    console.error('mpCheckPaymentStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});