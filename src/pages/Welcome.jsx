import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AuthSection from '@/components/access/AuthSection';
import { motion } from 'framer-motion';
import { Mail, ShoppingBag, Sparkles, Image as ImageIcon, MessageCircle, ChevronDown, Check } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';

const CHECKOUT_URL = 'https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh';

const FEATURES = [
  { icon: MessageCircle, title: 'IA Sexta-feira', desc: 'Uma inteligência que conversa, ajuda e cria junto com você — em português, na hora.' },
  { icon: ImageIcon, title: 'Gerador de imagens', desc: 'Transforme uma ideia em arte com um toque. Direto, rápido e seu.' },
  { icon: Sparkles, title: 'Feed & comunidade', desc: 'Acompanhe novidades, compartilhe e interaja num espaço só seu.' },
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
      className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
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
    <div className="min-h-screen bg-[#070709] text-white overflow-x-hidden">
      {/* ---- Fundo futurista ---- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gold/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[420px] h-[420px] bg-gold/[0.06] rounded-full blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#C9A24F 1px, transparent 1px), linear-gradient(90deg, #C9A24F 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ---- Barra superior ---- */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <img src={LOGO_URL} alt="Alps OS" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display text-lg font-bold gold-gradient">Alps OS</span>
        </div>
        <button
          onClick={() => setShowAuth(true)}
          className="text-sm font-medium text-white/80 hover:text-white transition-colors px-4 py-1.5 rounded-full border border-white/15 hover:border-white/30"
        >
          Entrar
        </button>
      </header>

      {/* ---- HERO ---- */}
      <main className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8">
        <section className="flex flex-col items-center text-center pt-12 pb-16 sm:pt-20 sm:pb-24">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className="relative mb-8"
          >
            <img src={LOGO_URL} alt="Alps OS" className="w-24 h-24 rounded-3xl object-cover shadow-2xl shadow-gold/30" />
            <div className="absolute -inset-4 rounded-full border border-gold/15 border-dashed animate-[spin_18s_linear_infinite]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl"
          >
            Sua central de IA.<br />
            <span className="gold-gradient">Tudo num só lugar.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed"
          >
            Converse com a Sexta-feira, crie imagens e explore o feed — numa
            experiência simples, rápida e do futuro.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-9 w-full max-w-sm space-y-3"
          >
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hotmart-fb hotmart__button-checkout w-full h-14 rounded-2xl text-background font-semibold text-base flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity shadow-lg shadow-gold/20"
              style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
            >
              <ShoppingBag className="w-5 h-5" />
              Garantir acesso — R$ 19,90
            </a>
            <button
              onClick={() => setShowAuth(true)}
              className="w-full h-12 rounded-2xl border border-white/15 text-sm font-medium text-white/80 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Já comprei — entrar
            </button>
          </motion.div>

          {/* Chips de confiança */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/50"
          >
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-gold" /> Acesso vitalício</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-gold" /> Pagamento único</span>
            {totalUsers >= 50 && (
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-gold" /> {totalUsers.toLocaleString('pt-BR')} usuários</span>
            )}
          </motion.div>
        </section>

        {/* ---- RECURSOS ---- */}
        <section className="pb-16 sm:pb-24">
          <h2 className="text-center text-2xl sm:text-3xl font-display font-bold mb-3">O que você ganha</h2>
          <p className="text-center text-white/50 text-sm mb-10 max-w-md mx-auto">Tudo que você precisa de IA, reunido numa plataforma só.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6"
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(232,199,122,0.25), rgba(168,133,46,0.15))' }}>
                  <f.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section className="pb-16 sm:pb-24 max-w-2xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-display font-bold mb-8">Perguntas frequentes</h2>
          <div className="space-y-3">
            {FAQ.map((item) => <FaqItem key={item.q} {...item} />)}
          </div>

          {/* CTA final */}
          <div className="mt-12 text-center">
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hotmart-fb hotmart__button-checkout inline-flex h-14 px-8 rounded-2xl text-background font-semibold items-center justify-center gap-2.5 hover:opacity-90 transition-opacity shadow-lg shadow-gold/20"
              style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
            >
              <ShoppingBag className="w-5 h-5" />
              Garantir acesso — R$ 19,90
            </a>
          </div>
        </section>
      </main>

      {/* ---- RODAPÉ ---- */}
      <footer className="relative z-10 border-t border-white/10 px-5 sm:px-8 py-8 max-w-5xl mx-auto text-center">
        <p className="text-[11px] text-white/40 leading-relaxed max-w-lg mx-auto">
          Versão Beta, ainda em aperfeiçoamento — podem ocorrer erros.{' '}
          <a href="https://alpsprime.com.br/sexta-feira-10" target="_blank" rel="noopener noreferrer" className="text-gold/80 hover:text-gold underline underline-offset-2">Saiba mais</a>
        </p>
        <p className="mt-3 text-[11px] text-white/40">
          <a href="https://alpsprime.com.br/termos-de-uso" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 underline underline-offset-2">Termos de Uso</a>
          {' · '}
          <a href="https://alpsprime.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 underline underline-offset-2">Privacidade</a>
          {' · '}
          <a href="https://alpsprime.com.br/termos-de-uso" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 underline underline-offset-2">Pagamento</a>
        </p>
        <p className="mt-4 text-[11px] text-white/30">© {new Date().getFullYear()} Alps OS</p>
      </footer>
    </div>
  );
}
