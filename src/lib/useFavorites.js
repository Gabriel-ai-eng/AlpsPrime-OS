import { useState, useEffect, useCallback } from 'react';

// Favoritos do Alps OS: guarda os ids dos apps favoritados no aparelho
// (localStorage) e mantém todas as telas sincronizadas na hora — favoritar
// num lugar (ex.: Categorias) já reflete na tela de Favoritos, sem reload.
const STORAGE_KEY = 'sf_favoritos';
const EVENT = 'sf-favoritos-changed';

function lerFavoritosSalvos() {
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(salvo) ? salvo : [];
  } catch {
    return [];
  }
}

function gravarFavoritosSalvos(ids) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(lerFavoritosSalvos);

  useEffect(() => {
    const sync = () => setFavoriteIds(lerFavoritosSalvos());
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const isFavorite = useCallback((id) => favoriteIds.includes(id), [favoriteIds]);

  const toggleFavorite = useCallback((id) => {
    const atuais = lerFavoritosSalvos();
    const proximos = atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id];
    gravarFavoritosSalvos(proximos);
    setFavoriteIds(proximos);
  }, []);

  return { favoriteIds, isFavorite, toggleFavorite };
}
