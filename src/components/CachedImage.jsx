import React, { useEffect, useState } from 'react';

/**
 * CachedImage — exibe imagens (foto de perfil/capa) de forma instantânea no reload.
 *
 * Guarda a imagem no localStorage como base64 na primeira vez que carrega. Nas
 * próximas vezes (inclusive ao recarregar a página) a imagem aparece na hora,
 * sem esperar a rede. Em segundo plano ela é rebaixada/atualizada caso a URL
 * mude (ex.: o usuário troca a foto), então o cache se mantém sempre correto.
 *
 * Se o navegador bloquear o fetch (CORS) ou o cache estourar a cota, o
 * componente simplesmente usa a URL direta — sem regressão em relação a um
 * <img> normal.
 */

const PREFIX = 'sf_imgcache_';

function readCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null; // { url, data }
  } catch {
    return null;
  }
}

function writeCache(key, url, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ url, data }));
  } catch {
    // cota cheia / indisponível — segue usando a URL direta
  }
}

export default function CachedImage({ src, cacheKey, alt = '', className, ...rest }) {
  // Inicialização preguiçosa: lê o cache uma única vez, antes da primeira pintura.
  const [display, setDisplay] = useState(() => {
    if (!src || !cacheKey) return src || '';
    const c = readCache(cacheKey);
    return c && c.url === src ? c.data : src;
  });

  useEffect(() => {
    if (!src || !cacheKey) {
      setDisplay(src || '');
      return;
    }
    const c = readCache(cacheKey);
    if (c && c.url === src) {
      setDisplay(c.data); // já temos esta imagem em cache: instantâneo
      return;
    }
    // URL nova: mostra a URL direta enquanto baixa e converte para cache.
    setDisplay(src);
    let cancelled = false;
    fetch(src, { mode: 'cors' })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('fetch falhou'))))
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onloadend = () => resolve(fr.result);
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          })
      )
      .then((data) => {
        if (cancelled) return;
        writeCache(cacheKey, src, data);
        setDisplay(data);
      })
      .catch(() => {
        /* mantém a URL direta */
      });
    return () => {
      cancelled = true;
    };
  }, [src, cacheKey]);

  if (!display) return null;
  return <img src={display} alt={alt} className={className} {...rest} />;
}
