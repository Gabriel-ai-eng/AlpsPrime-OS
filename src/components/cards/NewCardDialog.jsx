import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, EyeOff, Eye, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CARD_CATEGORIES } from '@/lib/cardCategories';

const MAX_Q = 200;
const MAX_CTX = 140;

export default function NewCardDialog({ open, onClose, currentUser, onCreated, editingCard }) {
  const isEditing = !!editingCard;
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState('outro');
  const [anon, setAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setQuestion(editingCard?.question || '');
      setContext(editingCard?.context || '');
      setCategory(editingCard?.category || 'outro');
      setAnon(editingCard?.is_anonymous || false);
    }
  }, [open, editingCard]);

  const reset = () => {
    setQuestion('');
    setContext('');
    setCategory('outro');
    setAnon(false);
  };

  const submit = async () => {
    const q = question.trim();
    if (!q || submitting) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await base44.entities.QuestionCard.update(editingCard.id, {
          question: q,
          context: context.trim(),
          category,
          is_anonymous: anon,
          author_name: anon ? 'Anônimo' : (currentUser.ranking_display_name || currentUser.full_name || 'Usuário'),
          author_avatar: anon ? '' : (currentUser.profile_picture_url || ''),
        });
        toast.success('Carta atualizada');
      } else {
        await base44.entities.QuestionCard.create({
          author_email: currentUser.email,
          author_name: anon ? 'Anônimo' : (currentUser.ranking_display_name || currentUser.full_name || 'Usuário'),
          author_avatar: anon ? '' : (currentUser.profile_picture_url || ''),
          is_anonymous: anon,
          question: q,
          context: context.trim(),
          category,
        });
        toast.success('Carta enviada para a comunidade');
      }
      reset();
      onCreated?.();
      onClose?.();
    } catch {
      toast.error('Erro ao salvar carta');
    }
    setSubmitting(false);
  };

  if (!open) return null;

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
          className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-tight">
              {isEditing ? (
                <>Editar <span className="gold-gradient italic">carta</span></>
              ) : (
                <>Nova <span className="gold-gradient italic">carta</span></>
              )}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Question */}
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Sua dúvida</label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, MAX_Q))}
            placeholder="Pergunte qualquer coisa que precisa de uma perspectiva..."
            rows={3}
            className="mt-1.5 resize-none bg-background border-border focus-visible:ring-gold/40 text-sm"
          />
          <div className="text-right text-[10px] text-muted-foreground mt-1">{MAX_Q - question.length}</div>

          {/* Context */}
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground mt-3 block">
            Contexto (opcional)
          </label>
          <Input
            value={context}
            onChange={(e) => setContext(e.target.value.slice(0, MAX_CTX))}
            placeholder="Uma frase pra ajudar quem for responder"
            className="mt-1.5 bg-background border-border focus-visible:ring-gold/40 text-sm"
          />

          {/* Category */}
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground mt-4 block">
            Categoria
          </label>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {CARD_CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[10px] font-medium transition',
                    active
                      ? 'border-gold/40 bg-gold/10 text-gold'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                  )}
                  style={active ? { color: c.color, borderColor: `${c.color}66`, background: `${c.color}15` } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Anonymous */}
          <button
            onClick={() => setAnon((v) => !v)}
            className={cn(
              'mt-4 w-full inline-flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition',
              anon ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="inline-flex items-center gap-2">
              {anon ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              Publicar anonimamente
            </span>
            <span className={cn('w-8 h-4 rounded-full relative transition-colors', anon ? 'bg-gold' : 'bg-muted')}>
              <span
                className={cn(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all',
                  anon ? 'left-[18px]' : 'left-0.5'
                )}
              />
            </span>
          </button>

          <button
            onClick={submit}
            disabled={!question.trim() || submitting}
            className="mt-5 w-full h-11 rounded-xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isEditing ? 'Salvar alterações' : 'Publicar carta'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}