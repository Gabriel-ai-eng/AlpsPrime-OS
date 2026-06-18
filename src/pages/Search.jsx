import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUB_APPS = [
  {
    id: 'sexta',
    name: 'Sexta AI',
    image: '/apps/sexta-bg.webp',
  },
  {
    id: 'titan',
    name: 'Titan',
    image: '/apps/titan-bg.webp',
  },
  {
    id: 'vivart',
    name: 'Vivart',
    image: '/apps/vivart-bg.webp',
  }
];

export default function Search() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filteredApps = useMemo(() => {
    if (!query.trim()) return SUB_APPS;
    return SUB_APPS.filter(app => 
      app.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="w-full h-[100dvh] bg-black text-white font-sans overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center pt-6 px-6 pb-32 relative select-none">
      
      {/* Luz ambiente sutil no fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center gap-8 z-10">
        
        {/* CAMPO DE BUSCA */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 rounded-2xl bg-white/[0.04] backdrop-blur-3xl border border-white/10 transition-all duration-300 focus-within:border-white/20 focus-within:shadow-[0_0_20px_rgba(255,215,0,0.1)] group" />
          
          <div className="relative flex items-center h-12 px-4 gap-3">
            <SearchIcon className="w-5 h-5 text-white/30 group-focus-within:text-white/60 transition-colors" strokeWidth={1.8} />
            
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar aplicativos..."
              className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/20 outline-none font-medium tracking-wide"
              autoFocus
                style={{ WebkitTapHighlightColor: 'transparent' }}
            />

            {query ? (
              <button 
                onClick={() => setQuery('')}
                className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-0.5 text-[10px] font-mono text-white/20 bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/5">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            )}
          </div>
        </div>

        {/* GRELHA DE SUB-APPS TOTALMENTE SEM BORDAS */}
        <div className="w-full flex flex-col gap-6 mt-2">
          <AnimatePresence mode="popLayout">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  // Envia o id do aplicativo no estado da navegação
                  onClick={() => navigate('/feed', { state: { openApp: app.id } })}
                  className="w-full rounded-[32px] overflow-hidden relative aspect-[4/3] group cursor-pointer active:scale-95 transition-all outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <img 
                    src={app.image} 
                    alt={app.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-12 flex flex-col items-center justify-center text-center px-4"
              >
                <SearchIcon className="w-8 h-8 text-white/10 mb-3" />
                <p className="text-sm text-[#8E8E93] font-medium">Nenhum aplicativo correspondente.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}