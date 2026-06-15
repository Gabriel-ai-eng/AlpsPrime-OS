import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Exclusive animated golden aura that wraps the avatar of Unlimited users.
 * Non-Unlimited users never see this wrapper.
 *
 * Renders:
 *  - a rotating conic-gradient ring
 *  - a soft pulsing glow
 *  - 6 orbiting particle dots
 *
 * Usage:
 *  <UnlimitedAura plan={user.plan}>
 *     <img className="w-24 h-24 rounded-full" ... />
 *  </UnlimitedAura>
 *
 * The tooltip "Aura exclusiva do plano Unlimited" for Free/Pro users
 * is shown on the separate <AuraTooltip /> component, because Free/Pro
 * users do NOT see this aura. (Per spec: they see a teaser elsewhere.)
 */
export default function UnlimitedAura({ plan, children, size = 'md', className }) {
  if (plan !== 'unlimited') {
    return <div className={className}>{children}</div>;
  }

  const padding = size === 'sm' ? 'p-[3px]' : size === 'lg' ? 'p-[5px]' : 'p-[4px]';
  const particleCount = 6;

  return (
    <div
      className={cn('relative inline-block overflow-hidden', className)}
      title="Aura exclusiva do plano Unlimited"
    >
      {/* Rotating conic gradient ring */}
      <motion.div
        aria-hidden="true"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className={cn('absolute inset-0 rounded-full', padding)}
        style={{
          background:
            'conic-gradient(from 0deg, rgba(244,208,111,0.9), rgba(212,175,55,0.3), rgba(244,208,111,0.9), rgba(184,134,11,0.5), rgba(244,208,111,0.9))',
          filter: 'blur(2px)',
          zIndex: 0,
        }}
      />
      {/* Soft pulsing glow */}
      <motion.div
        aria-hidden="true"
        animate={{
          boxShadow: [
            '0 0 12px 2px rgba(212,175,55,0.35)',
            '0 0 22px 6px rgba(244,208,111,0.55)',
            '0 0 12px 2px rgba(212,175,55,0.35)',
          ],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Orbiting particles */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const delay = (i / particleCount) * 2.5;
        return (
          <motion.div
            key={i}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6 + (i % 3), repeat: Infinity, ease: 'linear', delay }}
          >
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: delay / 2 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 block w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(244,208,111,0.9)]"
            />
          </motion.div>
        );
      })}

      {/* Content (the avatar) above effects */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}