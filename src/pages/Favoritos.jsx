import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Favoritos() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado inicial vazio. Os sub-apps favoritados pelo usuário serão adicionados aqui.
  const [favorites, setFavorites] = useState([]);

  const filteredFavorites = favorites.filter(fav => 
    fav.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    fav.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  };

  return (
    <div className="min-h-full w-full relative z-10 p-4 md:p-8 max-w-4xl mx-auto flex flex-col bg-black text-white">
      
      {/* Cabeçalho */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 pt-4 md:pt-0"
      >
        <div className="flex items-center gap-3 mb-2">
          {/* Fundo do ícone agora é preto fosco, sem brilho dourado */}
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            Favoritos
          </h1>
        </div>
        <p className="text-zinc-400 text-[15px] font-medium ml-1">
          Sua coleção pessoal de apps preferidos.
        </p>
      </motion.div>

      {/* Barra de Pesquisa */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 relative group"
      >
        {/* z-10 garante que a lupa nunca suma atrás do input */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
          <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors duration-300" />
        </div>
        <input
          type="text"
          placeholder="Buscar nos favoritos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 hover:bg-zinc-900 focus:bg-zinc-900 border border-white/10 focus:border-white/30 rounded-2xl text-white placeholder:text-zinc-500 outline-none transition-all duration-300 backdrop-blur-md"
          style={{ fontFamily: "'Open Sans', sans-serif" }}
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
                    className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/15 backdrop-blur-md hover:bg-zinc-900/60 transition-all duration-500 overflow-hidden"
                  >
                    <div className="flex items-center gap-4 relative z-10 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500 group-hover:border-white/20">
                        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-[16px] font-medium text-white truncate group-hover:text-white transition-colors" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                          {fav.title}
                        </h3>
                        <p className="text-[13px] text-zinc-400 truncate mt-0.5">
                          {fav.subtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-300 bg-white/10 px-2 py-0.5 rounded-full">
                            {fav.category}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium">
                            {fav.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10 pl-4">
                      <button 
                        onClick={() => removeFavorite(fav.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 outline-none"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-300 outline-none group/btn"
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
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4 shadow-sm">
                <Star className="w-7 h-7 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>Nenhum favorito</h3>
              <p className="text-sm text-zinc-500 max-w-[260px] font-medium">
                Explore a plataforma e adicione itens aos seus favoritos.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}