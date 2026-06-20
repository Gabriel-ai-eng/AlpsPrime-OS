import { admin } from './admin.js';

/**
 * Lê o JWT do Supabase (header Authorization: Bearer <token>), valida e devolve
 * o usuário logado já mesclado com o perfil da tabela `usuarios`.
 * Retorna null se não houver token válido.
 */
export async function getUserFromReq(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const token = String(header).replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  const u = data.user;

  let profile = null;
  try {
    const { data: prof } = await admin.from('usuarios').select('*').eq('id', u.id).maybeSingle();
    profile = prof;
  } catch {
    profile = null;
  }

  return {
    ...(profile || {}),
    id: u.id,
    email: u.email,
    role: profile?.role || u.app_metadata?.role || 'user',
  };
}
