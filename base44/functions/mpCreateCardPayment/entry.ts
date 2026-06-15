import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLANS = {
  pro: { title: 'Plano Pro - Sexta-feira 1.0', price: 49.90 },
  unlimited: { title: 'Plano Unlimited - Sexta-feira 1.0', price: 99.90 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan_id, token, payment_method_id, installments, issuer_id, payer } = await req.json();
    const plan = PLANS[plan_id];
    if (!plan) return Response.json({ error: 'Plano inválido' }, { status: 400 });

    const body = {
      transaction_amount: plan.price,
      token,
      description: plan.title,
      installments: installments || 1,
      payment_method_id,
      issuer_id,
      payer: {
        email: user.email,
        identification: payer?.identification,
      },
      metadata: {
        user_email: user.email,
        plan_id,
      },
    };

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${user.email}-${plan_id}-card-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('MP Card error:', JSON.stringify(data));
      return Response.json({ error: data.message || 'Erro no pagamento com cartão' }, { status: 500 });
    }

    return Response.json({
      payment_id: data.id,
      status: data.status,
      status_detail: data.status_detail,
    });
  } catch (error) {
    console.error('mpCreateCardPayment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});