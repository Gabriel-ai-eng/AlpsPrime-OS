import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Verifica se o usuário logado tem acesso liberado (comprou na Hotmart ou é admin).
 * Retorna: { hasAccess: boolean, reason: string, checkoutUrl: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ hasAccess: false, reason: 'unauthenticated' }, { status: 401 });
    }

    const checkoutUrl = Deno.env.get('HOTMART_CHECKOUT_URL') || '';

    // Admins sempre têm acesso
    if (user.role === 'admin') {
      return Response.json({ hasAccess: true, reason: 'admin', checkoutUrl });
    }

    const email = (user.email || '').trim().toLowerCase();
    const records = await base44.asServiceRole.entities.AuthorizedAccess.filter({ email });
    const record = records?.[0];

    if (record && record.status === 'active') {
      return Response.json({ hasAccess: true, reason: 'purchased', checkoutUrl });
    }

    return Response.json({
      hasAccess: false,
      reason: record ? 'revoked' : 'not_purchased',
      checkoutUrl,
    });
  } catch (error) {
    console.error('[checkMyAccess] error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});