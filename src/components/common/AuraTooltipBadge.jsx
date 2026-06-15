import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Small teaser badge shown ONLY for Free/Pro viewers on their OWN profile,
 * so they know the Unlimited aura exists. Hover/press reveals the tooltip:
 * "Aura exclusiva do plano Unlimited".
 */
export default function AuraTooltipBadge() {
  const [show, setShow] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((s) => !s)}
      onBlur={() => setShow(false)}
      className="relative inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold hover:bg-gold/10 transition-colors"
    >
      <Sparkles className="w-3 h-3" />
      Aura Unlimited
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background border border-gold/30 text-foreground text-[10px] px-2.5 py-1 rounded-md shadow-xl z-20"
          >
            Aura exclusiva do plano Unlimited
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}