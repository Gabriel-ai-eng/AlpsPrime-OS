import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');

const PLANS = {
  pro: { title: 'Plano Pro', price: 49.90 },
  unlimited: { title: 'Plano Unlimited', price: 99.90 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_id, success_url, cancel_url } = await req.json();

    const plan = PLANS[plan_id];
    if (!plan) {
      return Response.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const preference = {
      items: [
        {
          title: plan.title,
          quantity: 1,
          unit_price: plan.price,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: user.email,
      },
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
      back_urls: {
        success: success_url || `${req.headers.get('origin') || ''}/plans?success=true`,
        failure: cancel_url || `${req.headers.get('origin') || ''}/plans?canceled=true`,
        pending: success_url || `${req.headers.get('origin') || ''}/plans?pending=true`,
      },
      auto_return: 'approved',
      external_reference: `${user.email}|${plan_id}`,
      metadata: {
        user_email: user.email,
        plan_id,
      },
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MP error:', JSON.stringify(data));
      return Response.json({ error: data.message || 'Erro ao criar preferência' }, { status: 500 });
    }

    // init_point = produção, sandbox_init_point = sandbox
    const url = data.init_point || data.sandbox_init_point;

    return Response.json({ url });
  } catch (error) {
    console.error('MP checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});