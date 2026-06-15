import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Animated avatar with pulsing rings. Color is customizable.
 * state: 'idle' | 'thinking' | 'speaking' | 'listening'
 * color: hex string (default blue)
 */
export default function IAAvatar({ state = 'idle', size = 96, color = '#3B82F6' }) {
  const active = state !== 'idle';

  // Slightly translucent ring built from the user's chosen color
  const ringColor = `${color}80`; // ~50% alpha

  // Build a soft gradient using the chosen color
  const lighter = lighten(color, 25);
  const darker = darken(color, 20);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {active && [0, 0.4, 0.8].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${ringColor}` }}
          animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        animate={
          state === 'speaking'
            ? { scale: [1, 1.06, 1] }
            : state === 'thinking'
            ? { rotate: 360 }
            : state === 'listening'
            ? { scale: [1, 1.04, 1] }
            : {}
        }
        transition={{
          duration: state === 'thinking' ? 4 : 1.2,
          repeat: Infinity,
          ease: state === 'thinking' ? 'linear' : 'easeInOut',
        }}
        className="relative w-full h-full rounded-full flex items-center justify-center shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${lighter} 0%, ${color} 50%, ${darker} 100%)`,
          boxShadow: `0 12px 40px -8px ${color}66`,
        }}
      >
        <Sparkles className="text-white" style={{ width: size * 0.4, height: size * 0.4 }} strokeWidth={2.5} />
      </motion.div>
    </div>
  );
}

function clamp(n) { return Math.max(0, Math.min(255, n)); }
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((n) => clamp(n).toString(16).padStart(2, '0')).join('');
}
function lighten(hex, pct) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * (pct / 100), g + (255 - g) * (pct / 100), b + (255 - b) * (pct / 100));
}
function darken(hex, pct) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - pct / 100), g * (1 - pct / 100), b * (1 - pct / 100));
}