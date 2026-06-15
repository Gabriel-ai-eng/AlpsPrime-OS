import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, Lock, ShoppingBag, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Shows a creator's premium content sales: total revenue, # of unlocks,
 * and the list of premium posts with their performance.
 * Visible only to Unlimited creators (parent already gates).
 */
export default function PremiumSalesPanel({ userEmail, contentSales }) {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['my-premium-posts', userEmail],
    queryFn: () =>
      base44.entities.Post.filter({ author_email: userEmail, is_premium: true }, '-created_date', 100),
    enabled: !!userEmail,
  });

  const totalUnlocks = posts.reduce((s, p) => s + (Number(p.unlock_count) || 0), 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-gold" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Conteúdo Premium
        </h2>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
          Unlimited
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Receita total"
          value={contentSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        />
        <StatCard icon={ShoppingBag} label="Desbloqueios" value={totalUnlocks.toLocaleString('pt-BR')} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Seus posts pagos
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Nenhum post pago ainda. Ao publicar, ative "Conteúdo pago" no composer.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-gold" />
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="font-display text-lg">{value}</div>
    </div>
  );
}

function PostRow({ post }) {
  const price = Number(post.premium_price || 0);
  const unlocks = Number(post.unlock_count || 0);
  const revenue = Number(post.premium_revenue_brl || 0);

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl border border-border bg-background">
      {post.media_url && post.media_type === 'image' ? (
        <img src={post.media_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-gold" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground line-clamp-1">
          {post.content || post.premium_teaser || 'Post premium'}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[10px] text-muted-foreground">R$ {price.toFixed(2).replace('.', ',')}</div>
        <div className="text-xs text-gold font-semibold">{unlocks} ✨</div>
        <div className="text-[10px] text-foreground">
          {revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
      </div>
    </div>
  );
}