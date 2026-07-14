import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Notification bell — now a simple link to the dedicated /notifications page.
 * The bell shows only the unread badge; the panel is gone.
 */
export default function NotificationsBell({ userEmail }) {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: userEmail }, '-created_date', 30),
    enabled: !!userEmail,
    refetchInterval: 15000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Link
      to="/notifications"
      className="relative p-3 -m-1 min-w-[44px] min-h-[44px] rounded-xl hover:bg-muted active:bg-black/10 active:scale-95 transition-all duration-75 inline-flex items-center justify-center"
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
      aria-label="Notificações"
    >
      <Bell className="w-5 h-5 text-black" strokeWidth={2.6} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-gold text-background text-[9px] font-bold flex items-center justify-center border border-background">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}