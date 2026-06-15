import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function IAChatBubble({ role, content, image_url, typing }) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-white border border-border text-foreground rounded-br-md'
            : 'bg-gold/15 border border-gold/25 text-foreground rounded-bl-md'
        )}
      >
        {image_url && (
          <img src={image_url} alt="" className="w-full max-w-[200px] rounded-lg mb-2" />
        )}
        <p className="whitespace-pre-wrap break-words">
          {content}
          {typing && <span className="inline-block w-1.5 h-4 ml-0.5 bg-gold animate-pulse align-middle" />}
        </p>
      </div>
    </motion.div>
  );
}