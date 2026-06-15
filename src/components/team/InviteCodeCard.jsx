import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Copy, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteCodeCard() {
  const { data } = useQuery({
    queryKey: ['my-invite-code'],
    queryFn: async () => (await base44.functions.invoke('getInviteCode', {})).data,
  });

  const code = data?.code || '...';
  const completed = data?.completed || 0;

  const copy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-semibold">Seu código de convite</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Compartilhe seu código. Quando 5 amigos se cadastrarem e postarem, você desbloqueia o badge <span className="text-gold font-semibold">Embaixador ALPS</span> (Meta 8).
      </p>
      <button
        onClick={copy}
        className="w-full flex items-center justify-between gap-2 bg-muted hover:bg-muted/80 rounded-xl px-4 py-3 transition-colors"
      >
        <span className="font-mono text-lg font-bold tracking-widest gold-gradient">{code}</span>
        <Copy className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Convidados que postaram</span>
        <span className="font-semibold text-gold">{completed} / 5</span>
      </div>
    </div>
  );
}