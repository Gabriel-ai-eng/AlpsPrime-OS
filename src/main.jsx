import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';

// Unregister any stale service workers to prevent cached stale JS from
// breaking React hooks (e.g. "Cannot read properties of null (reading 'useState')")
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      reg.unregister();
    }
  });
  // Also clear all caches so stale chunks are evicted
  if (window.caches) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
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