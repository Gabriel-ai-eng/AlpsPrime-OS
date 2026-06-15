import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Vote, User, Clock, Loader2, Check, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import VotingOptInToggle from '@/components/profile/VotingOptInToggle';

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export default function Voting() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [voting, setVoting] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['voting-feed'],
    queryFn: async () => (await base44.functions.invoke('getVotingFeed', {})).data,
    enabled: !!user?.email,
  });

  const todayLabel = WEEKDAYS[new Date().getDay()];
  const isVotingDay = data?.is_voting_day;
  const myVote = data?.my_vote_post_id;

  const handleVote = async (postId) => {
    setVoting(postId);
    try {
      await base44.functions.invoke('castVote', { post_id: postId });
      toast.success('Voto registrado!');
      qc.invalidateQueries({ queryKey: ['voting-feed'] });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erro ao votar.');
    } finally {
      setVoting(null);
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border px-4 lg:px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Votação</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tight leading-[1.25] pb-2">
            Mais <span className="gold-gradient italic inline-block pr-2">Criativo</span> da Semana
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vote no post mais criativo. Resultado anunciado no <Link to="/sextou" className="text-gold hover:underline">Sextou</Link>. (Meta 18)
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-4">
        {/* Voting opt-in toggle */}
        {user && <VotingOptInToggle user={user} />}

        {/* Status banner */}
        {!isVotingDay ? (
          <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Votação fechada</p>
              <p className="text-xs text-muted-foreground">
                Hoje é <span className="capitalize">{todayLabel}</span>. A votação fica aberta apenas às quintas-feiras.
                Você pode visualizar os candidatos abaixo, mas não votar.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-2xl p-5 flex items-start gap-3">
            <Vote className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Votação aberta hoje!</p>
              <p className="text-xs text-muted-foreground">
                Escolha o post mais criativo da semana. Você pode trocar seu voto até o fim do dia.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.candidates?.length ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum candidato esta semana ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {data.candidates.map((post) => {
                const isMyVote = myVote === post.id;
                const isOwn = post.author_email === user.email;
                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'bg-card border rounded-2xl overflow-hidden transition-all',
                      isMyVote ? 'border-gold ring-1 ring-gold/30' : 'border-border'
                    )}
                  >
                    <div className="p-4">
                      <Link
                        to={`/profile/${encodeURIComponent(post.author_email)}`}
                        className="flex items-center gap-2.5 mb-3 group"
                      >
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {post.author_avatar ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-gold transition-colors">{post.author_name || 'Usuário'}</p>
                          <p className="text-[10px] text-muted-foreground">{post.likes_count} curtidas · {post.comments_count} comentários</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 border border-gold/20">
                          <Vote className="w-3 h-3 text-gold" />
                          <span className="text-xs font-bold text-gold">{post.votes}</span>
                        </div>
                      </Link>

                      {post.content && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
                      )}
                    </div>

                    {post.media_url && post.media_type === 'image' && (
                      <img src={post.media_url} alt="" className="w-full max-h-[400px] object-cover" />
                    )}
                    {post.media_url && post.media_type === 'video' && (
                      <video src={post.media_url} controls className="w-full max-h-[400px]" />
                    )}

                    <div className="p-3 border-t border-border">
                      <button
                        onClick={() => handleVote(post.id)}
                        disabled={!isVotingDay || isOwn || voting === post.id}
                        className={cn(
                          'w-full h-10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                          isMyVote
                            ? 'bg-gold text-background'
                            : 'bg-muted hover:bg-gold/10 hover:text-gold disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        {voting === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isMyVote ? (
                          <><Check className="w-4 h-4" /> Seu voto</>
                        ) : isOwn ? (
                          'Não pode votar no próprio post'
                        ) : !isVotingDay ? (
                          'Votação fechada'
                        ) : (
                          <><Vote className="w-4 h-4" /> Votar</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}