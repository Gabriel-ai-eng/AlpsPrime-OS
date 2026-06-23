/**
 * Preferências locais do Alps OS (notificações por app, bem-estar, beta, etc.)
 * e rastreamento simples de tempo de uso — tudo no localStorage do dispositivo.
 */

const PREFS_KEY = 'alps_prefs_v1';

export const DEFAULT_PREFS = {
  // Notificações por sub-app
  notif_sexta: true,
  notif_armor: true,
  notif_vivart: true,
  // Não perturbe
  dnd_enabled: false,
  dnd_from: '22:00',
  dnd_to: '07:00',
  // Resumo agendado
  digest_enabled: false,
  digest_at: '09:00',
  // Bem-estar
  pause_enabled: false,
  pause_minutes: 60,
  // Sistema
  beta_features: false,
  // Aparência — estilo da barra de navegação inferior ('floating' | 'fixed')
  navbar_style: 'floating',
};

export function getPrefs() {
  try {
    return { ...DEFAULT_PREFS, ...(JSON.parse(localStorage.getItem(PREFS_KEY)) || {}) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function setPref(key, value) {
  const p = getPrefs();
  p[key] = value;
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  // Notifica componentes vivos (ex.: BottomNav) para refletirem a mudança na hora.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('alps:prefchange', { detail: { key, value } }));
  }
  return p;
}

/* ── Tempo de uso ── */

const USAGE_KEY = 'alps_usage_v1';

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function getUsage() {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY)) || {};
  } catch {
    return {};
  }
}

/** Acumula segundos no dia atual e remove registros com mais de 14 dias. */
export function addUsage(seconds) {
  const u = getUsage();
  const k = dayKey();
  u[k] = (u[k] || 0) + seconds;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  for (const key of Object.keys(u)) {
    if (key < dayKey(cutoff)) delete u[key];
  }
  localStorage.setItem(USAGE_KEY, JSON.stringify(u));
}

/** Retorna os últimos 7 dias: [{ label, seconds }] (segunda→hoje). */
export function getWeeklyUsage() {
  const u = getUsage();
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ label: dias[d.getDay()], seconds: u[dayKey(d)] || 0 });
  }
  return out;
}

export function formatDuration(seconds) {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}min` : `${h}h`;
}
