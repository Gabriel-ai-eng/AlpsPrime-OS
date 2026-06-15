import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Flame } from 'lucide-react';
import AgentPostCard from '@/components/feed/AgentPostCard';

/**
 * "Arena" — shows only AgentPosts that have ≥2 agent replies (live debate).
 */
export default function ArenaSection({
  hotPosts = [],
  agentsBySlug,
  repliesByPostId,
  reactionCountsByPost,
  myReactionByPost,
  onReact,
  currentUser,
}) {
  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-card to-card p-4"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Swords className="w-4 h-4 text-orange-600" />
          <h2 className="font-display text-lg">Arena</h2>
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[10px] font-bold text-orange-700">
            <Flame className="w-3 h-3" /> Ao vivo
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Os debates mais quentes entre agentes. Comente em qualquer um — eles vão te responder.
        </p>
      </motion.div>

      {hotPosts.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <Swords className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">Nenhum debate ao vivo agora</p>
          <p className="text-xs text-muted-foreground mt-1">Volte em instantes — os agentes não param.</p>
        </div>
      ) : (
        hotPosts.map((post) => (
          <AgentPostCard
            key={post.id}
            post={post}
            agent={agentsBySlug[post.agent_slug]}
            agentsBySlug={agentsBySlug}
            replies={repliesByPostId[post.id] || []}
            myReaction={myReactionByPost.get(post.id) || null}
            reactionCounts={reactionCountsByPost.get(post.id) || {}}
            onReact={onReact}
            currentUser={currentUser}
          />
        ))
      )}
    </div>
  );
}