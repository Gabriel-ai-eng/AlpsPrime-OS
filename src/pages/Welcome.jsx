import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthSection from '@/components/access/AuthSection';
import {
  ChevronDown,
  Languages,
  Globe,
  Check,
} from 'lucide-react';
import { useT, useLang } from '@/lib/i18n';

const LOGO_MARK_URL = '/brand/logo-mark.webp';

const LANG_OPTIONS = [
  { id: 'pt', label: 'Português' },
  { id: 'en', label: 'English' },
];

function LanguagePicker({ variant = 'light' }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapperRef = React.useRef(null);
  const current = LANG_OPTIONS.find((l) => l.id === lang) || LANG_OPTIONS[0];
  const dark = variant === 'dark';

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          dark
            ? 'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20'
            : 'inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/80 shadow-sm transition hover:border-black/20 hover:bg-black/[0.02] focus:outline-none focus:ring-2 focus:ring-black/10'
        }
      >
        {dark ? <Globe className="h-3.5 w-3.5" /> : <Languages className="h-3.5 w-3.5" />}
        <span>{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className={
            dark
              ? 'absolute right-0 z-20 mt-2 min-w-[150px] overflow-hidden rounded-2xl border border-white/10 bg-black/95 p-1 shadow-xl backdrop-blur-xl'
              : 'absolute right-0 z-20 mt-2 min-w-[150px] overflow-hidden rounded-2xl border border-black/10 bg-white p-1 shadow-xl'
          }
        >
          {LANG_OPTIONS.map((l) => {
            const active = lang === l.id;
            return (
              <button
                key={l.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLang(l.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-black text-white'
                    : dark
                    ? 'text-white/75 hover:bg-white/10 hover:text-white'
                    : 'text-black/75 hover:bg-black/[0.04] hover:text-black'
                }`}
              >
                {l.label}
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Vitrine no estilo apple.com: cada jogo é um "produto" numa seção própria,
// com nome grande, uma frase e a arte embaixo. `disponivel: false` mostra o
// selo "Em breve" (sem botão de jogar) — é o caso do Free Kick World, cujo
// acesso está bloqueado no momento.
const PRODUTOS = [
  {
    id: 'armor',
    eyebrow: 'Jogo de ação',
    titulo: 'Projeto Armor',
    subtitulo: 'Conheça a nova geração da ação e sobrevivência.',
    img: '/apps/armor-hero.webp',
    quadrado: true,
    disponivel: true,
  },
  {
    id: 'fkw',
    eyebrow: 'Jogo de futebol',
    titulo: 'Free Kick World',
    subtitulo: 'Mire, cobre a falta perfeita e domine o gramado.',
    img: '/apps/fkw-hero.webp',
    quadrado: false,
    disponivel: false,
  },
];

const FAQ = [
  {
    q: 'O que é o Alps OS?',
    a: 'É um ecossistema privado de serviços da Alps Prime, reunido em um só lugar.',
  },
  {
    q: 'Como funciona o acesso?',
    a: 'O acesso é feito via pagamento único na Hotmart. Depois da compra, use o mesmo e-mail.',
  },
  {
    q: 'Já comprei. Como entro?',
    a: 'Toque em Entrar e use o mesmo e-mail informado no checkout.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-left transition hover:bg-black/[0.02] focus:outline-none focus:ring-2 focus:ring-black/10"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-black">{t(q)}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-black/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && <p className="mt-3 text-sm leading-relaxed text-black/65">{t(a)}</p>}
    </button>
  );
}

export default function Welcome() {
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useT();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (showAuth) return <AuthSection onClose={() => setShowAuth(false)} />;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-black antialiased" style={{ fontFamily: "'Inter', 'SF Pro Display', 'SF Pro Text', sans-serif" }}>
      <header
        className={`sticky top-0 z-30 border-b border-white/10 transition-colors duration-300 ${
          scrolled ? 'bg-black/85 backdrop-blur-xl' : 'bg-black/95'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center px-5 py-3 sm:px-8">
          <div className="flex flex-1 justify-center pr-6 sm:pr-10">
            <img src={LOGO_MARK_URL} alt="Alps OS" className="h-10 w-auto object-contain sm:h-12" />
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-6 w-px bg-white/15" />
            <LanguagePicker variant="dark" />
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {t('Entrar')}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* VITRINE — imagens dos jogos em tela cheia, empilhadas logo abaixo do
            cabeçalho (a arte já traz o nome do jogo embutido). O jogo disponível
            abre o login ao ser tocado; o "Em breve" fica apenas como imagem. */}
        <section className="bg-[#f5f5f7]">
          <div className="flex flex-col gap-2">
            {PRODUTOS.map((p) =>
              p.disponivel ? (
                <button
                  key={p.id}
                  onClick={() => setShowAuth(true)}
                  aria-label={p.titulo}
                  className="block w-full bg-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black/20"
                >
                  <img
                    src={p.img}
                    alt={p.titulo}
                    loading="lazy"
                    decoding="async"
                    className={`w-full object-cover ${p.quadrado ? 'aspect-square' : ''}`}
                  />
                </button>
              ) : (
                <img
                  key={p.id}
                  src={p.img}
                  alt={p.titulo}
                  loading="lazy"
                  decoding="async"
                  className={`block w-full bg-black object-cover ${p.quadrado ? 'aspect-square' : ''}`}
                />
              )
            )}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 pt-16 pb-16 sm:pt-24 sm:pb-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('Perguntas frequentes')}
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => <FaqItem key={item.q} {...item} />)}
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-[#f5f5f7]">
        <div className="mx-auto max-w-6xl px-5 py-8 text-center sm:px-8">
          <p className="mx-auto max-w-xl text-[11px] leading-relaxed text-black/40">
            {t('Versão Beta, ainda em aperfeiçoamento — podem ocorrer erros.')}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-black/40">
            <Link to="/termos-de-uso" className="underline underline-offset-2 hover:text-black/70">
              {t('Termos de Uso')}
            </Link>
            <Link to="/privacidade" className="underline underline-offset-2 hover:text-black/70">
              {t('Privacidade')}
            </Link>
            <Link to="/pagamento" className="underline underline-offset-2 hover:text-black/70">
              {t('Pagamento')}
            </Link>
          </div>

          <p className="mt-4 text-[11px] text-black/30">© {new Date().getFullYear()} Alps OS</p>
        </div>
      </footer>
    </div>
  );
}
