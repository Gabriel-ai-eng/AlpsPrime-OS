import React from 'react';
import { Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Tag shown on highlighted profiles in the "Buscar/Explorar" page.
 * - Unlimited: gold "Unlimited" tag
 * - Pro: blue "Em Destaque" tag
 */
export default function PlanHighlightTag({ plan, className }) {
  if (plan === 'unlimited') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full',
          'bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background shadow-sm shadow-gold/40',
          className
        )}
      >
        <Crown className="w-2.5 h-2.5" strokeWidth={3} />
        Unlimited
      </span>
    );
  }
  if (plan === 'pro') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full',
          'bg-sky-500/15 border border-sky-400/40 text-sky-300',
          className
        )}
      >
        <Star className="w-2.5 h-2.5" strokeWidth={3} />
        Em Destaque
      </span>
    );
  }
  return null;
}