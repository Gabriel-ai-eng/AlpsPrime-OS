import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function VoiceButton({ isListening, isSpeaking, supported, onToggle, onStopSpeaking }) {
  if (!supported) return null;

  if (isSpeaking) {
    return (
      <button
        onClick={onStopSpeaking}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 transition-all"
        title="Sexta-feira está falando — clique para parar"
      >
        <Volume2 className="w-4 h-4" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full animate-ping" />
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all",
        isListening
          ? "bg-destructive/20 border-destructive/50 text-destructive"
          : "bg-card border-border text-muted-foreground hover:text-gold hover:border-gold/40"
      )}
      title={isListening ? "Parar gravação" : "Falar com Sexta-feira"}
    >
      {isListening ? (
        <>
          <MicOff className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full animate-ping" />
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}