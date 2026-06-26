import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// id = chave usada na navegação (openApp → telaAtual no Home). `status: 'soon'`
// marca os apps ainda não lançados. Projeto Armor (id 'titan') vem primeiro.
const SUB_APPS = [
  {
    id: 'titan',
    name: 'Projeto Armor',
    image: '/apps/armor-bg.webp',
    status: 'live',
  },
  {
    id: 'sexta',
    name: 'Sexta-feira',
    image: '/apps/sexta-bg.webp',
    status: 'soon',
  },
  {
    id: 'vivart',
    name: 'Vivart',
    image: '/apps/vivart-bg.webp',
    status: 'soon',
  }
];

// Apps indisponíveis: continuam aparecendo na lista, mas clicar neles NÃO faz
// nada (o usuário não consegue acessar Sexta-feira nem Vivart).
const BLOQUEADOS = new Set(['sexta', 'vivart']);

// minúsculas + sem acentos, para a busca casar "Projeto" com "projeto" etc.
const normalize = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function Search() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filteredApps = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return SUB_APPS;
    return SUB_APPS
      .filter((app) => normalize(app.name).includes(q))
      .sort((a, b) => {
        // Quem começa com o texto digitado aparece primeiro (ex.: "Pro" → Projeto Armor).
        const aStarts = normalize(a.name).startsWith(q);
        const bStarts = normalize(b.name).startsWith(q);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return 0;
      });
  }, [query]);

  return (
    <div className="w-full h-[100dvh] bg-background text-foreground font-sans overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center pt-6 px-6 pb-32 relative select-none">

      {/* Luz ambiente sutil no fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-gold/[0.04] blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center gap-8 z-10">

        {/* CAMPO DE BUSCA */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 rounded-2xl bg-muted/50 backdrop-blur-3xl border border-border transition-all duration-300 focus-within:border-gold/40 focus-within:shadow-[0_0_20px_rgba(201,162,79,0.1)] group" />

          <div className="relative flex items-center h-12 px-4 gap-3">
            <SearchIcon className="w-5 h-5 text-muted-foreground group-focus-within:text-foreground/70 transition-colors" strokeWidth={1.8} />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar aplicativos..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium tracking-wide"
              autoFocus
                style={{ WebkitTapHighlightColor: 'transparent' }}
            />

            {query ? (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border">
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
                  // Envia o id do aplicativo no estado da navegação.
                  // Sexta-feira e Vivart estão bloqueados: clicar não faz nada.
                  onClick={() => { if (BLOQUEADOS.has(app.id)) return; navigate('/home', { state: { openApp: app.id } }); }}
                  className={`w-full rounded-[32px] overflow-hidden relative aspect-[4/3] group transition-all outline-none ${BLOQUEADOS.has(app.id) ? '' : 'cursor-pointer active:scale-95'}`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <img
                    src={app.image}
                    alt={app.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />

                  {/* Selo minimalista para apps ainda não lançados */}
                  {app.status === 'soon' && (
                    <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90">Em breve</span>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-12 flex flex-col items-center justify-center text-center px-4"
              >
                <SearchIcon className="w-8 h-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Nenhum aplicativo correspondente.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}