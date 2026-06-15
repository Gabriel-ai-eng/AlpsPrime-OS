import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Send, Loader2, ArrowLeft, Image as ImageIcon, X, Phone, Video, MoreVertical, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const otherEmail = getOtherEmail(conversationKey, currentUser.email);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [media, setMedia] = useState(null); // { url, uploading }
  const [plane, setPlane] = useState(null); // { x, y } origin for the paper plane animation
  const [showOptions, setShowOptions] = useState(false);
  
  const sendBtnRef = useRef(null);
  const { ref: rippleRef, onPointerDown: onSendRipple } = useLiquidRipple({ color: 'rgba(255,235,150,0.2)', duration: 480 });

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
    <div className="flex flex-col h-full bg-background relative">
      {/* Header Premium */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between glass-heavy sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Link
            to={`/profile/${encodeURIComponent(otherEmail)}`}
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-gold/20 group-hover:ring-gold/50">
              {otherUser?.profile_picture_url ? (
                <img src={otherUser.profile_picture_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-gold" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate group-hover:text-gold transition-colors">{otherName}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {otherUser?.username ? `@${otherUser.username}` : 'Ver perfil'}
              </p>
            </div>
          </Link>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button onClick={handleCall} className="p-2 rounded-full hover:bg-muted text-gold transition-colors" title="Ligação de Voz">
            <Phone className="w-[18px] h-[18px]" />
          </button>
          <button onClick={handleVideoCall} className="p-2 rounded-full hover:bg-muted text-gold transition-colors" title="Chamada de Vídeo">
            <Video className="w-[20px] h-[20px]" />
          </button>
          <div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border shadow-lg rounded-xl py-1 z-30"
                >
                  <button
                    onClick={handleDeleteConversation}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
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

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gold" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-3">
                <User className="w-6 h-6 opacity-50" />
              </div>
              <p>Envie a primeira mensagem para <span className="text-foreground font-medium">{otherName}</span></p>
            </div>
          ) : (
            grouped.map((item, i) => {
              if (item.type === 'separator') {
                return (
                  <div key={`sep-${i}`} className="flex items-center gap-3 py-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {format(item.date, "d 'de' MMMM", { locale: ptBR })}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                );
              }
              const m = item.msg;
              const mine = m.sender_email === currentUser.email;
              return (
                <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                      mine
                        ? 'bg-gradient-to-br from-gold to-gold-dark text-background rounded-br-sm'
                        : 'bg-card border border-border rounded-bl-sm'
                    )}
                  >
                    {m.media_url && (
                      <img
                        src={m.media_url}
                        alt="Mídia enviada"
                        className="rounded-lg mb-1.5 max-h-80 w-auto object-cover"
                      />
                    )}
                    {m.content && <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>}
                    <p className={cn('text-[9px] mt-1 text-right', mine ? 'text-background/70' : 'text-muted-foreground')}>
                      {format(new Date(m.created_date), 'HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Composer Toolbar */}
      <div className="border-t border-border p-3 glass-heavy z-20 relative">
        <div className="max-w-3xl mx-auto">
          {media && (
            <div className="mb-2 relative inline-block">
              {media.uploading ? (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-gold" />
                </div>
              ) : (
                <>
                  <img src={media.url} alt="" className="w-24 h-24 rounded-lg object-cover" />
                  <button
                    onClick={() => setMedia(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center hover:border-destructive hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex items-end gap-1.5 p-2 rounded-3xl transition-all duration-200 bg-background/50 border border-border shadow-sm">
            
            {/* Media Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || media?.uploading}
              className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-gold transition-colors flex-shrink-0 disabled:opacity-50 ml-1"
              title="Enviar foto ou vídeo"
            >
              <ImageIcon className="w-[18px] h-[18px]" />
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
              placeholder={`Mensagem...`}
              rows={1}
              disabled={sending}
              className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[36px] max-h-32 py-2 text-[15px]"
            />

            {/* Send Button */}
            <Button
              ref={(node) => { sendBtnRef.current = node; rippleRef.current = node; }}
              onPointerDown={onSendRipple}
              onClick={handleSend}
              disabled={(!input.trim() && !media?.url) || sending || media?.uploading}
              size="icon"
              className="text-night-950 rounded-full h-10 w-10 flex-shrink-0 relative overflow-hidden ripple-surface"
              style={{ background: 'linear-gradient(135deg, #E8C77A, #C9A24F)', boxShadow: '0 4px 14px rgba(201,162,79,0.35)' }}
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
