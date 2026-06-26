import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EN } from './translations.en';

// i18n do Alps OS (apenas a casca do sistema — os sub-apps não são traduzidos).
//
// Abordagem "texto-fonte como chave": o português é o texto original escrito no
// código (idioma padrão), então quando o idioma é PT o `t()` devolve a própria
// string sem alteração (risco zero de regressão). Quando é EN, busca a tradução
// no dicionário `EN`; se faltar alguma, cai de volta no português.

const LANG_KEY = 'alps_lang';
const LangContext = createContext(null);

export function getLang() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === 'en' ? 'en' : 'pt';
  } catch {
    return 'pt';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getLang());

  useEffect(() => {
    try { document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR'; } catch {}
  }, [lang]);

  const setLang = useCallback((l) => {
    const next = l === 'en' ? 'en' : 'pt';
    try { localStorage.setItem(LANG_KEY, next); } catch {}
    setLangState(next);
  }, []);

  const t = useCallback((s, vars) => {
    let out = lang === 'en' ? (EN[s] != null ? EN[s] : s) : s;
    if (vars) {
      for (const k in vars) out = out.split('{' + k + '}').join(String(vars[k]));
    }
    return out;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) return { lang: 'pt', setLang: () => {}, t: (s) => s };
  return ctx;
}

// Atalho para componentes que só precisam traduzir.
export function useT() {
  return useLang().t;
}
