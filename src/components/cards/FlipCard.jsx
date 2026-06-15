import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Clock, Crown, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseServerDate, cn } from '@/lib/utils';
import { getCategory } from '@/lib/cardCategories';
import CardBack from './CardBack';
import CardOwnerMenu from './CardOwnerMenu';

/**
 * 3D flippable question card.
 * Front: question, category, time, flip icon.
 * Back: answer composer + recent answers (with best-answer highlight).
 */
export default function FlipCard({ card, currentUser, onAnswered, onAnswersUpdated, onEdit, onDeleted }) {
  const [flipped, setFlipped] = useState(false);
  const cat = getCategory(card.category);
  const CatIcon = cat.icon;

  const isOwner = currentUser?.email === card.author_email;
  const authorLabel = card.is_anonymous ? 'Anônimo' : card.author_name || 'Alguém';

  return (
    <div className="[perspective:1600px] w-full">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.85, ease: [0.19, 1, 0.22, 1] }}
        className="relative w-full min-h-[260px]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-3xl bg-card border border-border p-5 flex flex-col shadow-[0_8px_30px_-12px_rgba(120,90,40,0.18)]"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Soft accent glow */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: cat.color }}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-3 relative">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold border"
              style={{ color: cat.color, borderColor: `${cat.color}55`, background: `${cat.color}10` }}
            >
              <CatIcon className="w-3 h-3" />
              {cat.label}
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(parseServerDate(card.created_date), { addSuffix: true, locale: ptBR })}
              </div>
              {isOwner && (
                <CardOwnerMenu card={card} onEdit={onEdit} onDeleted={onDeleted} />
              )}
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center">
            <p className="font-display italic text-xl leading-snug text-foreground">
              "{card.question}"
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between relative">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>— {authorLabel}</span>
              {isOwner && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gold/10 text-gold text-[9px] font-semibold uppercase tracking-widest">
                  <Crown className="w-2.5 h-2.5" /> Sua
                </span>
              )}
              {card.answers_count > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-[10px]">
                  <Star className="w-2.5 h-2.5" /> {card.answers_count}
                </span>
              )}
            </div>
            <button
              onClick={() => setFlipped(true)}
              className={cn(
                'group inline-flex items-center gap-1.5 text-[11px] font-semibold',
                'px-3 py-1.5 rounded-full border border-border hover:border-gold/40 hover:bg-gold/5',
                'text-muted-foreground hover:text-gold transition-all'
              )}
              aria-label="Virar carta"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              Virar carta
            </button>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-3xl bg-card border border-border shadow-[0_8px_30px_-12px_rgba(120,90,40,0.18)] overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardBack
            card={card}
            currentUser={currentUser}
            isOwner={isOwner}
            onFlipBack={() => setFlipped(false)}
            onAnswered={onAnswered}
            onAnswersUpdated={onAnswersUpdated}
          />
        </div>
      </motion.div>
    </div>
  );
}