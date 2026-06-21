import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, ChevronRight, HelpCircle } from 'lucide-react';

// Dados de contato do suporte
const WHATSAPP_DISPLAY = '(14) 99907-5111';
// Formato internacional para o link do WhatsApp: 55 (Brasil) + 14 (DDD) + número
const WHATSAPP_LINK = 'https://wa.me/5514999075111?text=' +
  encodeURIComponent('Olá! Preciso de ajuda com a AlpsPrime.');

const SUPPORT_EMAIL = 'team@alpsprime.com.br';
// Abre direto a janela de composição do Gmail já com o destinatário preenchido
const GMAIL_LINK =
  'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(SUPPORT_EMAIL);

function ContactCard({ icon: Icon, label, value, href, accent, delay }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-gold/40 hover:bg-gold/[0.04] transition-colors"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-base font-medium text-foreground mt-0.5 truncate">{value}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </motion.a>
  );
}

export default function Suporte() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full">
      <div className="px-6 lg:px-8 pt-6 pb-2 bg-transparent">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-9 text-sm font-normal text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Voltar</span>
          </button>
          <h1 className="m-0 font-light text-foreground uppercase" style={{
            fontSize: 'clamp(16px, 4vw, 36px)',
            letterSpacing: 'clamp(2px, 1.5vw, 8px)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif'
          }}>
            Suporte
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-9"
        >
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
            <HelpCircle className="w-6 h-6 text-gold" />
          </div>
          <h2 className="text-xl font-display text-foreground">Como podemos ajudar?</h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
            Fale com a nossa equipe. Estamos prontos para te atender pelo WhatsApp ou por e-mail.
          </p>
        </motion.div>

        <div className="space-y-3">
          <ContactCard
            icon={MessageCircle}
            label="WhatsApp"
            value={WHATSAPP_DISPLAY}
            href={WHATSAPP_LINK}
            accent="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            delay={0.05}
          />
          <ContactCard
            icon={Mail}
            label="E-mail"
            value={SUPPORT_EMAIL}
            href={GMAIL_LINK}
            accent="bg-gold/10 text-gold border border-gold/20"
            delay={0.1}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Atendimento de segunda a sexta, das 9h às 18h.
        </motion.p>
      </div>
    </div>
  );
}
