import { admin } from './admin.js';

/**
 * Lê o JWT do Supabase (header Authorization: Bearer <token>), valida e devolve
 * o usuário logado já mesclado com o perfil da tabela `usuarios`.
 * Retorna null se não houver token válido.
 */
export async function getUserFromReq(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const token = String(header).replace(/^Bearer\s+/i, '').trim();
  if (!token) return { user: null, error: 'sem token de login na requisição' };

  // Se a service key do servidor não estiver configurada, a validação falha aqui.
  const faltando = [];
  if (!process.env.SUPABASE_URL) faltando.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_KEY) faltando.push('SUPABASE_SERVICE_KEY');
  if (faltando.length) {
    return { user: null, error: `faltando/vazio no Vercel: ${faltando.join(' e ')} (precisa Redeploy após salvar)` };
  }

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    return { user: null, error: error?.message || 'token inválido/expirado' };
  }
  const u = data.user;

  let profile = null;
  try {
    const { data: prof } = await admin.from('usuarios').select('*').eq('id', u.id).maybeSingle();
    profile = prof;
  } catch {
    profile = null;
  }

  return {
    user: {
      ...(profile || {}),
      id: u.id,
      email: u.email,
      role: profile?.role || u.app_metadata?.role || 'user',
    },
    error: null,
  };
}
