import React from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { v: 'people', label: 'Pessoas', icon: Users },
];

export default function FeedFilterTabs({ value, onChange, glassEnabled }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin -mx-1 px-1 pb-1">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = value === t.v;
        return (
          <button
            key={t.v}
            onClick={() => onChange(t.v)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0',
              glassEnabled && 'glass-pill-pro',
              active && glassEnabled && 'glass-pill-pro-active',
              active
                ? 'text-gold-dark'
                : 'text-muted-foreground hover:text-foreground/70',
              !glassEnabled && !active && 'bg-muted border border-border',
              !glassEnabled && active && 'bg-gold/15 border border-gold/30'
            )}
            style={glassEnabled ? (active ? {
              background: 'rgba(201,162,79,0.14)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(201,162,79,0.36)',
              boxShadow: '0 2px 10px rgba(201,162,79,0.12), 0 1px 0 rgba(255,255,255,0.8) inset',
            } : {
              background: 'rgba(255,255,255,0.50)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.70)',
              boxShadow: '0 1px 6px rgba(120,90,40,0.05)',
            }) : {}}
          >
            <Icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        );
      })}

    </div>
  );
}