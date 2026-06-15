import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Animated circular waves:
 * - status 'speaking': blue pulse
 * - status 'listening': white pulse
 * - status 'thinking': gold pulse
 */
export default function VoiceVisualizer({ status }) {
  const color =
    status === 'speaking' ? 'rgb(59, 130, 246)' :
    status === 'thinking' ? 'rgb(212, 175, 55)' :
    'rgb(255, 255, 255)';

  const isActive = status === 'speaking' || status === 'listening' || status === 'thinking';

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            borderColor: color,
            width: '100%',
            height: '100%',
          }}
          animate={isActive ? {
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
          } : {
            scale: 1,
            opacity: 0.2,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeOut',
          }}
        />
      ))}
      <motion.div
        className="absolute rounded-full backdrop-blur-xl"
        style={{
          width: '50%',
          height: '50%',
          background: `radial-gradient(circle, ${color}40, ${color}10)`,
          boxShadow: `0 0 60px ${color}60`,
        }}
        animate={isActive ? {
          scale: [1, 1.08, 1],
        } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className={cn(
        "relative w-24 h-24 rounded-full flex items-center justify-center",
        "bg-gradient-to-br",
        status === 'speaking' && 'from-blue-400 to-blue-600',
        status === 'thinking' && 'from-gold-light to-gold-dark',
        (status === 'listening' || !isActive) && 'from-white to-gray-300',
      )}>
        <div className="w-3 h-3 rounded-full bg-background/80" />
      </div>
    </div>
  );
}