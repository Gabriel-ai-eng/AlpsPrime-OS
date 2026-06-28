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
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';
import { useT } from '@/lib/i18n';

const CHECKOUT_URL = 'https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh';

function msgErro(e) {
  const raw = e?.message || e?.error_description || '';
  if (/invalid login|invalid cred|wrong password|incorrect|401/i.test(raw)) return 'E-mail ou senha incorretos.';
  if (/already registered|already exists|user already/i.test(raw)) return 'Este e-mail já tem uma conta. Tente entrar.';
  if (/otp|code|token|expired|invalid/i.test(raw)) return 'Código inválido ou expirado.';
  if (/password.*(6|short|least)/i.test(raw)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/email.*confirm|not confirmed/i.test(raw)) return 'Confirme seu e-mail antes de entrar.';
  return raw || 'Não foi possível concluir. Tente novamente.';
}

function Field({ icon: Icon, children }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-0 top-0 flex h-12 w-12 items-center justify-center text-black/45">
        <Icon className="h-4.5 w-4.5" />
      </div>
      {children}
    </div>
  );
}

function EyeToggle({ shown, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-black/45 transition hover:text-black focus:outline-none"
    >
      {shown ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
    </button>
  );
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

  const reset = (m) => {
    setMode(m);
    setStep('form');
    setError('');
    setInfo('');
    setNoAccess(false);
  };

  const ensureAccess = async () => {
    const ok = await hasPaidAccess(cleanEmail());
    if (ok) {
      setNoAccess(false);
      return true;
    }
    setError('Este e-mail ainda não tem acesso. Use o mesmo e-mail da compra na Hotmart.');
    setNoAccess(true);
    return false;
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (!(await ensureAccess())) {
        setLoading(false);
        return;
      }
      await signInWithPassword(cleanEmail(), password);
      goFeed();
    } catch (e) {
      setError(msgErro(e));
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      if (!(await ensureAccess())) {
        setLoading(false);
        return;
      }
      const res = await signUp(cleanEmail(), password, fullName.trim());
      if (res?.session) {
        goFeed();
        return;
      }
      setStep('otp');
      setInfo('Enviamos um código de confirmação para o seu e-mail.');
      setLoading(false);
    } catch (e) {
      setError(msgErro(e));
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await verifySignupOtp(cleanEmail(), otpCode.trim());
      goFeed();
    } catch (e) {
      setError(msgErro(e));
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await resendSignupOtp(cleanEmail());
      setInfo('Código reenviado. Verifique seu e-mail.');
    } catch (e) {
      setError(msgErro(e));
    }
  };

  const handleForgotRequest = async () => {
    setLoading(true);
    setError('');
    try {
      await requestPasswordReset(cleanEmail());
      setStep('reset');
      setInfo('Enviamos as instruções para o seu e-mail.');
      setLoading(false);
    } catch (e) {
      setError(msgErro(e));
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    try {
      await resetPasswordWithCode(cleanEmail(), resetToken.trim(), newPassword);
      setPassword('');
      setNewPassword('');
      setResetToken('');
      reset('login');
      setInfo('Senha redefinida. Agora é só entrar com a nova senha.');
    } catch (e) {
      setError(msgErro(e));
      setLoading(false);
    }
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
        : mode === 'login' ? 'Entrar'
          : 'Criar conta';

  const botao =
    step === 'otp' ? 'Confirmar código'
      : mode === 'forgot' ? (step === 'reset' ? 'Redefinir senha' : 'Enviar instruções')
        : mode === 'login' ? 'Entrar'
          : 'Criar conta';

  const inputBase =
    'w-full h-12 bg-transparent border-b border-black/12 pl-12 pr-12 text-[15px] text-black placeholder:text-black/35 outline-none transition focus:border-black/60';
  const inputPw = `${inputBase} pr-12`;
  const inputCls = inputBase;

  return (
    <div className="fixed inset-0 z-[100000] bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-5 sm:py-6">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm text-black/60 transition hover:text-black focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('Voltar')}
          </button>

          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-black/60 transition hover:text-black"
          >
            {t('Comprar acesso')}
            <ChevronRight className="h-4 w-4" />
          </a>
        </header>

        <main className="flex flex-1 items-center">
          <section className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <img src={LOGO_URL} alt="Alps OS" className="h-12 w-12 rounded-2xl object-cover" />

              <p className="mt-8 text-sm font-medium tracking-wide text-black/45">
                {t('Acesso privado')}
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                {t(titulo)}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-black/60 sm:text-lg">
                {t('Use o mesmo e-mail da compra na Hotmart para entrar, criar conta ou redefinir sua senha.')}
              </p>

              <div className="mt-10 space-y-4 border-t border-black/8 pt-8">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-black" />
                  <p className="text-sm leading-relaxed text-black/60">
                    {t('Uma interface clara, sem distrações, com foco na ação principal.')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-black" />
                  <p className="text-sm leading-relaxed text-black/60">
                    {t('Acesso, confirmação e recuperação organizados em um único fluxo.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:justify-self-end w-full max-w-xl">
              <div className="border-t border-black/10 pt-0">
                {step === 'form' && mode !== 'forgot' && (
                  <div className="mb-10 flex gap-8 border-b border-black/10 pb-4">
                    {['login', 'register'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => reset(m)}
                        className={`pb-3 text-sm font-medium transition ${
                          mode === m ? 'border-b-2 border-black text-black' : 'text-black/45 hover:text-black/70'
                        }`}
                      >
                        {m === 'login' ? t('Entrar') : t('Criar conta')}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                  {step === 'form' && mode === 'register' && (
                    <Field icon={User}>
                      <input
                        className={inputCls}
                        placeholder={t('Seu nome')}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                      />
                    </Field>
                  )}

                  {step === 'form' && (
                    <Field icon={Mail}>
                      <input
                        className={inputCls}
                        type="email"
                        placeholder={t('E-mail')}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (noAccess) {
                            setNoAccess(false);
                            setError('');
                          }
                        }}
                        autoComplete="email"
                        required
                      />
                    </Field>
                  )}

                  {step === 'form' && mode !== 'forgot' && (
                    <Field icon={Lock}>
                      <input
                        className={inputPw}
                        type={showPw ? 'text' : 'password'}
                        placeholder={t('Senha')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        required
                      />
                      <EyeToggle
                        shown={showPw}
                        onToggle={() => setShowPw((v) => !v)}
                        label={showPw ? t('Ocultar senha') : t('Mostrar senha')}
                      />
                    </Field>
                  )}

                  {step === 'otp' && (
                    <Field icon={KeyRound}>
                      <input
                        className={`${inputCls} tracking-[0.35em] text-center pl-12`}
                        inputMode="numeric"
                        placeholder={t('Código')}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </Field>
                  )}

                  {mode === 'forgot' && step === 'reset' && (
                    <>
                      <Field icon={KeyRound}>
                        <input
                          className={inputCls}
                          placeholder={t('Código recebido por e-mail')}
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                        />
                      </Field>

                      <Field icon={Lock}>
                        <input
                          className={inputPw}
                          type={showNewPw ? 'text' : 'password'}
                          placeholder={t('Nova senha')}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                        <EyeToggle
                          shown={showNewPw}
                          onToggle={() => setShowNewPw((v) => !v)}
                          label={showNewPw ? t('Ocultar senha') : t('Mostrar senha')}
                        />
                      </Field>
                    </>
                  )}

                  {error && <p className="text-sm text-red-600">{t(error)}</p>}
                  {info && !error && <p className="text-sm text-emerald-600">{t(info)}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 border border-black bg-black px-6 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t(botao)}
                  </button>

                  {noAccess && (
                    <a
                      href={CHECKOUT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 border border-black/15 px-6 text-sm font-medium text-black transition hover:bg-black/[0.03]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {t('Comprar acesso')}
                    </a>
                  )}

                  {step === 'form' && mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => reset('forgot')}
                      className="block text-sm text-black/45 transition hover:text-black/70"
                    >
                      {t('Esqueci minha senha')}
                    </button>
                  )}

                  {mode === 'forgot' && (
                    <button
                      type="button"
                      onClick={() => reset('login')}
                      className="block text-sm text-black/45 transition hover:text-black/70"
                    >
                      {t('Voltar para o login')}
                    </button>
                  )}

                  {step === 'otp' && (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="block text-sm text-black/45 transition hover:text-black/70"
                    >
                      {t('Reenviar código')}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-black/5 py-5 text-center">
          <p className="text-[11px] leading-relaxed text-black/35">
            {t('Versão Beta, ainda em aperfeiçoamento — podem ocorrer erros.')}
          </p>
        </footer>
      </div>
    </div>
  );
}