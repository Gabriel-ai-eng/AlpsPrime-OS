import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { GeminiLiveClient } from '@/lib/geminiLive';
import VoiceVisualizer from './VoiceVisualizer';
import { X, Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const STATUS_LABELS = {
  connecting: 'Conectando...',
  listening: 'Ouvindo...',
  thinking: 'Pensando...',
  speaking: 'Falando...',
  disconnected: 'Desconectado',
  closed: 'Encerrado',
};

export default function LiveVoiceModal({ open, onClose, onSaveConversation }) {
  const [status, setStatus] = useState('connecting');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const clientRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const start = async () => {
      setError(null);
      setStatus('connecting');
      setTranscripts([]);

      try {
        // 1. Get ephemeral token from backend
        const resp = await base44.functions.invoke('getGeminiLiveToken', {});
        const token = resp?.data?.token;
        if (!token) throw new Error('Falha ao obter token');

        if (cancelled) return;

        // 2. Create client
        const client = new GeminiLiveClient({
          token,
          onStatusChange: (s) => {
            if (!cancelled) setStatus(s);
          },
          onTranscript: ({ role, text }) => {
            if (!text) return;
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === role) {
                return [...prev.slice(0, -1), { role, text: last.text + text }];
              }
              return [...prev, { role, text }];
            });
          },
          onError: (msg) => {
            if (!cancelled) handleConnectionError(msg);
          },
        });

        clientRef.current = client;
        await client.connect();
        reconnectAttemptsRef.current = 0;
      } catch (err) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
          setError('Para conversar com a Sexta Feira, preciso de acesso ao seu microfone. Por favor, permita o acesso e recarregue a página.');
        } else {
          handleConnectionError(err.message);
        }
      }
    };

    const handleConnectionError = (msg) => {
      if (reconnectAttemptsRef.current < 3) {
        reconnectAttemptsRef.current++;
        setStatus('connecting');
        setTimeout(() => !cancelled && start(), 1500);
      } else {
        setError(`Não foi possível conectar com a Sexta Feira. ${msg || ''} Tente novamente mais tarde.`);
      }
    };

    start();

    return () => {
      cancelled = true;
      clientRef.current?.close();
      clientRef.current = null;
    };
  }, [open]);

  const handleMuteToggle = () => {
    const next = !muted;
    setMuted(next);
    clientRef.current?.setMuted(next);
  };

  const handleClose = async () => {
    // Save conversation
    if (transcripts.length > 0) {
      try {
        const messages = transcripts.map((t) => ({
          role: t.role,
          content: t.text,
          type: 'text',
        }));
        const firstUserMsg = transcripts.find((t) => t.role === 'user')?.text || 'Conversa por voz';
        await base44.entities.Conversation.create({
          title: `🎙️ ${firstUserMsg.slice(0, 40)}`,
          messages,
          message_count: messages.length,
        });
        onSaveConversation?.();
      } catch (e) {
        console.error('Save error:', e);
      }
    }
    clientRef.current?.close();
    clientRef.current = null;
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-sm text-muted-foreground">Sexta Feira · Modo Live</span>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full border border-border hover:border-destructive/40 hover:bg-destructive/10 flex items-center justify-center transition-colors"
            aria-label="Encerrar conversa"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
          {error ? (
            <div className="max-w-md text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <p className="text-foreground">{error}</p>
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-xl bg-gold text-background font-medium hover:bg-gold-dark transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <VoiceVisualizer status={status} />
              <motion.p
                key={status}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 font-display text-2xl tracking-tight"
              >
                {status === 'connecting' && <Loader2 className="w-5 h-5 animate-spin inline mr-2" />}
                {STATUS_LABELS[status] || status}
              </motion.p>
              <p className="text-xs text-muted-foreground mt-2">
                {status === 'listening' && 'Fale naturalmente, estou ouvindo.'}
                {status === 'speaking' && 'Microfone pausado durante a resposta.'}
                {status === 'connecting' && 'Preparando tudo para você...'}
              </p>
            </>
          )}
        </div>

        {/* Transcripts */}
        {transcripts.length > 0 && !error && (
          <div className="max-h-48 overflow-y-auto scrollbar-thin px-4 py-3 border-t border-border bg-card/50">
            <div className="max-w-2xl mx-auto space-y-2">
              {transcripts.slice(-6).map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    t.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
                      t.role === 'user'
                        ? 'bg-gold text-background'
                        : 'bg-card border border-border'
                    )}
                  >
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer mute button */}
        {!error && (
          <div className="flex justify-center py-6 border-t border-border">
            <button
              onClick={handleMuteToggle}
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center transition-all',
                muted
                  ? 'bg-destructive text-white'
                  : 'bg-card border border-border hover:border-gold/40'
              )}
              aria-label={muted ? 'Desativar mudo' : 'Ativar mudo'}
            >
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}