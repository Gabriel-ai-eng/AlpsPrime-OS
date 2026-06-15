import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Share2, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseServerDate, cn } from '@/lib/utils';
import AgentAvatar from './AgentAvatar';
import AgentChart from './AgentChart';
import AgentRepliesList from './AgentRepliesList';
import { AIBadge, GeneratedByAITag } from './AgentBadge';
import ReactionPicker from './ReactionPicker';

export default function AgentPostCard({
  post,
  agent,
  agentBySlug,
  replies,
  myReaction,
  reactionsCount,
  liveDebate,
  onReact,
  onComment,
  onShare,
  glassEnabled,
}) {
  const accent = agent?.color_hex || '#C9A24F';

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden relative ${glassEnabled ? 'rounded-3xl' : 'rounded-2xl bg-card border border-border shadow-sm'}`}
      style={glassEnabled ? {
        background: 'rgba(255,255,255,0.58)',
        backdropFilter: 'blur(28px) saturate(170%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(28px) saturate(170%) brightness(1.05)',
        border: '1px solid rgba(255,255,255,0.80)',
        boxShadow: '0 4px 24px rgba(120,90,40,0.08), 0 1px 0 rgba(255,255,255,1) inset, 0 0 0 0.5px rgba(120,90,40,0.05)',
      } : {}}
    >
      {liveDebate && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/30 text-[10px] font-bold text-destructive uppercase tracking-widest z-10">
          <Flame className="w-3 h-3" />
          Debate ao vivo
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <AgentAvatar agent={agent} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: accent }}>
              {post.agent_name}
            </span>
            <AIBadge small />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {agent?.specialty || ''}
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
            {formatDistanceToNow(parseServerDate(post.created_date), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{post.content}</p>
        </div>
      )}

      {/* Chart */}
      {post.media_type === 'grafico' && post.chart_data && (
        <AgentChart data={post.chart_data} accentColor={accent} />
      )}

      {/* Image */}
      {post.media_type === 'imagem' && post.media_url && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-border">
          <img src={post.media_url} alt="" className="w-full max-h-[500px] object-cover" />
        </div>
      )}

      <div className="px-4 pb-3">
        <GeneratedByAITag />
      </div>

      {/* Replies */}
      <AgentRepliesList replies={replies} agentBySlug={agentBySlug} />

      {/* Stats */}
      {(reactionsCount > 0 || (replies?.length || 0) > 0) && (
        <div className={`px-4 py-2 flex items-center gap-3 text-xs text-muted-foreground border-t ${glassEnabled ? 'border-white/40' : 'border-border'}`}>
          {reactionsCount > 0 && <span>{reactionsCount} reações</span>}
          {replies?.length > 0 && <span>{replies.length} respostas</span>}
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center border-t ${glassEnabled ? 'border-white/40' : 'border-border'}`} style={glassEnabled ? { background: 'rgba(255,255,255,0.20)' } : {}}>
        <ReactionPicker
          currentReaction={myReaction}
          onSelect={(type) => onReact(post.id, type)}
        />
        <ActionButton icon={MessageCircle} label="Comentar" onClick={() => onComment(post)} />
        <ActionButton icon={Share2} label="Compartilhar" onClick={() => onShare(post)} />
      </div>
    </motion.article>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}