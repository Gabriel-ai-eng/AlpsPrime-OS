import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AuthSection from '@/components/access/AuthSection';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ChevronDown,
  Languages,
  Check,
  Shield,
  Sparkles,
  Layers3,
  ArrowRight
} from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';
import { useT, useLang } from '@/lib/i18n';

const LANG_OPTIONS = [
  { id: 'pt', label: 'Português' },
  { id: 'en', label: 'English' },
];

function LanguagePicker() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANG_OPTIONS.find((l) => l.id === lang) || LANG_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/80 shadow-sm transition hover:border-black/20 hover:bg-black/[0.02] focus:outline-none focus:ring-2 focus:ring-black/10"
      >
        <Languages className="h-3.5 w-3.5" />
        <span>{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            className="absolute right-0 z-20 mt-2 min-w-[150px] overflow-hidden rounded-2xl border border-black/10 bg-white p-1 shadow-xl"
          >
            {LANG_OPTIONS.map((l) => {
              const active = lang === l.id;
              return (
                <button
                  key={l.id}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLang(l.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                    active ? 'bg-black text-white' : 'text-black/75 hover:bg-black/[0.04] hover:text-black'
                  }`}
                >
                  {l.label}
                  {active && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const CHECKOUT_URL = 'https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Experiência integrada',
    desc: 'Um único acesso para organizar tudo em um fluxo simples e contínuo.',
  },
  {
    icon: Layers3,
    title: 'Estrutura curada',
    desc: 'Tudo distribuído em blocos claros, com foco no que importa primeiro.',
  },
  {
    icon: Shield,
    title: 'Acesso protegido',
    desc: 'Login rápido com a mesma conta usada na compra e navegação segura.',
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
  const [totalUsers, setTotalUsers] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const t = useT();

  useEffect(() => {
    base44.functions.invoke('getUsersCount', {})
      .then((r) => setTotalUsers(r?.data?.count || 0))
      .catch(() => setTotalUsers(0));
  }, []);

  if (showAuth) return <AuthSection onClose={() => setShowAuth(false)} />;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-black antialiased" style={{ fontFamily: "'Inter', 'SF Pro Display', 'SF Pro Text', sans-serif" }}>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f5f5f7]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Alps OS" className="h-8 w-8 rounded-xl object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Alps OS</p>
              <p className="text-[11px] text-black/45">{t('Um ecossistema, um login')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguagePicker />
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {t('Entrar')}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-4xl text-center"
          >
            <p className="mb-4 text-sm font-medium text-black/55">
              {t('Novo acesso disponível')}
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              {t('Tudo da Alps Prime.')}<br />
              {t('em um só lugar.')}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-black/60 sm:text-lg">
              {t('Uma entrada única para explorar o ecossistema Alps com mais clareza, rapidez e consistência.')}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-7 text-sm font-medium text-white transition hover:scale-[1.02] hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <ShoppingBag className="h-4 w-4" />
                {t('Garantir acesso')}
              </a>

              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 text-sm font-medium text-black/80 transition hover:border-black/20 hover:bg-black/[0.02] focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                {t('Já sou cliente')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-6 text-xs text-black/40">
              {totalUsers > 0 ? `${totalUsers.toLocaleString('pt-BR')} ${t('usuários já acessaram essa experiência.')}` : t('Acesso direto e simples.')}
            </p>
          </motion.div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.04]">
                  <f.icon className="h-5 w-5 text-black" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{t(f.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/58">{t(f.desc)}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-medium text-black/50">{t('Pensado para ser intuitivo')}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t('Menos ruído. Mais direção.')}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-black/60">
                {t('A interface usa hierarquia forte, botões claros e blocos com função definida, para reduzir esforço mental e acelerar a decisão.')}
              </p>

              <div className="mt-8 space-y-3">
                {[
                  'Mensagem principal visível no primeiro olhar.',
                  'CTA forte, mas sem exagero visual.',
                  'Seções curtas, com leitura rápida e fluida.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-black/8 bg-white px-4 py-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">✓</div>
                    <p className="text-sm leading-relaxed text-black/70">{t(item)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-gradient-to-b from-white to-black/[0.02] p-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-medium text-black/50">{t('Fluxo recomendado')}</p>
                <p className="text-xs text-black/40">{t('Apple-like')}</p>
              </div>

              <div className="space-y-4">
                {[
                  ['1', 'Apresentar o valor principal em uma frase curta.'],
                  ['2', 'Oferecer uma ação primária e uma secundária.'],
                  ['3', 'Reforçar confiança com FAQ e detalhes mínimos.'],
                ].map(([num, txt]) => (
                  <div key={num} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                      {num}
                    </div>
                    <p className="pt-1 text-sm leading-relaxed text-black/68">{t(txt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8 sm:pb-24">
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
            {' '}
            <a
              href="https://alpsprime.com.br/sexta-feira-10"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-black/60 underline underline-offset-2 hover:text-black"
            >
              {t('Saiba mais')}
            </a>
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