import { getUserFromReq } from '../_lib/auth.js';
import { handlers, PUBLIC_FUNCTIONS } from '../_lib/handlers.js';

/**
 * Ponte das antigas funções do Base44 (base44.functions.invoke) para o Vercel.
 * O frontend chama POST /api/fn/<nome> com o JWT do Supabase no Authorization.
 * Cada handler devolve um objeto JSON, que o invoke do frontend entrega como { data }.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Apenas POST' });
  }

  const name = req.query?.name;
  const fn = handlers[name];
  if (!fn) {
    return res.status(501).json({
      error: `Função "${name}" ainda não foi migrada para o Supabase (Fase 3 em andamento).`,
    });
  }

  try {
    const user = await getUserFromReq(req);
    if (!user && !PUBLIC_FUNCTIONS.has(name)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const result = await fn({ user, body });
    return res.status(200).json(result ?? {});
  } catch (e) {
    console.error(`[fn ${name}]`, e?.message || e);
    return res.status(e?.status || 500).json({ error: e?.message || 'Erro interno' });
  }
}
