import React, { useState } from 'react';
import {
  hasPaidAccess,
  signInWithPassword,
  signUp,
  signInWithGoogle,
  verifySignupOtp,
  resendSignupOtp,
  requestPasswordReset,
  resetPasswordWithCode,
} from '@/lib/auth';
import { Mail, Lock, User, ArrowLeft, Loader2, KeyRound, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';
import { useT } from '@/lib/i18n';

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
  const t = useT();
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

  const goFeed = () => window.location.assign('/home');
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

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      // Redireciona para o Google e volta já autenticado. O paywall é aplicado
      // no retorno pelo HotmartGate (só entra quem pagou na Hotmart).
      await signInWithGoogle();
      // Em caso de sucesso o navegador já saiu desta página (redirect).
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

  // Inputs claros: fundo cinza bem suave, texto escuro, foco em dourado.
  const inputBase =
    'w-full h-12 pl-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 outline-none focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition-all relative z-10 caret-gray-900 [&:-webkit-autofill]:[box-shadow:0_0_0_40px_#f9fafb_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]';
  const inputCls = `${inputBase} pr-3`;
  const inputPw = `${inputBase} pr-11`;

  const EyeToggle = ({ shown, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={shown ? t('Ocultar senha') : t('Mostrar senha')}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors z-20"
    >
      {shown ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100000] bg-white flex flex-col px-6 pt-6 pb-10 overflow-y-auto overflow-x-hidden">
      <button
        onClick={onClose}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors outline-none self-start"
      >
        <ArrowLeft className="w-4 h-4" /> {t('Voltar')}
      </button>

      <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto">
        <div className="relative z-20">
          <div className="flex flex-col items-center mb-8">
            <img src={LOGO_URL} alt="Alps Prime" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
            <h1 className="mt-5 text-2xl font-semibold text-gray-900">{t(titulo)}</h1>
            <p className="text-sm text-gray-500 mt-1.5 text-center">
              {t('Use o mesmo e-mail da sua compra na Hotmart.')}
            </p>
          </div>

          {step === 'form' && mode !== 'forgot' && (
            <div className="flex p-1 mb-5 rounded-xl bg-gray-100 border border-gray-200 relative z-10">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => reset(m)}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all outline-none ${
                    mode === m ? 'bg-white text-gold shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {m === 'login' ? t('Entrar') : t('Criar conta')}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="space-y-3 relative z-10">
            {step === 'form' && mode === 'register' && (
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                <input
                  className={inputCls}
                  placeholder={t('Seu nome')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            {step === 'form' && (
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                <input
                  className={inputCls}
                  type="email"
                  placeholder={t('E-mail')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (noAccess) { setNoAccess(false); setError(''); } }}
                  autoComplete="email"
                  required
                />
              </div>
            )}

            {step === 'form' && mode !== 'forgot' && (
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                <input
                  className={inputPw}
                  type={showPw ? 'text' : 'password'}
                  placeholder={t('Senha')}
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
                <KeyRound className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                <input
                  className={`${inputCls} tracking-[0.3em] text-center`}
                  inputMode="numeric"
                  placeholder={t('Código do e-mail')}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
              </div>
            )}

            {mode === 'forgot' && step === 'reset' && (
              <>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                  <input
                    className={inputCls}
                    placeholder={t('Código recebido por e-mail')}
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                  <input
                    className={inputPw}
                    type={showNewPw ? 'text' : 'password'}
                    placeholder={t('Nova senha')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <EyeToggle shown={showNewPw} onToggle={() => setShowNewPw((v) => !v)} />
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-500 px-1 pt-1">{t(error)}</p>}
            {info && !error && <p className="text-xs text-emerald-600 px-1 pt-1">{t(info)}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 relative z-20 mt-2 outline-none"
              style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t(botao)}
            </button>

            {step === 'form' && mode !== 'forgot' && (
              <>
                {/* Divisor "ou" */}
                <div className="flex items-center gap-3 py-1">
                  <span className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{t('ou')}</span>
                  <span className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Continuar com o Google: mesmo que criar conta com e-mail/senha.
                    O paywall vale igual — no retorno, o HotmartGate só libera
                    quem já pagou na Hotmart. */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-60 relative z-20 outline-none"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  {t('Continuar com o Google')}
                </button>
              </>
            )}

            {noAccess && (
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity relative z-20 outline-none"
                style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
              >
                <ShoppingBag className="w-4 h-4" /> {t('Comprar acesso')}
              </a>
            )}

            {step === 'form' && mode === 'login' && (
              <button
                type="button"
                onClick={() => reset('forgot')}
                className="w-full text-xs text-gray-500 hover:text-gray-900 transition-colors pt-2 relative z-20 outline-none"
              >
                {t('Esqueci minha senha')}
              </button>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => reset('login')}
                className="w-full text-xs text-gray-500 hover:text-gray-900 transition-colors pt-2 relative z-20 outline-none"
              >
                {t('Voltar para o login')}
              </button>
            )}

            {step === 'otp' && (
              <button
                type="button"
                onClick={handleResend}
                className="w-full text-xs text-gray-500 hover:text-gray-900 transition-colors pt-2 relative z-20 outline-none"
              >
                {t('Reenviar código')}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}