import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Trash2, ArrowRight, Sparkles, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Favoritos() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dados de exemplo para preencher a tela inicialmente
  const [favorites, setFavorites] = useState([
    { 
      id: 1, 
      title: 'Logo Circular Dourada', 
      subtitle: 'Animação de carregamento contínuo',
      category: 'Motion Graphics', 
      icon: Video,
      date: 'Hoje' 
    },
    { 
      id: 2, 
      title: 'Smiley Face Line-Art', 
      subtitle: 'Transição de piscada para admiração',
      category: 'Animação', 
      icon: Sparkles,
      date: 'Há 2 dias' 
    },
    { 
      id: 3, 
      title: 'Setup de Luz Cinematográfica', 
      subtitle: 'Fundo preto com reflexos premium',
      category: 'Ambiente', 
      icon: ImageIcon,
      date: 'Semana passada' 
    }
  ]);

  const filteredFavorites = favorites.filter(fav => 
    fav.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    fav.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  };

  return (
    <div className="min-h-full w-full relative z-10 p-4 md:p-8 max-w-4xl mx-auto flex flex-col">
      
      {/* Cabeçalho */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 pt-4 md:pt-0"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E5C07B]/20 to-[#C9A24F]/10 border border-[#C9A24F]/20 flex items-center justify-center shadow-[0_0_15px_rgba(201,162,79,0.1)]">
            <Star className="w-5 h-5 text-[#C9A24F]" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Favoritos
          </h1>
        </div>
        <p className="text-[#8E8E93] text-[15px] font-light ml-1">
          Sua coleção pessoal de itens salvos e inspirações.
        </p>
      </motion.div>

      {/* Barra de Pesquisa */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 relative group"
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-white/40 group-focus-within:text-[#C9A24F] transition-colors duration-300" />
        </div>
        <input
          type="text"
          placeholder="Buscar nos favoritos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-4 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/10 focus:border-[#C9A24F]/50 rounded-[24px] text-white placeholder:text-white/30 outline-none transition-all duration-300 backdrop-blur-xl shadow-inner shadow-white/5"
        />
      </motion.div>

      {/* Lista de Favoritos */}
      <div className="flex-1">
        <AnimatePresence mode="popLayout">
          {filteredFavorites.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredFavorites.map((fav, index) => {
                const Icon = fav.icon;
                return (
                  <motion.div
                    key={fav.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative flex items-center justify-between p-4 sm:p-5 rounded-[28px] bg-[#121214]/60 border border-white/5 hover:border-white/15 backdrop-blur-2xl hover:bg-[#1A1A1D]/80 transition-all duration-500 overflow-hidden"
                  >
                    {/* Efeito de hover (brilho dourado suave) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C9A24F]/0 via-[#C9A24F]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="flex items-center gap-4 relative z-10 min-w-0">
                      <div className="w-12 h-12 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500 group-hover:border-[#C9A24F]/30 group-hover:shadow-[0_0_20px_rgba(201,162,79,0.15)]">
                        <Icon className="w-5 h-5 text-white/70 group-hover:text-[#C9A24F] transition-colors duration-300" />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-[16px] font-medium text-white/90 truncate group-hover:text-white transition-colors">
                          {fav.title}
                        </h3>
                        <p className="text-[13px] text-white/40 truncate mt-0.5">
                          {fav.subtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C9A24F] bg-[#C9A24F]/10 px-2 py-0.5 rounded-full">
                            {fav.category}
                          </span>
                          <span className="text-[11px] text-white/30">
                            {fav.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10 pl-4">
                      <button 
                        onClick={() => removeFavorite(fav.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 outline-none"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center bg-white/5 border border-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 outline-none group/btn"
                        title="Abrir"
                      >
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-64 text-center px-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-inner shadow-white/5">
                <Star className="w-7 h-7 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white/80 mb-1">Nenhum favorito encontrado</h3>
              <p className="text-sm text-white/40 max-w-[260px]">
                Explore o feed e adicione itens aos seus favoritos para encontrá-los facilmente aqui.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}