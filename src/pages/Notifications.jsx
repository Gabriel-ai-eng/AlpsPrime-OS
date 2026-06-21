import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Mail, User, CheckCheck, Sparkles, ArrowLeft, Megaphone, AppWindow } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';
import { cn, parseServerDate } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useUsersDirectory } from '@/lib/useUsersDirectory';

const ICON_BY_TYPE = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  message: Mail,
  welcome: Sparkles,
  update: Megaphone,
  app: AppWindow,
};

// Cores premium para cada tipo de ação
const STYLE_BY_TYPE = {
  like: 'text-red-400 bg-red-400/20 border-red-500/30',
  comment: 'text-blue-400 bg-blue-400/20 border-blue-500/30',
  follow: 'text-[#FFD700] bg-[#FFD700]/20 border-[#FFD700]/30',
  message: 'text-emerald-400 bg-emerald-400/20 border-emerald-500/30',
  welcome: 'text-[#FFD700] bg-[#FFD700]/20 border-[#FFD700]/30',
  update: 'text-purple-400 bg-purple-400/20 border-purple-500/30',
  app: 'text-blue-400 bg-blue-400/20 border-blue-500/30',
};

function buildMessage(n) {
  switch (n.type) {
    case 'like': return 'curtiu seu post';
    case 'comment': return 'comentou no seu post';
    case 'follow': return 'começou a seguir você';
    case 'message': return 'enviou uma mensagem';
    case 'welcome': return 'quer instalar o Alps OS no seu celular?';
    case 'update': return 'publicou uma nova atualização';
    case 'app': return 'lançou um novo aplicativo';
    default: return '';
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { getAvatar } = useUsersDirectory();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] });

  // Ação de Marcar Todas como Lidas
  const markAllRead = async () => {
    if (unreadCount === 0) return;

    queryClient.setQueryData(['notifications', user?.email], (old = []) =>
      old.map((n) => (n.read ? n : { ...n, read: true }))
    );

    const unreadNotifs = notifications.filter((n) => !n.read);
    try {
      await Promise.all(
        unreadNotifs.map((n) => base44.entities.Notification.update(n.id, { read: true }))
      );
    } catch (e) {
      console.error('Erro ao marcar todas como lidas:', e);
    } finally {
      refresh();
    }
  };

  const handleClick = async (n) => {
    if (!n.read) {
      queryClient.setQueryData(['notifications', user?.email], (old = []) =>
        old.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      base44.entities.Notification.update(n.id, { read: true }).finally(refresh);
    }
    
    if (n.type === 'welcome') {
      navigate('/settings#install');
    } else if (n.type === 'follow') {
      navigate(`/profile/${encodeURIComponent(n.actor_email)}`);
    } else if (n.type === 'message') {
      if (n.conversation_key) {
        navigate(`/chat-dm?c=${encodeURIComponent(n.conversation_key)}`);
      } else {
        navigate(`/chat-dm`);
      }
    } else if ((n.type === 'like' || n.type === 'comment') && n.post_id) {
      navigate(`/home?post=${n.post_id}`);
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-background text-foreground font-sans overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col relative select-none">

      {/* Luz ambiente sutil no fundo (Estilo Apple Aurora) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-gold/[0.04] blur-[120px] rounded-full pointer-events-none" />

      {/* =========================================
          CABEÇALHO FIXO
          ========================================= */}
      <header className="w-full bg-background/80 backdrop-blur-3xl pt-14 pb-4 px-5 flex items-center justify-between z-20 sticky top-0 border-b border-border shadow-sm">

        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors outline-none active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="text-[20px] font-semibold tracking-tight text-foreground select-none absolute left-1/2 -translate-x-1/2">
          Notificações
        </h1>

        {/* Botão Marcar como Lido */}
        {unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 active:scale-95 border border-border text-[12px] font-medium text-gold transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Lido
          </button>
        ) : (
          <div className="w-16" /* Espaçador para manter o título centralizado */ />
        )}
      </header>

      {/* =========================================
          CONTEÚDO PRINCIPAL
          ========================================= */}
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col pt-6 px-4 pb-32 z-10 relative">
        
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[88px] rounded-[20px] bg-muted/50 border border-border animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center pt-32 px-4"
          >
            <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center mb-5">
              <Bell className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h2 className="text-[20px] font-semibold text-foreground mb-2 tracking-tight">Tudo em silêncio</h2>
            <p className="text-[14px] text-muted-foreground">Você ainda não tem novas notificações.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {notifications.map((n, index) => {
                const Icon = ICON_BY_TYPE[n.type] || Bell;
                const styleClass = STYLE_BY_TYPE[n.type] || 'text-foreground bg-muted border-border';
                const preview =
                  n.type === 'comment' ? n.comment_preview :
                  n.type === 'message' ? n.message_preview :
                  n.type === 'like' ? n.post_preview :
                  n.type === 'welcome' ? n.post_preview :
                  (n.type === 'update' || n.type === 'app') ? n.post_preview : null;

                return (
                  <motion.button
                    key={n.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30, delay: index * 0.03 }}
                    onClick={() => handleClick(n)}
                    className={cn(
                      'w-full flex items-start gap-4 p-4 text-left rounded-[20px] transition-all duration-300 relative overflow-hidden group outline-none active:scale-[0.98]',
                      !n.read
                        ? 'bg-gold/[0.06] border border-gold/20'
                        : 'bg-card border border-border hover:bg-muted/60'
                    )}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {/* Brilho de fundo para não lidas */}
                    {!n.read && <div className="absolute -left-12 -top-12 w-32 h-32 bg-gold/10 blur-[40px] pointer-events-none opacity-50" />}

                    {/* AVATAR E ÍCONE DO TIPO DE AÇÃO */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-[46px] h-[46px] rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center">
                        {(getAvatar(n.actor_email) || n.actor_avatar) ? (
                          <img src={getAvatar(n.actor_email) || n.actor_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className={cn(
                        'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background backdrop-blur-md',
                        styleClass
                      )}>
                        <Icon className="w-3 h-3" strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* TEXTO DA NOTIFICAÇÃO */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] leading-snug text-muted-foreground">
                        <span className="font-semibold text-foreground tracking-tight">{n.actor_name}</span>{' '}
                        {buildMessage(n)}
                      </p>
                      {preview && (
                        <p className="text-[13px] text-muted-foreground truncate mt-1 italic font-light">
                          "{preview}"
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-[0.05em]">
                        {formatDistanceToNow(parseServerDate(n.created_date), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>

                    {/* PONTO INDICADOR DE NÃO LIDA */}
                    {!n.read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-gold mt-2 shrink-0 shadow-[0_0_10px_rgba(201,162,79,0.6)]" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
