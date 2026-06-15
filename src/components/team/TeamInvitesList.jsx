import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Mail, Check, X, Loader2 } from 'lucide-react';

export default function TeamInvitesList({ invites, onResponded }) {
  const [busyId, setBusyId] = useState(null);

  if (!invites?.length) return null;

  const respond = async (tmId, action) => {
    setBusyId(tmId);
    try {
      await base44.functions.invoke('respondTeamInvite', { team_member_id: tmId, action });
      toast.success(action === 'accept' ? 'Convite aceito!' : 'Convite recusado.');
      onResponded?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erro.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-card border border-gold/30 rounded-2xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-semibold">Convites pendentes</h3>
      </div>
      <div className="space-y-3">
        {invites.map(({ team_member_id, team }) => (
          <div key={team_member_id} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-gold">{team.name[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{team.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">de {team.owner_email}</p>
            </div>
            <Button
              size="sm"
              disabled={busyId === team_member_id}
              onClick={() => respond(team_member_id, 'accept')}
              className="h-8 bg-gold hover:bg-gold-dark text-background"
            >
              {busyId === team_member_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busyId === team_member_id}
              onClick={() => respond(team_member_id, 'decline')}
              className="h-8"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}