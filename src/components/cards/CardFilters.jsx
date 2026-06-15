import React from 'react';
import { cn } from '@/lib/utils';
import { CARD_CATEGORIES } from '@/lib/cardCategories';

const SORTS = [
  { id: 'recent', label: 'Recentes' },
  { id: 'popular', label: 'Populares' },
];

export default function CardFilters({ sort, onSortChange, category, onCategoryChange }) {
  return (
    <div className="space-y-3">
      {/* Sort */}
      <div className="flex items-center gap-2">
        {SORTS.map((s) => {
          const active = sort === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSortChange(s.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition',
                active
                  ? 'bg-gold text-background border-gold'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin -mx-1 px-1 pb-1">
        <button
          onClick={() => onCategoryChange('all')}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition',
            category === 'all'
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          Todas
        </button>
        {CARD_CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onCategoryChange(c.id)}
              className={cn(
                'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition'
              )}
              style={
                active
                  ? { color: c.color, borderColor: `${c.color}66`, background: `${c.color}15` }
                  : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }
              }
            >
              <Icon className="w-3 h-3" />
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}