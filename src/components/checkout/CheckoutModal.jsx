import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, CreditCard, FileText, Sparkles, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import PixPayment from './PixPayment';
import CardPayment from './CardPayment';
import BoletoPayment from './BoletoPayment';
import { getProPricing } from '@/lib/planPricing';

const proPricing = getProPricing();
const proPriceLabel = `R$ ${proPricing.price.toFixed(2).replace('.', ',')}/mês`;

const PLAN_INFO = {
  pro: { name: 'Pro', price: proPriceLabel, icon: Sparkles, color: 'from-gold-light to-gold-dark' },
  unlimited: { name: 'Unlimited', price: 'R$ 99,90/mês', icon: Crown, color: 'from-purple-400 to-violet-600' },
};

const TABS = [
  { id: 'pix', label: 'Pix', icon: QrCode },
  { id: 'card', label: 'Cartão', icon: CreditCard },
  { id: 'boleto', label: 'Boleto', icon: FileText },
];

export default function CheckoutModal({ planId, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('pix');
  const plan = PLAN_INFO[planId];
  if (!plan) return null;
  const PlanIcon = plan.icon;

  const handleSuccess = () => {
    setTimeout(() => {
      onSuccess?.();
      onClose?.();
      window.location.reload();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md bg-card border border-gold/20 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-border">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-gold/8 rounded-full blur-[80px] pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br', plan.color)}>
              <PlanIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Assinar plano</p>
              <h2 className="font-display text-xl leading-tight">{plan.name} <span className="text-muted-foreground font-light text-base">· {plan.price}</span></h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative',
                activeTab === id
                  ? 'text-gold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'pix' && <PixPayment planId={planId} onSuccess={handleSuccess} />}
              {activeTab === 'card' && <CardPayment planId={planId} onSuccess={handleSuccess} />}
              {activeTab === 'boleto' && <BoletoPayment planId={planId} onSuccess={handleSuccess} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}