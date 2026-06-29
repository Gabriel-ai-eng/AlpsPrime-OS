import React, { useEffect, useRef, useState } from 'react';

/**
 * CachedImage — exibe imagens (foto de perfil/capa, banners do Home, etc.) de
 * forma instantânea no reload.
 *
 * Estratégia em camadas:
 *  1. localStorage (base64): imagens pequenas (avatar/capa) ficam disponíveis
 *     de forma SÍNCRONA, antes da primeira pintura — aparecem na hora.
 *  2. Cache Storage (window.caches): imagens grandes que estouram a cota do
 *     localStorage (ex.: o fundo do Projeto Armor, ~5 MB) são guardadas aqui e
 *     servidas do disco no reload, sem ir à rede.
 *  3. Fallback: se o navegador bloquear o fetch (CORS) ou os caches falharem, o
 *     componente usa a URL direta — sem regressão em relação a um <img> normal.
 *
 * Em segundo plano a imagem é baixada/atualizada caso a URL mude (ex.: o usuário
 * troca a foto), então o cache se mantém sempre correto.
 */

const PREFIX = 'sf_imgcache_';
const CACHE_NAME = 'sf-img-cache-v1';

function readLS(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null; // { url, data }
  } catch {
    return null;
  }
}

function writeLS(key, url, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ url, data }));
    return true;
  } catch {
    // cota cheia / indisponível (típico em imagens grandes)
    return false;
  }
}

// Cache Storage: guarda o que não cabe no localStorage e devolve um object URL
// pronto para usar. Falha silenciosa => o chamador segue com a URL direta.
async function readFromCacheStorage(url) {
  if (typeof caches === 'undefined') return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(url);
    if (!res || !res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
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

    const ls = readLS(cacheKey);
    if (ls && ls.url === src) {
      revokePrev();
      setDisplay(ls.data); // já temos em cache (imagem pequena): instantâneo
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
        if (fromCache) URL.revokeObjectURL(fromCache);
        return;
      }
      if (fromCache) {
        revokePrev();
        objectUrlRef.current = fromCache;
        setDisplay(fromCache);
        return;
      }

      // 2) Baixa uma vez e guarda para os próximos reloads.
      try {
        const resp = await fetch(src, { mode: 'cors' });
        if (!resp.ok) return;
        const blob = await resp.clone().blob();

        // Tenta o localStorage (instantâneo no reload p/ imagens pequenas).
        const dataUrl = await new Promise((resolve, reject) => {
          const fr = new FileReader();
          fr.onloadend = () => resolve(fr.result);
          fr.onerror = reject;
          fr.readAsDataURL(blob);
        });
        if (cancelled) return;

        if (writeLS(cacheKey, src, dataUrl)) {
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
