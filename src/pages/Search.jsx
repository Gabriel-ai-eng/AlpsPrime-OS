import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, User, UserPlus, UserCheck, MessageCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getConversationKey } from '@/lib/chatUtils';
import { createNotification } from '@/lib/notifications';
import VerifiedBadge from '@/components/common/VerifiedBadge';

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Load all users (lightweight — then filter locally)
  // Uses a backend function with service role to bypass User RLS
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('listPublicUsers', {});
      return res?.data?.users || [];
    },
  });

  // My follows
  const { data: myFollows = [] } = useQuery({
    queryKey: ['my-follows', user?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: user?.email }, '-created_date', 500),
    enabled: !!user?.email,
  });
  const followedSet = new Set(myFollows.map((f) => f.followed_email));

  const results = useMemo(() => {
    const list = allUsers.filter((u) => u.email !== user?.email);
    if (!debounced) return list.slice(0, 50);
    return list.filter((u) => {
      const hay = `${u.full_name || ''} ${u.username || ''} ${u.email || ''} ${u.ranking_display_name || ''}`.toLowerCase();
      return hay.includes(debounced);
    }).slice(0, 100);
  }, [allUsers, debounced, user?.email]);

  const handleFollow = async (targetEmail) => {
    const existing = myFollows.find((f) => f.followed_email === targetEmail);
    if (existing) {
      await base44.entities.Follow.delete(existing.id);
      toast.success('Deixou de seguir');
    } else {
      await base44.entities.Follow.create({
        follower_email: user.email,
        followed_email: targetEmail,
      });
      createNotification({ recipientEmail: targetEmail, actor: user, type: 'follow' });
      toast.success('Seguindo!');
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
      {/* Header */}
      <div className="border-b border-border px-4 lg:px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <SearchIcon className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Buscar</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tight mb-4">
            Descubra <span className="gold-gradient italic">pessoas</span>
          </h1>
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por nome, @usuário ou email..."
              className="pl-10 h-11 bg-card border-border focus-visible:ring-gold/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {debounced ? `Nenhum resultado para "${debounced}"` : 'Nenhum usuário encontrado.'}
          </div>
        ) : (
          <div className="space-y-2">
            {!debounced && (
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Sugestões</p>
            )}
            {results.map((u, i) => (
              <motion.div
                key={u.email}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
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
                  <p className="font-semibold text-sm truncate group-hover:text-gold transition-colors inline-flex items-center gap-1">
                    {u.ranking_display_name || u.full_name || 'Usuário'}
                    <VerifiedBadge size={13} />
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.username ? `@${u.username}` : u.email}
                  </p>
                  {u.bio && (
                    <p className="text-xs text-muted-foreground/80 truncate mt-0.5 italic">{u.bio}</p>
                  )}
                </Link>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleMessage(u.email)}
                    className="w-9 h-9 rounded-lg border border-border hover:border-gold/40 hover:bg-gold/5 hover:text-gold text-muted-foreground flex items-center justify-center transition-colors"
                    title="Enviar mensagem"
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
                      <><UserCheck className="w-3.5 h-3.5" /> Seguindo</>
                    ) : (
                      <><UserPlus className="w-3.5 h-3.5" /> Seguir</>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
