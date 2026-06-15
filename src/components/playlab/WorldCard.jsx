import React from 'react';
import { Play, Users, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTemplate } from '@/lib/playlabTemplates';
import { cn } from '@/lib/utils';

export default function WorldCard({ world, onPlay }) {
  const tpl = getTemplate(world.template);
  const isPaid = world.visibility === 'paid';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
    >
      <div
        className="relative h-32 flex items-center justify-center text-6xl"
        style={{ background: `linear-gradient(135deg, ${tpl.palette.bg}, ${tpl.palette.wall})` }}
      >
        <span style={{ imageRendering: 'pixelated' }}>{tpl.cover}</span>
        {isPaid && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gold text-background text-[10px] font-bold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            R${world.price_brl?.toFixed(2)}
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="font-display text-sm font-semibold truncate">{world.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">por {world.owner_name || 'Usuário'}</p>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{world.plays_count || 0} jogadas</span>
        </div>
        <button
          onClick={() => onPlay(world)}
          className={cn(
            'mt-3 w-full py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-widest',
            'bg-gold text-background hover:bg-gold-dark transition-colors flex items-center justify-center gap-1.5'
          )}
        >
          <Play className="w-3 h-3" /> Jogar
        </button>
      </div>
    </motion.div>
  );
}