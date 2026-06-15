import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Webhook da Hotmart.
 * Configurar na Hotmart (Ferramentas → Webhook) apontando para a URL desta função.
 * Aceita o Hottok via header "X-HOTMART-HOTTOK" OU no body (campo "hottok").
 *
 * Eventos relevantes:
 *  - PURCHASE_APPROVED / PURCHASE_COMPLETE → libera acesso
 *  - PURCHASE_REFUNDED / PURCHASE_CHARGEBACK / PURCHASE_CANCELED → revoga acesso
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const hottokExpected = Deno.env.get('HOTMART_HOTTOK');
    if (!hottokExpected) {
      console.error('[hotmartWebhook] HOTMART_HOTTOK not configured');
      return Response.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const body = await req.json();
    const headerHottok = req.headers.get('x-hotmart-hottok') || req.headers.get('X-HOTMART-HOTTOK');
    const bodyHottok = body?.hottok;
    const providedHottok = headerHottok || bodyHottok;

    if (providedHottok !== hottokExpected) {
      console.error('[hotmartWebhook] invalid hottok', { providedHottok: providedHottok ? '***' : null });
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // A Hotmart envia em formatos diferentes dependendo da versão do webhook.
    // Tentamos cobrir os dois mais comuns: V2 (data.buyer / data.purchase) e legado (email/status no topo).
    const event = body?.event || body?.status || body?.data?.purchase?.status || 'UNKNOWN';
    const buyer = body?.data?.buyer || {};
    const email = (buyer.email || body?.email || '').trim().toLowerCase();
    const buyerName = buyer.name || body?.name || '';
    const transactionId = body?.data?.purchase?.transaction || body?.transaction || '';

    if (!email) {
      console.error('[hotmartWebhook] missing buyer email', { event });
      return Response.json({ error: 'Missing buyer email' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const APPROVE_EVENTS = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'approved', 'complete']);
    const REVOKE_EVENTS = new Set([
      'PURCHASE_REFUNDED',
      'PURCHASE_CHARGEBACK',
      'PURCHASE_CANCELED',
      'PURCHASE_PROTEST',
      'PURCHASE_EXPIRED',
      'refunded',
      'chargeback',
      'canceled',
    ]);

    // Procura registro existente pelo e-mail
    const existing = await base44.asServiceRole.entities.AuthorizedAccess.filter({ email });
    const record = existing?.[0];

    if (APPROVE_EVENTS.has(event)) {
      const payload = {
        email,
        source: 'hotmart',
        transaction_id: transactionId,
        buyer_name: buyerName,
        status: 'active',
        last_event: event,
      };
      if (record) {
        await base44.asServiceRole.entities.AuthorizedAccess.update(record.id, payload);
      } else {
        await base44.asServiceRole.entities.AuthorizedAccess.create(payload);
      }
      console.log('[hotmartWebhook] access granted', { email, event });
      return Response.json({ ok: true, action: 'granted' });
    }

    if (REVOKE_EVENTS.has(event)) {
      if (record) {
        await base44.asServiceRole.entities.AuthorizedAccess.update(record.id, {
          status: 'revoked',
          last_event: event,
        });
      }
      console.log('[hotmartWebhook] access revoked', { email, event });
      return Response.json({ ok: true, action: 'revoked' });
    }

    console.log('[hotmartWebhook] ignored event', { email, event });
    return Response.json({ ok: true, action: 'ignored', event });
  } catch (error) {
    console.error('[hotmartWebhook] error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});