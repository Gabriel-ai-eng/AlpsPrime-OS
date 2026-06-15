import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, Circle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { GOALS, DIFFICULTY_STYLES, TOTAL_GOALS } from '@/lib/goals';
import AIUnlockedCelebration from '@/components/feed/AIUnlockedCelebration';
import { useAIUnlock } from '@/lib/useAIUnlock';

export default function Challenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('todos');
  const { showCelebration, dismissCelebration } = useAIUnlock();

  const { data: myCompletions = [] } = useQuery({
    queryKey: ['challenges', user?.email],
    queryFn: () => base44.entities.Challenge.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: allCompletions = [] } = useQuery({
    queryKey: ['challenges-all'],
    queryFn: () => base44.entities.Challenge.list('-created_date', 500),
  });

  const completedIds = new Set(myCompletions.map((c) => c.challenge_id));

  // Leaderboard: count completions per user
  const leaderboard = useMemo(() => {
    const map = {};
    allCompletions.forEach((c) => {
      map[c.user_email] = (map[c.user_email] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [allCompletions]);

  // Metas agora são validadas automaticamente pelo agente `validateGoals`
  // (automação roda a cada 1h e analisa posts/curtidas/seguidores reais).
  // Usuários NÃO podem mais marcar manualmente.
  const handleToggle = () => {
    toast.info('As metas são validadas automaticamente pela Sexta-feira. Continue postando e engajando!', { duration: 4000 });
  };

  const filters = ['todos', 'pendentes', 'concluídas'];
  const filtered = GOALS.filter((g) => {
    if (filter === 'pendentes') return !completedIds.has(g.id);
    if (filter === 'concluídas') return completedIds.has(g.id);
    return true;
  });

  const progress = completedIds.size;
  const pct = Math.round((progress / TOTAL_GOALS) * 100);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative px-6 py-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Objetivos</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tight mb-1">
            <span className="gold-gradient italic">Metas</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete as 20 metas para desbloquear todas as conquistas e liberar a Sexta-feira IA.
          </p>
          <p className="text-xs text-gold/80 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Validação automática · a Sexta-feira monitora seus posts e conquistas em tempo real
          </p>

          <div className="mt-5 max-w-sm">
            <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
              <span>{progress} de {TOTAL_GOALS} concluídas</span>
              <span className="text-gold font-semibold">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-dark"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit mb-6">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                    filter === f ? 'bg-gold text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((goal, i) => {
                  const Icon = goal.icon;
                  const done = completedIds.has(goal.id);
                  const diff = DIFFICULTY_STYLES[goal.difficulty];

                  return (
                    <motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: i * 0.02 }}
                      className={cn(
                        'relative group rounded-2xl border overflow-hidden transition-all',
                        done
                          ? 'border-gold/30 bg-gradient-to-r from-gold/5 to-transparent'
                          : 'border-border bg-card hover:border-gold/20',
                        goal.legendary && 'ring-1 ring-gold/20'
                      )}
                    >
                      <div className="relative flex items-center gap-4 p-4">
                        <span className="text-[10px] text-muted-foreground font-bold w-6 text-center flex-shrink-0 opacity-50">
                          {String(goal.id).padStart(2, '0')}
                        </span>

                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                            done
                              ? `bg-gradient-to-br ${goal.gradient} text-white`
                              : 'bg-muted text-muted-foreground group-hover:bg-gold/10 group-hover:text-gold'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className={cn('font-semibold text-sm', done && 'text-gold')}>
                              Meta {goal.id} · {goal.title}
                            </h3>
                            <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', diff.class)}>
                              {diff.label}
                            </span>
                            {goal.legendary && (
                              <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-bold">
                                Único
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{goal.desc}</p>
                          <p className="text-[10px] text-gold/80 mt-1">
                            🏆 Desbloqueia: <span className="font-semibold">{goal.badge}</span>
                          </p>
                        </div>

                        <div
                          onClick={handleToggle}
                          title={done ? 'Meta conquistada' : 'Validação automática'}
                          className={cn(
                            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-help',
                            done
                              ? 'bg-gold border-gold text-background'
                              : 'border-border text-muted-foreground'
                          )}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Top Metas</h3>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Seja o primeiro!</p>
              ) : (
                <div className="space-y-2.5">
                  {leaderboard.map(([email, count], i) => (
                    <div key={email} className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'w-5 text-center font-display text-sm font-bold flex-shrink-0',
                          i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center text-xs font-bold text-gold flex-shrink-0">
                        {email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{email.split('@')[0]}</p>
                        <p className="text-[10px] text-muted-foreground">{count} metas</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-[10px] text-muted-foreground mb-1">Você concluiu</p>
                  <p className="font-display text-2xl gold-gradient font-bold">{progress}</p>
                  <p className="text-xs text-muted-foreground">de {TOTAL_GOALS} metas</p>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Recompensa final</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Complete todas as <span className="text-gold font-semibold">20 metas</span> para desbloquear todas as conquistas{' '}
                <span className="text-gold font-semibold">+ acesso à Sexta-feira IA</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AIUnlockedCelebration open={showCelebration} onClose={dismissCelebration} />
    </div>
  );
}