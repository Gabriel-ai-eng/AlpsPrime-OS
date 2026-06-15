import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function PremiumPaywall({ post }) {
  const [unlocking, setUnlocking] = useState(false);
  const queryClient = useQueryClient();
  const price = Number(post.premium_price || 0);

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      await base44.functions.invoke('unlockPremiumPost', { post_id: post.id });
      toast.success('Conteúdo desbloqueado!');
      queryClient.invalidateQueries({ queryKey: ['my-unlocked-posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erro ao desbloquear. Saldo insuficiente?';
      toast.error(msg);
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-5 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent border-t border-gold/20"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold">Conteúdo Premium</span>
          </div>
          {post.premium_teaser && (
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{post.premium_teaser}</p>
          )}
          <Button
            onClick={handleUnlock}
            disabled={unlocking}
            className="bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold hover:opacity-90 h-9"
          >
            {unlocking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>Desbloquear por {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground mt-2">
            Pago com seu saldo da carteira (metas + vendas).
          </p>
        </div>
      </div>
    </motion.div>
  );
}