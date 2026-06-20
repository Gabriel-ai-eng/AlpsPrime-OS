// Compatibilidade: este módulo costumava exportar o cliente do Base44.
// O backend do Base44 não existe mais — agora o `base44` é um adaptador que
// usa o Supabase por baixo, mantendo a MESMA interface (base44.entities.*,
// base44.auth.me/updateMe/logout) para não quebrar os componentes existentes.
//
// As funções de servidor (base44.functions.invoke) ainda não foram migradas
// (Fase 3): por enquanto avisam no console e rejeitam, sem derrubar o app.
import { entities, me, updateMe } from '@/api/entitiesAdapter';
import { supabase } from '@/api/supabaseClient';
import { signOut } from '@/lib/auth';

// Chama as funções de servidor migradas para o Vercel (api/fn/<nome>).
// Mantém o mesmo contrato do Base44: retorna { data } com o corpo JSON.
async function invoke(name, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`/api/fn/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(payload || {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 501) {
      console.warn(`[base44.functions] "${name}" ainda não migrado (Fase 3).`);
    }
    const err = new Error(json?.error || `Erro na função ${name}`);
    err.status = res.status;
    throw err;
  }
  return { data: json };
}

export const base44 = {
  entities,
  auth: {
    me,
    updateMe,
    logout: (redirect) => signOut(typeof redirect === 'string' ? redirect : '/'),
    setToken: () => {},
  },
  functions: { invoke },
  integrations: {},
};
