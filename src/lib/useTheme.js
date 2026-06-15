/**
 * useTheme — Forçado para modo claro permanentemente.
 * O toggle e dark mode estão desativados.
 */
import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    try { localStorage.setItem('sextaTheme', 'light'); } catch {}
  }, []);

  return {
    theme: 'light',
    isDark: false,
    toggle: () => {},
    setTheme: () => {},
  };
}