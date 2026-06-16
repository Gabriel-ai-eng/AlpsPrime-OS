import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Mail, User, Check, Sparkles, ArrowLeft, Megaphone, AppWindow } from 'lucide-react';
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

const COLOR_BY_TYPE = {
  like: 'text-red-400 bg-red-400/10',
  comment: 'text-blue-400 bg-blue-400/10',
  follow: 'text-gold bg-gold/10',
  message: 'text-emerald-400 bg-emerald-400/10',
  welcome: 'text-gold bg-gold/10',
  update: 'text-gold bg-gold/10',
  app: 'text-blue-400 bg-blue-400/10',
};

function buildMessage(n) {
  switch (n.type) {
    case 'like': return 'curtiu seu post';
    case 'comment': return 'comentou no seu post';
    case 'follow': return 'começou a seguir você';
    case 'message': return 'enviou uma mensagem';
    case 'welcome': return 'quer instalar a Sexta-feira no seu celular?';
    case 'update': return 'publicou uma nova atualização';
    case 'app': return 'lançou um novo web app';
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

  // AQUI FOI CONSERTADO O BOTÃO "MARCAR TODAS"
  const markAllRead = async () => {
    if (unreadCount === 0) return;

    // 1. Atualiza a tela instantaneamente (Visual)
    queryClient.setQueryData(['notifications', user?.email], (old = []) =>
      old.map((n) => (n.read ? n : { ...n, read: true }))
    );

    // 2. Avisa o banco de dados de cada notificação não lida (Lógica direta e infalível)
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
    // 1. Atualiza visualmente na hora
    if (!n.read) {
      queryClient.setQueryData(['notifications', user?.email], (old = []) =>
        old.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      // 2. Atualiza no banco
      base44.entities.Notification.update(n.id, { read: true }).finally(refresh);
    }
    
    // 3. Redirecionamento correto e blindado
    if (n.type === 'welcome') {
      navigate('/settings#install');
    } else if (n.type === 'follow') {
      navigate(`/profile/${encodeURIComponent(n.actor_email)}`);
    } else if (n.type === 'message') {
      // Se tiver a chave da conversa, leva pro chat, senão leva pro inbox
      if (n.conversation_key) {
        navigate(`/chat-dm?c=${encodeURIComponent(n.conversation_key)}`);
      } else {
        navigate(`/chat-dm`);
      }
    } else if ((n.type === 'like' || n.type === 'comment') && n.post_id) {
      navigate(`/feed?post=${n.post_id}`);
    }
  };

  return (
    <div className="min-h-full">
      <div className="border-b border-border px-4 lg:px-6 py-5 sticky top-0 bg-background/90 backdrop-blur-xl z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl tracking-tight leading-none">
              <span className="gold-gradient italic">Notificações</span>
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-gold hover:text-gold-dark flex items-center gap-1 font-medium"
            >
              <Check className="w-3.5 h-3.5" /> Marcar todas
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-display text-lg mb-1">Tudo em silêncio</p>
            <p className="text-sm text-muted-foreground">
              Você ainda não tem notificações.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n, i) => {
              const Icon = ICON_BY_TYPE[n.type] || Bell;
              const preview =
                n.type === 'comment' ? n.comment_preview :
                n.type === 'message' ? n.message_preview :
                n.type === 'like' ? n.post_preview :
                n.type === 'welcome' ? n.post_preview :
                (n.type === 'update' || n.type === 'app') ? n.post_preview : null;

              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => handleClick(n)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left rounded-xl border transition-colors',
                    !n.read
                      ? 'bg-gold/5 border-gold/20 hover:bg-gold/10'
                      : 'bg-card border-border hover:bg-muted/50'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                      {(getAvatar(n.actor_email) || n.actor_avatar) ? (
                        <img src={getAvatar(n.actor_email) || n.actor_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-background',
                      COLOR_BY_TYPE[n.type]
                    )}>
                      <Icon className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{n.actor_name}</span>{' '}
                      <span className="text-muted-foreground">{buildMessage(n)}</span>
                    </p>
                    {preview && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5 italic">
                        "{preview}"
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(parseServerDate(n.created_date), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-gold mt-2 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
