import { supabase } from '@/api/supabaseClient';
import { ENTITY_TABLES } from '@/api/entityTables';

/**
 * Adaptador que reproduz a API de dados do Base44 (base44.entities.X.*)
 * usando o Supabase por baixo. Assim os componentes existentes continuam
 * chamando .filter / .list / .get / .create / .update / .delete sem mudanças.
 */

function parseSort(sort) {
  // '-created_date' => desc | 'created_date' => asc
  if (!sort || typeof sort !== 'string') return null;
  const desc = sort.startsWith('-');
  return { column: desc ? sort.slice(1) : sort, ascending: !desc };
}

async function currentEmail() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.email || null;
}

function makeEntity(table) {
  const from = () => supabase.from(table);
  const applySortLimit = (q, sort, limit) => {
    const s = parseSort(sort);
    if (s) q = q.order(s.column, { ascending: s.ascending });
    if (limit) q = q.limit(limit);
    return q;
  };

  return {
    async list(sort = '-created_date', limit = 100) {
      const { data, error } = await applySortLimit(from().select('*'), sort, limit);
      if (error) throw error;
      return data || [];
    },
    async filter(conditions = {}, sort, limit) {
      let q = from().select('*');
      for (const [k, v] of Object.entries(conditions || {})) {
        q = Array.isArray(v) ? q.in(k, v) : q.eq(k, v);
      }
      const { data, error } = await applySortLimit(q, sort, limit);
      if (error) throw error;
      return data || [];
    },
    async get(id) {
      const { data, error } = await from().select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async create(values = {}) {
      const row = { ...values };
      if (!row.created_by) row.created_by = await currentEmail();
      const { data, error } = await from().insert(row).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    async update(id, values = {}) {
      const row = { ...values, updated_date: new Date().toISOString() };
      const { data, error } = await from().update(row).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await from().delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };
}

// base44.entities.<Entidade> → resolve a tabela e devolve o objeto com os métodos.
export const entities = new Proxy({}, {
  get(_t, entityName) {
    const table = ENTITY_TABLES[entityName];
    if (!table) {
      console.error(`[entities] entidade desconhecida: ${String(entityName)}`);
      return makeEntity(String(entityName).toLowerCase());
    }
    return makeEntity(table);
  },
});

// --- Perfil do usuário logado (substitui base44.auth.me / updateMe) ---
// O perfil vive na tabela "usuarios", com id = id do Supabase Auth.
async function sessionUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

export async function me() {
  const user = await sessionUser();
  if (!user) throw new Error('Não autenticado');
  let { data: profile, error } = await supabase
    .from('usuarios').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  if (!profile) {
    // Primeiro acesso: cria o perfil a partir dos dados do Auth.
    const novo = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      role: user.app_metadata?.role || 'user',
      created_by: user.email,
    };
    const { data, error: upErr } = await supabase
      .from('usuarios').upsert(novo, { onConflict: 'id' }).select().maybeSingle();
    if (upErr) throw upErr;
    profile = data;
  }
  return { ...profile, id: user.id, email: user.email };
}

export async function updateMe(patch = {}) {
  const user = await sessionUser();
  if (!user) throw new Error('Não autenticado');
  const row = {
    ...patch,
    id: user.id,
    email: user.email,
    updated_date: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('usuarios').upsert(row, { onConflict: 'id' }).select().maybeSingle();
  if (error) throw error;

  // Espelha os campos visuais no metadata da sessão (que o navegador já tem
  // guardado), para que apareçam INSTANTANEAMENTE ao recarregar — sem esperar
  // a ida ao banco. A tabela `usuarios` continua sendo a fonte da verdade.
  const espelho = {};
  for (const k of ['profile_picture_url', 'profile_banner_url', 'username', 'full_name', 'avatar']) {
    if (k in patch) espelho[k] = patch[k];
  }
  if (Object.keys(espelho).length) {
    try { await supabase.auth.updateUser({ data: espelho }); } catch (e) { /* não crítico */ }
  }
  return data;
}
