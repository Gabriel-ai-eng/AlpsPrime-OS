import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Sparkles, X } from 'lucide-react';

/**
 * Futuristic intro shown the FIRST TIME a user opens the "Ganhar" section.
 * - Vault opening sequence: light beams → coin shower → reveal headline.
 */
export default function EarnIntroAnimation({ open, onClose }) {
  const coins = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: -180 + Math.random() * 360,
        delay: 0.3 + Math.random() * 1.2,
        duration: 1.6 + Math.random() * 1.0,
        size: 18 + Math.random() * 14,
        rotate: Math.random() * 720 - 360,
      })),
    [open]
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), 6800);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  const gold = '#C9A24F';
  const goldSoft = 'rgba(201,162,79,0.45)';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 60%, rgba(40,28,8,0.95), rgba(0,0,0,0.98))' }}
      >
        {/* Hexagon grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${gold} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 70%)',
          }}
        />

        {/* Light beams */}
        {[-30, -10, 10, 30].map((rot, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 0.55, 0.3] }}
            transition={{ duration: 1.4, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
            className="absolute top-0 left-1/2 origin-top w-[6px] h-[120vh] pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, ${gold}, transparent)`,
              transform: `translateX(-50%) rotate(${rot}deg)`,
              filter: 'blur(2px)',
            }}
          />
        ))}

        {/* Vault glow */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: [0.2, 1.3, 1], opacity: [0, 0.7, 0.5] }}
          transition={{ duration: 1.6 }}
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${goldSoft}, transparent 70%)`, filter: 'blur(30px)' }}
        />

        {/* Falling coin shower */}
        {coins.map((c) => (
          <motion.div
            key={c.id}
            initial={{ y: -100, x: c.x, opacity: 0, rotate: 0 }}
            animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: c.rotate }}
            transition={{ duration: c.duration, delay: c.delay, ease: 'easeIn' }}
            className="absolute top-0 left-1/2 pointer-events-none"
            style={{ width: c.size, height: c.size }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, #ffe9ad, ${gold} 60%, #8a6a2e)`,
                boxShadow: `0 0 ${c.size}px ${goldSoft}`,
              }}
            >
              <span className="text-[10px] font-black text-amber-900">$</span>
            </div>
          </motion.div>
        ))}

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
          {/* Vault icon */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="relative mb-8"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #4a3514 0%, #1a1208 100%)',
                border: `1.5px solid ${gold}`,
                boxShadow: `0 0 80px ${goldSoft}, inset 0 0 30px ${goldSoft}`,
              }}
            >
              <Coins className="w-12 h-12" style={{ color: gold }} strokeWidth={1.8} />

              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full pointer-events-none"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0%, ${gold} 30%, transparent 60%, ${gold} 90%, transparent 100%)`,
                  mask: 'radial-gradient(circle, transparent 60%, black 62%)',
                  WebkitMask: 'radial-gradient(circle, transparent 60%, black 62%)',
                  opacity: 0.6,
                }}
              />
            </motion.div>

            {/* Orbital sparkles */}
            {[0, 120, 240].map((deg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                transition={{
                  opacity: { delay: 1.2 + i * 0.2, duration: 0.4 },
                  rotate: { duration: 6, repeat: Infinity, ease: 'linear', delay: i * 0.1 },
                }}
                className="absolute inset-0 pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <Sparkles
                  className="w-4 h-4 absolute -top-2 left-1/2 -translate-x-1/2"
                  style={{ color: gold }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="text-[10px] tracking-[0.5em] mb-3"
            style={{ color: gold }}
          >
            BEM-VINDO À CARTEIRA
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.7 }}
            className="font-display italic text-5xl sm:text-6xl font-bold mb-4 leading-tight"
            style={{
              background: `linear-gradient(135deg, #fff, ${gold}, #fff)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Hora de ganhar.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.6 }}
            className="text-white/70 text-base sm:text-lg max-w-md mx-auto"
          >
            Cumpra metas, venda conteúdo premium e converta presença em <span style={{ color: gold }}>dinheiro real</span>.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            onClick={onClose}
            className="mt-8 px-7 py-2.5 rounded-full text-sm font-bold tracking-wide text-black"
            style={{ background: gold, boxShadow: `0 0 40px ${goldSoft}` }}
          >
            Acessar carteira
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}