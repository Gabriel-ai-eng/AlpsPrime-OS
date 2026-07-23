/*
 * Service worker do Alps Prime (PWA).
 *
 * Estratégia pensada para NUNCA servir app desatualizado (já tivemos telas
 * "atrasadas" por cache de HTML — ver vercel.json):
 *
 * - Navegações (HTML): SEMPRE rede primeiro. O cache só entra como fallback
 *   quando o usuário está offline.
 * - /assets/ (arquivos com hash no nome, imutáveis): cache primeiro.
 * - /api, /jogo e /fkw: o SW NÃO se mete — backend e sub-apps têm vida
 *   própria (e cachear a navegação deles sobrescreveria o fallback offline
 *   da casca com o HTML do jogo).
 * - Demais requisições: passam direto pra rede (sem interferência).
 * - O cache de imagens do app (sf-img-cache-v1, usado pelo CachedImage) é
 *   de outra dona — este SW nunca lê nem apaga ele.
 */

const SW_CACHE = 'sf-sw-v1';
const IMG_CACHE = 'sf-img-cache-v1'; // pertence ao CachedImage — não tocar

self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Pré-aquece o fallback offline com a casca do app.
  event.waitUntil(
    caches.open(SW_CACHE).then((cache) => cache.add('/').catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Remove só caches antigos DESTE SW (prefixo sf-sw-), preservando o
      // sf-img-cache-v1 e qualquer outro cache de terceiros.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('sf-sw-') && k !== SW_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Re-aquece o fallback offline com a casca mais recente do app.
async function atualizarShell() {
  try {
    const res = await fetch('/', { cache: 'no-cache' });
    if (res.ok) {
      const cache = await caches.open(SW_CACHE);
      await cache.put('/', res.clone());
    }
  } catch {
    // sem rede agora — fica pra próxima
  }
}

// Background Sync: quando a conexão volta, atualiza o fallback offline
// (registrado pelo fetch handler quando uma navegação falha offline).
self.addEventListener('sync', (event) => {
  if (event.tag === 'alps-refresh-shell') event.waitUntil(atualizarShell());
});

// Periodic Background Sync: mantém o fallback offline fresco de tempos em
// tempos (só roda com o PWA instalado e permissão do navegador — ver main.jsx).
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'alps-refresh-shell') event.waitUntil(atualizarShell());
});

// ── Notificações push ──
// Exibe notificações recebidas via Web Push (quando um servidor de push for
// plugado) e também as disparadas pelo próprio app via showNotification —
// no Chrome do Android, notificação de página só funciona pelo SW.
self.addEventListener('push', (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = { body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(dados.title || 'Alps OS', {
      body: dados.body || 'Você tem novidades para ver.',
      icon: '/icon-192.webp',
      badge: '/favicon.webp',
      tag: dados.tag || 'alps-push',
      data: { url: dados.url || '/home' },
    })
  );
});

// Clique na notificação: foca uma aba já aberta do app ou abre uma nova.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/home';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((janelas) => {
        for (const janela of janelas) {
          if ('focus' in janela) return janela.focus();
        }
        return self.clients.openWindow(url);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // só o próprio site

  // Backend e sub-apps (Wonderbound, FKW): o SW não se mete.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/jogo') ||
    url.pathname.startsWith('/fkw')
  ) return;

  // Navegações: rede primeiro (HTML sempre fresco); cache só se offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(SW_CACHE);
          cache.put('/', fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          // Sem rede: agenda uma atualização do shell pra quando a conexão
          // voltar (Background Sync; se o navegador não suportar, ignora).
          try { await self.registration.sync.register('alps-refresh-shell'); } catch {}
          const cached = await caches.match('/', { cacheName: SW_CACHE });
          return (
            cached ||
            new Response('Sem conexão. Verifique sua internet e tente de novo.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
          );
        }
      })()
    );
    return;
  }

  // Assets com hash (imutáveis): cache primeiro, rede como complemento.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req, { cacheName: SW_CACHE });
        if (cached) return cached;
        const fresh = await fetch(req);
        if (fresh.ok) {
          const cache = await caches.open(SW_CACHE);
          cache.put(req, fresh.clone()).catch(() => {});
        }
        return fresh;
      })()
    );
  }
  // Todo o resto (imagens, API, etc.): rede normal, sem interferência.
});
