import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, PenLine, Languages, ImageIcon, Wand2, Mic,
  AudioLines, Code2, FileCode, Sparkles, Coins, Lock, ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  MessageSquare, PenLine, Languages, ImageIcon, Wand2, Mic,
  AudioLines, Code2, FileCode, Sparkles,
};

export default function ToolCard({ tool, index = 0 }) {
  const IconComponent = ICON_MAP[tool.icon] || Sparkles;
  const disabled = !tool.available;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      whileHover={!disabled ? { y: -4 } : {}}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-6 h-full transition-all duration-300",
        disabled
          ? "border-border/50 opacity-60 cursor-not-allowed"
          : "border-border hover:border-gold/40 cursor-pointer"
      )}
    >
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
            disabled
              ? "bg-muted text-muted-foreground"
              : "bg-gold/10 text-gold group-hover:bg-gold group-hover:text-background"
          )}>
            {disabled ? <Lock className="w-5 h-5" /> : <IconComponent className="w-5 h-5" strokeWidth={2} />}
          </div>
          {!disabled && (
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
          )}
        </div>

        <h3 className="font-display text-lg font-semibold mb-1.5 leading-tight">{tool.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
          {tool.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Coins className="w-3.5 h-3.5 text-gold" />
            <span className="font-medium text-foreground">{tool.credits}</span>
            <span>créditos</span>
          </div>
          {disabled && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Em breve</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (disabled) return <div>{content}</div>;
  return <Link to={tool.route}>{content}</Link>;
}