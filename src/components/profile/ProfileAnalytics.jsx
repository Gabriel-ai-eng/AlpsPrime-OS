import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  BarChart3, Eye, Users, Clock, TrendingUp, Download, Loader2,
  Rss, Search, BadgeCheck, PartyPopper, MessageCircle, Trophy, Globe2, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SOURCE_LABELS = {
  feed: { label: 'Feed', icon: Rss },
  search: { label: 'Busca', icon: Search },
  verified: { label: 'Verificados', icon: BadgeCheck },
  sextou: { label: 'Sextou', icon: PartyPopper },
  dm: { label: 'Mensagens', icon: MessageCircle },
  ranking: { label: 'Ranking', icon: Trophy },
  notification: { label: 'Notificação', icon: BadgeCheck },
  direct: { label: 'Direto', icon: Globe2 },
  other: { label: 'Outro', icon: MoreHorizontal },
};

function formatDuration(sec) {
  if (!sec || sec < 1) return '0s';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export default function ProfileAnalytics({ user }) {
  return <UnlockedAnalytics user={user} />;
}

function UnlockedAnalytics({ user }) {
  const { data, isLoading } = useQuery({
    queryKey: ['profile-analytics', user.email],
    queryFn: async () => {
      const res = await base44.functions.invoke('getProfileAnalytics', {});
      return res.data;
    },
  });

  const [exporting, setExporting] = useState(false);

  const handleExportCSV = () => {
    if (!data) return;
    setExporting(true);
    const rows = [
      ['Métrica', 'Valor'],
      ['Total de visitas', data.totals.total_visits],
      ['Visitantes únicos', data.totals.unique_visitors],
      ['Tempo médio (s)', data.totals.avg_duration_seconds],
      ['Janela', data.window],
      [],
      ['Fonte', 'Visitas'],
      ...Object.entries(data.sources || {}).map(([k, v]) => [SOURCE_LABELS[k]?.label || k, v]),
      [],
      ['Data', 'Visitas'],
      ...(data.timeline || []).map((t) => [t.date, t.count]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${user.email}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-4 h-4 text-gold" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Analytics Profundo
        </h2>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
          Últimos 7 dias
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-5">
        Apenas números agregados. Identidade dos visitantes nunca é exposta.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-gold" />
        </div>
      ) : !data ? (
        <p className="text-sm text-muted-foreground text-center py-8">Sem dados ainda.</p>
      ) : (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <StatCard icon={Eye} label="Visitas" value={data.totals.total_visits.toLocaleString('pt-BR')} />
            <StatCard icon={Users} label="Únicos" value={data.totals.unique_visitors.toLocaleString('pt-BR')} />
            <StatCard icon={Clock} label="Tempo médio" value={formatDuration(data.totals.avg_duration_seconds)} />
          </div>

          {/* Timeline (7d) */}
          <Timeline timeline={data.timeline} />

          {/* Sources */}
          <Sources sources={data.sources} total={data.totals.total_visits} />

          {/* Top post */}
          {data.top_post && <TopPost post={data.top_post} />}

          {/* Export CSV */}
          <Button
            onClick={handleExportCSV}
            disabled={exporting}
            variant="outline"
            className="w-full mt-4 border-gold/30 hover:border-gold/60 hover:bg-gold/5 hover:text-gold gap-2"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-background border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-gold" />
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="font-display text-lg">{value}</div>
    </div>
  );
}

function Timeline({ timeline }) {
  if (!timeline?.length) return null;
  const max = Math.max(...timeline.map((t) => t.count), 1);
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp className="w-3 h-3 text-gold" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Últimos 7 dias</span>
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {timeline.map((t) => (
          <div key={t.date} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {t.count}
            </div>
            <div
              className="w-full bg-gradient-to-t from-gold-dark to-gold rounded-t transition-all"
              style={{ height: `${(t.count / max) * 100}%`, minHeight: t.count > 0 ? '3px' : '1px' }}
            />
            <div className="text-[9px] text-muted-foreground">
              {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'narrow' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sources({ sources, total }) {
  const entries = Object.entries(sources || {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-3">
        <Globe2 className="w-3 h-3 text-gold" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Origem das visitas</span>
      </div>
      <div className="space-y-2">
        {entries.map(([key, count]) => {
          const meta = SOURCE_LABELS[key] || SOURCE_LABELS.other;
          const Icon = meta.icon;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} className="flex items-center gap-3 text-xs">
              <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-20 flex-shrink-0">{meta.label}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-foreground font-medium w-12 text-right">{count} <span className="text-muted-foreground">({pct}%)</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopPost({ post }) {
  return (
    <div className="border border-border rounded-xl p-3 bg-background">
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="w-3 h-3 text-gold" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Post com mais visitas</span>
      </div>
      <div className="flex gap-3">
        {post.media_url && post.media_type === 'image' && (
          <img src={post.media_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground line-clamp-2">{post.content || 'Post sem texto'}</p>
          <p className="text-xs text-gold mt-1">{post.click_count} cliques</p>
        </div>
      </div>
    </div>
  );
}