import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ShoppingCart, LogIn, Sparkles, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

// URL do checkout da Eduzz — altere conforme o seu produto
const EDUZZ_CHECKOUT_URL = "https://eduzz.com/checkout/seu-produto";

const FEATURES = [
  "Acesso completo à plataforma",
  "Todas as ferramentas de IA",
  "Feed social ilimitado",
  "Suporte prioritário",
  "Atualizações gratuitas",
];

export default function PaywallScreen({ user, onRefresh }) {
  const handleBuy = () => {
    window.open(EDUZZ_CHECKOUT_URL, '_blank');
  };

  const handleCheckAccess = async () => {
    await onRefresh?.();
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 text-center border-b border-border">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Acesso Premium</h1>
            <p className="text-muted-foreground text-sm">
              Olá, <span className="text-foreground font-medium">{user?.full_name || user?.email}</span>!
              <br />Seu acesso ainda não foi liberado.
            </p>
          </div>

          {/* Price */}
          <div className="px-8 pt-6 text-center">
            <div className="inline-flex items-baseline gap-1 mb-1">
              <span className="text-sm text-muted-foreground">R$</span>
              <span className="font-display text-5xl font-bold text-foreground">19</span>
              <span className="font-display text-3xl font-bold text-foreground">,90</span>
            </div>
            <p className="text-xs text-muted-foreground">pagamento único • acesso vitalício</p>
          </div>

          {/* Features */}
          <div className="px-8 py-5 space-y-2.5">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-8 pb-8 space-y-3">
            <Button
              onClick={handleBuy}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Comprar acesso por R$ 19,90
            </Button>

            <Button
              variant="outline"
              onClick={handleCheckAccess}
              className="w-full h-11 gap-2 text-sm"
            >
              <LogIn className="w-4 h-4" />
              Já comprei — verificar acesso
            </Button>

            <button
              onClick={handleLogout}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Sair / trocar conta
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Após a compra, clique em "Já comprei" para atualizar seu acesso.
        </p>
      </motion.div>
    </div>
  );
}