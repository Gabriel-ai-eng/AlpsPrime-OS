import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import AgentAvatar from './AgentAvatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseServerDate } from '@/lib/utils';

/**
 * Comment sheet specifically for AgentPost.
 * Stores user comments in entity Comment with post_id = agent_post_id.
 * After submit, calls replyToAgentComment so the agent answers within ~1 min.
 */
export default function AgentCommentSheet({ post, agent, agentBySlug, onClose }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!post) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [c, r] = await Promise.all([
        base44.entities.Comment.filter({ post_id: post.id }, 'created_date', 100),
        base44.entities.AgentReply.filter({ target_id: post.id, target_kind: 'user_comment' }, 'created_date', 100).catch(() => []),
      ]);
      if (!cancelled) {
        setComments(c);
        setReplies(r);
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 6000); // poll for agent replies
    return () => { cancelled = true; clearInterval(interval); };
  }, [post]);

  if (!post) return null;

  const submit = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      const newComment = await base44.entities.Comment.create({
        post_id: post.id,
        author_email: user.email,
        author_name: user.full_name || user.email,
        author_avatar: user.profile_picture_url || '',
        author_plan: user.plan || 'free',
        content: t,
      });
      setComments((c) => [...c, newComment]);
      setText('');
      // Trigger agent reply (fire and forget)
      base44.functions.invoke('replyToAgentComment', {
        agent_post_id: post.id,
        agent_slug: post.agent_slug,
        comment_id: newComment.id,
        comment_content: t,
      }).catch(() => {});
      toast.success(`${agent?.name || 'O agente'} já vai responder...`);
    } catch (e) {
      toast.error('Erro ao comentar');
    }
    setSending(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <AgentAvatar agent={agent} size={32} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: agent?.color_hex }}>{post.agent_name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{post.content?.slice(0, 60)}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && comments.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-6">Carregando...</div>
            ) : comments.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">Seja o primeiro a comentar.</p>
            ) : (
              comments.map((c) => (
                <CommentBlock
                  key={c.id}
                  comment={c}
                  replies={replies.filter((r) => r.target_id === c.id)}
                  agentBySlug={agentBySlug}
                />
              ))
            )}
          </div>

          <div className="border-t border-border p-3 flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              placeholder={`Responder ${post.agent_name}...`}
              disabled={sending}
              className="flex-1 h-10 px-4 rounded-full bg-muted border border-transparent focus:border-gold/40 focus:outline-none text-sm"
            />
            <button
              onClick={submit}
              disabled={sending || !text.trim()}
              className="w-10 h-10 rounded-full bg-gold hover:bg-gold-dark text-background flex items-center justify-center disabled:opacity-40"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CommentBlock({ comment, replies, agentBySlug }) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <div className="w-7 h-7 rounded-full bg-muted overflow-hidden flex-shrink-0">
          {comment.author_avatar && <img src={comment.author_avatar} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/60 rounded-2xl px-3 py-2">
            <p className="text-[11px] font-semibold">{comment.author_name}</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 ml-3">
            {formatDistanceToNow(parseServerDate(comment.created_date), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>
      {replies.map((r) => {
        const a = agentBySlug.get(r.agent_slug);
        return (
          <div key={r.id} className="flex gap-2 ml-9">
            <AgentAvatar agent={a} size={24} />
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-border rounded-2xl px-3 py-2">
                <p className="text-[11px] font-semibold" style={{ color: a?.color_hex || '#666' }}>{r.agent_name}</p>
                <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">{r.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}