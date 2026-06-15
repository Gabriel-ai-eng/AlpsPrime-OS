import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, LogOut, Trash2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import TeamCreateForm from '@/components/team/TeamCreateForm';
import TeamMembersList from '@/components/team/TeamMembersList';
import TeamInviteBox from '@/components/team/TeamInviteBox';
import TeamInvitesList from '@/components/team/TeamInvitesList';
import InviteCodeCard from '@/components/team/InviteCodeCard';

export default function Team() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-team', user?.email],
    queryFn: async () => (await base44.functions.invoke('getMyTeam', {})).data,
    enabled: !!user?.email,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['my-team'] });

  const handleLeaveOrDelete = async (action) => {
    if (!data?.team) return;
    const msg = action === 'delete'
      ? 'Tem certeza que deseja EXCLUIR o time? Essa ação é permanente.'
      : 'Sair do time agora?';
    if (!confirm(msg)) return;
    try {
      await base44.functions.invoke('leaveTeam', { team_id: data.team.id, action });
      toast.success(action === 'delete' ? 'Time excluído.' : 'Você saiu do time.');
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erro.');
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border px-4 lg:px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Equipe</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tight leading-[1.25] pb-2">
            <span className="gold-gradient italic inline-block pr-2">Time</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Junte forças, alcance metas em equipe e desbloqueie badges exclusivos (Metas 10 e 15).
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {data?.invites?.length > 0 && (
              <TeamInvitesList invites={data.invites} onResponded={refresh} />
            )}

            {data?.team ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Team header */}
                <div className="bg-card border border-gold/20 rounded-2xl p-6 bg-gradient-to-br from-gold/5 to-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-2xl mb-1 truncate">{data.team.name}</h2>
                      {data.team.description && (
                        <p className="text-sm text-muted-foreground">{data.team.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {data.team.members_count || data.members.length} {(data.team.members_count || data.members.length) === 1 ? 'membro' : 'membros'}
                      </p>
                    </div>
                    {data.team.owner_email === user.email ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLeaveOrDelete('delete')}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Excluir
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLeaveOrDelete('leave')}
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        Sair
                      </Button>
                    )}
                  </div>
                </div>

                {data.team.owner_email === user.email && <TeamInviteBox team={data.team} />}
                <TeamMembersList members={data.members} />
              </motion.div>
            ) : (
              <TeamCreateForm onCreated={refresh} />
            )}

            {/* Invite code (always visible) */}
            <InviteCodeCard />
          </>
        )}
      </div>
    </div>
  );
}