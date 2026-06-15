import { Heart, Briefcase, Activity, Sparkles, Cpu, Brain, HelpCircle, Compass } from 'lucide-react';

export const CARD_CATEGORIES = [
  { id: 'vida',         label: 'Vida',         icon: Compass,    color: '#C9A24F' },
  { id: 'amor',         label: 'Amor',         icon: Heart,      color: '#E08AAA' },
  { id: 'trabalho',     label: 'Trabalho',     icon: Briefcase,  color: '#8E7CC3' },
  { id: 'saude',        label: 'Saúde',        icon: Activity,   color: '#7AB89E' },
  { id: 'criatividade', label: 'Criatividade', icon: Sparkles,   color: '#E8C77A' },
  { id: 'tecnologia',   label: 'Tecnologia',   icon: Cpu,        color: '#6FA8DC' },
  { id: 'filosofia',    label: 'Filosofia',    icon: Brain,      color: '#A98BD9' },
  { id: 'outro',        label: 'Outro',        icon: HelpCircle, color: '#9CA3AF' },
];

export const getCategory = (id) =>
  CARD_CATEGORIES.find((c) => c.id === id) || CARD_CATEGORIES[CARD_CATEGORIES.length - 1];