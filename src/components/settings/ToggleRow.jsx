import React from 'react';
import { cn } from '@/lib/utils';

export default function ToggleRow({ icon: Icon, label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-start justify-between gap-3 p-4 rounded-xl border border-border bg-background">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          'w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5',
          checked ? 'bg-gold' : 'bg-muted',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all',
            checked ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </button>
    </div>
  );
}