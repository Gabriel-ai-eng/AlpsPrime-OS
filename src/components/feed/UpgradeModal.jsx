import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UpgradeModal({ open, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-gold/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-gold/20 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center mx-auto mb-5 shadow-lg shadow-gold/30">
            <Crown className="w-7 h-7 text-background" />
          </div>

          <h2 className="font-display text-3xl tracking-tight text-center mb-2">
            Limite <span className="gold-gradient italic">Free</span> atingido
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Você usou seus <span className="text-foreground font-semibold">10 posts de hoje</span>. Faça upgrade para o Pro e poste até <span className="text-foreground font-semibold">50 vezes por dia</span>.
          </p>

          <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-xl p-5 mb-6 space-y-2.5">
            {[
              'Até 50 posts por dia',
              'Selo de verificado azul ao lado do seu nome',
              'Perfil em destaque na aba Explorar',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-gold" />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <Link
            to="/plans"
            onClick={onClose}
            className="block w-full text-center bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold rounded-xl py-3 hover:opacity-90 transition-opacity"
          >
            Fazer upgrade para Pro
          </Link>
          <button
            onClick={onClose}
            className="w-full text-center text-muted-foreground hover:text-foreground text-sm mt-3 transition-colors"
          >
            Talvez mais tarde
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}