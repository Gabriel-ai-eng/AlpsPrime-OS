// Compatibilidade: este módulo costumava exportar o cliente do Base44.
// O backend do Base44 não existe mais — agora o `base44` é um adaptador que
// usa o Supabase por baixo, mantendo a MESMA interface (base44.entities.*,
// base44.auth.me/updateMe/logout) para não quebrar os componentes existentes.
//
// As funções de servidor (base44.functions.invoke) ainda não foram migradas
// (Fase 3): por enquanto avisam no console e rejeitam, sem derrubar o app.
import { entities, me, updateMe } from '@/api/entitiesAdapter';
import { signOut } from '@/lib/auth';

export const base44 = {
  entities,
  auth: {
    me,
    updateMe,
    logout: (redirect) => signOut(typeof redirect === 'string' ? redirect : '/'),
    setToken: () => {},
  },
  functions: {
    invoke: async (name) => {
      console.warn(`[base44.functions] "${name}" ainda não foi migrado para o Supabase (Fase 3).`);
      const err = new Error(`Função "${name}" indisponível (migração para Supabase pendente).`);
      err.code = 'FUNCTION_NOT_MIGRATED';
      throw err;
    },
  },
  integrations: {},
};
