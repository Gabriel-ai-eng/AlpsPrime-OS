import React, { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, User, UserPlus, UserCheck, MessageCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getConversationKey } from '@/lib/chatUtils';
import { createNotification } from '@/lib/notifications';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import { useT } from '@/lib/i18n';

export default function Verified() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const t = useT();

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('listPublicUsers', {});
      return res?.data?.users || [];
    },
  });

  const { data: myFollows = [] } = useQuery({
    queryKey: ['my-follows', user?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: user?.email }, '-created_date', 500),
    enabled: !!user?.email,
  });
  const followedSet = new Set(myFollows.map((f) => f.followed_email));

  const verifiedUsers = useMemo(() => {
    return allUsers.filter((u) => u.is_verified === true || u.plan === 'pro' || u.plan === 'unlimited');
  }, [allUsers]);

  const handleFollow = async (targetEmail) => {
    const existing = myFollows.find((f) => f.followed_email === targetEmail);
    if (existing) {
      await base44.entities.Follow.delete(existing.id);
      toast.success(t('Deixou de seguir'));
    } else {
      await base44.entities.Follow.create({
        follower_email: user.email,
        followed_email: targetEmail,
      });
      createNotification({ recipientEmail: targetEmail, actor: user, type: 'follow' });
      toast.success(t('Seguindo!'));
    }
    queryClient.invalidateQueries({ queryKey: ['my-follows'] });
    queryClient.invalidateQueries({ queryKey: ['followers'] });
    queryClient.invalidateQueries({ queryKey: ['following'] });
  };

  const handleMessage = (targetEmail) => {
    const key = getConversationKey(user.email, targetEmail);
    navigate(`/chat-dm?c=${encodeURIComponent(key)}`);
  };

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gold/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative px-6 py-12 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 mb-5">
              <BadgeCheck className="w-3.5 h-3.5 text-gold" fill="rgba(212,175,55,0.15)" />
              <span className="text-[10px] uppercase tracking-widest text-gold font-bold">{t('Selo de verificação')}</span>
            </div>
            <h1 className="font-display text-4xl lg:text-6xl tracking-tight leading-[1.05]">
              <span className="gold-gradient italic">{t('Verificados')}</span>
            </h1>
            <p className="text-muted-foreground mt-4 text-sm lg:text-base max-w-xl mx-auto">
              {t('Usuários verificados da comunidade Sexta-feira.')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : verifiedUsers.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <BadgeCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-display text-xl mb-1">{t('Ainda sem verificados')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('Seja um dos primeiros a conquistar o selo.')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {verifiedUsers.map((u, i) => (
              <motion.div
                key={u.email}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-gold/30 transition-colors"
              >
                <Link
                  to={`/profile/${encodeURIComponent(u.email)}`}
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-gold/40 transition-all block"
                >
                  {u.profile_picture_url ? (
                    <img src={u.profile_picture_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gold" />
                  )}
                </Link>

                <Link to={`/profile/${encodeURIComponent(u.email)}`} className="flex-1 min-w-0 group">
                  <p className="font-semibold text-sm truncate group-hover:text-gold transition-colors inline-flex items-center gap-1 flex-wrap">
                    {u.ranking_display_name || u.full_name || t('Usuário')}
                    <VerifiedBadge size={13} />
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.username ? `@${u.username}` : u.email}
                  </p>
                  {u.bio && (
                    <p className="text-xs text-muted-foreground/80 truncate mt-0.5 italic">{u.bio}</p>
                  )}
                </Link>

                {u.email !== user?.email && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleMessage(u.email)}
                      className="w-9 h-9 rounded-lg border border-border hover:border-gold/40 hover:bg-gold/5 hover:text-gold text-muted-foreground flex items-center justify-center transition-colors"
                      title={t('Enviar mensagem')}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFollow(u.email)}
                      className={cn(
                        'h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
                        followedSet.has(u.email)
                          ? 'border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive'
                          : 'bg-gold hover:bg-gold-dark text-background'
                      )}
                    >
                      {followedSet.has(u.email) ? (
                        <><UserCheck className="w-3.5 h-3.5" /> {t('Seguindo')}</>
                      ) : (
                        <><UserPlus className="w-3.5 h-3.5" /> {t('Seguir')}</>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
