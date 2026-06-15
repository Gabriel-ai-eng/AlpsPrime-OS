import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Toggle that lets the user opt-in or opt-out of the weekly "Most Creative"
 * voting (Meta 18). When opt-in is false, the user's posts won't be listed
 * as candidates in /voting.
 */
export default function VotingOptInToggle({ user }) {
  // Default: participates (true) unless explicitly opted out.
  const initial = user?.voting_opt_in !== false;
  const [enabled, setEnabled] = useState(initial);
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    try {
      await base44.auth.updateMe({ voting_opt_in: next });
      toast.success(next ? 'Você participa da votação semanal.' : 'Você saiu da votação semanal.');
    } catch {
      setEnabled(!next);
      toast.error('Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-gold" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Votação Semanal</h2>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
        <div className="pr-3">
          <p className="text-sm font-medium">Participar da votação "Mais Criativo da Semana"</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quando ativado, seus posts podem ser candidatos na votação semanal toda quinta-feira.
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          className={cn(
            'w-10 h-6 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-60',
            enabled ? 'bg-gold' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all',
              enabled ? 'left-[18px]' : 'left-0.5'
            )}
          />
        </button>
      </div>
    </motion.div>
  );
}