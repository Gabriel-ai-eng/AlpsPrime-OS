import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Asks for browser Notification permission once, then watches the user's
 * Notification entity and fires native push for each new one.
 *
 * Works on Chrome Android / desktop. iOS Safari requires the app to be
 * installed as a PWA (add to home screen) for notifications to show.
 */
const STORAGE_KEY = 'sf_push_permission_asked_v1';
const LAST_SEEN_KEY = 'sf_push_last_seen_id';

const LABEL_BY_TYPE = {
  like: 'curtiu seu post',
  comment: 'comentou no seu post',
  follow: 'começou a seguir você',
  message: 'enviou uma mensagem',
  welcome: 'Bem-vindo(a) à Sexta-feira!',
};

export function usePushNotifications(userEmail) {
  const askedRef = useRef(false);

  // Ask permission once per device, shortly after login
  useEffect(() => {
    if (!userEmail) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (askedRef.current) return;
    askedRef.current = true;

    const alreadyAsked = localStorage.getItem(STORAGE_KEY);
    if (alreadyAsked) return;
    if (Notification.permission !== 'default') {
      localStorage.setItem(STORAGE_KEY, '1');
      return;
    }

    // Delay a bit so the welcome UI renders first
    const t = setTimeout(() => {
      Notification.requestPermission().finally(() => {
        localStorage.setItem(STORAGE_KEY, '1');
      });
    }, 2500);
    return () => clearTimeout(t);
  }, [userEmail]);

  // Poll the user's notifications and fire native push for new ones
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () =>
      base44.entities.Notification.filter({ recipient_email: userEmail }, '-created_date', 30),
    enabled: !!userEmail,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!userEmail) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (!notifications.length) return;

    const lastSeenId = localStorage.getItem(LAST_SEEN_KEY);
    // On first run after granting permission, do not fire for history — just bookmark
    if (!lastSeenId) {
      localStorage.setItem(LAST_SEEN_KEY, notifications[0].id);
      return;
    }

    // Newest first; fire for everything above the bookmark
    const fresh = [];
    for (const n of notifications) {
      if (n.id === lastSeenId) break;
      if (!n.read) fresh.push(n);
    }
    if (fresh.length === 0) return;

    // Fire in chronological order (oldest -> newest)
    fresh.reverse().forEach((n) => {
      const title = 'Sexta-feira';
      const label = LABEL_BY_TYPE[n.type] || 'Nova notificação';
      const body = n.actor_name
        ? `${n.actor_name} ${label}`
        : label;
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: `sf-${n.id}`,
        });
      } catch {
        // ignore
      }
    });

    localStorage.setItem(LAST_SEEN_KEY, notifications[0].id);
  }, [notifications, userEmail]);
}