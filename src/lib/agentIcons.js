import { Zap, TrendingUp, Moon, Atom, Heart, Sparkles } from 'lucide-react';

const ICON_MAP = {
  Zap,
  TrendingUp,
  Moon,
  Atom,
  Heart,
  Sparkles,
};

export function getAgentIcon(name) {
  return ICON_MAP[name] || Sparkles;
}