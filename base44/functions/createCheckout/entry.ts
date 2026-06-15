import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICE_MAP = {
  pro: 'price_1TP3j8DOCThOJwU1CyfJLDYw',
  unlimited: 'price_1TP3j8DOCThOJwU1pz6huhNe',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_id, success_url, cancel_url } = await req.json();

    const price_id = PRICE_MAP[plan_id];
    if (!price_id) {
      return Response.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // Check if running in iframe (preview) - handled on frontend

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price_id, quantity: 1 }],
      customer_email: user.email,
      success_url: success_url || 'https://app.base44.com/plans?success=true',
      cancel_url: cancel_url || 'https://app.base44.com/plans?canceled=true',
      payment_method_types: ['card'],
      locale: 'pt-BR',
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        plan_id,
      },
      subscription_data: {
        metadata: {
          user_email: user.email,
          plan_id,
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});