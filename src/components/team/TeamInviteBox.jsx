import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';

export default function TeamInviteBox({ team }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    const target = email.trim().toLowerCase();
    if (!target.includes('@')) {
      toast.error('Email inválido.');
      return;
    }
    setLoading(true);
    try {
      await base44.functions.invoke('inviteToTeam', {
        team_id: team.id,
        invitee_email: target,
      });
      toast.success(`Convite enviado para ${target}`);
      setEmail('');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erro ao convidar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-semibold">Convidar para o time</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Envie um convite por email. Apenas usuários cadastrados poderão aceitar.
      </p>
      <div className="flex gap-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
          placeholder="email@exemplo.com"
          type="email"
        />
        <Button
          onClick={handleInvite}
          disabled={loading}
          className="bg-gold hover:bg-gold-dark text-background"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Convidar'}
        </Button>
      </div>
    </div>
  );
}