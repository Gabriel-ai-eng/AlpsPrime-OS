import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Loader2, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'ja', label: '日本語',     flag: '🇯🇵' },
  { code: 'zh', label: '中文',       flag: '🇨🇳' },
];

const TranslationContext = createContext(null);

export const useProfileTranslation = () => useContext(TranslationContext);

export function ProfileTranslationProvider({ profileEmail, isUnlimited, children }) {
  const [targetLang, setTargetLang] = useState('pt');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingItems, setPendingItems] = useState({});

  const registerTexts = useCallback((entries) => {
    setPendingItems((prev) => {
      const next = { ...prev };
      entries.forEach(({ id, text }) => {
        if (id && text) next[id] = text;
      });
      return next;
    });
  }, []);

  const setLanguage = useCallback(async (langCode) => {
    if (langCode === targetLang) return;
    if (langCode === 'pt') {
      setTargetLang('pt');
      setTranslations({});
      return;
    }
    if (!isUnlimited) {
      toast.error('Tradução automática disponível apenas em perfis Unlimited.');
      return;
    }

    const items = Object.entries(pendingItems).map(([id, text]) => ({ id, text }));
    if (items.length === 0) {
      setTargetLang(langCode);
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('translateProfileContent', {
        profile_email: profileEmail,
        target_lang: langCode,
        items,
      });
      setTranslations(res?.data?.translations || {});
      setTargetLang(langCode);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erro ao traduzir.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [isUnlimited, profileEmail, pendingItems, targetLang]);

  const translate = useCallback(
    (id, fallback) => translations[id] ?? fallback,
    [translations],
  );

  const ctx = useMemo(
    () => ({ targetLang, translations, translate, registerTexts, setLanguage, isUnlimited, loading }),
    [targetLang, translations, translate, registerTexts, setLanguage, isUnlimited, loading],
  );

  return <TranslationContext.Provider value={ctx}>{children}</TranslationContext.Provider>;
}

/**
 * Standalone language switcher button. Place anywhere inside a ProfileTranslationProvider.
 */
export function ProfileTranslateButton({ className }) {
  const ctx = useProfileTranslation();
  const [open, setOpen] = useState(false);
  if (!ctx) return null;
  const { targetLang, setLanguage, isUnlimited, loading } = ctx;
  const current = LANGUAGES.find((l) => l.code === targetLang) || LANGUAGES[0];

  const handleSelect = (code) => {
    setOpen(false);
    setLanguage(code);
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all',
          isUnlimited
            ? 'border-gold/30 bg-gold/5 hover:bg-gold/10 text-foreground'
            : 'border-border bg-card hover:border-gold/30 text-muted-foreground'
        )}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin text-gold" />
        ) : (
          <Globe className="w-3 h-3 text-gold" />
        )}
        <span>{current.flag}</span>
        <span>{current.label}</span>
        {!isUnlimited && <Lock className="w-3 h-3 text-gold/60" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-2xl z-30 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Traduzir perfil
              </p>
              {!isUnlimited && (
                <p className="text-[10px] text-gold mt-0.5">Exclusivo Unlimited</p>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleSelect(l.code)}
                  disabled={!isUnlimited && l.code !== 'pt'}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gold/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                    l.code === targetLang && 'bg-gold/10 text-gold'
                  )}
                >
                  <span>{l.flag}</span>
                  <span className="flex-1 text-left">{l.label}</span>
                  {l.code === targetLang && <Check className="w-3.5 h-3.5" />}
                  {!isUnlimited && l.code !== 'pt' && <Lock className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Renders text translated to the active target language.
 * Auto-registers the (id, text) so the provider can batch-translate later.
 */
export function Translated({ id, children, className, as: Tag = 'span' }) {
  const ctx = useProfileTranslation();
  const original = typeof children === 'string' ? children : '';

  React.useEffect(() => {
    if (ctx && id && original) ctx.registerTexts([{ id, text: original }]);
  }, [ctx, id, original]);

  if (!original) return null;
  if (!ctx || ctx.targetLang === 'pt') return <Tag className={className}>{original}</Tag>;
  return <Tag className={className}>{ctx.translate(id, original)}</Tag>;
}