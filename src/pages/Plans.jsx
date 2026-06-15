import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Crown, Zap, Loader2, CreditCard, QrCode, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { getProPricing } from '@/lib/planPricing';

const proPricing = getProPricing();

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'mês',
    icon: Zap,
    features: [
      'Até 10 posts por dia',
      'Acesso ao Sextou',
      'Direito à votação',
      'Criar um Time',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: proPricing.price,
    originalPrice: proPricing.originalPrice,
    promoLabel: proPricing.promoLabel,
    period: 'mês',
    icon: Sparkles,
    features: [
      'Todos os benefícios do Plano Free',
      'Até 50 posts por dia',
      'Selo de verificado azul ao lado do nome em todo o app',
      'Perfil em destaque na aba Explorar (tag "Em Destaque" azul)',
      'Analytics Profundo do Perfil — veja quem visitou seu perfil, quanto tempo ficou, de onde veio e qual post atraiu mais visitas',
      'Modo Fantasma — visite perfis e veja posts sem aparecer na lista de visualizações',
    ],
    highlighted: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 99.90,
    period: 'mês',
    icon: Crown,
    features: [
      'Todos os benefícios do Plano Pro',
      'Posts ilimitados por dia',
      'Selo de verificado dourado (mais raro que o azul)',
      'Topo absoluto do Explorar com tag "Unlimited" dourada',
      'Suporte prioritário via chat (resposta em até 2h)',
      'Aura exclusiva: brilho dourado animado na foto de perfil',
      'Perfil Traduzido Automaticamente — seu conteúdo é traduzido em tempo real para inglês, espanhol e outros idiomas, abrindo seu perfil para audiência global',
    ],
    highlighted: false,
  },
];

const PAYMENT_METHODS = [
  { icon: CreditCard, label: 'Cartão de crédito' },
  { icon: CreditCard, label: 'Cartão de débito' },
  { icon: QrCode,     label: 'Pix' },
  { icon: FileText,   label: 'Boleto' },
];

export default function Plans() {
  const { user } = useAuth();
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const handleSelect = (plan) => {
    if (user?.plan === plan.id || plan.price === 0) return;
    setCheckoutPlan(plan.id);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Pagamento realizado! Seu plano será ativado em instantes.', { duration: 6000 });
      window.history.replaceState({}, '', '/plans');
    } else if (params.get('canceled') === 'true') {
      toast.info('Pagamento cancelado.');
      window.history.replaceState({}, '', '/plans');
    }
  }, []);

  return (
    <div className="min-h-full">
      <AnimatePresence>
        {checkoutPlan && (
          <CheckoutModal
            planId={checkoutPlan}
            onClose={() => setCheckoutPlan(null)}
            onSuccess={() => setCheckoutPlan(null)}
          />
        )}
      </AnimatePresence>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative px-6 py-14 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 mb-6">
              <Sparkles className="w-3 h-3 text-gold" />
              <span className="text-xs uppercase tracking-widest text-gold">Planos Mensais</span>
            </div>
            <h1 className="font-display text-4xl lg:text-6xl tracking-tight leading-[1.05]">
              Escolha o plano <span className="gold-gradient italic">perfeito</span> para você
            </h1>
            <p className="text-muted-foreground mt-5 text-lg">
              Desbloqueie o poder total da IA. Cancele quando quiser.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isCurrent = user?.plan === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'relative rounded-2xl border p-8 flex flex-col',
                  plan.highlighted
                    ? 'border-gold/40 bg-gradient-to-b from-gold/5 to-transparent'
                    : 'border-border bg-card'
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                    Mais Popular
                  </div>
                )}

                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center mb-5',
                  plan.highlighted ? 'bg-gold text-background' : 'bg-muted text-gold'
                )}>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                <h3 className="font-display text-2xl tracking-tight">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Renovação mensal automática</p>

                <div className="mb-6">
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground line-through">
                        R${plan.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-destructive/20 text-destructive border border-destructive/30">
                        {plan.promoLabel}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-semibold">
                      {plan.price === 0 ? 'Grátis' : `R$${plan.price.toFixed(2).replace('.', ',')}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground text-sm">/mês</span>
                    )}
                  </div>
                  {plan.id === 'unlimited' && (
                    <p className="text-xs text-gold mt-1">Posts ilimitados</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                        plan.highlighted ? 'bg-gold text-background' : 'bg-muted text-gold'
                      )}>
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </div>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelect(plan)}
                  disabled={isCurrent || plan.price === 0}
                  className={cn(
                    'h-12 font-semibold',
                    plan.highlighted
                      ? 'bg-gradient-to-r from-gold-light via-gold to-gold-dark hover:opacity-90 text-background'
                      : 'bg-card border border-border hover:border-gold/40 hover:bg-gold/5'
                  )}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {isCurrent || plan.price === 0 ? 'Plano Atual' : `Assinar ${plan.name}`}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <p className="text-center text-sm font-medium text-muted-foreground mb-5 uppercase tracking-widest text-xs">
            Formas de pagamento aceitas
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {PAYMENT_METHODS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gold" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground/60 mt-5">
            Pagamentos processados com segurança via Mercado Pago · Cancele a qualquer momento
          </p>
        </motion.div>
      </div>
    </div>
  );
}