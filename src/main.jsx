import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';

// Registra o service worker do PWA (/sw.js). Ele é seguro contra o problema
// antigo de JS/HTML desatualizado: navegações são SEMPRE rede-primeiro (cache
// só como fallback offline) — ver public/sw.js.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        // Tenta agendar a atualização periódica do fallback offline (Periodic
        // Background Sync). Só funciona com o PWA instalado e permissão do
        // navegador — se não der, o app segue normal sem isso.
        try {
          await reg.periodicSync?.register('alps-refresh-shell', {
            minInterval: 24 * 60 * 60 * 1000, // 1x por dia
          });
        } catch {}
      })
      .catch(() => {});
  });
  // Limpa caches órfãos de service workers antigos — MAS preserva o cache de
  // imagens do CachedImage (sf-img-cache-v1) e os caches do SW atual (sf-sw-*):
  // apagar o de imagens forçava rebaixar da rede, em toda visita, as imagens
  // grandes do Home (era isso que deixava o carregamento lento).
  if (window.caches) {
    caches.keys().then((keys) => {
      keys
        .filter((key) => key !== 'sf-img-cache-v1' && !key.startsWith('sf-sw-'))
        .forEach((key) => caches.delete(key));
    });
  }
}

// Aplica tema salvo ANTES do React montar (evita flash)
(function() {
  try {
    const t = localStorage.getItem('sextaTheme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch {}
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
