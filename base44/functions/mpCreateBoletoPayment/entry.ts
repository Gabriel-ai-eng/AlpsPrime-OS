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

    const { plan_id, cpf, first_name, last_name } = await req.json();
    const plan = PLANS[plan_id];
    if (!plan) return Response.json({ error: 'Plano inválido' }, { status: 400 });

    const body = {
      transaction_amount: plan.price,
      description: plan.title,
      payment_method_id: 'bolbradesco',
      payer: {
        email: user.email,
        first_name: first_name || user.full_name?.split(' ')[0] || 'Usuario',
        last_name: last_name || user.full_name?.split(' ').slice(1).join(' ') || '',
        identification: {
          type: 'CPF',
          number: cpf,
        },
        address: {
          zip_code: '01310100',
          street_name: 'Av. Paulista',
          street_number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          federal_unit: 'SP',
        },
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
        'X-Idempotency-Key': `${user.email}-${plan_id}-boleto-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('MP Boleto error:', JSON.stringify(data));
      return Response.json({ error: data.message || 'Erro ao gerar boleto' }, { status: 500 });
    }

    return Response.json({
      payment_id: data.id,
      barcode: data.barcode?.content,
      external_resource_url: data.transaction_details?.external_resource_url,
      status: data.status,
    });
  } catch (error) {
    console.error('mpCreateBoletoPayment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});