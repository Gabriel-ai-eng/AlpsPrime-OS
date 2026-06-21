import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MessageSquare, Bot, Sparkles, User } from 'lucide-react';

// Frases aleatórias para o balão de fala
const RANDOM_PHRASES = [
  "Em breve...",
  "Daqui a pouco te ajudo!",
  "Estou ajustando meus circuitos...",
  "Quase pronto para rodar!",
  "Aguarde só mais um pouquinho..."
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [balloonText, setBalloonText] = useState("");
  const [showBalloon, setShowBalloon] = useState(false);

  // Função que gerencia o clique no ícone do robô
  const handleBotClick = (e) => {
    e.preventDefault();
    
    // Sorteia uma nova frase diferente da atual
    const filteredPhrases = RANDOM_PHRASES.filter(p => p !== balloonText);
    const randomIndex = Math.floor(Math.random() * filteredPhrases.length);
    
    setBalloonText(filteredPhrases[randomIndex]);
    setShowBalloon(true);
  };

  // Fecha o balão automaticamente após alguns segundos
  useEffect(() => {
    if (showBalloon) {
      const timer = setTimeout(() => {
        setShowBalloon(false);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [showBalloon]);

  // Itens da navegação inferior
  const navItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Sparkles, label: 'Vivart', path: '/vivart' },
    { icon: Bot, label: 'Titan', path: '#', isBot: true }, // O ícone do robô interceptado
    { icon: MessageSquare, label: 'Sexta', path: '/sexta' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 px-4 py-2 sm:hidden">
      <div className="relative flex items-center justify-around max-w-md mx-auto">
        
        {/* ---- Balão de Fala Animado (Estilo iOS/Apple Minimal) ---- */}
        <AnimatePresence>
          {showBalloon && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute bottom-16 bg-zinc-900 border border-white/10 text-white text-xs font-medium py-2.5 px-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-nowrap z-50 pointer-events-none"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
              <span className="font-semibold tracking-wide text-white">
                {balloonText}
              </span>
              {/* Pequena seta indicadora do balão */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-r border-b border-white/10 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Renderização dos Botões da Barra ---- */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={(e) => item.isBot ? handleBotClick(e) : navigate(item.path)}
              className="relative flex flex-col items-center justify-center p-2 rounded-xl focus:outline-none group select-none"
            >
              {/* Container do Ícone com destaque verde para o Robô */}
              <div 
                className={`relative p-1.5 rounded-xl transition-all duration-200 active:scale-90
                  ${item.isBot 
                    ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/5' 
                    : isActive 
                      ? 'text-white bg-white/5' 
                      : 'text-white/40 group-hover:text-white/60'
                  }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Texto descritivo abaixo do ícone */}
              <span 
                className={`text-[10px] mt-1 font-medium transition-colors duration-200
                  ${item.isBot 
                    ? 'text-emerald-400/80' 
                    : isActive 
                      ? 'text-white' 
                      : 'text-white/40'
                  }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}