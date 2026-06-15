import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, RefreshCcw, LogOut, Lock } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';
import { motion } from 'framer-motion';

/**
 * Bloqueia o app até que o usuário logado tenha comprado o acesso na Hotmart.
 * - Consulta `checkMyAccess` no backend
 * - Se liberado, renderiza `children`
 * - Caso contrário, mostra paywall com CTA pra Hotmart e botão "Já comprei"
 */
export default function HotmartGate({ userEmail, children }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [rechecking, setRechecking] = useState(false);

  const check = async () => {
    try {
      const res = await base44.functions.invoke('checkMyAccess', {});
      const data = res?.data || {};
      setHasAccess(!!data.hasAccess);
      setCheckoutUrl(data.checkoutUrl || '');
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

  if (loading) {
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

  const handleBuy = () => {
    if (!checkoutUrl) return;
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

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
            <span className="gold-gradient font-bold">Acesso restrito</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Sexta-feira agora é um produto exclusivo. Adquira seu acesso vitalício por apenas <strong className="text-foreground">R$ 19,90</strong> e libere todos os recursos imediatamente.
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
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleBuy}
            disabled={!checkoutUrl}
            className="w-full mt-7 h-12 bg-gradient-to-r from-gold-light via-gold to-gold-dark hover:opacity-90 text-background font-semibold text-base"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Comprar acesso por R$ 19,90
          </Button>

          <button
            onClick={handleRecheck}
            disabled={rechecking}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {rechecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            Já comprei — verificar novamente
          </button>

          <p className="mt-5 text-[11px] text-muted-foreground leading-relaxed">
            Sua compra é processada pela Hotmart. Use o mesmo e-mail da sua conta <strong className="text-foreground">{userEmail}</strong> na hora de comprar para que o acesso seja liberado automaticamente.
          </p>

          <button
            onClick={() => base44.auth.logout()}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-3 h-3" /> Sair da conta
          </button>
        </div>
      </motion.div>
    </div>
  );
}