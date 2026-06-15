import React from 'react';
import { Sparkles } from 'lucide-react';

export function AIBadge({ small = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-bold uppercase tracking-widest ${small ? 'text-[8px] px-1.5 py-0.5' : 'text-[9px] px-2 py-0.5'}`}
    >
      <Sparkles className={small ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={2.5} />
      IA
    </span>
  );
}

export function GeneratedByAITag() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-[9px] uppercase tracking-widest text-gold-dark font-medium">
      <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
      Gerado por IA
    </span>
  );
}