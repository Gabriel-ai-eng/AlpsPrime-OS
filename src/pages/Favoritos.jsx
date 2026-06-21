import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Trash2, ArrowRight, Sparkles, Image as ImageIcon, Shield, Gamepad2, Database, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Lista global de apps disponíveis no seu sistema
const ALL_APPS = [
  { id: 'sexta', title: 'Sexta-feira', subtitle: 'Sua assistente de inteligência artificial', category: 'IA', icon: Sparkles, path: '/feed' },
  { id: 'vivart', title: 'Vivart', subtitle: 'Estúdio de criação de imagens com IA', category: 'Criatividade', icon: ImageIcon, path: '/image' },
  { id: 'titan', title: 'Projeto Titan', subtitle: 'Gestão e automação avançada', category: 'Produtividade', icon: Shield, path: '/titan' },
  { id: 'arena', title: 'Cyber Arena', subtitle: 'Plataforma de jogos e desafios', category: 'Jogos', icon: Gamepad2, path: '/arena' },
  { id: 'armor', title: 'Projeto Armor', subtitle: 'Segurança e monitoramento do ecossistema', category: 'Segurança', icon: Shield, path: '/armor' },
  { id: 'files', title: 'Alps Files', subtitle: 'Gerenciador de arquivos em nuvem', category: 'Utilitários', icon: Database, path: '/files' },
  { id: 'categorias', title: 'Categorias', subtitle: 'Explore todas as categorias de apps', category: 'Navegação', icon: LayoutGrid, path: '/categorias' },
];

export default function Favoritos() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado inicial de favoritos. (Começa vazio)
  const [favorites, setFavorites] = useState([]);

  // Detecta se o usuário está pesquisando ou não
  const isSearching = searchQuery.trim().length > 0;

  // Se estiver pesquisando, busca na lista global de apps. Se não, exibe apenas os favoritos.
  const displayList = isSearching 
    ? ALL_APPS.filter(app => 
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : favorites;

  // Adiciona ou remove da lista de favoritos
  const toggleFavorite = (app) => {
    if (favorites.some(f => f.id === app.id)) {
      setFavorites(prev => prev.filter(f => f.id !== app.id));
    } else {
      setFavorites(prev => [...prev, app]);
    }
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
        <div className="mb-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Favoritos
          </h1>
        </div>
        <p className="text-[#8E8E93] text-[15px] font-light ml-1">
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
        <div className="absolute inset-y-0 left-4 z-10 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-white/40 group-focus-within:text-[#C9A24F] transition-colors duration-300" />
        </div>
        <input
          type="text"
          placeholder="Buscar ou adicionar apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-4 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/10 focus:border-[#C9A24F]/50 rounded-[24px] text-white placeholder:text-white/30 outline-none transition-all duration-300 backdrop-blur-xl shadow-inner shadow-white/5"
        />
      </motion.div>

      {/* Lista */}
      <div className="flex-1">
        <AnimatePresence mode="popLayout">
          {displayList.length > 0 ? (
            <div className="flex flex-col gap-3">
              {isSearching && (
                <motion.h3 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1 px-2"
                >
                  Resultados da busca
                </motion.h3>
              )}
              {displayList.map((app, index) => {
                const Icon = app.icon;
                const isFavorited = favorites.some(f => f.id === app.id);

                return (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2), ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => navigate(app.path)}
                    className="group relative flex items-center justify-between p-4 sm:p-5 rounded-[28px] bg-[#121214]/60 border border-white/5 hover:border-white/15 backdrop-blur-2xl hover:bg-[#1A1A1D]/80 transition-all duration-500 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C9A24F]/0 via-[#C9A24F]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="flex items-center gap-4 relative z-10 min-w-0">
                      <div className="w-12 h-12 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500 group-hover:border-[#C9A24F]/30 group-hover:shadow-[0_0_20px_rgba(201,162,79,0.15)]">
                        <Icon className="w-5 h-5 text-white/70 group-hover:text-[#C9A24F] transition-colors duration-300" />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-[16px] font-medium text-white/90 truncate group-hover:text-white transition-colors">
                          {app.title}
                        </h3>
                        <p className="text-[13px] text-white/40 truncate mt-0.5">
                          {app.subtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C9A24F] bg-[#C9A24F]/10 px-2 py-0.5 rounded-full">
                            {app.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10 pl-4">
                      {/* Botão de Favoritar/Remover */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Impede que o clique no botão abra o app acidentalmente
                          toggleFavorite(app);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 outline-none",
                          !isSearching
                            ? "text-white/30 hover:text-red-400 hover:bg-red-500/10" // Se na visualização de favoritos, ícone de excluir (vermelho)
                            : isFavorited 
                              ? "text-[#C9A24F] bg-[#C9A24F]/10 hover:bg-white/10 hover:text-white/70" // Se já for favorito, fica dourado
                              : "text-white/30 hover:text-[#C9A24F] hover:bg-[#C9A24F]/10" // Se não for favorito, fica cinza
                        )}
                        title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        {!isSearching ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <Star className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} />
                        )}
                      </button>

                      {/* Botão de Abrir App */}
                      <button 
                        className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-300 outline-none group/btn"
                        title="Acessar"
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
                {isSearching ? <Search className="w-7 h-7 text-zinc-600" /> : <Star className="w-7 h-7 text-zinc-600" />}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {isSearching ? 'Nenhum app encontrado' : 'Nenhum favorito'}
              </h3>
              <p className="text-sm text-zinc-500 max-w-[260px] font-medium">
                {isSearching 
                  ? 'Não encontramos nenhum aplicativo com esse nome.' 
                  : 'Explore a plataforma ou use a busca acima para adicionar apps aos seus favoritos.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
