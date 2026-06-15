import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';

export default function AILockedFullscreen({ open, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 overflow-hidden"
      >
        {/* Animated background glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute w-[600px] h-[600px] rounded-full bg-gold/20 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute w-[400px] h-[400px] rounded-full bg-gold/30 blur-3xl pointer-events-none"
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-border hover:border-gold/40 bg-card/90 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Floating sparkle */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mb-8 relative z-10"
        >
          <img src={LOGO_URL} alt="Sexta-feira" className="w-20 h-20 rounded-2xl shadow-2xl shadow-gold/50 object-cover" />
        </motion.div>

        {/* Main message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center max-w-4xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4 font-semibold">
            Acesso exclusivo
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-tight mb-6">
            Seja o <span className="gold-gradient italic">primeiro</span> a acessar a{' '}
            <span className="gold-gradient italic">Sexta-feira 1.0</span>.
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            A revolução da inteligência artificial está chegando. Fique atento às novidades.
          </p>
        </motion.div>

        {/* Decorative pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-40 h-40 rounded-full border-2 border-gold pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
}