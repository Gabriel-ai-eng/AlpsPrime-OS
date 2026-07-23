import React, { useEffect, useRef, useState } from 'react';

/**
 * CachedImage — exibe imagens (foto de perfil/capa, banners do Home, etc.) de
 * forma instantânea no reload.
 *
 * Estratégia em camadas:
 *  1. localStorage (base64): imagens pequenas (avatar/capa) ficam disponíveis
 *     de forma SÍNCRONA, antes da primeira pintura — aparecem na hora.
 *  2. Cache Storage (window.caches): imagens grandes que estouram a cota do
 *     localStorage (ex.: o fundo do Wonderbound, ~5 MB) são guardadas aqui e
 *     servidas do disco no reload, sem ir à rede.
 *  3. Fallback: se o navegador bloquear o fetch (CORS) ou os caches falharem, o
 *     componente usa a URL direta — sem regressão em relação a um <img> normal.
 *
 * Revalidação (stale-while-revalidate):
 *  O cache é indexado pela URL. Como as imagens estáticas do app (fundo do
 *  Wonderbound, slides do Home…) mantêm o MESMO nome de arquivo entre publicações,
 *  guardar por URL sem revalidar fazia uma imagem trocada na `main` NUNCA
 *  aparecer para quem já tinha visitado (era preciso renomear o arquivo p/
 *  furar o cache). Agora, depois de pintar a versão em cache, o componente
 *  revalida em segundo plano com o servidor usando ETag (If-None-Match):
 *   - 304 (não mudou): nada a fazer, sem re-baixar — mantém a rapidez.
 *   - 200 (mudou): baixa a nova, atualiza o cache e troca a imagem na tela.
 *  A revalidação só roda para imagens do MESMO domínio (as estáticas do app);
 *  as de perfil (Supabase) já trocam de URL ao subir uma nova, então a própria
 *  chave de cache muda e não há o que revalidar.
 */

const PREFIX = 'sf_imgcache_';
const CACHE_NAME = 'sf-img-cache-v1';

function isSameOrigin(url) {
  try {
    return new URL(url, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function readLS(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null; // { url, data, etag }
  } catch {
    return null;
  }
}

function writeLS(key, url, data, etag) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ url, data, etag: etag || '' }));
    return true;
  } catch {
    // cota cheia / indisponível (típico em imagens grandes)
    return false;
  }
}

// Cache Storage: guarda o que não cabe no localStorage e devolve um object URL
// pronto para usar (junto do ETag guardado). Falha silenciosa => o chamador
// segue com a URL direta.
async function readFromCacheStorage(url) {
  if (typeof caches === 'undefined') return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(url);
    if (!res || !res.ok) return null;
    const etag = res.headers.get('etag') || '';
    const blob = await res.blob();
    return { objectUrl: URL.createObjectURL(blob), etag };
  } catch {
    return null;
  }
}

async function writeToCacheStorage(url, response) {
  if (typeof caches === 'undefined') return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(url, response);
  } catch {
    // sem espaço / indisponível — segue usando a URL direta
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onloadend = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}

export default function CachedImage({ src, cacheKey, alt = '', className, ...rest }) {
  // Inicialização preguiçosa: lê o localStorage uma única vez, antes da primeira
  // pintura — é o que torna avatar/capa instantâneos.
  const [display, setDisplay] = useState(() => {
    if (!src || !cacheKey) return src || '';
    const c = readLS(cacheKey);
    return c && c.url === src ? c.data : src;
  });

  // Guarda o object URL ativo (imagens grandes) para revogá-lo depois.
  const objectUrlRef = useRef(null);

  useEffect(() => {
    if (!src || !cacheKey) {
      setDisplay(src || '');
      return;
    }

    let cancelled = false;
    const revokePrev = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

    // Guarda a nova imagem baixada (localStorage p/ pequenas, senão Cache
    // Storage) e a exibe. `resp` é a Response da rede (com ETag).
    const storeAndShow = async (resp) => {
      const blob = await resp.clone().blob();
      const etag = resp.headers.get('etag') || '';
      const dataUrl = await blobToDataUrl(blob);
      if (cancelled) return;

      if (writeLS(cacheKey, src, dataUrl, etag)) {
        revokePrev();
        setDisplay(dataUrl);
        return;
      }
      // Estourou a cota (imagem grande): guarda no Cache Storage e exibe via
      // object URL do blob que já temos em mãos.
      await writeToCacheStorage(src, resp);
      const objUrl = URL.createObjectURL(blob);
      if (cancelled) {
        URL.revokeObjectURL(objUrl);
        return;
      }
      revokePrev();
      objectUrlRef.current = objUrl;
      setDisplay(objUrl);
    };

    // Stale-while-revalidate: confirma com o servidor se a imagem em cache
    // (mesma URL) continua atual. Só faz sentido para o mesmo domínio.
    const revalidate = async (etag) => {
      if (!isSameOrigin(src)) return;
      try {
        const resp = await fetch(src, {
          cache: 'no-store',
          headers: etag ? { 'If-None-Match': etag } : {},
        });
        if (cancelled) return;
        if (resp.status === 304) return; // não mudou — mantém o cache
        if (!resp.ok) return;
        await storeAndShow(resp); // mudou (ou não tínhamos ETag): atualiza
      } catch {
        /* offline / bloqueado — mantém a versão em cache */
      }
    };

    const ls = readLS(cacheKey);
    if (ls && ls.url === src) {
      revokePrev();
      setDisplay(ls.data); // já temos em cache (imagem pequena): instantâneo
      revalidate(ls.etag); // …e confere no servidor se mudou
      return () => {
        cancelled = true;
      };
    }

    // URL nova / não cacheada: mostra a URL direta enquanto resolve o cache.
    setDisplay(src);

    (async () => {
      // 1) Imagem grande já guardada no Cache Storage? Serve do disco, sem rede.
      const fromCache = await readFromCacheStorage(src);
      if (cancelled) {
        if (fromCache) URL.revokeObjectURL(fromCache.objectUrl);
        return;
      }
      if (fromCache) {
        revokePrev();
        objectUrlRef.current = fromCache.objectUrl;
        setDisplay(fromCache.objectUrl);
        revalidate(fromCache.etag); // confere no servidor se mudou
        return;
      }

      // 2) Baixa uma vez e guarda para os próximos reloads.
      try {
        const resp = await fetch(src, { mode: 'cors' });
        if (!resp.ok) return;
        if (cancelled) return;
        await storeAndShow(resp);
      } catch {
        /* mantém a URL direta */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src, cacheKey]);

  // Revoga o object URL pendente ao desmontar.
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  if (!display) return null;
  return <img src={display} alt={alt} className={className} {...rest} />;
}
