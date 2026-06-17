import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, Lock, User, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';

// Extrai uma mensagem amigável do erro da API do Base44.
function msgErro(e) {
  const d = e?.response?.data || e?.data || {};
  const raw = d.detail || d.message || e?.message || '';
  if (/incorrect|invalid cred|unauthorized|401/i.test(raw)) return 'E-mail ou senha incorretos.';
  if (/already|exists|registered/i.test(raw)) return 'Este e-mail já tem uma conta. Tente entrar.';
  if (/otp|code/i.test(raw)) return 'Código inválido ou expirado.';
  return raw || 'Não foi possível concluir. Tente novamente.';
}

/**
 * Seção de Cadastro/Login dentro do app (e-mail + senha), usando a API de auth do
 * Base44 (funciona pelo /api proxied, sem depender de subdomínio). Após autenticar,
 * o HotmartGate ainda valida se o e-mail comprou o acesso.
 */
export default function AuthSection({ onClose }) {
  const [mode, setMode] = useState('login');   // 'login' | 'register'
  const [step, setStep] = useState('form');     // 'form' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const goFeed = () => window.location.assign('/feed');
  const cleanEmail = () => email.trim().toLowerCase();

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      await base44.auth.loginViaEmailPassword(cleanEmail(), password);
      goFeed();
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      const res = await base44.auth.register({
        email: cleanEmail(),
        password,
        full_name: fullName.trim(),
      });
      if (res?.access_token) { base44.auth.setToken(res.access_token); goFeed(); return; }
      setStep('otp');
      setInfo('Enviamos um código de confirmação para o seu e-mail.');
      setLoading(false);
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const handleVerify = async () => {
    setLoading(true); setError('');
    try {
      const res = await base44.auth.verifyOtp({ email: cleanEmail(), otpCode: otpCode.trim() });
      if (res?.access_token) base44.auth.setToken(res.access_token);
      goFeed();
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const handleResend = async () => {
    setError(''); setInfo('');
    try {
      await base44.auth.resendOtp(cleanEmail());
      setInfo('Código reenviado. Verifique seu e-mail.');
    } catch (e) { setError(msgErro(e)); }
  };

  const submit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (step === 'otp') return handleVerify();
    return mode === 'login' ? handleLogin() : handleRegister();
  };

  const inputCls =
    'w-full h-12 pl-11 pr-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-gold/50 focus:bg-white/[0.07] transition-colors';

  return (
    <div className="fixed inset-0 z-[100000] bg-background flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={onClose}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-card/95 backdrop-blur-xl border border-gold/20 rounded-3xl p-7 shadow-2xl shadow-gold/10">
          <div className="flex flex-col items-center mb-6">
            <img src={LOGO_URL} alt="Sexta-feira" className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-gold/20" />
            <h1 className="mt-4 text-xl font-semibold text-white">
              {step === 'otp' ? 'Confirme seu e-mail' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Use o mesmo e-mail da sua compra na Hotmart.
            </p>
          </div>

          {/* Abas login/cadastro (ocultas na etapa de código) */}
          {step === 'form' && (
            <div className="flex p-1 mb-5 rounded-xl bg-white/5 border border-white/10">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
                    mode === m ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            {step === 'form' && mode === 'register' && (
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input className={inputCls} placeholder="Seu nome" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
              </div>
            )}

            {step === 'form' && (
              <>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input className={inputCls} type="email" placeholder="E-mail" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input className={inputCls} type="password" placeholder="Senha" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
                </div>
              </>
            )}

            {step === 'otp' && (
              <div className="relative">
                <KeyRound className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input className={`${inputCls} tracking-[0.3em] text-center`} inputMode="numeric"
                  placeholder="Código do e-mail" value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)} />
              </div>
            )}

            {error && <p className="text-xs text-red-400 px-1">{error}</p>}
            {info && !error && <p className="text-xs text-emerald-400 px-1">{info}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl text-background font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {step === 'otp' ? 'Confirmar código' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>

            {step === 'otp' && (
              <button type="button" onClick={handleResend}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-1">
                Reenviar código
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
