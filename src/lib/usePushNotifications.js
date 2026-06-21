import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getPrefs } from '@/lib/appPrefs';

/**
 * Asks for browser Notification permission once, then watches the user's
 * Notification entity and fires native push for each new one — respeitando
 * as preferências da tela de Configurações:
 *   • Por sub-app   → não dispara push de um serviço desligado
 *   • Não perturbe  → não dispara dentro do horário escolhido
 *   • Resumo agendado → junta tudo e entrega um único aviso no horário definido
 *
 * Works on Chrome Android / desktop. iOS Safari requires the app to be
 * installed as a PWA (add to home screen) for notifications to show.
 */
const STORAGE_KEY = 'sf_push_permission_asked_v1';
const LAST_SEEN_KEY = 'sf_push_last_seen_id';
const DIGEST_PENDING_KEY = 'alps_digest_pending'; // nº de novidades seguradas
const DIGEST_LAST_KEY = 'alps_digest_last_date';   // YYYY-MM-DD do último resumo

const LABEL_BY_TYPE = {
  like: 'curtiu seu post',
  comment: 'comentou no seu post',
  follow: 'começou a seguir você',
  message: 'enviou uma mensagem',
  welcome: 'Bem-vindo(a) à Sexta-feira!',
};

// Qual sub-app gerou a notificação. Hoje a marca é a Sexta-feira; o campo
// `app` (quando existir) deixa armor/vivart prontos para o futuro.
function notifApp(n) {
  return n?.app || 'sexta';
}
function appPref(prefs, app) {
  if (app === 'armor') return prefs.notif_armor;
  if (app === 'vivart') return prefs.notif_vivart;
  return prefs.notif_sexta;
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function inDnd(prefs, date = new Date()) {
  if (!prefs.dnd_enabled) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  const from = toMinutes(prefs.dnd_from);
  const to = toMinutes(prefs.dnd_to);
  // Janela que vira a meia-noite (ex.: 22:00 → 07:00)
  return from <= to ? now >= from && now < to : now >= from || now < to;
}

function fire(title, body, tag) {
  try {
    new Notification(title, { body, icon: '/favicon.png', tag });
  } catch {
    // ignore
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

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

    // Newest first; collect everything above the bookmark
    const fresh = [];
    for (const n of notifications) {
      if (n.id === lastSeenId) break;
      if (!n.read) fresh.push(n);
    }
    // Always advance the bookmark so nothing fires twice
    localStorage.setItem(LAST_SEEN_KEY, notifications[0].id);
    if (fresh.length === 0) return;

    const prefs = getPrefs();

    // Mantém só as de sub-apps habilitados
    const permitidas = fresh.filter((n) => appPref(prefs, notifApp(n)));
    if (permitidas.length === 0) return;

    // Não perturbe: segura tudo (continua no inbox, só não vibra agora)
    if (inDnd(prefs)) return;

    // Resumo agendado: em vez de avisar agora, acumula para entregar no horário
    if (prefs.digest_enabled) {
      const pending = Number(localStorage.getItem(DIGEST_PENDING_KEY) || 0) + permitidas.length;
      localStorage.setItem(DIGEST_PENDING_KEY, String(pending));
      return;
    }

    // Disparo normal (cronológico: mais antigo → mais novo)
    permitidas.reverse().forEach((n) => {
      const label = LABEL_BY_TYPE[n.type] || 'Nova notificação';
      const body = n.actor_name ? `${n.actor_name} ${label}` : label;
      fire('Sexta-feira', body, `sf-${n.id}`);
    });
  }, [notifications, userEmail]);

  // Entrega do resumo agendado no horário definido (verifica a cada minuto)
  useEffect(() => {
    if (!userEmail) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const check = () => {
      if (Notification.permission !== 'granted') return;
      const prefs = getPrefs();
      if (!prefs.digest_enabled) return;
      if (inDnd(prefs)) return;

      const pending = Number(localStorage.getItem(DIGEST_PENDING_KEY) || 0);
      if (pending <= 0) return;

      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin < toMinutes(prefs.digest_at)) return;
      if (localStorage.getItem(DIGEST_LAST_KEY) === todayKey()) return;

      fire(
        'Alps OS',
        `Você tem ${pending} ${pending === 1 ? 'nova novidade' : 'novas novidades'} para ver.`,
        'alps-digest'
      );
      localStorage.setItem(DIGEST_LAST_KEY, todayKey());
      localStorage.setItem(DIGEST_PENDING_KEY, '0');
    };

    check();
    const id = setInterval(check, 60 * 1000);
    return () => clearInterval(id);
  }, [userEmail]);
}
