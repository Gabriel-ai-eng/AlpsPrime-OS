import React, { useEffect, useState } from 'react';
import { hasPaidAccess, signOut } from '@/lib/auth';
import { Loader2, ShoppingBag, RefreshCcw, LogOut, Lock } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';

// Checkout da Hotmart (mesmo usado no Welcome/AuthSection).
const CHECKOUT_URL = 'https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh';

/**
 * Bloqueia o app até que o usuário logado tenha comprado o acesso na Hotmart.
 * - Consulta `checkMyAccess` no backend
 * - Se liberado, renderiza `children`
 * - Caso contrário, mostra paywall com CTA pra Hotmart e botão "Já comprei"
 *
 * Login manual (e-mail/senha): o AuthSection já checa o acesso ANTES de criar
 * a sessão, então cair aqui sem acesso é um caso raro (ex.: reembolso depois
 * de já ter conta) — mostramos a tela "Acesso restrito" com o CTA de compra.
 *
 * Login com Google (`userProvider === 'google'`): não dá pra checar o e-mail
 * antes, porque só se sabe quem é depois que o Google devolve o usuário já
 * autenticado. Por isso, se o e-mail do Google não tiver acesso pago, manda
 * direto pro checkout da Hotmart (sem passar pela tela "Acesso restrito").
 */
export default function HotmartGate({ userEmail, userProvider, children }) {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [rechecking, setRechecking] = useState(false);

  const check = async () => {
    try {
      const ok = await hasPaidAccess(userEmail);
      setHasAccess(ok);
    } catch {
      setHasAccess(false);
    } finally {
      setLoading(false);
      setRechecking(false);
    }
  };

  useEffect(() => {
    if (!userEmail) return;
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  useEffect(() => {
    if (loading || hasAccess || rechecking) return;
    if (userProvider === 'google') {
      window.location.href = CHECKOUT_URL;
    }
  }, [loading, hasAccess, rechecking, userProvider]);

  // Carrega o widget de checkout da Hotmart (abre o checkout em overlay — checkoutMode=2)
  useEffect(() => {
    if (document.getElementById('hotmart-checkout-widget')) return;
    const script = document.createElement('script');
    script.id = 'hotmart-checkout-widget';
    script.src = 'https://static.hotmart.com/checkout/widget.min.js';
    document.head.appendChild(script);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
    document.head.appendChild(link);
  }, []);

  // Enquanto checa o acesso, ou enquanto redireciona uma conta Google sem
  // acesso pro checkout da Hotmart, mostra só o spinner (evita piscar a tela
  // "Acesso restrito" por uma fração de segundo antes do redirect).
  if (loading || (!hasAccess && userProvider === 'google')) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="Sexta-feira" className="w-12 h-12 rounded-xl shadow-xl shadow-gold/20 object-cover" />
          <Loader2 className="w-5 h-5 animate-spin text-gold" />
        </div>
      </div>
    );
  }

  if (hasAccess) return children;

  const handleRecheck = () => {
    setRechecking(true);
    check();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-5 py-10 bg-gradient-to-b from-background via-background to-gold/5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-7 shadow-xl shadow-gold/10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img src={LOGO_URL} alt="Sexta-feira" className="w-16 h-16 rounded-2xl object-cover" />
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold flex items-center justify-center ring-4 ring-background">
              <Lock className="w-3.5 h-3.5 text-background" />
            </span>
          </div>

          <h1 className="font-display text-3xl mt-5 tracking-tight">
            <span className="gold-gradient font-bold">{t('Acesso restrito')}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {t('Sexta-feira agora é um produto exclusivo. Adquira seu acesso vitalício por apenas ')}<strong className="text-foreground">R$ 19,90</strong>{t(' e libere todos os recursos imediatamente.')}
          </p>

          <div className="w-full mt-6 space-y-2.5 text-left">
            {[
              'Feed completo, Sextou, Cards e Votação',
              'Arena e comunidade exclusiva',
              'Mensagens diretas, ranking e conquistas',
              'Acesso vitalício — pagamento único',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[10px] flex-shrink-0">✓</span>
                <span className="text-muted-foreground">{t(item)}</span>
              </div>
            ))}
          </div>

          {/* Link real do checkout da Hotmart: o widget (quando carregado) abre em
              overlay; se o widget não interceptar, o link abre o checkout direto. */}
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hotmart-fb hotmart__button-checkout w-full mt-7 h-12 rounded-md hover:opacity-90 text-background font-semibold text-base flex items-center justify-center"
            style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {t('Comprar acesso por R$ 19,90')}
          </a>

          <button
            onClick={handleRecheck}
            disabled={rechecking}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {rechecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            {t('Já comprei — verificar novamente')}
          </button>

          <p className="mt-5 text-[11px] text-muted-foreground leading-relaxed">
            {t('Você entrou com ')}<strong className="text-foreground">{userEmail}</strong>{t(', mas esse e-mail ainda não tem acesso. Faça o cadastro/login com o ')}<strong className="text-foreground">{t('mesmo e-mail usado na compra da Hotmart')}</strong>{t(' — só ele libera a plataforma. Se ainda não comprou, use este mesmo e-mail no checkout para o acesso ser liberado automaticamente.')}
          </p>

          <button
            onClick={() => signOut()}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-3 h-3" /> {t('Sair da conta')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}