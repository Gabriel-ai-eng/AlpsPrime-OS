import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowLeft } from 'lucide-react';

// Dados de contato do suporte
// Formato internacional para o link do WhatsApp: 55 (Brasil) + 14 (DDD) + número
const WHATSAPP_LINK = 'https://wa.me/5514999075111?text=' +
  encodeURIComponent('Olá! Preciso de ajuda com a AlpsPrime.');

// Link de ligação direta (mesmo número do WhatsApp)
const PHONE_LINK = 'tel:+5514999075111';

const SUPPORT_EMAIL = 'team@alpsprime.com.br';
// Abre direto a janela de composição do Gmail já com o destinatário preenchido
const GMAIL_LINK =
  'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(SUPPORT_EMAIL);

// Cartões de contato (imagens em WebP, leves — ficam em /public/apps)
const CONTACT_CARDS = [
  { src: '/apps/support-whatsapp.webp', alt: 'Fale conosco pelo WhatsApp', href: WHATSAPP_LINK },
  { src: '/apps/support-telefone.webp', alt: 'Fale conosco por telefone', href: PHONE_LINK },
  { src: '/apps/support-email.webp', alt: 'Fale conosco por e-mail', href: GMAIL_LINK },
];

// Perguntas frequentes (mesmas da tela de boas-vindas / Welcome)
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

export default function Suporte() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-6 pb-16">
        {/* ---- Voltar ---- */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm font-medium text-white/70 hover:text-white transition-colors outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {/* ---- Título ---- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <img
            src="/apps/support-title.webp"
            alt="Suporte da Alps"
            className="mx-auto w-[78%] max-w-[440px] h-auto select-none"
            draggable="false"
          />
          <p className="text-lg sm:text-xl font-light text-white/45 mt-1">
            Como podemos te ajudar?
          </p>
        </motion.div>

        {/* ---- Cartões de contato ---- */}
        <div className="space-y-4 sm:space-y-5">
          {CONTACT_CARDS.map((card, i) => (
            <motion.a
              key={card.src}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.07 }}
              className="block rounded-3xl overflow-hidden transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              <img
                src={card.src}
                alt={card.alt}
                loading="lazy"
                className="w-full h-auto block"
              />
            </motion.a>
          ))}
        </div>

        {/* ---- Perguntas frequentes ---- */}
        <section className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-white sm:text-3xl">
            Perguntas frequentes
          </h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {FAQ.map((item) => <FaqItem key={item.q} {...item} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
