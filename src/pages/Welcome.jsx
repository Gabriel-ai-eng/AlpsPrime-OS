import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AuthSection from '@/components/access/AuthSection';
import { motion } from 'framer-motion';
import { Mail, ShoppingBag, Sparkles, Image as ImageIcon, MessageCircle, ChevronDown } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';

const CHECKOUT_URL = 'https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh';

const FEATURES = [
  { icon: MessageCircle, title: 'Converse com a Sexta-feira', desc: 'Uma IA que responde, ajuda e cria com você — em português, na hora.' },
  { icon: ImageIcon, title: 'Crie imagens', desc: 'Descreva o que imagina e receba a arte pronta em segundos.' },
  { icon: Sparkles, title: 'Feed da comunidade', desc: 'Acompanhe novidades, compartilhe e veja o que outros estão criando.' },
];

const FAQ = [
  { q: 'O que é o Alps OS?', a: 'É a sua central de IA: converse com a Sexta-feira, gere imagens e explore o feed — tudo numa plataforma só, simples e poderosa.' },
  { q: 'Como funciona o acesso?', a: 'É um pagamento único pela Hotmart, com acesso vitalício. Depois de comprar, entre com o mesmo e-mail da compra.' },
  { q: 'Já comprei. Como entro?', a: 'Toque em "Já comprei — entrar" e use o mesmo e-mail informado na compra da Hotmart.' },
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

  // Widget de checkout da Hotmart (abre em overlay — checkoutMode=2)
  useEffect(() => {
    if (document.getElementById('hotmart-checkout-widget')) return;
    const script = document.createElement('script');
    script.id = 'hotmart-checkout-widget';
    script.src = 'https://static.hotmart.com/checkout/widget.min.js';
    document.head.appendChild(script);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    base44.functions.invoke('getUsersCount', {})
      .then((r) => setTotalUsers(r?.data?.count || 0))
      .catch(() => setTotalUsers(0));
  }, []);

  if (showAuth) return <AuthSection onClose={() => setShowAuth(false)} />;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      {/* ---- Barra superior ---- */}
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
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
        <section className="flex flex-col pt-10 pb-16 sm:pt-16 sm:pb-24 lg:flex-row lg:items-center lg:gap-12">
          {/* Texto + CTA */}
          <div className="flex flex-col items-center text-center lg:flex-1 lg:items-start lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1 text-xs font-medium text-gold/90"
            >
              <Sparkles className="h-3.5 w-3.5" /> Sua central de IA em português
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
            >
              Converse, crie,<br />
              <span className="gold-gradient">tudo num só lugar.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 max-w-md text-base leading-relaxed text-white/60 sm:text-lg"
            >
              Fale com a Sexta-feira, gere imagens e acompanhe o feed — numa
              plataforma simples, rápida e feita para o teu dia a dia.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 w-full max-w-sm space-y-3"
            >
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hotmart-fb hotmart__button-checkout flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl text-base font-semibold text-background shadow-lg shadow-gold/20 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
              >
                <ShoppingBag className="h-5 w-5" />
                Garantir acesso
              </a>
              <button
                onClick={() => setShowAuth(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <Mail className="h-4 w-4" />
                Já comprei — entrar
              </button>
            </motion.div>
          </div>
        </section>

        {/* ---- RECURSOS ---- */}
        <section className="pb-16 sm:pb-24">
          <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">O que você ganha</h2>
          <p className="mx-auto mb-10 max-w-md text-center text-sm text-white/50">Tudo o que precisas de IA, reunido numa plataforma só.</p>
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