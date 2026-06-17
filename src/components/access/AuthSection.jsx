import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, Lock, User, ArrowLeft, Loader2, KeyRound, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';

// Checkout da Hotmart (mesmo usado no Welcome/HotmartGate).
const CHECKOUT_URL = 'https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh';

// Extrai uma mensagem amigável do erro da API do Base44.
function msgErro(e) {
  const d = e?.response?.data || e?.data || {};
  const raw = d.detail || d.message || e?.message || '';
  if (/incorrect|invalid cred|unauthorized|401/i.test(raw)) return 'E-mail ou senha incorretos.';
  if (/already|exists|registered/i.test(raw)) return 'Este e-mail já tem uma conta. Tente entrar.';
  if (/otp|code|token/i.test(raw)) return 'Código inválido ou expirado.';
  return raw || 'Não foi possível concluir. Tente novamente.';
}

/**
 * Seção de Cadastro/Login dentro do app (e-mail + senha).
 */
export default function AuthSection({ onClose }) {
  const [mode, setMode] = useState('login');   // 'login' | 'register' | 'forgot'
  const [step, setStep] = useState('form');     // 'form' | 'otp' | 'reset'
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
    try {
      const res = await base44.functions.invoke('checkEmailAccess', { email: cleanEmail() });
      if (res?.data && res.data.hasAccess === false) {
        setError('Este e-mail ainda não tem acesso. Use o mesmo e-mail da sua compra na Hotmart — só ele libera o cadastro/login.');
        setNoAccess(true);
        return false;
      }
      setNoAccess(false);
      return true;
    } catch {
      return true;
    }
  };

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      if (!(await ensureAccess())) { setLoading(false); return; }
      await base44.auth.loginViaEmailPassword(cleanEmail(), password);
      goFeed();
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      if (!(await ensureAccess())) { setLoading(false); return; }
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

  const handleForgotRequest = async () => {
    setLoading(true); setError('');
    try {
      await base44.auth.resetPasswordRequest(cleanEmail());
      setStep('reset');
      setInfo('Enviamos as instruções para o seu e-mail. Cole o código recebido e defina a nova senha.');
      setLoading(false);
    } catch (e) { setError(msgErro(e)); setLoading(false); }
  };

  const handleResetPassword = async () => {
    setLoading(true); setError('');
    try {
      await base44.auth.resetPassword({ resetToken: resetToken.trim(), newPassword });
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

  // BUG 2 RESOLVIDO: O comando autofill agora não substitui as cores originais
  const inputBase =
    'w-full h-12 pl-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-gold/50 focus:bg-white/[0.07] transition-all [&:-webkit-autofill]:[transition-delay:9999s] [&:-webkit-autofill]:[-webkit-text-fill-color:white] relative z-10';
  const inputCls = `${inputBase} pr-3`;
  const inputPw = `${inputBase} pr-11`;

  // BUG 1 RESOLVIDO: Ícone do olho maior (w-5 h-5), cor mais nítida (text-white/70)
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
    // BUG 3 RESOLVIDO: Adicionado 'overflow-x-hidden' para matar a rolagem lateral 
    <div className="fixed inset-0 z-[100000] bg-background flex items-center justify-center px-4 py-8 overflow-y-auto overflow-x-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={onClose}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-card/95 backdrop-blur-xl border border-gold/20 rounded-3xl p-7 shadow-2xl shadow-gold/10 relative z-20">
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
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
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
                <User className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 z-20" />
                <input className={inputCls} placeholder="Seu nome" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
              </div>
            )}

            {step === 'form' && (
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 z-20" />
                <input className={inputCls} type="email" placeholder="E-mail" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (noAccess) { setNoAccess(false); setError(''); } }}
                  autoComplete="email" required />
              </div>
            )}

            {step === 'form' && mode !== 'forgot' && (
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 z-20" />
                <input className={inputPw} type={showPw ? 'text' : 'password'} placeholder="Senha" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
                <EyeToggle shown={showPw} onToggle={() => setShowPw((v) => !v)} />
              </div>
            )}

            {step === 'otp' && (
              <div className="relative">
                <KeyRound className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 z-20" />
                <input className={`${inputCls} tracking-[0.3em] text-center`} inputMode="numeric"
                  placeholder="Código do e-mail" value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)} />
              </div>
            )}

            {mode === 'forgot' && step === 'reset' && (
              <>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 z-20" />
                  <input className={inputCls} placeholder="Código recebido por e-mail" value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)} />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 z-20" />
                  <input className={inputPw} type={showNewPw ? 'text' : 'password'} placeholder="Nova senha" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required />
                  <EyeToggle shown={showNewPw} onToggle={() => setShowNewPw((v) => !v)} />
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-400 px-1">{error}</p>}
            {info && !error && <p className="text-xs text-emerald-400 px-1">{info}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl text-background font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 relative z-20"
              style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {botao}
            </button>

            {noAccess && (
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl text-background font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity relative z-20"
                style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
              >
                <ShoppingBag className="w-4 h-4" /> Comprar acesso
              </a>
            )}

            {step === 'form' && mode === 'login' && (
              <button type="button" onClick={() => reset('forgot')}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-1 relative z-20">
                Esqueci minha senha
              </button>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => reset('login')}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-1 relative z-20">
                Voltar para o login
              </button>
            )}
            {step === 'otp' && (
              <button type="button" onClick={handleResend}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-1 relative z-20">
                Reenviar código
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}