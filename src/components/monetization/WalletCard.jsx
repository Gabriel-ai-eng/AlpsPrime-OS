import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp } from 'lucide-react';

export default function WalletCard({ balance, totalEarned, totalWithdrawn }) {
  const fmt = (v) =>
    (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 via-gold/5 to-transparent p-6"
    >
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-gold/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-3.5 h-3.5 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold">Carteira</span>
        </div>

        <p className="text-xs text-muted-foreground mb-1">Saldo disponível para saque</p>
        <div className="font-display text-5xl lg:text-6xl tracking-tight gold-gradient mb-4">
          {fmt(balance)}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat icon={TrendingUp} label="Total acumulado" value={fmt(totalEarned)} />
          <Stat icon={Wallet} label="Já sacado" value={fmt(totalWithdrawn)} />
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-background/60 backdrop-blur-sm border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-gold" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="font-display text-base">{value}</p>
    </div>
  );
}