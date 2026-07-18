import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase para o FRONTEND.
// Defina no Vercel (Project → Settings → Environment Variables):
//   VITE_SUPABASE_URL       → URL do projeto Supabase (ex.: https://xxxx.supabase.co)
//   VITE_SUPABASE_ANON_KEY  → chave "anon public" (NUNCA a service_role no frontend!)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Não quebra o build; apenas avisa. Sem essas variáveis o login não funciona.
  console.error(
    '[Supabase] Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. ' +
      'Defina-as nas Environment Variables do Vercel e refaça o deploy.'
  );
}

// Diagnóstico: usados pelo rastreador na tela de login para mostrar o estado.
export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);
export const SUPABASE_URL_SET = Boolean(supabaseUrl);
export const SUPABASE_KEY_SET = Boolean(supabaseAnonKey);
export const SUPABASE_HOST = (() => {
  try { return new URL(supabaseUrl).host; } catch { return null; }
})();

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'missing-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Mapeia o usuário do Supabase Auth para o formato que o app espera
// (mesmos campos que vinham do Base44: email, full_name, role, etc.).
export function mapSupabaseUser(u) {
  if (!u) return null;
  const meta = u.user_metadata || {};
  const appMeta = u.app_metadata || {};
  return {
    id: u.id,
    email: u.email,
    full_name: meta.full_name || meta.name || '',
    avatar: meta.avatar_url || meta.avatar || '',
    role: appMeta.role || meta.role || 'user',
    plan: meta.plan || 'free',
    // Provedor de login usado ('google', 'email', etc.) — o HotmartGate usa
    // isso pra saber se pode mandar direto pro checkout da Hotmart quando o
    // e-mail do Google não tem acesso pago (não dá pra checar ANTES, como no
    // login manual, porque só se sabe o e-mail depois que o Google devolve).
    provider: appMeta.provider || 'email',
    ...meta,
  };
}
