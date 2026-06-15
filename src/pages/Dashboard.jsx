import React, { useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { TOOLS, TOOL_CATEGORIES } from '@/lib/tools';
import ToolCard from '@/components/dashboard/ToolCard';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();

  const categorized = useMemo(() => {
    const byCat = {};
    TOOLS.forEach(t => {
      if (!byCat[t.category]) byCat[t.category] = [];
      byCat[t.category].push(t);
    });
    return byCat;
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Usuário';

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative px-6 lg:px-10 py-10 lg:py-14 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Painel Principal</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl tracking-tight mb-3">
              Olá, <span className="gold-gradient italic">{firstName}</span>
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg max-w-2xl">
              Escolha uma ferramenta abaixo para começar. Todas as capacidades de IA de ponta em um só lugar.
            </p>

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 max-w-3xl">
              <StatCard icon={Zap} label="Créditos" value={user?.plan === 'unlimited' ? '∞' : (user?.credits ?? 0).toLocaleString()} />
              <StatCard icon={TrendingUp} label="Plano" value={user?.plan || 'free'} capitalize />
              <StatCard icon={Sparkles} label="Ferramentas" value={TOOLS.filter(t => t.available).length} />
              <StatCard icon={TrendingUp} label="Usado" value={(user?.total_credits_used ?? 0).toLocaleString()} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 lg:px-10 py-10 max-w-7xl mx-auto space-y-12">
        {Object.entries(TOOL_CATEGORIES).map(([catKey, catInfo]) => {
          const tools = categorized[catKey] || [];
          if (tools.length === 0) return null;
          return (
            <section key={catKey}>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl lg:text-3xl tracking-tight">{catInfo.label}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{tools.length} ferramentas disponíveis</p>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-border via-border to-transparent mx-6 mb-3 hidden sm:block" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {tools.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} index={i} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Upgrade CTA for free users */}
        {user?.plan === 'free' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-gold/20 p-8 lg:p-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl lg:text-3xl tracking-tight mb-2">
                  Desbloqueie todo o <span className="gold-gradient italic">potencial</span>
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Faça upgrade para Pro e tenha acesso a 2.000 créditos mensais, todas as ferramentas e suporte prioritário.
                </p>
              </div>
              <Link to="/plans">
                <Button className="bg-gradient-to-r from-gold-light via-gold to-gold-dark hover:opacity-90 text-background font-semibold h-12 px-8">
                  Ver Planos
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="bg-card/50 border border-border rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-gold" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className={`font-display text-xl lg:text-2xl ${capitalize ? 'capitalize' : ''}`}>{value}</div>
    </div>
  );
}