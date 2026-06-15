import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Search as SearchIcon, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getOtherEmail } from '@/lib/chatUtils';

/**
 * Shows all users the current user has been messaging with.
 * Groups DMs by conversation_key, picks the latest per key.
 */
export default function ConversationList({ currentEmail, activeKey, onSelect }) {
  // Load all messages involving the user (both sent and received)
  const { data: sent = [] } = useQuery({
    queryKey: ['dm-sent', currentEmail],
    queryFn: () => base44.entities.DirectMessage.filter({ sender_email: currentEmail }, '-created_date', 500),
    enabled: !!currentEmail,
    refetchInterval: 5000,
  });
  const { data: received = [] } = useQuery({
    queryKey: ['dm-received', currentEmail],
    queryFn: () => base44.entities.DirectMessage.filter({ receiver_email: currentEmail }, '-created_date', 500),
    enabled: !!currentEmail,
    refetchInterval: 5000,
  });

  // Load user directory to show names/avatars
  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });
  const userByEmail = useMemo(() => {
    const m = {};
    allUsers.forEach((u) => { m[u.email] = u; });
    return m;
  }, [allUsers]);

  // Group by conversation_key → latest message
  const conversations = useMemo(() => {
    const map = {};
    [...sent, ...received].forEach((msg) => {
      const key = msg.conversation_key;
      if (!map[key] || new Date(msg.created_date) > new Date(map[key].created_date)) {
        map[key] = msg;
      }
    });
    const unreadCounts = {};
    received.forEach((m) => {
      if (!m.read) unreadCounts[m.conversation_key] = (unreadCounts[m.conversation_key] || 0) + 1;
    });
    return Object.values(map)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .map((last) => {
        const other = getOtherEmail(last.conversation_key, currentEmail);
        return {
          key: last.conversation_key,
          other,
          otherUser: userByEmail[other],
          lastMessage: last,
          unread: unreadCounts[last.conversation_key] || 0,
        };
      });
  }, [sent, received, currentEmail, userByEmail]);

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gold" />
          <h2 className="font-display text-lg tracking-tight">Mensagens</h2>
        </div>
        <Link
          to="/search"
          className="w-8 h-8 rounded-lg border border-border hover:border-gold/40 hover:text-gold flex items-center justify-center text-muted-foreground transition-colors"
          title="Nova conversa"
        >
          <SearchIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="mb-1">Nenhuma conversa ainda</p>
            <Link to="/search" className="text-xs text-gold hover:underline">
              Encontre pessoas para conversar →
            </Link>
          </div>
        ) : (
          conversations.map((c) => {
            const name = c.otherUser?.ranking_display_name || c.otherUser?.full_name || c.other;
            const avatar = c.otherUser?.profile_picture_url;
            const isActive = c.key === activeKey;
            const fromMe = c.lastMessage.sender_email === currentEmail;
            return (
              <button
                key={c.key}
                onClick={() => onSelect(c.key)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 text-left transition-colors border-b border-border/50',
                  isActive ? 'bg-gold/5' : 'hover:bg-muted/40'
                )}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gold" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-sm truncate', c.unread > 0 ? 'font-bold' : 'font-semibold')}>
                      {name}
                    </p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(c.lastMessage.created_date), { locale: ptBR, addSuffix: false })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-xs truncate', c.unread > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                      {fromMe && <span className="text-muted-foreground">Você: </span>}
                      {c.lastMessage.content || (c.lastMessage.media_url ? '📎 Mídia' : '')}
                    </p>
                    {c.unread > 0 && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center">
                        {c.unread > 9 ? '9+' : c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}