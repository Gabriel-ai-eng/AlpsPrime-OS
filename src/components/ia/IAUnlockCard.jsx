import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { TOTAL_GOALS } from '@/lib/goals';

export default function IAUnlockCard({ completedCount = 0, pendingTitles = [] }) {
  const pct = Math.round((completedCount / TOTAL_GOALS) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gold/10 via-card to-card border border-gold/30 rounded-2xl p-4 my-2"
    >
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-gold" />
        <p className="font-display text-sm font-semibold">Desbloqueie a Sexta-feira 1.0</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {completedCount} de {TOTAL_GOALS} metas concluídas
      </p>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
          className="h-full bg-gradient-to-r from-gold-light to-gold-dark"
        />
      </div>
      {pendingTitles.length > 0 && (
        <ul className="space-y-1 mb-3">
          {pendingTitles.slice(0, 3).map((t, i) => (
            <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
              <span className="text-gold mt-0.5">◆</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      <Link to="/challenges">
        <button className="w-full h-9 rounded-lg bg-gold text-background font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-gold-dark transition-colors">
          Ver minhas metas <ArrowRight className="w-3 h-3" />
        </button>
      </Link>
    </motion.div>
  );
}