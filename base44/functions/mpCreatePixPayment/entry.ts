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

    const { plan_id } = await req.json();
    const plan = PLANS[plan_id];
    if (!plan) return Response.json({ error: 'Plano inválido' }, { status: 400 });

    const body = {
      transaction_amount: plan.price,
      description: plan.title,
      payment_method_id: 'pix',
      payer: {
        email: user.email,
        first_name: user.full_name?.split(' ')[0] || 'Usuario',
        last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
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
        'X-Idempotency-Key': `${user.email}-${plan_id}-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('MP Pix error:', JSON.stringify(data));
      return Response.json({ error: data.message || 'Erro ao criar Pix' }, { status: 500 });
    }

    return Response.json({
      payment_id: data.id,
      qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      status: data.status,
    });
  } catch (error) {
    console.error('mpCreatePixPayment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});