import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import LikeBurst from '@/components/feed/LikeBurst';

// Kept for backward compatibility — feed UI is now heart-only (Instagram-style),
// but other components (notifications, comment likes, etc.) may still consume the map.
export const REACTIONS = [
  { type: 'like', emoji: '❤️', label: 'Curtir', color: 'text-red-500' },
];
export const REACTION_MAP = {
  like: { type: 'like', emoji: '❤️', label: 'Curtir', color: 'text-red-500' },
  love: { type: 'like', emoji: '❤️', label: 'Curtir', color: 'text-red-500' },
  haha: { type: 'like', emoji: '❤️', label: 'Curtir', color: 'text-red-500' },
  wow:  { type: 'like', emoji: '❤️', label: 'Curtir', color: 'text-red-500' },
  sad:  { type: 'like', emoji: '❤️', label: 'Curtir', color: 'text-red-500' },
  fire: { type: 'like', emoji: '❤️', label: 'Curtir', color: 'text-red-500' },
  clap: { type: 'like', emoji: '❤️', label: 'Curtir', color: 'text-red-500' },
};

/**
 * Cinematic Instagram-style heart like button.
 * - Spring physics on press
 * - LikeBurst (particles + glow) on activation
 * - Variant changes accent color (gold for premium posts)
 */
export default function ReactionPicker({ currentReaction, onSelect, variant = 'default' }) {
  const liked = !!currentReaction;
  const [burstKey, setBurstKey] = useState(0);

  const handleClick = () => {
    if (liked) {
      onSelect(null);
    } else {
      onSelect('like');
      setBurstKey((k) => k + 1);
    }
  };

  const isPremium = variant === 'premium';
  const activeColor = isPremium ? 'text-gold' : 'text-red-500';
  const fillColor = isPremium ? 'fill-gold' : 'fill-red-500';

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium hover:bg-muted/40 transition-colors relative overflow-visible',
        liked ? activeColor : 'text-muted-foreground hover:text-foreground'
      )}
      aria-label={liked ? 'Descurtir' : 'Curtir'}
    >
      <span className="relative inline-flex items-center justify-center">
        <motion.span
          key={burstKey || 'idle'}
          initial={false}
          animate={
            liked
              ? { scale: [1, 0.85, 1.4, 1], rotate: [0, -8, 6, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{
            duration: 0.5,
            ease: [0.22, 1.4, 0.5, 1], // spring-like overshoot
          }}
          className="inline-flex"
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors',
              liked && cn(fillColor, activeColor)
            )}
            strokeWidth={2}
          />
        </motion.span>

        {/* Cinematic burst overlay anchored on the heart icon */}
        <LikeBurst keyId={burstKey} variant={variant} />
      </span>
      <span>Curtir</span>
    </button>
  );
}