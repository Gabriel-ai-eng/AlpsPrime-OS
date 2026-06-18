import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Search as SearchIcon, MessageCircle, PenSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getOtherEmail } from '@/lib/chatUtils';

/**
 * Shows all users the current user has been messaging with.
 * Groups DMs by conversation_key, picks the latest per key.
 * Visual: "Alps OS" premium black / liquid-glass language (matches Feed,
 * Notifications & Search), gold accent #FFD700.
 */
export default function ConversationList({ currentEmail, activeKey, onSelect }) {
  const [search, setSearch] = useState('');

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

  // Client-side filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = c.otherUser?.ranking_display_name || c.otherUser?.full_name || c.other || '';
      return name.toLowerCase().includes(q);
    });
  }, [conversations, search]);

  return (
    <div className="flex flex-col h-full text-white relative">
      {/* ─────────── HEADER ─────────── */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <MessageCircle className="w-5 h-5 text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.35)]" strokeWidth={1.6} />
          <h2
            className="text-[22px] font-semibold tracking-tight text-white"
            style={{ textShadow: '0 0 14px rgba(255,255,255,0.18)' }}
          >
            Mensagens
          </h2>
        </div>
        <Link
          to="/search"
          title="Nova conversa"
          className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl flex items-center justify-center text-[#FFD700] transition-all hover:bg-white/[0.1] active:scale-90"
        >
          <PenSquare className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </Link>
      </div>

      {/* ─────────── SEARCH BAR ─────────── */}
      <div className="px-5 pb-3 flex-shrink-0">
        <div className="relative flex items-center h-11 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl px-3.5 gap-2.5 transition-all focus-within:border-white/20 focus-within:bg-white/[0.06]">
          <SearchIcon className="w-[18px] h-[18px] text-white/30 flex-shrink-0" strokeWidth={1.8} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversas..."
            className="flex-1 bg-transparent text-[14px] text-white/90 placeholder:text-white/25 outline-none font-medium"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          />
        </div>
      </div>

      {/* ─────────── LIST ─────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-3 pb-28 lg:pb-4">
        {conversations.length === 0 ? (
          /* Empty state — premium */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center pt-24 px-6"
          >
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-[#FFD700]/10 blur-[40px] rounded-full pointer-events-none" />
              <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-center relative">
                <MessageCircle className="w-8 h-8 text-[#FFD700] drop-shadow-[0_0_12px_rgba(255,215,0,0.35)]" strokeWidth={1.2} />
              </div>
            </div>
            <h3 className="text-[18px] font-semibold text-white mb-1.5 tracking-tight">Nenhuma conversa ainda</h3>
            <p className="text-[13px] text-[#8E8E93] mb-5 max-w-[230px] leading-relaxed">
              Comece um bate-papo com alguém da comunidade Alps.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFD700]/[0.08] border border-[#FFD700]/25 text-[13px] font-medium text-[#FFD700] transition-all hover:bg-[#FFD700]/[0.14] active:scale-95"
            >
              Encontre pessoas para conversar →
            </Link>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="pt-16 text-center text-sm text-[#8E8E93]">
            Nenhum resultado para “{search}”.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 pt-1">
            {filtered.map((c, index) => {
              const name = c.otherUser?.ranking_display_name || c.otherUser?.full_name || c.other;
              const avatar = c.otherUser?.profile_picture_url;
              const isActive = c.key === activeKey;
              const fromMe = c.lastMessage.sender_email === currentEmail;
              return (
                <motion.button
                  key={c.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: Math.min(index * 0.025, 0.3) }}
                  onClick={() => onSelect(c.key)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 text-left rounded-[18px] transition-all duration-300 relative overflow-hidden outline-none active:scale-[0.98]',
                    isActive
                      ? 'bg-[#FFD700]/[0.08] border border-[#FFD700]/25 shadow-[0_0_20px_rgba(255,215,0,0.04)]'
                      : 'border border-transparent hover:bg-white/[0.05]'
                  )}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white/30" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-[15px] truncate text-white', c.unread > 0 ? 'font-bold' : 'font-semibold')}>
                        {name}
                      </p>
                      <span className="text-[10px] text-[#8E8E93] flex-shrink-0 font-medium">
                        {formatDistanceToNow(new Date(c.lastMessage.created_date), { locale: ptBR, addSuffix: false })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={cn('text-[13px] truncate', c.unread > 0 ? 'text-white/80' : 'text-[#8E8E93]')}>
                        {fromMe && <span className="text-white/40">Você: </span>}
                        {c.lastMessage.content || (c.lastMessage.media_url ? '📎 Mídia' : '')}
                      </p>
                      {c.unread > 0 && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#FFD700] text-black text-[11px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.5)]">
                          {c.unread > 9 ? '9+' : c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
