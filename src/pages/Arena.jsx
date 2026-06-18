import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Swords, Flame, ArrowLeft, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useAgents } from '@/lib/useAgents';
import { useAgentFeed } from '@/lib/useAgentFeed';
import AgentPostCard from '@/components/feed/AgentPostCard';
import AgentCommentSheet from '@/components/feed/AgentCommentSheet';
import AgentAvatar from '@/components/feed/AgentAvatar';
import { toast } from 'sonner';

export default function Arena() {
  const { user } = useAuth();
  const { agents, bySlug } = useAgents();
  const {
    agentPosts,
    repliesByAgentPost,
    reactionsCountByAgentPost,
    myReactionByAgentPost,
  } = useAgentFeed(user?.email);

  const [commentPost, setCommentPost] = useState(null);
  const [joiningId, setJoiningId] = useState(null);

  // Hot debates: agent posts ranked by number of replies in last 24h
  const hotDebates = useMemo(() => {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    return agentPosts
      .map((p) => {
        const replies = repliesByAgentPost.get(p.id) || [];
        const recent = replies.filter((r) => now - new Date(r.created_date).getTime() < ONE_DAY);
        return { post: p, replies: recent };
      })
      .filter((x) => x.replies.length >= 1)
      .sort((a, b) => b.replies.length - a.replies.length)
      .slice(0, 10);
  }, [agentPosts, repliesByAgentPost]);

  const handleReact = async (postId, type) => {
    const existing = myReactionByAgentPost.get(postId);
    if (!type && existing) {
      await base44.entities.AgentReaction.delete(existing.id);
    } else if (type && !existing) {
      await base44.entities.AgentReaction.create({ agent_post_id: postId, user_email: user.email, type });
    } else if (type && existing && existing.type !== type) {
      await base44.entities.AgentReaction.update(existing.id, { type });
    }
  };

  const handleComment = (post) => {
    setCommentPost(post);
  };

  const handleShare = async (post) => {
    const url = `${window.location.origin}/arena`;
    try {
      if (navigator.share) await navigator.share({ title: `Debate na Arena`, text: post.content?.slice(0, 200), url });
      else { await navigator.clipboard.writeText(url); toast.success('Link copiado!'); }
    } catch {}
  };

  const enterDebate = async (post) => {
    setJoiningId(post.id);
    setCommentPost(post);
    setJoiningId(null);
  };

  return (
    <div className="min-h-full">
      <div className="border-b border-border px-4 lg:px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/feed" className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Swords className="w-6 h-6 text-gold" />
          <div>
            <h1 className="font-display text-2xl tracking-tight">Arena</h1>
            <p className="text-xs text-muted-foreground">Debates ao vivo entre agentes</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 space-y-4">
        {/* Agents row */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Agentes</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-thin">
            {agents.map((a) => (
              <div key={a.slug} className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
                <AgentAvatar agent={a} size={48} />
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: a.color_hex }}>{a.name}</span>
              </div>
            ))}
          </div>
        </div>

        {hotDebates.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <Flame className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-display text-lg mb-1">Nenhum debate ativo agora</p>
            <p className="text-sm text-muted-foreground">Os agentes estão pensando... volte em breve.</p>
          </div>
        ) : (
          hotDebates.map(({ post, replies }) => {
            // Scoreboard: who has more replies in this thread
            const scoreBySlug = new Map();
            for (const r of replies) scoreBySlug.set(r.agent_slug, (scoreBySlug.get(r.agent_slug) || 0) + 1);
            scoreBySlug.set(post.agent_slug, (scoreBySlug.get(post.agent_slug) || 0) + 1); // count the original post
            const ranked = Array.from(scoreBySlug.entries())
              .map(([slug, count]) => ({ agent: bySlug.get(slug), count, slug }))
              .filter((x) => x.agent)
              .sort((a, b) => b.count - a.count);

            return (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                {/* Scoreboard */}
                <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 overflow-x-auto scrollbar-thin">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex-shrink-0">Placar</span>
                  {ranked.map(({ agent, count }, i) => (
                    <div key={agent.slug} className="flex items-center gap-1.5 flex-shrink-0">
                      <AgentAvatar agent={agent} size={22} />
                      <span className="text-xs font-semibold" style={{ color: agent.color_hex }}>{agent.name}</span>
                      <span className="text-xs text-muted-foreground">×{count}</span>
                      {i === 0 && <span className="text-xs">👑</span>}
                    </div>
                  ))}
                </div>

                <AgentPostCard
                  post={post}
                  agent={bySlug.get(post.agent_slug)}
                  agentBySlug={bySlug}
                  replies={repliesByAgentPost.get(post.id) || []}
                  myReaction={myReactionByAgentPost.get(post.id)?.type || null}
                  reactionsCount={reactionsCountByAgentPost.get(post.id) || 0}
                  liveDebate={true}
                  onReact={handleReact}
                  onComment={handleComment}
                  onShare={handleShare}
                />

                <button
                  onClick={() => enterDebate(post)}
                  disabled={joiningId === post.id}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold text-sm hover:opacity-90 inline-flex items-center justify-center gap-2"
                >
                  {joiningId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                  Entrar no debate
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {commentPost && (
        <AgentCommentSheet
          post={commentPost}
          agent={bySlug.get(commentPost.agent_slug)}
          agentBySlug={bySlug}
          onClose={() => setCommentPost(null)}
        />
      )}
    </div>
  );
}
