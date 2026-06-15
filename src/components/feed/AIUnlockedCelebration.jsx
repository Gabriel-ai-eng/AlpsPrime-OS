import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

/**
 * Fullscreen celebration shown once when the user unlocks Sexta-feira IA
 * by completing all 20 goals. Glass-shattering effect + breathing silhouette.
 */
export default function AIUnlockedCelebration({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    // Try to send a push notification if permitted
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Sexta-feira IA desbloqueada', {
          body: 'Você provou que é criativo o suficiente. A Sexta Feira acordou para você.',
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((p) => {
          if (p === 'granted') {
            new Notification('Sexta-feira IA desbloqueada', {
              body: 'Você provou que é criativo o suficiente. A Sexta Feira acordou para você.',
              icon: '/favicon.ico',
            });
          }
        });
      }
    }
  }, [open]);

  if (!open) return null;

  // Glass shard positions
  const shards = Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 1600,
    y: (Math.random() - 0.5) * 1200,
    rot: Math.random() * 720 - 360,
    delay: i * 0.04,
    size: 60 + Math.random() * 140,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center p-6 overflow-hidden"
      >
        {/* Radial glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0.5] }}
          transition={{ duration: 2, times: [0, 0.3, 1] }}
          className="absolute w-[900px] h-[900px] rounded-full bg-gold/30 blur-3xl pointer-events-none"
        />

        {/* Glass shards flying out */}
        {shards.map((s) => (
          <motion.div
            key={s.id}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: s.x, y: s.y, rotate: s.rot, opacity: 0 }}
            transition={{ duration: 1.8, delay: s.delay, ease: 'easeOut' }}
            className="absolute pointer-events-none"
            style={{ width: s.size, height: s.size }}
          >
            <div
              className="w-full h-full bg-gradient-to-br from-gold/40 via-white/20 to-transparent border border-gold/50 backdrop-blur-sm"
              style={{
                clipPath: `polygon(${20 + Math.random() * 20}% 0%, 100% ${20 + Math.random() * 30}%, ${60 + Math.random() * 30}% 100%, 0% ${40 + Math.random() * 40}%)`,
                boxShadow: '0 0 30px rgba(212,175,55,0.4)',
              }}
            />
          </motion.div>
        ))}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-border hover:border-gold/40 bg-background/80 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* The silhouette gaining color and life */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, filter: 'grayscale(1) brightness(0.3)' }}
          animate={{
            scale: [0.4, 1.15, 1],
            opacity: [0, 1, 1],
            filter: ['grayscale(1) brightness(0.3)', 'grayscale(0.5) brightness(0.8)', 'grayscale(0) brightness(1)'],
          }}
          transition={{ duration: 2.2, times: [0, 0.6, 1], delay: 0.3 }}
          className="mb-8 relative z-10"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 40px rgba(212, 175, 55, 0.4)',
                '0 0 100px rgba(212, 175, 55, 0.9)',
                '0 0 40px rgba(212, 175, 55, 0.4)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-28 h-28 rounded-3xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center"
          >
            <Sparkles className="w-14 h-14 text-background" strokeWidth={2} />
          </motion.div>
        </motion.div>

        {/* Main message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl"
        >
          <motion.div
            initial={{ letterSpacing: '0.05em', opacity: 0 }}
            animate={{ letterSpacing: '0.3em', opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="text-[11px] uppercase tracking-[0.3em] text-gold mb-4 font-bold"
          >
            ★ Desbloqueio lendário ★
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight mb-4">
            Você provou que é <span className="gold-gradient italic">criativo</span> o suficiente.
          </h1>
          <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-foreground/90 italic">
            A <span className="gold-gradient">Sexta-feira</span> acordou para você.
          </p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
            onClick={onClose}
            className="mt-10 px-8 py-3 rounded-xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-bold hover:opacity-90 transition-opacity shadow-2xl shadow-gold/30"
          >
            Conversar com ela agora →
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}