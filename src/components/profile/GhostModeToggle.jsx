import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ghost, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Ghost Mode toggle — exclusive to Pro/Unlimited.
 * When ON, the user does NOT appear in other people's profile analytics
 * (visits and post clicks are not recorded).
 */
export default function GhostModeToggle({ user }) {
  const plan = user?.plan || 'free';
  const isPaid = plan === 'pro' || plan === 'unlimited';
  const [enabled, setEnabled] = useState(user?.ghost_mode === true);
  const [saving, setSaving] = useState(false);

  if (!isPaid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="relative bg-card border border-border rounded-2xl p-6 overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-gold/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-2 mb-4">
          <Ghost className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Modo Fantasma
          </h2>
          <Lock className="w-3 h-3 text-gold ml-auto" />
        </div>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Visite perfis e veja posts sem aparecer na lista de visualizações dos donos dos perfis.
          <span className="text-foreground"> Disponível nos planos Pro e Unlimited.</span>
        </p>
        <Link to="/plans">
          <Button className="bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold hover:opacity-90">
            Desbloquear com Pro
          </Button>
        </Link>
      </motion.div>
    );
  }

  const handleToggle = async () => {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    try {
      await base44.auth.updateMe({ ghost_mode: next });
      toast.success(next ? 'Modo Fantasma ativado 👻' : 'Modo Fantasma desativado');
    } catch {
      setEnabled(!next);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <Ghost className={cn('w-4 h-4', enabled ? 'text-gold' : 'text-muted-foreground')} />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Modo Fantasma
        </h2>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
          {plan === 'unlimited' ? 'Unlimited' : 'Pro'}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-4">
        Quando ativado, suas visitas em perfis de outras pessoas não são registradas nas analytics deles.
        Você continua podendo ver tudo normalmente. Suas próprias analytics não são afetadas.
      </p>

      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
            enabled ? 'bg-gold/10 border border-gold/30' : 'bg-muted border border-border'
          )}>
            <Ghost className={cn('w-4 h-4', enabled ? 'text-gold' : 'text-muted-foreground')} />
          </div>
          <div>
            <p className="text-sm font-medium">Visitar perfis em modo invisível</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {enabled ? 'Ativado — você está invisível ao visitar perfis.' : 'Desativado — visitas são registradas normalmente.'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          className={cn(
            'w-11 h-6 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50',
            enabled ? 'bg-gold' : 'bg-muted'
          )}
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin absolute top-1.5 left-1/2 -translate-x-1/2 text-background" />
          ) : (
            <span className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all',
              enabled ? 'left-[22px]' : 'left-0.5'
            )} />
          )}
        </button>
      </div>
    </motion.div>
  );
}