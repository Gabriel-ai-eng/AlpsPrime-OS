import React, { useState, useEffect, useRef } from 'react';
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

// Checkout da Hotmart (mesmo usado no AuthSection/HotmartGate).
const HOTMART_CHECKOUT_URL = 'https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh';

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
    id: 'alpsos',
    eyebrow: 'Alps OS',
    titulo: 'Alps OS',
    subtitulo: 'O ecossistema Alps Prime.',
    img: '/apps/alpsos-hero.webp',
    quadrado: false,
    disponivel: false,
  },
  {
    id: 'wonderbound',
    eyebrow: 'Jogo de ação',
    titulo: 'Wonderbound',
    subtitulo: 'Conheça a nova geração da ação e sobrevivência.',
    img: '/apps/armor-hero.webp',
    quadrado: false,
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
    <div className="border-b border-black/10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:text-black focus:outline-none"
      >
        <span className="text-sm text-black/70">{t(q)}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-black/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-black/55">{t(a)}</p>}
    </div>
  );
}

// Ícones que rodopiam ao redor do wordmark "Alps OS" no topo do site, tipo um
// "tornado": cada um orbita num raio/velocidade levemente diferente e ganha
// escala/opacidade conforme passa na frente (profundidade simulada via seno
// do ângulo). A velocidade acompanha o scroll — em vez de saltar direto pro
// alvo, ela é amortecida (lerp) quadro a quadro, então a desaceleração fica
// suave em vez de travar de uma vez.
const ORBIT_ICONS = [
  { id: 'sexta', src: '/apps/sexta-logo-square.webp', radius: 0.36, ellipse: 0.58, speed: 1, phase: 0 },
  { id: 'fkw', src: '/apps/fkw-logo-square.webp', radius: 0.4, ellipse: 0.58, speed: 0.82, phase: 120 },
  { id: 'wonderbound', src: '/apps/armor-logo-square.webp', radius: 0.385, ellipse: 0.58, speed: 1.18, phase: 240 },
];

const ORBIT_SCROLL_RANGE = 220; // px de scroll até a órbita parar de vez
const ORBIT_BASE_SPEED = 26; // graus/seg no topo da página

function OrbitIcons({ stageRef }) {
  const iconRefs = useRef([]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollRef = { current: 0 };

    const applyFrame = (angleBase, width) => {
      ORBIT_ICONS.forEach((cfg, i) => {
        const el = iconRefs.current[i];
        if (!el) return;
        const angDeg = angleBase * cfg.speed + cfg.phase;
        const ang = (angDeg * Math.PI) / 180;
        const depth = Math.sin(ang); // -1 = atrás do texto, 1 = na frente
        const x = Math.cos(ang) * cfg.radius * width;
        const y = depth * cfg.ellipse * cfg.radius * width;
        const scale = 0.72 + (depth + 1) * 0.19;
        const opacity = 0.5 + (depth + 1) * 0.25;
        el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = depth >= 0 ? '20' : '5';
      });
    };

    const onScroll = () => {
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / ORBIT_SCROLL_RANGE));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (reduceMotion) {
      applyFrame(0, stageRef.current?.clientWidth || 0);
      return () => window.removeEventListener('scroll', onScroll);
    }

    let raf;
    let lastT = performance.now();
    let angle = 0;
    let speed = ORBIT_BASE_SPEED;

    const tick = (t) => {
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;

      const eased = 1 - scrollRef.current * scrollRef.current; // desacelera suave até 0
      const targetSpeed = ORBIT_BASE_SPEED * Math.max(0, eased);
      speed += (targetSpeed - speed) * Math.min(1, dt * 2.4);
      // Sem módulo aqui: os ícones giram em velocidades diferentes (speed
      // multiplicado por cfg.speed), então "enrolar" esse ângulo base a cada
      // 360° quebra a continuidade de quem não gira a 1x — cada um pularia
      // pra um ponto diferente da própria órbita a cada volta da base.
      angle += speed * dt;

      applyFrame(angle, stageRef.current?.clientWidth || 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [stageRef]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {ORBIT_ICONS.map((cfg, i) => (
        <img
          key={cfg.id}
          ref={(el) => (iconRefs.current[i] = el)}
          src={cfg.src}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute left-1/2 top-[27%] h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16"
          style={{ willChange: 'transform, opacity', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.35))' }}
        />
      ))}
    </div>
  );
}

export default function Welcome() {
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const alpsStageRef = useRef(null);
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
          <div className="flex flex-col gap-3">
            {PRODUTOS.map((p) => {
              if (p.id === 'alpsos') {
                return (
                  <div key={p.id} ref={alpsStageRef} className="relative block w-full bg-black">
                    <img
                      src={p.img}
                      alt={p.titulo}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="block w-full object-cover"
                    />
                    <OrbitIcons stageRef={alpsStageRef} />
                    <div className="absolute left-1/2 top-[72%] flex -translate-x-1/2 flex-col items-center gap-3">
                      <p className="text-sm text-black sm:text-base">{t('Um toque. Um mundo.')}</p>
                      <a
                        href={HOTMART_CHECKOUT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border-2 px-10 py-3.5 text-sm text-[#0071e3] transition hover:opacity-80 sm:px-12 sm:py-4 sm:text-base"
                        style={{ borderColor: '#0071e3' }}
                      >
                        {t('Garantir agora')}
                      </a>
                    </div>
                  </div>
                );
              }

              if (p.id === 'fkw') {
                return (
                  <div key={p.id} className="relative block w-full bg-black">
                    <img
                      src={p.img}
                      alt={p.titulo}
                      loading="eager"
                      decoding="async"
                      className="block w-full object-cover"
                    />
                    <span className="absolute left-1/2 top-[13%] -translate-x-1/2 rounded-full bg-black px-10 py-3.5 text-lg text-white sm:px-12 sm:py-4 sm:text-xl">
                      {t('Em breve')}
                    </span>
                  </div>
                );
              }

              return p.disponivel ? (
                <button
                  key={p.id}
                  onClick={() => setShowAuth(true)}
                  aria-label={p.titulo}
                  className="block w-full bg-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black/20"
                >
                  <img
                    src={p.img}
                    alt={p.titulo}
                    loading="eager"
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
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-5 pt-32 pb-8 sm:pt-48 sm:pb-12">
          <h2 className="text-center text-base font-medium text-black/50">
            {t('Perguntas frequentes')}
          </h2>
          <div className="mt-6 border-t border-black/10">
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
