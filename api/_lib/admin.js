import { createClient } from '@supabase/supabase-js';
import { ENTITY_TABLES } from './entityTables.js';

// Cliente Supabase com a service_role (uso EXCLUSIVO no servidor — ignora RLS).
// Reutiliza as mesmas variáveis já configuradas para o webhook da Hotmart.
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

export const admin = createClient(supabaseUrl || 'http://localhost', serviceKey || 'missing', {
  auth: { persistSession: false, autoRefreshToken: false },
});

function parseSort(sort) {
  if (!sort || typeof sort !== 'string') return null;
  const desc = sort.startsWith('-');
  return { column: desc ? sort.slice(1) : sort, ascending: !desc };
}

function makeEntity(table) {
  const from = () => admin.from(table);
  const sortLimit = (q, sort, limit) => {
    const s = parseSort(sort);
    if (s) q = q.order(s.column, { ascending: s.ascending });
    if (limit) q = q.limit(limit);
    return q;
  };
  return {
    async list(sort = '-created_date', limit = 100) {
      const { data, error } = await sortLimit(from().select('*'), sort, limit);
      if (error) throw error;
      return data || [];
    },
    async filter(conditions = {}, sort, limit) {
      let q = from().select('*');
      for (const [k, v] of Object.entries(conditions || {})) {
        q = Array.isArray(v) ? q.in(k, v) : q.eq(k, v);
      }
      const { data, error } = await sortLimit(q, sort, limit);
      if (error) throw error;
      return data || [];
    },
    async get(id) {
      const { data, error } = await from().select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async create(values = {}) {
      const { data, error } = await from().insert({ ...values }).select().maybeSingle();
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

// entities.<Entidade> → mesma API do Base44 (asServiceRole.entities), sobre o Supabase.
export const entities = new Proxy({}, {
  get(_t, entityName) {
    const table = ENTITY_TABLES[entityName] || String(entityName).toLowerCase();
    return makeEntity(table);
  },
});
