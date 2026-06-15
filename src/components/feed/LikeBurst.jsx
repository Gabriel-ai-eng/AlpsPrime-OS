import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

/**
 * Cinematic like-burst: emitted at a relative position inside the like button.
 * - Soft glow ring expanding outward
 * - Particles (mini hearts + sparks) spreading with spring physics
 * - Subtle rim highlight
 *
 * Props:
 *  - keyId: changes to re-trigger
 *  - variant: 'default' | 'premium' (gold) — slight visual difference
 */
export default function LikeBurst({ keyId, variant = 'default' }) {
  // Particle field — pre-randomized per trigger
  const particles = useMemo(() => {
    const count = 10;
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
      const dist = 22 + Math.random() * 18;
      return {
        id: i,
        angle,
        dist,
        isHeart: i % 3 === 0,
        size: 3 + Math.random() * 3,
        delay: Math.random() * 0.05,
        duration: 0.65 + Math.random() * 0.25,
      };
    });
  }, [keyId]);

  if (!keyId) return null;

  const isPremium = variant === 'premium';
  const accent = isPremium ? '#E8C77A' : '#FF4D6D';
  const accentSoft = isPremium ? '#FFE9B0' : '#FF8FA3';

  return (
    <AnimatePresence>
      <motion.span
        key={keyId}
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        {/* Soft glow ring */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: 28,
            height: 28,
            background: `radial-gradient(circle, ${accent}55 0%, ${accent}22 45%, transparent 70%)`,
          }}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 2.2, 3], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Rim flash */}
        <motion.span
          className="absolute rounded-full border"
          style={{
            width: 18,
            height: 18,
            borderColor: accentSoft,
            boxShadow: `0 0 10px ${accent}88`,
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 2.4], opacity: [0.9, 0] }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />

        {/* Particles */}
        {particles.map((p) => {
          const x = Math.cos(p.angle) * p.dist;
          const y = Math.sin(p.angle) * p.dist - 4; // slight upward bias
          if (p.isHeart) {
            return (
              <motion.span
                key={`h-${p.id}`}
                className="absolute"
                style={{
                  color: accent,
                  filter: `drop-shadow(0 0 4px ${accent}aa)`,
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x,
                  y: [0, y - 6, y],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.6],
                  rotate: (Math.random() - 0.5) * 50,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              >
                <Heart className="w-2.5 h-2.5 fill-current" />
              </motion.span>
            );
          }
          return (
            <motion.span
              key={`s-${p.id}`}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: accentSoft,
                boxShadow: `0 0 6px ${accent}cc, 0 0 12px ${accent}66`,
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x,
                y,
                opacity: [0, 1, 0],
                scale: [0, 1.1, 0.3],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          );
        })}

        {/* Pulsing center heart silhouette */}
        <motion.span
          className="absolute"
          style={{ color: accent, filter: `drop-shadow(0 0 6px ${accent})` }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.8, 1], opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Heart className="w-5 h-5 fill-current" />
        </motion.span>
      </motion.span>
    </AnimatePresence>
  );
}