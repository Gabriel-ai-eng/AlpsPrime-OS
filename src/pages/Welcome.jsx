import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AuthSection from '@/components/access/AuthSection';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronDown, MessageSquare, Sparkles, Users } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';

const CHECKOUT_URL = 'https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh';

const FEATURES = [];

const FAQ = [
  { q: 'O que é o Alps OS?', a: 'É um ecossistema privado de serviços da Alps Prime, tudo em um só lugar' },
  { q: 'Como funciona o acesso?', a: 'É um pagamento único pela Hotmart, com acesso vitalício. Depois de comprar, entre com o mesmo e-mail da compra.' },
  { q: 'Já comprei. Como entro?', a: 'Toque em "Entrar" e use o mesmo e-mail informado na compra da Hotmart.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gold flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && <p className="mt-3 text-sm leading-relaxed text-white/60">{a}</p>}
    </button>
  );
}

export default function Welcome() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    base44.functions.invoke('getUsersCount', {})
      .then((r) => setTotalUsers(r?.data?.count || 0))
      .catch(() => setTotalUsers(0));
  }, []);

  if (showAuth) return <AuthSection onClose={() => setShowAuth(false)} />;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      {/* ---- Barra superior ---- */}
      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <img src={LOGO_URL} alt="Alps OS" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-lg font-bold gold-gradient">Alps OS</span>
        </div>
        <button
          onClick={() => setShowAuth(true)}
          className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          Entrar
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
        {/* ---- HERO ---- */}
        <section className="relative flex flex-col items-center justify-center pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          {/* Brilho de fundo para dar profundidade */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gold/10 blur-[100px] rounded-full pointer-events-none" />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-10 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          >
            Tudo da Alps Prime.<br />
            em um só lugar.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Um login. Todo o ecossistema Alps. Garanta o seu acesso.
          </motion.p>

          {/* CTA — botão menor, redondo, alinhado e sem borda verde */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 mt-10 flex justify-center"
          >
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-0 px-8 text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-transform hover:scale-[1.03] focus:outline-none"
              style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
            >
              <ShoppingBag className="h-4 w-4" />
              Garantir acesso
            </a>
          </motion.div>
        </section>

        {/* ---- RECURSOS ---- */}
        <section className="pb-16 sm:pb-24">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(232,199,122,0.25), rgba(168,133,46,0.15))' }}
                >
                  <f.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mb-1.5 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/55">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section className="mx-auto max-w-2xl pb-16 sm:pb-24">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Perguntas frequentes</h2>
          <div className="space-y-3">
            {FAQ.map((item) => <FaqItem key={item.q} {...item} />)}
          </div>
        </section>
      </main>

      {/* ---- RODAPÉ ---- */}
      <footer className="relative z-10 mx-auto max-w-5xl border-t border-white/10 px-5 py-8 text-center sm:px-8">
        <p className="mx-auto max-w-lg text-[11px] leading-relaxed text-white/40">
          Versão Beta, ainda em aperfeiçoamento — podem ocorrer erros.{' '}
          <a href="https://alpsprime.com.br/sexta-feira-10" target="_blank" rel="noopener noreferrer" className="text-gold/80 underline underline-offset-2 hover:text-gold">Saiba mais</a>
        </p>
        <p className="mt-3 text-[11px] text-white/40">
          <a href="https://alpsprime.com.br/termos-de-uso" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70">Termos de Uso</a>
          {' · '}
          <a href="https://alpsprime.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70">Privacidade</a>
          {' · '}
          <a href="https://alpsprime.com.br/termos-de-uso" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70">Pagamento</a>
        </p>
        <p className="mt-4 text-[11px] text-white/30">© {new Date().getFullYear()} Alps OS</p>
      </footer>
    </div>
  );
}