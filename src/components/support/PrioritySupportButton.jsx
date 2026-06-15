import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Mail, Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

/**
 * Floating priority support chat for Unlimited users.
 * Free/Pro users do not see this. Sends the message via email to support.
 */
export default function PrioritySupportButton({ user }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (user?.plan !== 'unlimited') return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'suporte@alpsprime.com.br',
        from_name: `Suporte Unlimited · ${user.full_name || user.email}`,
        subject: `[PRIORITÁRIO · Unlimited] Suporte de ${user.email}`,
        body: `Usuário Unlimited solicitou suporte prioritário.\n\nNome: ${user.full_name || '—'}\nEmail: ${user.email}\n\nMensagem:\n${message.trim()}\n\n— Resposta garantida em até 2 horas.`,
      });
      toast.success('Mensagem enviada! Resposta em até 2 horas.');
      setMessage('');
      setOpen(false);
    } catch {
      toast.error('Falha ao enviar. Tente novamente.');
    }
    setSending(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 group flex items-center gap-2 h-12 pl-3 pr-4 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold shadow-2xl shadow-gold/40 hover:opacity-95 transition-opacity"
        title="Suporte prioritário Unlimited"
      >
        <div className="w-7 h-7 rounded-full bg-background/20 flex items-center justify-center">
          <Headphones className="w-4 h-4" />
        </div>
        <span className="text-xs hidden sm:inline">Suporte Prioritário</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-gold/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-gold/20 relative"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center">
                  <Zap className="w-5 h-5 text-background" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold">Exclusivo Unlimited</p>
                  <h3 className="font-display text-xl leading-tight">Suporte Prioritário</h3>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                <Mail className="w-3 h-3" />
                Resposta garantida em até <span className="text-gold font-medium">2 horas</span>.
              </p>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva o que você precisa..."
                rows={5}
                maxLength={2000}
                className="resize-none bg-background border-border focus-visible:ring-gold/50 mb-4"
              />

              <Button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="w-full h-11 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold hover:opacity-90"
              >
                {sending ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" /> Enviar mensagem</>}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}