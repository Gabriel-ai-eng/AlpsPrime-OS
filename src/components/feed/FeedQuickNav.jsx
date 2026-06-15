import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Star, Target, Trophy, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ITEMS = [
  { label: 'Cards',       path: '/cards',        icon: Layers     },
  { label: 'Conquistas',  path: '/achievements', icon: Star       },
  { label: 'Metas',       path: '/challenges',   icon: Target     },
  { label: 'Ranking',     path: '/ranking',      icon: Trophy     },
  { label: 'Verificados', path: '/verified',     icon: BadgeCheck },
];

export default function FeedQuickNav() {
  const location = useLocation();

  return (
    <nav className="flex justify-between items-start px-3 py-4 rounded-[34px] bg-card border border-border shadow-sm">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex-1 flex flex-col items-center gap-1.5 text-center min-w-0 group"
          >
            <motion.div
              whileTap={{ scale: 0.88 }}
              whileHover={{ y: -3, scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                active 
                  ? 'bg-gold/10 border-2 border-gold/30 shadow-[0_0_15px_rgba(212,169,58,0.2)]' 
                  : 'bg-background border border-border group-hover:border-gold/40 shadow-sm'
              }`}
            >
              <Icon
                className={`w-[22px] h-[22px] relative z-10 transition-colors ${
                  active ? 'text-gold' : 'text-gold/80 group-hover:text-gold'
                }`}
                strokeWidth={1.9}
              />
            </motion.div>

            <span
              className={`text-[11px] font-semibold tracking-tight transition-colors ${
                active ? 'text-gold' : 'text-muted-foreground group-hover:text-foreground'
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
