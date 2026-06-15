import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, MoreHorizontal, Trash2, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, parseServerDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useLiquidRipple } from '@/lib/useLiquidRipple';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import UnlimitedAura from '@/components/common/UnlimitedAura';
import PremiumPaywall from '@/components/feed/PremiumPaywall';
import ReactionPicker, { REACTION_MAP } from '@/components/feed/ReactionPicker';

export default function PostCard({
  post,
  currentUserEmail,
  myReaction,
  reactionCounts,
  onReact,
  onComment,
  onShare,
  onDelete,
  liveAvatar,
  liveName,
  livePlan,
  isUnlocked,
  glassEnabled,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwnPost = post.author_email === currentUserEmail;
  const isPremium = !!post.is_premium && Number(post.premium_price) > 0;
  const canSeeMedia = !isPremium || isOwnPost || isUnlocked;
  // Always prefer the live (current) profile picture/name/plan over the snapshot stored on the post
  const avatar = liveAvatar || post.author_avatar;
  const name = liveName || post.author_name || 'Usuário';
  const plan = livePlan || post.author_plan;

  // Build top emojis summary
  const counts = reactionCounts || {};
  const totalReactions = Object.values(counts).reduce((s, n) => s + n, 0);
  const topEmojis = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => REACTION_MAP[type]?.emoji)
    .filter(Boolean);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={
        glassEnabled
          ? "liquid-glass-card relative overflow-hidden"
          : "rounded-2xl bg-card border border-border shadow-sm relative overflow-hidden"
      }
    >
      {/* Top shine (glass only) */}
      {glassEnabled && <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />}
      
      {/* Header */}
      <div className="flex items-start gap-3 p-4 relative z-10">
        <UnlimitedAura plan={plan} size="sm">
          <Link
            to={`/profile/${encodeURIComponent(post.author_email)}`}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-gold/40 transition-all block"
          >
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </Link>
        </UnlimitedAura>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${encodeURIComponent(post.author_email)}`}
            className="font-semibold text-sm truncate hover:text-gold transition-colors inline-flex items-center gap-1"
          >
            {name}
            <VerifiedBadge plan={plan} size={13} />
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(parseServerDate(post.created_date), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
            {menuOpen && (
              <div
                className={`absolute right-0 top-full mt-1 py-1 z-10 min-w-[140px] ${glassEnabled ? 'rounded-2xl' : 'rounded-xl bg-popover border border-border shadow-md'}`}
                style={glassEnabled ? {
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(24px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.90)',
                  boxShadow: '0 8px 32px rgba(120,90,40,0.12)',
                } : {}}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (confirm('Tem certeza que deseja excluir este post?\n\n⚠️ Atenção: os créditos de posts já consumidos NÃO serão restaurados ao excluir. Você continuará com o mesmo limite diário.')) onDelete(post.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3 relative z-10">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.media_url && post.media_type === 'image' && (
        canSeeMedia ? (
          <div className="relative z-10">
            <img src={post.media_url} alt="" className="w-full max-h-[600px] object-cover" />
            {isPremium && isOwnPost && (
              <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-gold/30 text-[10px] uppercase tracking-widest text-gold font-bold">
                💎 Premium
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full max-h-[600px] overflow-hidden z-10">
            <img src={post.media_url} alt="" className="w-full max-h-[600px] object-cover blur-2xl scale-110" />
          </div>
        )
      )}
      {post.media_url && post.media_type === 'video' && (
        canSeeMedia ? (
          <video src={post.media_url} controls className="w-full max-h-[600px] relative z-10" />
        ) : (
          <div className="relative w-full h-72 overflow-hidden bg-muted z-10">
            <video src={post.media_url} className="w-full h-full object-cover blur-2xl scale-110" muted />
          </div>
        )
      )}

      {/* Paywall */}
      {isPremium && !canSeeMedia && (
        <PremiumPaywall post={post} />
      )}

      {/* Stats (if any) */}
      {(totalReactions > 0 || post.comments_count > 0 || post.shares_count > 0) && (
        <div className={`px-4 py-2 flex items-center gap-3 text-xs text-muted-foreground border-t relative z-10 ${glassEnabled ? 'border-white/40' : 'border-border'}`}>
          {totalReactions > 0 && (
            <span className="flex items-center gap-1">
              <span className="flex -space-x-1">
                {topEmojis.map((e, i) => (
                  <span key={i} className="text-sm leading-none">{e}</span>
                ))}
              </span>
              {totalReactions}
            </span>
          )}
          {post.comments_count > 0 && <span>{post.comments_count} comentários</span>}
          {post.shares_count > 0 && <span>{post.shares_count} compart.</span>}
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center border-t relative z-10 ${glassEnabled ? 'border-white/40' : 'border-border'}`} style={glassEnabled ? { background: 'rgba(255,255,255,0.25)' } : {}}>
        <ReactionPicker
          currentReaction={myReaction}
          onSelect={(type) => onReact(post.id, type)}
          variant={isPremium ? 'premium' : 'default'}
        />
        <ActionButton icon={MessageCircle} label="Comentar" onClick={() => onComment(post)} />
        <ActionButton icon={Share2} label="Compartilhar" onClick={() => onShare(post)} />
      </div>
    </motion.article>
  );
}

function ActionButton({ icon: Icon, label, onClick, active, activeColor }) {
  const { ref, onPointerDown } = useLiquidRipple({ color: 'rgba(255,255,255,0.07)', duration: 480 });
  return (
    <button
      ref={ref}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors relative overflow-hidden ripple-surface',
        active ? activeColor : 'text-foreground/40 hover:text-foreground/70 hover:bg-black/[0.03]'
      )}
    >
      <Icon className={cn('w-4 h-4', active && activeColor)} />
      {label}
    </button>
  );
}
