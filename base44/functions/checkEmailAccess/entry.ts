import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Diz se um e-mail tem acesso liberado (comprou na Hotmart ou é admin) ANTES do login.
 * Usado pela tela de Cadastro/Login para impedir que quem não comprou crie conta/entre.
 * Body: { email: string }  ->  { hasAccess: boolean, reason: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let email = '';
    try {
      const body = await req.json();
      email = (body?.email || '').trim().toLowerCase();
    } catch {
      email = '';
    }

    if (!email) {
      return Response.json({ hasAccess: false, reason: 'no_email' });
    }

    // Comprou na Hotmart (registro ativo em AuthorizedAccess)?
    const records = await base44.asServiceRole.entities.AuthorizedAccess.filter({ email });
    const record = records?.[0];
    if (record && record.status === 'active') {
      return Response.json({ hasAccess: true, reason: 'purchased' });
    }

    // Admins também podem entrar mesmo sem compra.
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email });
      if (users?.[0]?.role === 'admin') {
        return Response.json({ hasAccess: true, reason: 'admin' });
      }
    } catch {
      // ignora — se não der pra checar admin, segue para "sem acesso"
    }

    return Response.json({
      hasAccess: false,
      reason: record ? 'revoked' : 'not_purchased',
    });
  } catch (error) {
    console.error('[checkEmailAccess] error', error);
    return Response.json({ error: error.message, hasAccess: false }, { status: 500 });
  }
});
