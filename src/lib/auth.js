import { supabase, SUPABASE_CONFIGURED, SUPABASE_HOST, SUPABASE_URL_SET, SUPABASE_KEY_SET } from '@/api/supabaseClient';
import { ADMIN_EMAILS } from '@/lib/branding';

/**
 * Camada de autenticação baseada no Supabase Auth.
 * Substitui o antigo base44.auth.* (o backend do Base44 não existe mais).
 */

const clean = (email) => (email || '').trim().toLowerCase();

export const isAdminEmail = (email) =>
  ADMIN_EMAILS.map((x) => x.toLowerCase()).includes(clean(email));

// --- Acesso pago (tabela acessos_pagos, preenchida pelo webhook da Hotmart) ---
// Admin entra sempre. Caso contrário, consulta a função RPC `tem_acesso`
// (SECURITY DEFINER) que devolve só true/false para um e-mail.
export async function hasPaidAccess(email) {
  const e = clean(email);
  if (!e) return false;
  if (isAdminEmail(e)) return true;
  const { data, error } = await supabase.rpc('tem_acesso', { p_email: e });
  if (error) {
    console.error('[acesso] erro ao consultar tem_acesso:', error.message);
    return false;
  }
  return data === true;
}

/**
 * Diagnóstico do acesso — usado pelo RASTREADOR na tela de login.
 * Retorna cada etapa para mostrar EXATAMENTE onde está falhando.
 */
export async function diagnoseAccess(email) {
  const e = clean(email);
  const info = {
    email: e,
    supabaseConfigured: SUPABASE_CONFIGURED,
    urlSet: SUPABASE_URL_SET,
    keySet: SUPABASE_KEY_SET,
    supabaseHost: SUPABASE_HOST,
    isAdmin: isAdminEmail(e),
    rpcOk: null,        // true/false retornado pela função tem_acesso
    rpcError: null,     // mensagem de erro, se houver
    allowed: false,     // resultado final (pode entrar?)
  };

  if (!e) { info.rpcError = 'E-mail vazio.'; return info; }

  // Admin entra sem depender do banco.
  if (info.isAdmin) { info.allowed = true; return info; }

  if (!SUPABASE_CONFIGURED) {
    info.rpcError = 'Supabase não configurado no app (faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY no Vercel + Redeploy).';
    return info;
  }

  try {
    const { data, error } = await supabase.rpc('tem_acesso', { p_email: e });
    if (error) { info.rpcError = error.message; return info; }
    info.rpcOk = data === true;
    info.allowed = data === true;
  } catch (err) {
    info.rpcError = err?.message || 'Falha ao conectar no Supabase.';
  }
  return info;
}

// --- Login / Cadastro ---
export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: clean(email),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email: clean(email),
    password,
    options: { data: { full_name: (fullName || '').trim() } },
  });
  if (error) throw error;
  // Se "Confirm email" estiver desligado no Supabase, já vem uma session aqui.
  return data;
}

// Código de 6 dígitos enviado por e-mail no cadastro (Supabase: verifyOtp).
export async function verifySignupOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: clean(email),
    token: (token || '').trim(),
    type: 'signup',
  });
  if (error) throw error;
  return data;
}

export async function resendSignupOtp(email) {
  const { error } = await supabase.auth.resend({ type: 'signup', email: clean(email) });
  if (error) throw error;
}

// --- Recuperação de senha (via código de recuperação) ---
export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(clean(email));
  if (error) throw error;
}

export async function resetPasswordWithCode(email, token, newPassword) {
  // 1) valida o código de recuperação (cria uma sessão temporária)
  const { error: vErr } = await supabase.auth.verifyOtp({
    email: clean(email),
    token: (token || '').trim(),
    type: 'recovery',
  });
  if (vErr) throw vErr;
  // 2) define a nova senha
  const { error: uErr } = await supabase.auth.updateUser({ password: newPassword });
  if (uErr) throw uErr;
}

// --- Sessão ---
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export async function signOut(redirectTo = '/') {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error('[auth] erro ao sair:', e?.message);
  }
  if (typeof window !== 'undefined') window.location.assign(redirectTo);
}
