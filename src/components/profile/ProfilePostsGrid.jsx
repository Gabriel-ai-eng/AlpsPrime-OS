import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Grid3x3, ImageIcon, Video, MessageSquare, Heart, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { trackPostClick } from '@/lib/useProfileVisitTracker';
import { useNavigate } from 'react-router-dom';

export default function ProfilePostsGrid({ profileEmail, visitorEmail, visitorIsGhost }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canDelete = user?.email === profileEmail;
  const trackerVisitorEmail = visitorEmail ?? user?.email;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['profile-posts', profileEmail],
    queryFn: () => base44.entities.Post.filter({ author_email: profileEmail }, '-created_date', 100),
    enabled: !!profileEmail,
  });

  const handleDelete = async (postId) => {
    const confirmed = confirm(
      'Tem certeza que deseja excluir este post?\n\n⚠️ Atenção: os créditos de posts já consumidos NÃO serão restaurados ao excluir. Você continuará com o mesmo limite diário.'
    );
    if (!confirmed) return;
    await base44.entities.Post.delete(postId);
    toast.success('Post excluído');
    queryClient.invalidateQueries({ queryKey: ['profile-posts', profileEmail] });
    queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 className="w-4 h-4 text-gold" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Posts
        </h2>
        <span className="ml-auto text-xs text-muted-foreground">{posts.length}</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhum post ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {posts.map((post) => (
            <PostTile
              key={post.id}
              post={post}
              canDelete={canDelete}
              onDelete={handleDelete}
              onClick={() => {
                trackPostClick({
                  profileEmail,
                  visitorEmail: trackerVisitorEmail,
                  postId: post.id,
                  visitorIsGhost,
                });
                navigate(`/feed?post=${post.id}`);
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PostTile({ post, canDelete, onDelete, onClick }) {
  const hasMedia = post.media_type !== 'none' && post.media_url;
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    await onDelete(post.id);
    setDeleting(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="relative aspect-square bg-background border border-border rounded-xl overflow-hidden group cursor-pointer shadow-sm"
    >
      {hasMedia ? (
        post.media_type === 'image' ? (
          <img src={post.media_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="relative w-full h-full">
            <video src={post.media_url} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1">
              <Video className="w-3 h-3 text-white" />
            </div>
          </div>
        )
      ) : (
        <div className="w-full h-full p-3 flex flex-col justify-center bg-gradient-to-br from-gold/5 to-transparent">
          <MessageSquare className="w-4 h-4 text-gold/60 mb-1.5" />
          <p className="text-[11px] text-foreground leading-snug line-clamp-6">{post.content}</p>
        </div>
      )}

      {/* Delete button (owner only) */}
      {canDelete && (
        <button
          onClick={handleDeleteClick}
          disabled={deleting}
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all flex items-center justify-center z-10"
          title="Excluir post"
        >
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        </button>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white pointer-events-none">
        <div className="flex items-center gap-1 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 fill-white" />
          {post.likes_count || 0}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5 fill-white" />
          {post.comments_count || 0}
        </div>
      </div>

      {/* Date footer */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/70 to-transparent text-[9px] text-white/80 pointer-events-none">
        {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: ptBR })}
      </div>
    </motion.div>
  );
}
