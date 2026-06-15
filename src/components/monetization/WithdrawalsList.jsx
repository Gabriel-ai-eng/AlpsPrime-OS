import React from 'react';
import { History, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  pending:    { icon: Clock,        label: 'Pendente',    color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  processing: { icon: Loader2,      label: 'Processando', color: 'text-sky-400 bg-sky-400/10 border-sky-400/30', spin: true },
  paid:       { icon: CheckCircle2, label: 'Pago',        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  rejected:   { icon: XCircle,      label: 'Recusado',    color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

export default function WithdrawalsList({ withdrawals = [] }) {
  if (withdrawals.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-3.5 h-3.5 text-gold" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Histórico de saques</span>
      </div>

      <div className="space-y-2">
        {withdrawals.map((w) => {
          const cfg = STATUS_CONFIG[w.status] || STATUS_CONFIG.pending;
          const Icon = cfg.icon;
          return (
            <div
              key={w.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background"
            >
              <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0', cfg.color)}>
                <Icon className={cn('w-3.5 h-3.5', cfg.spin && 'animate-spin')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {(w.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  PIX: {w.pix_key} ·{' '}
                  {w.created_date && format(new Date(w.created_date), "d 'de' MMM, HH:mm", { locale: ptBR })}
                </p>
              </div>
              <span className={cn('text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border', cfg.color)}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}