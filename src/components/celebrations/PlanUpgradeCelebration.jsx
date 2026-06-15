import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Infinity as InfinityIcon, X } from 'lucide-react';

/**
 * Futuristic full-screen celebration when a user upgrades to Pro or Unlimited.
 * - Shockwave + scanlines + particles + 3D card flip + tier reveal.
 * - Auto-closes after ~6s, but user can dismiss earlier.
 */
export default function PlanUpgradeCelebration({ open, plan, onClose }) {
  const isUnlimited = plan === 'unlimited';
  const accent = isUnlimited ? '#9b6bff' : '#C9A24F';
  const accentSoft = isUnlimited ? 'rgba(155,107,255,0.35)' : 'rgba(201,162,79,0.35)';
  const tierLabel = isUnlimited ? 'UNLIMITED' : 'PRO';
  const TierIcon = isUnlimited ? InfinityIcon : Crown;

  // Generate 60 particles once per open
  const particles = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        angle: (Math.PI * 2 * i) / 60 + Math.random() * 0.4,
        distance: 200 + Math.random() * 280,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 0.4,
        duration: 1.2 + Math.random() * 1.2,
      })),
    [open]
  );

  // Auto-close
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), 6500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(20,12,40,0.92), rgba(0,0,0,0.98))' }}
      >
        {/* Scanlines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent 0, transparent 2px, ${accent} 2px, ${accent} 3px)`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Animated grid */}
        <motion.div
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 0.18, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${accent}33 1px, transparent 1px), linear-gradient(90deg, ${accent}33 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 75%)',
          }}
        />

        {/* Shockwave rings */}
        {[0, 0.25, 0.5].map((delay, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 8, opacity: 0 }}
            transition={{ duration: 2.2, delay, ease: 'easeOut' }}
            className="absolute w-40 h-40 rounded-full pointer-events-none"
            style={{ border: `2px solid ${accent}`, boxShadow: `0 0 60px ${accentSoft}` }}
          />
        ))}

        {/* Glow halo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.6, 0.4], scale: [0.4, 1.1, 1] }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accentSoft} 0%, transparent 65%)`,
            filter: 'blur(40px)',
          }}
        />

        {/* Particles burst */}
        {particles.map((p) => {
          const x = Math.cos(p.angle) * p.distance;
          const y = Math.sin(p.angle) * p.distance;
          return (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x, y, opacity: [0, 1, 0], scale: [0, 1, 0.4] }}
              transition={{ duration: p.duration, delay: 0.4 + p.delay, ease: 'easeOut' }}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                background: accent,
                boxShadow: `0 0 ${p.size * 4}px ${accent}`,
              }}
            />
          );
        })}

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition z-10"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Tier card with 3D flip */}
          <motion.div
            initial={{ rotateY: -180, scale: 0.4, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
            style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
            className="mb-7 relative"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Card */}
              <div
                className="relative w-32 h-32 rounded-3xl flex items-center justify-center"
                style={{
                  background: isUnlimited
                    ? 'linear-gradient(135deg, #2a1a4a 0%, #1a0a2a 100%)'
                    : 'linear-gradient(135deg, #3a2a0e 0%, #1a1208 100%)',
                  border: `1.5px solid ${accent}`,
                  boxShadow: `0 0 80px ${accentSoft}, inset 0 0 30px ${accentSoft}`,
                }}
              >
                <TierIcon className="w-14 h-14" style={{ color: accent }} strokeWidth={1.8} />

                {/* Rotating border */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-2 rounded-[1.75rem] pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0%, ${accent} 25%, transparent 50%, ${accent} 75%, transparent 100%)`,
                    mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                    WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    padding: 1.5,
                    opacity: 0.7,
                  }}
                />
              </div>

              {/* Sparkle accents */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, delay: 1.2 + i * 0.18, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute"
                  style={{
                    top: i < 2 ? '-8px' : 'auto',
                    bottom: i >= 2 ? '-8px' : 'auto',
                    left: i % 2 === 0 ? '-8px' : 'auto',
                    right: i % 2 === 1 ? '-8px' : 'auto',
                  }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: accent }} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Tier label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="text-[10px] tracking-[0.5em] mb-3"
            style={{ color: accent }}
          >
            ACESSO LIBERADO
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.15em' }}
            transition={{ delay: 1.3, duration: 0.9, ease: 'easeOut' }}
            className="font-display text-5xl sm:text-7xl font-bold mb-4 leading-none"
            style={{
              background: `linear-gradient(135deg, #fff, ${accent}, #fff)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 200%',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            {tierLabel}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.6 }}
            className="text-white/70 text-base sm:text-lg max-w-md"
          >
            {isUnlimited
              ? 'Você desbloqueou o tier máximo. Bem-vindo ao infinito.'
              : 'Você é Pro agora. O jogo mudou.'}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
            onClick={onClose}
            className="mt-8 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide text-black relative overflow-hidden group"
            style={{ background: accent, boxShadow: `0 0 40px ${accentSoft}` }}
          >
            <span className="relative z-10">Continuar</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}