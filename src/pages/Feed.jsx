import React, { useState, Suspense, lazy } from 'react';
import {
  Menu, X, Grid, LayoutList, Star, Sparkles,
  User, Settings, HelpCircle, LogOut, Loader2,
  ChevronLeft, ChevronRight // Ícones das setas adicionados aqui
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

// OTIMIZAÇÃO: Carregamento Preguiçoso (Lazy Loading)
const Vivart = lazy(() => import('./Vivart'));
const Sexta = lazy(() => import('./Sexta'));
const Titan = lazy(() => import('./Titan'));

// Tela de carregamento minimalista
const LoadingScreen = () => (
  <div className="absolute inset-0 z-[200000] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
    <Loader2 className="w-8 h-8 text-white/40 animate-spin mb-4" />
    <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium">Iniciando</span>
  </div>
);

export default function Feed() {
  const [telaAtual, setTelaAtual] = useState('hub');
  const [menuAberto, setMenuAberto] = useState(false);
  
  // ESTADO DO CARROSSEL
  const [slideAtual, setSlideAtual] = useState(0);

  // DADOS DOS SLIDES
  const slides = [
    { id: 'alps', type: 'titulo' },
    { id: 'banner1', type: 'imagem', cor: 'bg-white' },
    { id: 'banner2', type: 'imagem', cor: 'bg-red-500' },
    { id: 'banner3', type: 'imagem', cor: 'bg-green-500' },
  ];

  const slideAnterior = () => {
    setSlideAtual((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const proximoSlide = () => {
    setSlideAtual((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full h-[100dvh] bg-black text-white font-sans relative overflow-hidden flex flex-col selection:bg-white/30">

      {/* =========================================
          MODAL DO MENU
          ========================================= */}
      {menuAberto && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-5 bg-black/40 backdrop-blur-xl animate-menu-overlay-in">

          {/* Overlay invisível para fechar ao clicar fora */}
          <div className="absolute inset-0" onClick={() => setMenuAberto(false)} />

          <div
            className="relative z-10 w-full max-w-md rounded-[44px] flex flex-col overflow-hidden animate-menu-panel-in"
            style={{
              background: 'linear-gradient(160deg, rgba(44,44,48,0.72) 0%, rgba(18,18,22,0.66) 100%)',
              backdropFilter: 'blur(44px) saturate(180%) brightness(1.08)',
              WebkitBackdropFilter: 'blur(44px) saturate(180%) brightness(1.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 40px rgba(255,255,255,0.03)',
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-transparent" />

            {/* Botão fechar (X) em vidro, flutuando no canto */}
            <button
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            <div className="relative px-5 pb-8 pt-6 space-y-7">

              {/* Seção 1: Web-apps do Ecossistema */}
              <div className="space-y-1">
                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Grid className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Todos</span>
                </button>
                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <LayoutList className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Categorias</span>
                </button>
                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Favoritos</span>
                </button>
                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-[#C9A24F]/20 flex items-center justify-center text-[#C9A24F] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Em breve</span>
                </button>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="space-y-1">
                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-white transition-colors">Perfil</span>
                </button>
                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-white transition-colors">Configurações</span>
                </button>
                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-white transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-white transition-colors">Suporte</span>
                </button>
                <button onClick={() => base44.auth.logout(window.location.origin)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-500/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-red-400 group-hover:border-red-400/20 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-red-400 transition-colors">Sair</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {telaAtual === 'hub' && (
        <>
          {/* HEADER DO FEED */}
          <div className="absolute top-0 left-0 w-full h-14 flex items-center justify-between px-4 z-50 pointer-events-none">
            <div className="w-10 flex-shrink-0 flex items-center justify-start pointer-events-auto">
              <button
                onClick={() => setMenuAberto(true)}
                className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors outline-none"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1" />
          </div>

          {/* CONTEÚDO PRINCIPAL */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center pt-28 px-6 pb-32 z-10 relative animate-fade-in">

            {/* Efeito Aurora */}
            <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

            {/* =========================================
                SLIDER CARROSSEL ESTILO NETFLIX
                ========================================= */}
            <div className="w-full max-w-md flex items-center justify-between mb-12 z-10">
              
              <button
                onClick={slideAnterior}
                className="p-2 text-white/40 hover:text-white transition-colors outline-none active:scale-90"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              <div className="flex-1 overflow-hidden relative h-28 flex items-center justify-center">
                <div
                  className="flex w-full h-full items-center transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${slideAtual * 100}%)` }}
                >
                  {slides.map((slide) => (
                    <div key={slide.id} className="w-full flex-shrink-0 flex flex-col items-center justify-center px-2">
                      
                      {slide.type === 'titulo' ? (
                        <div className="text-center">
                          <h1
                            className="text-[46px] font-semibold tracking-tight text-white mb-2 select-none"
                            style={{
                              textShadow:
                                '0 0 4px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.6), 0 0 24px rgba(255,255,255,0.4), 0 0 45px rgba(255,255,255,0.2)',
                            }}
                          >
                            Alps OS
                          </h1>
                          <p className="text-[#8E8E93] text-[14px] font-light tracking-wide">
                            Um mundo de possibilidades.
                          </p>
                        </div>
                      ) : (
                        /* Retângulos Coloridos (Para você substituir por imagens depois) */
                        <div className={`w-full h-24 rounded-[20px] ${slide.cor} shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden relative`}>
                          {/* Dica: Quando for por imagem, apague a "cor" acima e coloque a tag img aqui dentro */}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={proximoSlide}
                className="p-2 text-white/40 hover:text-white transition-colors outline-none active:scale-90"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>

            {/* CARDS DOS APLICATIVOS */}
            <div className="w-full max-w-sm flex flex-col gap-8 z-10">

              <div
                onClick={() => setTelaAtual('titan')}
                className="w-full rounded-[32px] overflow-hidden relative shadow-[0_0_50px_rgba(37,99,235,0.12)] aspect-[4/3] group cursor-pointer active:scale-95 transition-transform duration-300"
              >
                <img
                  src="https://i.ibb.co/RkH2TW3t/In-Shot-20260612-004514736.jpg"
                  alt="Novo App Azul"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />
              </div>

              <div
                onClick={() => setTelaAtual('sexta')}
                className="w-full rounded-[32px] overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.03)] aspect-[4/3] group cursor-pointer active:scale-95 transition-transform duration-300"
              >
                <img
                  src="https://i.ibb.co/VcM6ZpBQ/11-20260609-144421-0000.png"
                  alt="Sexta App"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              <div
                onClick={() => setTelaAtual('vivart')}
                className="w-full rounded-[32px] overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.08)] aspect-[4/3] group cursor-pointer active:scale-95 transition-transform duration-300"
              >
                <img
                  src="https://i.ibb.co/ywTbh5q/Vivart-20260609-024021-0000.png"
                  alt="Vivart App"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

            </div>
          </div>
        </>
      )}

      {/* TELAS INTERNAS (COM SUSPENSE PARA OTIMIZAÇÃO) */}
      <Suspense fallback={<LoadingScreen />}>
        {telaAtual === 'vivart' && (
          <Vivart onVoltar={() => setTelaAtual('hub')} />
        )}

        {telaAtual === 'sexta' && (
          <Sexta onVoltar={() => setTelaAtual('hub')} />
        )}

        {telaAtual === 'titan' && (
          <Titan onVoltar={() => setTelaAtual('hub')} />
        )}
      </Suspense>
      
    </div>
  );
}
