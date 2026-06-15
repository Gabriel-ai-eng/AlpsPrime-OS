import { Zap, TrendingUp, Moon, Atom, Heart } from 'lucide-react';

/**
 * Static frontend registry mapping agent slug → icon and tag color.
 * Color/specialty/name come from the Agent entity itself.
 */
export const AGENT_ICONS = {
  nova: Zap,
  rafael: TrendingUp,
  luna: Moon,
  theo: Atom,
  maya: Heart,
  zeus: Zap,
};

export function getAgentIcon(slug) {
  return AGENT_ICONS[slug] || Zap;
}