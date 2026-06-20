import React, { useState } from 'react';
import {
  hasPaidAccess,
  signInWithPassword,
  signUp,
  verifySignupOtp,
  resendSignupOtp,
  requestPasswordReset,
  resetPasswordWithCode,
} from '@/lib/auth';
import { Mail, Lock, User, ArrowLeft, Loader2, KeyRound, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';

// Checkout da Hotmart (mesmo usado no Welcome/HotmartGate).
const CHECKOUT_URL = 'https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh';

// Extrai uma mensagem amigável do erro do Supabase Auth.
function msgErro(e) {
  const raw = e?.message || e?.error_description || '';
  if (/invalid login|invalid cred|wrong password|incorrect|401/i.test(raw)) return 'E-mail ou senha incorretos.';
  if (/already registered|already exists|user already/i.test(raw)) return 'Este e-mail já tem uma conta. Tente entrar.';
  if (/otp|code|token|expired|invalid/i.test(raw)) return 'Código inválido ou expirado.';
  if (/password.*(6|short|least)/i.test(raw)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/email.*confirm|not confirmed/i.test(raw)) return 'Confirme seu e-mail antes de entrar.';
  return raw || 'Não foi possível concluir. Tente novamente.';
}

export default function AuthSection({ onClose }) {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [noAccess, setNoAccess] = useState(false);

  const goFeed = () => window.location.assign('/feed');
  const cleanEmail = () => email.trim().toLowerCase();
  const reset = (m) => { setMode(m); setStep('form'); setError(''); setInfo(''); setNoAccess(false); };

  const ensureAccess = async () => {
    const ok = await hasPaidAccess(cleanEmail());
    if (ok) { setNoAccess(false); return true; }
    setError('Este e-mail ainda não tem acesso. Use o mesmo e-mail da compra na Hotmart — só ele libera o cadastro/login.');
    setNoAccess(true);
    return false;
  };

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      if (!(await ensureAccess())) { setLoading(false); return; }
      await signInWithPassword(cleanEmail(), password);
      goFeed();
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      if (!(await ensureAccess())) { setLoading(false); return; }
      const res = await signUp(cleanEmail(), password, fullName.trim());
      // Se a confirmação de e-mail estiver desligada no Supabase, já vem sessão.
      if (res?.session) { goFeed(); return; }
      setStep('otp');
      setInfo('Enviamos um código de confirmação para o seu e-mail.');
      setLoading(false);
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const handleVerify = async () => {
    setLoading(true); setError('');
    try {
      await verifySignupOtp(cleanEmail(), otpCode.trim());
      goFeed();
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const handleResend = async () => {
    setError(''); setInfo('');
    try {
      await resendSignupOtp(cleanEmail());
      setInfo('Código reenviado. Verifique seu e-mail.');
    } catch (e) { setError(msgErro(e)); }
  };

  const handleForgotRequest = async () => {
    setLoading(true); setError('');
    try {
      await requestPasswordReset(cleanEmail());
      setStep('reset');
      setInfo('Enviamos as instruções para o seu e-mail. Cole o código recebido e defina a nova senha.');
      setLoading(false);
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const handleResetPassword = async () => {
    setLoading(true); setError('');
    try {
      await resetPasswordWithCode(cleanEmail(), resetToken.trim(), newPassword);
      setPassword(''); setNewPassword(''); setResetToken('');
      reset('login');
      setInfo('Senha redefinida! Agora é só entrar com a nova senha.');
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const submit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (step === 'otp') return handleVerify();
    if (mode === 'forgot') return step === 'reset' ? handleResetPassword() : handleForgotRequest();
    return mode === 'login' ? handleLogin() : handleRegister();
  };

  const titulo =
    step === 'otp' ? 'Confirme seu e-mail'
    : mode === 'forgot' ? 'Recuperar senha'
    : mode === 'login' ? 'Entrar' : 'Criar conta';

  const botao =
    step === 'otp' ? 'Confirmar código'
    : mode === 'forgot' ? (step === 'reset' ? 'Redefinir senha' : 'Enviar instruções')
    : mode === 'login' ? 'Entrar' : 'Criar conta';

  // CORREÇÃO: Fundo cinza suave (#3f3f46) no preenchimento e cursor forçado na cor branca (caret-white)
  const inputBase =
    'w-full h-12 pl-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-gold/50 focus:bg-white/[0.07] transition-all relative z-10 caret-white [&:-webkit-autofill]:[box-shadow:0_0_0_40px_#3f3f46_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]';
  const inputCls = `${inputBase} pr-3`;
  const inputPw = `${inputBase} pr-11`;

  const EyeToggle = ({ shown, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={shown ? 'Ocultar senha' : 'Mostrar senha'}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-20"
    >
      {shown ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100000] bg-[#0B0B0C] flex items-center justify-center px-4 py-8 overflow-y-auto overflow-x-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={onClose}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-[#161618]/95 backdrop-blur-xl border border-gold/20 rounded-3xl p-7 shadow-2xl shadow-gold/10 relative z-20">
          <div className="flex flex-col items-center mb-6">
            <img src={LOGO_URL} alt="Sexta-feira" className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-gold/20" />
            <h1 className="mt-4 text-xl font-semibold text-white">{titulo}</h1>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Use o mesmo e-mail da sua compra na Hotmart.
            </p>
          </div>

          {step === 'form' && mode !== 'forgot' && (
            <div className="flex p-1 mb-5 rounded-xl bg-white/5 border border-white/10 relative z-10">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => reset(m)}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors outline-none ${
                    mode === m ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="space-y-3 relative z-10">
            {step === 'form' && mode === 'register' && (
              <div className="relative">
                <User className="w-5 h-5 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                <input
                  className={inputCls}
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            {step === 'form' && (
              <div className="relative">
                <Mail className="w-5 h-5 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                <input
                  className={inputCls}
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (noAccess) { setNoAccess(false); setError(''); } }}
                  autoComplete="email"
                  required
                />
              </div>
            )}

            {step === 'form' && mode !== 'forgot' && (
              <div className="relative">
                <Lock className="w-5 h-5 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                <input
                  className={inputPw}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <EyeToggle shown={showPw} onToggle={() => setShowPw((v) => !v)} />
              </div>
            )}

            {step === 'otp' && (
              <div className="relative">
                <KeyRound className="w-5 h-5 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                <input
                  className={`${inputCls} tracking-[0.3em] text-center`}
                  inputMode="numeric"
                  placeholder="Código do e-mail"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
              </div>
            )}

            {mode === 'forgot' && step === 'reset' && (
              <>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                  <input
                    className={inputCls}
                    placeholder="Código recebido por e-mail"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                  <input
                    className={inputPw}
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="Nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <EyeToggle shown={showNewPw} onToggle={() => setShowNewPw((v) => !v)} />
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-400 px-1 pt-1">{error}</p>}
            {info && !error && <p className="text-xs text-emerald-400 px-1 pt-1">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-background font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 relative z-20 mt-2 outline-none"
              style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {botao}
            </button>

            {noAccess && (
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl text-background font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity relative z-20 outline-none"
                style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
              >
                <ShoppingBag className="w-4 h-4" /> Comprar acesso
              </a>
            )}

            {step === 'form' && mode === 'login' && (
              <button
                type="button"
                onClick={() => reset('forgot')}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 relative z-20 outline-none"
              >
                Esqueci minha senha
              </button>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => reset('login')}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 relative z-20 outline-none"
              >
                Voltar para o login
              </button>
            )}

            {step === 'otp' && (
              <button
                type="button"
                onClick={handleResend}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 relative z-20 outline-none"
              >
                Reenviar código
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}