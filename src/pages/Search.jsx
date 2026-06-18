import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// CONFIGURAÇÃO EXCLUSIVA DOS SUB-APPS (Usando as imagens reais do Feed)
const SUB_APPS = [
  {
    id: 'sexta',
    name: 'Sexta AI',
    tagline: 'Agente Cognitivo Proativo',
    description: 'Inteligência artificial conversacional avançada, análise de contexto e memória global do ecossistema.',
    path: '/feed', 
    image: '/apps/sexta-bg.webp', // Imagem oficial do feed
    glow: 'from-amber-500/20 to-transparent',
    badge: 'Core AI'
  },
  {
    id: 'titan',
    name: 'Titan',
    tagline: 'Automação Absoluta',
    description: 'Motor de execução em segundo plano, fluxos de automação massiva e integração com ferramentas de produtividade.',
    path: '/feed', 
    image: '/apps/titan-bg.webp', // Imagem oficial do feed
    glow: 'from-emerald-500/20 to-transparent',
    badge: 'Engine'
  },
  {
    id: 'vivart',
    name: 'Vivart',
    tagline: 'Estúdio de Geração Criativa',
    description: 'Renderização de imagens neurais em alta fidelidade, assets digitais e galeria criativa da comunidade.',
    path: '/feed',
    image: '/apps/vivart-bg.webp', // Imagem oficial do feed
    glow: 'from-purple-500/20 to-transparent',
    badge: 'Creative'
  }
];

export default function Search() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Filtro inteligente
  const filteredApps = useMemo(() => {
    if (!query.trim()) return SUB_APPS;
    return SUB_APPS.filter(app => 
      app.name.toLowerCase().includes(query.toLowerCase()) ||
      app.tagline.toLowerCase().includes(query.toLowerCase()) ||
      app.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    // Espaçamento superior reduzido drasticamente para pt-6
    <div className="w-full h-[100dvh] bg-black text-white font-sans overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center pt-6 px-6 pb-32 relative select-none">
      
      {/* Luz ambiente sutil no fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-8 z-10">
        
        {/* =========================================
            CAMPO DE BUSCA PREMIUM (Spotlight puxado para cima)
            ========================================= */}
        <div className="relative w-full">
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

        {/* =========================================
            LISTA DE RESULTADOS
            ========================================= */}
        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-medium tracking-[0.2em] text-[#8E8E93] uppercase pl-1">
            {query ? `Resultados encontrados (${filteredApps.length})` : 'Aplicativos Disponíveis'}
          </p>

          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredApps.length > 0 ? (
                filteredApps.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28, delay: index * 0.05 }}
                    onClick={() => navigate(app.path)}
                    className="w-full rounded-[24px] bg-[#1C1C1E]/60 hover:bg-[#1C1C1E]/90 border border-white/5 hover:border-white/10 p-5 flex flex-col justify-between relative overflow-hidden cursor-pointer group active:scale-[0.99] transition-all duration-300"
                  >
                    {/* Brilho radial interno ao passar o mouse */}
                    <div className={`absolute -right-12 -top-12 w-36 h-36 blur-[40px] opacity-0 group-hover:opacity-30 bg-gradient-to-br ${app.glow} transition-opacity duration-700 pointer-events-none`} />

                    <div className="flex items-start justify-between w-full z-10 mb-2">
                      
                      <div className="flex items-center gap-4">
                        {/* =========================================
                            IMAGEM REAL DO FEED COMO ÍCONE
                            ========================================= */}
                        <div className="w-14 h-14 rounded-[14px] overflow-hidden border border-white/10 shadow-lg flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                          <img 
                            src={app.image} 
                            alt={`${app.name} Icon`} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <h3 className="text-white font-semibold text-[16px] tracking-tight flex items-center gap-2">
                            {app.name}
                            <span className="text-[10px] font-medium tracking-normal px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/40">
                              {app.badge}
                            </span>
                          </h3>
                          <p className="text-[#8E8E93] text-[12px] font-medium">{app.tagline}</p>
                        </div>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all transform translate-x-2 group-hover:translate-x-0 mt-3">
                        <ArrowRight className="w-4 h-4 text-white/70" />
                      </div>
                    </div>

                    {/* Descrição alinhada com o texto acima */}
                    <p className="text-white/50 text-[13px] leading-relaxed z-10 font-normal pl-[72px] pr-4 mt-1">
                      {app.description}
                    </p>
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
                  <p className="text-xs text-white/20 mt-1">Tente buscar por "Titan" ou "Sexta".</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}