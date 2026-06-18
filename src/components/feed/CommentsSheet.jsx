import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Loader2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { parseServerDate } from '@/lib/utils';
import { createNotification } from '@/lib/notifications';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import { useUsersDirectory } from '@/lib/useUsersDirectory';

export default function CommentsSheet({ post, user, onClose, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [likesByComment, setLikesByComment] = useState({});
  const [myLikedComments, setMyLikedComments] = useState(new Set());
  const { getAvatar, getName, getPlan } = useUsersDirectory();

  useEffect(() => {
    if (!post) return;
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const loadComments = async () => {
    setLoading(true);
    const list = await base44.entities.Comment.filter({ post_id: post.id }, '-created_date', 100);
    setComments(list);
    // Load likes counts and my likes
    if (list.length) {
      const allLikes = await base44.entities.CommentLike.list('-created_date', 5000).catch(() => []);
      const counts = {};
      const mine = new Set();
      const ids = new Set(list.map((c) => c.id));
      allLikes.forEach((cl) => {
        if (!ids.has(cl.comment_id)) return;
        counts[cl.comment_id] = (counts[cl.comment_id] || 0) + 1;
        if (cl.user_email === user.email) mine.add(cl.comment_id);
      });
      setLikesByComment(counts);
      setMyLikedComments(mine);
    }
    setLoading(false);
  };

  const toggleCommentLike = async (commentId) => {
    const wasLiked = myLikedComments.has(commentId);
    // optimistic
    setMyLikedComments((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(commentId) : next.add(commentId);
      return next;
    });
    setLikesByComment((prev) => ({
      ...prev,
      [commentId]: Math.max(0, (prev[commentId] || 0) + (wasLiked ? -1 : 1)),
    }));
    try {
      await base44.functions.invoke('likeComment', { comment_id: commentId });
    } catch {
      // revert on error
      setMyLikedComments((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(commentId) : next.delete(commentId);
        return next;
      });
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await base44.entities.Comment.create({
        post_id: post.id,
        author_email: user.email,
        author_name: user.ranking_display_name || user.full_name,
        author_avatar: user.profile_picture_url || '',
        author_plan: user.plan || 'free',
        content: text.trim(),
      });
      await base44.entities.Post.update(post.id, {
        comments_count: (post.comments_count || 0) + 1,
      });
      createNotification({
        recipientEmail: post.author_email,
        actor: user,
        type: 'comment',
        postId: post.id,
        postPreview: post.content,
        commentPreview: text.trim(),
      });
      setText('');
      await loadComments();
      onCommentAdded?.();
    } catch (e) {
      toast.error('Falha ao comentar');
    }
    setSending(false);
  };

  if (!post) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-end sm:items-center justify-center"
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border-t sm:border border-border sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Comentários</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Seja o primeiro a comentar.</p>
            ) : (
              comments.map((c) => {
                const avatar = getAvatar(c.author_email, c.author_avatar);
                const name = getName(c.author_email, c.author_name);
                const plan = getPlan(c.author_email, c.author_plan);
                return (
                <div key={c.id} className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted rounded-2xl px-3 py-2">
                      <p className="text-xs font-semibold inline-flex items-center gap-1">
                        {name || 'Usuário'}
                        <VerifiedBadge size={11} />
                      </p>
                      <p className="text-sm mt-0.5 break-words">{c.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-3">
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(parseServerDate(c.created_date), { addSuffix: true, locale: ptBR })}
                      </p>
                      <button
                        onClick={() => toggleCommentLike(c.id)}
                        className={cn(
                          'inline-flex items-center gap-1 text-[10px] transition-colors',
                          myLikedComments.has(c.id) ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
                        )}
                      >
                        <Heart className={cn('w-3 h-3', myLikedComments.has(c.id) && 'fill-current')} />
                        {(likesByComment[c.id] || 0) > 0 && (likesByComment[c.id] || 0)}
                      </button>
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>

          <div className="p-3 border-t border-border flex items-center gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Escreva um comentário..."
              className="bg-background border-border"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="w-9 h-9 rounded-full bg-gold hover:bg-gold-dark text-background flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}