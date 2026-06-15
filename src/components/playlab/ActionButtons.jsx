import React from 'react';
import { cn } from '@/lib/utils';

/**
 * A/B action buttons for mobile (right side of the screen).
 * A = jump, B = interact.
 */
export default function ActionButtons({ onJump, onInteract }) {
  const Btn = ({ label, color, onPress }) => (
    <button
      onTouchStart={(e) => { e.preventDefault(); onPress(); }}
      onMouseDown={(e) => { e.preventDefault(); onPress(); }}
      className={cn(
        'w-14 h-14 rounded-full border-2 font-bold text-lg shadow-lg select-none touch-none active:scale-95 transition-transform',
        color
      )}
      style={{ touchAction: 'none' }}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-center gap-3 z-50">
      <Btn label="A" color="bg-gold/80 border-gold text-background" onPress={onJump} />
      <Btn label="B" color="bg-rose/80 border-rose-dark text-background" onPress={onInteract} />
    </div>
  );
}