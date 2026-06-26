import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

export default function Favoritos() {
  const navigate = useNavigate();
  const t = useT();

  // Lista de favoritos. (Começa vazia)
  const [favorites, setFavorites] = useState([]);

  // Remove um app da lista de favoritos
  const removeFavorite = (app) => {
    setFavorites(prev => prev.filter(f => f.id !== app.id));
  };

  return (
    <div className="min-h-full w-full relative z-10 p-4 md:p-8 max-w-4xl mx-auto flex flex-col bg-background text-foreground">

      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 pt-4 md:pt-0"
      >
        <div className="mb-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t('Favoritos')}
          </h1>
        </div>
        <p className="text-muted-foreground text-[15px] font-light ml-1">
          {t('Sua coleção pessoal de apps preferidos.')}
        </p>
      </motion.div>

      {/* Lista */}
      <div className="flex-1">
        <AnimatePresence mode="popLayout">
          {favorites.length > 0 ? (
            <div className="flex flex-col gap-3">
              {favorites.map((app, index) => {
                const Icon = app.icon;

                return (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2), ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => navigate(app.path)}
                    className="group relative flex items-center justify-between p-4 sm:p-5 rounded-[28px] bg-card border border-border hover:border-gold/20 backdrop-blur-2xl hover:bg-muted/60 transition-all duration-500 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="flex items-center gap-4 relative z-10 min-w-0">
                      <div className="w-12 h-12 rounded-[20px] bg-muted border border-border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500 group-hover:border-gold/30 group-hover:shadow-[0_0_20px_rgba(201,162,79,0.15)]">
                        {Icon && <Icon className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors duration-300" />}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <h3 className="text-[16px] font-medium text-foreground truncate transition-colors">
                          {app.title}
                        </h3>
                        <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                          {app.subtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                            {app.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10 pl-4">
                      {/* Botão de Remover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Impede que o clique no botão abra o app acidentalmente
                          removeFavorite(app);
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 outline-none text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        title={t('Remover dos favoritos')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Botão de Abrir App */}
                      <button
                        className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-300 outline-none group/btn"
                        title={t('Acessar')}
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
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4 shadow-sm">
                <Star className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {t('Nenhum favorito')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[260px] font-medium">
                {t('Explore a plataforma para adicionar apps aos seus favoritos.')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
