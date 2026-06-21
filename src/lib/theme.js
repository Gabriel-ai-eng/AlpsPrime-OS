/**
 * Tema (claro / escuro / automático) e cor de destaque (acento).
 * Tudo é persistido em localStorage e aplicado no <html> via classes/variáveis CSS.
 */

const THEME_KEY = 'sf_theme_preference';

export function getThemePref() {
  const v = localStorage.getItem(THEME_KEY);
  return v === 'dark' || v === 'auto' ? v : 'light';
}

export function resolveTheme(pref) {
  if (pref === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref === 'dark' ? 'dark' : 'light';
}

export function applyTheme(pref) {
  localStorage.setItem(THEME_KEY, pref);
  const resolved = resolveTheme(pref);
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
  }
  return resolved;
}

/* ── Cor de destaque (acento) ── */

const ACCENT_KEY = 'sf_accent_preference';

// Valores em canais RGB (espaço separado) para casar com rgb(var(--gold) / <alpha>)
export const ACCENTS = {
  dourado: { label: 'Dourado', DEFAULT: '201 162 79',  light: '232 199 122', dark: '168 133 46',  swatch: '#C9A24F' },
  azul:    { label: 'Azul',    DEFAULT: '90 150 255',   light: '150 190 255', dark: '40 90 200',   swatch: '#5A96FF' },
  roxo:    { label: 'Roxo',    DEFAULT: '160 110 235',  light: '200 170 245', dark: '110 70 190',  swatch: '#A06EEB' },
  verde:   { label: 'Verde',   DEFAULT: '70 190 130',   light: '140 220 180', dark: '40 140 95',   swatch: '#46BE82' },
  rosa:    { label: 'Rosa',    DEFAULT: '235 110 160',  light: '245 170 200', dark: '200 70 120',  swatch: '#EB6EA0' },
};

export function getAccent() {
  const v = localStorage.getItem(ACCENT_KEY);
  return ACCENTS[v] ? v : 'dourado';
}

export function applyAccent(id) {
  const a = ACCENTS[id] || ACCENTS.dourado;
  localStorage.setItem(ACCENT_KEY, ACCENTS[id] ? id : 'dourado');
  const s = document.documentElement.style;
  s.setProperty('--gold', a.DEFAULT);
  s.setProperty('--gold-light', a.light);
  s.setProperty('--gold-dark', a.dark);
}

/** Aplica tema + acento salvos. Chamado uma vez no boot do app. */
export function initAppearance() {
  applyAccent(getAccent());
  return applyTheme(getThemePref());
}
