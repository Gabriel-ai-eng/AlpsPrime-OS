import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';

export default function AILockedSection({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full text-left relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-background to-background hover:border-gold/60 transition-all group"
    >
      {/* Animated silhouette/shimmer */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ width: '50%' }}
        />
      </div>

      <div className="relative flex items-center gap-4 p-5">
        {/* Silhouette avatar */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(212, 175, 55, 0.2)',
                '0 0 40px rgba(212, 175, 55, 0.5)',
                '0 0 20px rgba(212, 175, 55, 0.2)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/30 via-muted to-background flex items-center justify-center border border-gold/40"
          >
            <img src={LOGO_URL} alt="Sexta-feira IA" className="w-10 h-10 rounded-full object-cover" />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-gold flex items-center justify-center">
            <Lock className="w-3 h-3 text-gold" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-lg gold-gradient font-semibold">Sexta-feira IA</span>
            <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-bold">
              Em breve
            </span>
          </div>
          <div className="space-y-1.5">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 rounded-full bg-gradient-to-r from-gold/40 to-transparent w-4/5"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="h-2 rounded-full bg-gradient-to-r from-gold/30 to-transparent w-3/5"
            />
          </div>
        </div>

        <div className="flex-shrink-0 text-gold/80 group-hover:text-gold transition-colors text-xs font-medium uppercase tracking-widest">
          Desbloquear →
        </div>
      </div>
    </motion.button>
  );
}