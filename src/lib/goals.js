import {
  Laugh, Crown, Flame, Zap, MessageCircle, Heart, Gem, Megaphone,
  Star, Users, BookOpen, Clock, Share2, Mic, Shield, UserCheck,
  Moon, Lightbulb, Trophy, Rocket, Sparkles,
} from 'lucide-react';

/**
 * As 20 metas oficiais. Cada meta corresponde a uma conquista (badge).
 * A ordem e os ids são preservados (1..20).
 */
export const GOALS = [
  { id: 1,  icon: Laugh,      title: 'Post Mais Engraçado',     desc: 'Ter o post com mais comentários de risada na semana.',                                         badge: 'Comediante',          badgeIcon: Laugh,      gradient: 'from-yellow-400 to-orange-400',   difficulty: 'médio' },
  { id: 2,  icon: Crown,      title: 'Perfil Mais Seguido',     desc: 'Ser o usuário com mais seguidores novos em 7 dias.',                                           badge: 'Top Creator',         badgeIcon: Crown,      gradient: 'from-gold-light to-gold-dark',    difficulty: 'difícil' },
  { id: 3,  icon: Flame,      title: 'Top Streak',              desc: 'Fazer posts por 7 dias consecutivos sem parar.',                                               badge: 'Top Streak',          badgeIcon: Flame,      gradient: 'from-orange-500 to-red-500',      difficulty: 'médio' },
  { id: 4,  icon: Zap,        title: 'Viral da Semana',         desc: 'Ter o post com mais curtidas em 24 horas.',                                                    badge: 'Viral',               badgeIcon: Zap,        gradient: 'from-yellow-300 to-amber-500',    difficulty: 'difícil' },
  { id: 5,  icon: MessageCircle, title: 'Mestre dos Comentários', desc: 'Receber 100 comentários somando todos os posts da semana.',                                 badge: 'Mestre das Palavras', badgeIcon: MessageCircle, gradient: 'from-sky-400 to-blue-600',     difficulty: 'médio' },
  { id: 6,  icon: Heart,      title: 'Rei do Engajamento',      desc: 'Ter a maior taxa de curtidas por seguidor da semana (mín. 50 seguidores).',                    badge: 'Rei do Engajamento',  badgeIcon: Crown,      gradient: 'from-purple-500 to-fuchsia-600',  difficulty: 'difícil' },
  { id: 7,  icon: Gem,        title: 'Descoberta da Semana',    desc: 'Ser o perfil mais seguido entre usuários com menos de 50 seguidores.',                         badge: 'Diamante Bruto',      badgeIcon: Gem,        gradient: 'from-cyan-300 to-sky-500',        difficulty: 'médio' },
  { id: 8,  icon: Megaphone,  title: 'Embaixador',              desc: 'Convidar 5 amigos que se cadastraram e fizeram pelo menos 1 post.',                            badge: 'Embaixador ALPS',     badgeIcon: Megaphone,  gradient: 'from-emerald-400 to-teal-600',    difficulty: 'médio' },
  { id: 9,  icon: Star,       title: 'Trend Setter',            desc: 'Criar um post que outros 10 usuários usaram como referência (mesma tag).',                     badge: 'Trend Setter',        badgeIcon: Star,       gradient: 'from-pink-400 to-rose-600',       difficulty: 'difícil' },
  { id: 10, icon: Users,      title: 'Melhor Dupla',            desc: 'Com um parceiro, postar juntos sobre o mesmo tema e somar +100 curtidas combinadas.',           badge: 'Dupla Dinâmica',      badgeIcon: Zap,        gradient: 'from-indigo-400 to-violet-600',   difficulty: 'médio' },
  { id: 11, icon: BookOpen,   title: 'Storyteller',             desc: 'Publicar 5 posts em sequência contando uma história (capítulo 1 a 5).',                         badge: 'Storyteller',         badgeIcon: BookOpen,   gradient: 'from-amber-400 to-orange-600',    difficulty: 'fácil' },
  { id: 12, icon: Clock,      title: 'Primeira Hora',           desc: 'Ser um dos 10 primeiros a postar sobre a Trend da semana no domingo.',                         badge: 'Primeiro Sangue',     badgeIcon: Clock,      gradient: 'from-red-400 to-rose-700',        difficulty: 'médio' },
  { id: 13, icon: Share2,     title: 'Post Mais Compartilhado', desc: 'Ter o post mais compartilhado da semana (mín. 20 compartilhamentos).',                         badge: 'Propagador',          badgeIcon: Share2,     gradient: 'from-green-400 to-emerald-600',   difficulty: 'médio' },
  { id: 14, icon: Mic,        title: 'Melhor Comentarista',     desc: 'Ter os comentários mais curtidos da semana (top 5 comentários).',                              badge: 'Voz da Comunidade',   badgeIcon: Mic,        gradient: 'from-fuchsia-400 to-pink-600',    difficulty: 'médio' },
  { id: 15, icon: Shield,     title: 'Time Invencível',         desc: 'Seu time completar 3 metas em equipe na mesma semana.',                                        badge: 'Time Invencível',     badgeIcon: Shield,     gradient: 'from-blue-500 to-indigo-700',     difficulty: 'difícil' },
  { id: 16, icon: UserCheck,  title: 'Perfil Completo',         desc: 'Preencher 100% do perfil — foto, bio, time e primeira meta concluída.',                        badge: 'Identidade Formada',  badgeIcon: UserCheck,  gradient: 'from-teal-400 to-cyan-600',       difficulty: 'fácil' },
  { id: 17, icon: Moon,       title: 'Madrugador',              desc: 'Fazer um post entre 00h e 6h que receba pelo menos 30 curtidas.',                              badge: 'Coruja',              badgeIcon: Moon,       gradient: 'from-slate-500 to-indigo-800',    difficulty: 'médio' },
  { id: 18, icon: Lightbulb,  title: 'Mais Criativo da Semana', desc: 'Post votado pela comunidade como mais criativo (votação às quintas, resultado no Sextou).',   badge: 'Gênio Criativo',      badgeIcon: Lightbulb,  gradient: 'from-gold-light to-yellow-500',   difficulty: 'difícil' },
  { id: 19, icon: Trophy,     title: 'Longa Jornada',           desc: 'Completar 30 dias consecutivos no app com pelo menos 1 post por dia.',                         badge: 'Lenda Viva',          badgeIcon: Flame,      gradient: 'from-gold-light via-gold to-gold-dark', difficulty: 'difícil' },
  { id: 20, icon: Rocket,     title: 'O Primeiro',              desc: 'Ser o primeiro usuário a completar TODAS as 19 metas anteriores.',                             badge: 'Pioneer',             badgeIcon: Rocket,     gradient: 'from-gold via-yellow-400 to-amber-600', difficulty: 'lendário', legendary: true },
  { id: 21, icon: Sparkles,   title: 'Boas-vindas',             desc: 'Publicar seu primeiro post no feed. Quebre o gelo e apresente-se à comunidade!',                badge: 'Estreante',           badgeIcon: Sparkles,   gradient: 'from-emerald-400 to-teal-600',    difficulty: 'fácil' },
];

export const DIFFICULTY_STYLES = {
  fácil:    { label: 'Fácil',    class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  médio:    { label: 'Médio',    class: 'bg-gold/10 text-gold border-gold/20' },
  difícil:  { label: 'Difícil',  class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  lendário: { label: 'Lendário', class: 'bg-gradient-to-r from-gold/20 to-yellow-500/10 text-gold border-gold/40' },
};

export const TOTAL_GOALS = GOALS.length; // 20