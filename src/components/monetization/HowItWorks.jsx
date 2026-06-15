import React from 'react';
import { Target, Coins, Wallet, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: Target,
    title: 'Cumpra metas',
    desc: 'Acesse a aba Metas e complete os desafios disponíveis. Cada meta tem suas próprias regras.',
  },
  {
    icon: Coins,
    title: 'Receba R$ 1,00 por meta',
    desc: 'Para cada meta concluída, R$ 1,00 é creditado automaticamente na sua carteira.',
  },
  {
    icon: Wallet,
    title: 'Saque pela carteira',
    desc: 'Quando quiser, solicite o saque direto na seção Carteira via PIX.',
  },
];

export default function HowItWorks() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRight className="w-3.5 h-3.5 text-gold" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Como funciona</span>
      </div>

      <h2 className="font-display text-2xl tracking-tight mb-1">
        Ganhe <span className="gold-gradient italic">cumprindo metas</span>
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Um passo a passo simples para transformar seu engajamento em dinheiro real.
      </p>

      <div className="space-y-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background"
            >
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-gold">PASSO {i + 1}</span>
                </div>
                <p className="text-sm font-semibold leading-tight">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground/80 mt-4 text-center italic">
        Mais opções de ganhos em breve.
      </p>
    </div>
  );
}