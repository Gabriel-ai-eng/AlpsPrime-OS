import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Send, Loader2, Star, EyeOff, Eye, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseServerDate } from '@/lib/utils';
import { getCategory } from '@/lib/cardCategories';

const MAX_ANSWER = 280;

export default function CardBack({ card, currentUser, isOwner, onFlipBack, onAnswered, onAnswersUpdated }) {
  const [text, setText] = useState('');
  const [anon, setAnon] = useState(false);
  const [sending, setSending] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const cat = getCategory(card.category);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await base44.entities.CardAnswer.filter({ card_id: card.id }, '-likes_count', 50);
      if (!cancelled) {
        setAnswers(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [card.id]);

  const submit = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      const newAns = await base44.entities.CardAnswer.create({
        card_id: card.id,
        author_email: currentUser.email,
        author_name: anon ? 'Anônimo' : (currentUser.ranking_display_name || currentUser.full_name || 'Usuário'),
        author_avatar: anon ? '' : (currentUser.profile_picture_url || ''),
        is_anonymous: anon,
        content: t,
      });
      await base44.entities.QuestionCard.update(card.id, {
        answers_count: (card.answers_count || 0) + 1,
      });
      setAnswers((a) => [newAns, ...a]);
      setText('');
      toast.success('Resposta enviada');
      onAnswered?.(card.id);
    } catch {
      toast.error('Erro ao enviar resposta');
    }
    setSending(false);
  };

  const likeAnswer = async (ans) => {
    const updated = await base44.entities.CardAnswer.update(ans.id, {
      likes_count: (ans.likes_count || 0) + 1,
    });
    setAnswers((list) =>
      list
        .map((a) => (a.id === ans.id ? { ...a, likes_count: updated.likes_count } : a))
        .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    );
  };

  const markBest = async (ans) => {
    if (!isOwner) return;
    // Unmark previous best
    if (card.best_answer_id && card.best_answer_id !== ans.id) {
      await base44.entities.CardAnswer.update(card.best_answer_id, { is_best: false }).catch(() => {});
    }
    await base44.entities.CardAnswer.update(ans.id, { is_best: true });
    await base44.entities.QuestionCard.update(card.id, { best_answer_id: ans.id });
    setAnswers((list) => list.map((a) => ({ ...a, is_best: a.id === ans.id })));
    toast.success('Melhor resposta destacada');
    onAnswersUpdated?.(card.id);
  };

  const remaining = MAX_ANSWER - text.length;
  const canSubmit = text.trim().length > 0 && !sending && !isOwner;

  return (
    <div className="h-full flex flex-col p-5">
      <div
        className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: cat.color }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            {isOwner ? 'Respostas recebidas' : 'Sua resposta'}
          </span>
        </div>
        <button
          onClick={onFlipBack}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-border hover:border-gold/40 hover:bg-gold/5 text-muted-foreground hover:text-gold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Voltar
        </button>
      </div>

      {/* Composer (only if not owner) */}
      {!isOwner && (
        <div className="mb-3 relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_ANSWER))}
            placeholder="Escreva uma resposta gentil e útil..."
            rows={3}
            className="resize-none bg-background border-border focus-visible:ring-gold/40 text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setAnon((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition',
                anon
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {anon ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {anon ? 'Anônimo' : 'Identificado'}
            </button>
            <div className="flex items-center gap-2">
              <span className={cn('text-[10px]', remaining < 30 ? 'text-destructive' : 'text-muted-foreground')}>
                {remaining}
              </span>
              <button
                onClick={submit}
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold hover:bg-gold-dark text-background text-xs font-semibold disabled:opacity-40 transition"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Enviar
              </button>
            </div>
          </div>
          {card.context && (
            <p className="text-[11px] text-muted-foreground italic mt-3 pl-3 border-l-2 border-gold/30">
              {card.context}
            </p>
          )}
        </div>
      )}

      {isOwner && card.context && (
        <p className="text-[11px] text-muted-foreground italic mb-3 pl-3 border-l-2 border-gold/30">
          {card.context}
        </p>
      )}

      {/* Answers list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin -mr-2 pr-2 space-y-2">
        {loading ? (
          <div className="text-center text-[11px] text-muted-foreground py-4">Carregando respostas...</div>
        ) : answers.length === 0 ? (
          <div className="text-center text-[11px] text-muted-foreground py-6">
            Ainda sem respostas. {isOwner ? 'Aguarde a comunidade.' : 'Seja o primeiro a responder.'}
          </div>
        ) : (
          answers.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-2xl p-3 border text-xs',
                a.is_best
                  ? 'border-gold/40 bg-gradient-to-br from-gold/10 to-transparent'
                  : 'border-border bg-background'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  {a.is_anonymous ? (
                    <span className="text-muted-foreground italic">Anônimo</span>
                  ) : (
                    <span>{a.author_name}</span>
                  )}
                  {a.is_best && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gold/20 text-gold text-[9px] font-bold uppercase tracking-widest">
                      <Star className="w-2.5 h-2.5" /> Melhor
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {formatDistanceToNow(parseServerDate(a.created_date), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">{a.content}</p>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => likeAnswer(a)}
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-gold transition"
                >
                  <Star className="w-3 h-3" />
                  {a.likes_count || 0}
                </button>
                {isOwner && !a.is_best && (
                  <button
                    onClick={() => markBest(a)}
                    className="text-[10px] font-semibold text-gold hover:underline"
                  >
                    Marcar como melhor
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}