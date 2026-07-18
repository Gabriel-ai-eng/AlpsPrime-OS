/*
 * Service worker do Alps Prime (PWA).
 *
 * Estratégia pensada para NUNCA servir app desatualizado (já tivemos telas
 * "atrasadas" por cache de HTML — ver vercel.json):
 *
 * - Navegações (HTML): SEMPRE rede primeiro. O cache só entra como fallback
 *   quando o usuário está offline.
 * - /assets/ (arquivos com hash no nome, imutáveis): cache primeiro.
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // só o próprio site

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
