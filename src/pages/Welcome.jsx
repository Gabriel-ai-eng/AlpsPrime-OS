import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { redirectToBase44Login } from '@/lib/loginRedirect';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShoppingBag, Loader2 } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';
import { cn } from '@/lib/utils';

const FLOATING_WORDS = ['IA', 'Neural', 'Genius', 'Quantum', 'Core', 'Alpha', 'Logic', 'Sync'];

const FloatingParticle = ({ word, style }) => (
  <motion.div
    className="absolute text-[10px] font-mono text-gold/20 pointer-events-none select-none"
    style={style}
    animate={{ y: [-10, 10, -10], opacity: [0.15, 0.4, 0.15] }}
    transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
  >
    {word}
  </motion.div>
);

export default function Welcome() {
  const [particles] = useState(() =>
    FLOATING_WORDS.map((w, i) => ({
      word: w,
      style: {
        left: `${8 + (i * 12) % 84}%`,
        top: `${10 + (i * 17) % 75}%`,
      },
    }))
  );

  // Estados para a contagem de usuários
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Carrega o widget de checkout da Hotmart (abre o checkout em overlay — checkoutMode=2)
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

  // Busca de Usuários (agora lendo "response.data.count")
  useEffect(() => {
    const fetchTotalUsers = async () => { 
      try {
        const response = await base44.functions.invoke('getUsersCount', {});
        
        // O segredo estava aqui: o número vem dentro de "data"
        setTotalUsers(response?.data?.count || 0);
      } catch (e) {
        setTotalUsers(0);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchTotalUsers();
  }, []);

  const handleEmail = () => {
    redirectToBase44Login('/feed');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background glow layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gold/8 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[5%] w-[250px] h-[250px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(hsl(43,74%,52%) 1px, transparent 1px), linear-gradient(90deg, hsl(43,74%,52%) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating words */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} word={p.word} style={p.style} />
      ))}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glow ring */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-gold/40 via-gold/10 to-transparent blur-sm pointer-events-none" />

        <div className="relative bg-card/95 backdrop-blur-xl border border-gold/20 rounded-3xl p-8 shadow-2xl shadow-gold/10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative mb-5"
            >
              <img src={LOGO_URL} alt="Sexta-feira" className="w-20 h-20 rounded-2xl shadow-2xl shadow-gold/30 object-cover" />
              {/* Orbit ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border border-gold/20 border-dashed"
              />
              {/* Small dot on orbit */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold shadow-lg shadow-gold/50" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-center"
            >
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <h1 className="font-display text-4xl font-bold gold-gradient tracking-tight">Sexta-feira</h1>
                <span className="font-display text-xl text-muted-foreground font-light">1.0</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 rounded-full px-2 py-0.5">Beta</span>
              </div>
            </motion.div>
          </div>

          {/* Auth buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="space-y-3 mb-6"
          >
            {/* Link real do checkout da Hotmart: o widget (quando carregado) abre em
                overlay; se o widget não interceptar, o link abre o checkout direto. */}
            <a
              href="https://pay.hotmart.com/G105845926J?checkoutMode=2&off=ncqx25bh"
              target="_blank"
              rel="noopener noreferrer"
              className="hotmart-fb hotmart__button-checkout w-full h-12 rounded-md text-background font-semibold hover:opacity-90 flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(to right, #E8C77A, #C9A24F, #A8852E)' }}
            >
              <ShoppingBag className="w-4 h-4" />
              Comprar acesso por R$ 19,90
            </a>

            {/* Contador de usuários atualizado e corrigido */}
            <div className="text-center mt-2 mb-4">
              {loadingUsers ? (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-gold" />
                  <span>Carregando...</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground font-medium" style={{ color: '#888' }}>
                  Junte-se a <strong style={{ color: '#c8a96b' }}>{totalUsers.toLocaleString('pt-BR')}</strong> usuários
                </p>
              )}
            </div>

            <div className="text-center space-y-1">
              <button
                onClick={handleEmail}
                className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Já comprei — entrar com meu e-mail
              </button>
              <p className="text-[10px] text-muted-foreground/60 leading-snug px-3">
                Use o mesmo e-mail informado na compra da Hotmart
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground/80 text-center leading-relaxed px-2 mt-4">
              Ao continuar, você concorda com nossos{' '}
              <a
                href="https://alpsprime.com.br/termos-de-uso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
              >
                Termos de Uso
              </a>
              ,{' '}
              <a
                href="https://alpsprime.com.br/politica-de-privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
              >
                Política de Privacidade
              </a>
              {' '}e{' '}
              <a
                href="https://alpsprime.com.br/termos-de-uso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
              >
                Política de Pagamento
              </a>
              .
            </p>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="border-t border-border pt-5"
          >
            <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
              Esta é uma versão Beta do projeto ainda em aperfeiçoamento, podendo ocorrer erros.{' '}
              <a
                href="https://alpsprime.com.br/sexta-feira-10"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
              >
                Saiba mais
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}