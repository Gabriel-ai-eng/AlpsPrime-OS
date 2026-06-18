import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Send, Loader2, ArrowLeft, Image as ImageIcon, X, Phone, Video, MoreVertical, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getOtherEmail } from '@/lib/chatUtils';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';
import PaperPlaneAnimation from '@/components/dm/PaperPlaneAnimation';
import { useLiquidRipple } from '@/lib/useLiquidRipple';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageThread({ conversationKey, currentUser, onBack }) {
  const queryClient = useQueryClient();
  const otherEmail = getOtherEmail(conversationKey, currentUser.email);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [media, setMedia] = useState(null); // { url, uploading }
  const [plane, setPlane] = useState(null); // { x, y } origin for the paper plane animation
  const [showOptions, setShowOptions] = useState(false);

  const sendBtnRef = useRef(null);
  const { ref: rippleRef, onPointerDown: onSendRipple } = useLiquidRipple({ color: 'rgba(255,235,150,0.25)', duration: 480 });

  // Load the other user's profile
  const { data: otherUser } = useQuery({
    queryKey: ['user-profile', otherEmail],
    queryFn: async () => {
      const list = await base44.entities.User.filter({ email: otherEmail });
      return list?.[0] || null;
    },
    enabled: !!otherEmail,
  });

  // Load messages for this conversation
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['dm-thread', conversationKey],
    queryFn: () => base44.entities.DirectMessage.filter({ conversation_key: conversationKey }, 'created_date', 500),
    enabled: !!conversationKey,
    refetchInterval: 3000,
  });

  // Mark incoming messages as read
  useEffect(() => {
    const unread = messages.filter((m) => m.receiver_email === currentUser.email && !m.read);
    if (unread.length === 0) return;
    (async () => {
      await Promise.all(unread.map((m) => base44.entities.DirectMessage.update(m.id, { read: true })));
      queryClient.invalidateQueries({ queryKey: ['dm-received'] });
    })();
  }, [messages, currentUser.email, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Mídia muito grande (máx 10MB)');
      return;
    }
    setMedia({ url: null, uploading: true });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMedia({ url: file_url, uploading: false });
    } catch (err) {
      toast.error('Erro ao enviar mídia.');
      setMedia(null);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !media?.url) || sending) return;

    if (sendBtnRef.current) {
      const rect = sendBtnRef.current.getBoundingClientRect();
      setPlane({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }

    setSending(true);
    await base44.entities.DirectMessage.create({
      sender_email: currentUser.email,
      receiver_email: otherEmail,
      content: text,
      media_url: media?.url || undefined,
      read: false,
      conversation_key: conversationKey,
    });
    createNotification({
      recipientEmail: otherEmail,
      actor: currentUser,
      type: 'message',
      messagePreview: text || '📸 Mídia',
      conversationKey,
    });
    setInput('');
    setMedia(null);
    setSending(false);
    queryClient.invalidateQueries({ queryKey: ['dm-thread', conversationKey] });
    queryClient.invalidateQueries({ queryKey: ['dm-sent'] });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteConversation = async () => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico de mensagens com esta pessoa?')) {
      try {
        await Promise.all(messages.map(m => base44.entities.DirectMessage.delete(m.id)));
        queryClient.invalidateQueries({ queryKey: ['dm-thread', conversationKey] });
        toast.success('Conversa apagada com sucesso.');
        setShowOptions(false);
      } catch (e) {
        toast.error('Erro ao apagar conversa.');
      }
    }
  };

  const handleCall = () => {
    toast.info('Recurso de chamadas de voz estará disponível em breve!');
  };

  const handleVideoCall = () => {
    toast.info('Recurso de videochamadas estará disponível em breve!');
  };

  // Group messages by day for separators
  const grouped = useMemo(() => {
    const result = [];
    let lastDay = null;
    messages.forEach((m) => {
      const d = new Date(m.created_date);
      if (!lastDay || !isSameDay(lastDay, d)) {
        result.push({ type: 'separator', date: d });
        lastDay = d;
      }
      result.push({ type: 'message', msg: m });
    });
    return result;
  }, [messages]);

  const otherName = otherUser?.ranking_display_name || otherUser?.full_name || otherEmail;

  return (
    <div className="flex flex-col h-full text-white relative">
      {/* ─────────── HEADER ─────────── */}
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between bg-[#0A0A0B]/70 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="lg:hidden p-2 -ml-1 rounded-full text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link
            to={`/profile/${encodeURIComponent(otherEmail)}`}
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-[#FFD700]/25 group-hover:ring-[#FFD700]/50 transition-all">
              {otherUser?.profile_picture_url ? (
                <img src={otherUser.profile_picture_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-[#FFD700]/70" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[15px] truncate text-white group-hover:text-[#FFD700] transition-colors">{otherName}</p>
              <p className="text-[11px] text-[#8E8E93] truncate">
                {otherUser?.username ? `@${otherUser.username}` : 'Ver perfil'}
              </p>
            </div>
          </Link>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={handleCall} className="w-9 h-9 rounded-full flex items-center justify-center text-[#FFD700] hover:bg-white/[0.06] transition-colors active:scale-90" title="Ligação de Voz">
            <Phone className="w-[18px] h-[18px]" />
          </button>
          <button onClick={handleVideoCall} className="w-9 h-9 rounded-full flex items-center justify-center text-[#FFD700] hover:bg-white/[0.06] transition-colors active:scale-90" title="Chamada de Vídeo">
            <Video className="w-5 h-5" />
          </button>
          <div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors active:scale-90">
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-1.5 z-30 bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                >
                  <button
                    onClick={handleDeleteConversation}
                    className="w-full text-left px-4 py-2.5 text-[14px] text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Apagar Conversa
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─────────── MESSAGES ─────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-none">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-1.5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#FFD700]" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-[#FFD700]/10 blur-[30px] rounded-full" />
                <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center relative">
                  <User className="w-6 h-6 text-[#FFD700]/70" />
                </div>
              </div>
              <p className="text-[14px] text-[#8E8E93]">
                Envie a primeira mensagem para <span className="text-white font-medium">{otherName}</span>
              </p>
            </div>
          ) : (
            grouped.map((item, i) => {
              if (item.type === 'separator') {
                return (
                  <div key={`sep-${i}`} className="flex items-center gap-3 py-4">
                    <div className="flex-1 h-px bg-white/[0.07]" />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#8E8E93] font-medium">
                      {format(item.date, "d 'de' MMMM", { locale: ptBR })}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.07]" />
                  </div>
                );
              }
              const m = item.msg;
              const mine = m.sender_email === currentUser.email;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[78%] rounded-[20px] px-3.5 py-2.5 text-[14px]',
                      mine
                        ? 'text-black rounded-br-md shadow-[0_4px_16px_rgba(255,215,0,0.18)]'
                        : 'bg-white/[0.06] border border-white/10 text-white rounded-bl-md backdrop-blur-xl'
                    )}
                    style={mine ? { background: 'linear-gradient(135deg, #FFE066, #FFD700)' } : undefined}
                  >
                    {m.media_url && (
                      <img
                        src={m.media_url}
                        alt="Mídia enviada"
                        className="rounded-xl mb-1.5 max-h-80 w-auto object-cover"
                      />
                    )}
                    {m.content && <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>}
                    <p className={cn('text-[9px] mt-1 text-right', mine ? 'text-black/50' : 'text-white/35')}>
                      {format(new Date(m.created_date), 'HH:mm')}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ─────────── COMPOSER ─────────── */}
      <div className="px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] bg-[#0A0A0B]/70 backdrop-blur-2xl border-t border-white/5 z-20 relative">
        <div className="max-w-3xl mx-auto mb-[76px] lg:mb-0">
          {media && (
            <div className="mb-2 relative inline-block">
              {media.uploading ? (
                <div className="w-24 h-24 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FFD700]" />
                </div>
              ) : (
                <>
                  <img src={media.url} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/10" />
                  <button
                    onClick={() => setMedia(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1C1C1E] border border-white/15 flex items-center justify-center text-white/70 hover:text-red-400 hover:border-red-400/40 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex items-end gap-1.5 p-1.5 rounded-[26px] transition-all duration-200 bg-white/[0.05] border border-white/10 backdrop-blur-2xl focus-within:border-white/20">

            {/* Media Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || media?.uploading}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-[#FFD700] hover:bg-white/[0.06] transition-colors flex-shrink-0 disabled:opacity-40 ml-0.5"
              title="Enviar foto ou vídeo"
            >
              <ImageIcon className="w-[19px] h-[19px]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleUpload}
            />

            {/* Input Field */}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mensagem..."
              rows={1}
              disabled={sending}
              className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-32 py-2.5 text-[15px] text-white placeholder:text-white/30"
            />

            {/* Send Button */}
            <Button
              ref={(node) => { sendBtnRef.current = node; rippleRef.current = node; }}
              onPointerDown={onSendRipple}
              onClick={handleSend}
              disabled={(!input.trim() && !media?.url) || sending || media?.uploading}
              size="icon"
              className="text-black rounded-full h-10 w-10 flex-shrink-0 relative overflow-hidden ripple-surface disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #FFE066, #FFD700)', boxShadow: '0 4px 16px rgba(255,215,0,0.35)' }}
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-[18px] h-[18px]" style={{ marginLeft: '-2px' }} />}
            </Button>

          </div>
        </div>
      </div>

      {plane && (
        <PaperPlaneAnimation origin={plane} onDone={() => setPlane(null)} />
      )}
    </div>
  );
}
