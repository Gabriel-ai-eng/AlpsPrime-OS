import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiquidGlass } from '@/lib/useLiquidGlass';

export default function LiquidGlassToggle() {
  const { isEnabled, toggle, saving } = useLiquidGlass();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{
        background: isEnabled ? 'rgba(201,162,79,0.08)' : 'hsl(var(--card))',
        border: isEnabled ? '1px solid rgba(201,162,79,0.28)' : '1px solid hsl(var(--border))',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-gold" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Interface Liquid Glass
        </h2>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Ativar visual premium</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Feed com cards translúcidos, backdrop blur e efeito de vidro fosco ao estilo Apple.
          </p>
        </div>

        <button
          onClick={toggle}
          disabled={saving}
          className={cn(
            'w-12 h-7 rounded-full transition-all relative flex-shrink-0',
            isEnabled ? 'bg-gold shadow-gold-sm' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-5 h-5 rounded-full bg-background shadow transition-all',
              isEnabled ? 'left-6' : 'left-1'
            )}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[10px] text-gold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Liquid Glass ativado — aproveite a interface premium do seu Feed!
          </p>
        </div>
      )}
    </motion.div>
  );
}
