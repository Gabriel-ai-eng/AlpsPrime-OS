import React, { useState, Suspense, lazy } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // ESTADO DO CARROSSEL
  const [slideAtual, setSlideAtual] = useState(0);

  // DADOS DOS SLIDES (Apenas Banners agora, o título foi para o cabeçalho fixo)
  const slides = [
    { id: 'banner1', type: 'imagem', cor: 'bg-white/10' },
    { id: 'banner2', type: 'imagem', cor: 'bg-white/5' },
    { id: 'banner3', type: 'imagem', cor: 'bg-white/10' },
  ];

  const slideAnterior = () => {
    setSlideAtual((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const proximoSlide = () => {
    setSlideAtual((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full h-[100dvh] bg-black text-white font-sans relative overflow-hidden flex flex-col selection:bg-white/30">

      {telaAtual === 'hub' && (
        <>
          {/* =========================================
              CABEÇALHO FIXO PRETO (Onde ficava o retângulo cinza)
              ========================================= */}
          <header className="w-full bg-black pt-14 pb-5 flex flex-col items-center justify-center z-20 relative shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <h1
              className="text-[32px] font-semibold tracking-tight text-white select-none"
              style={{
                textShadow:
                  '0 0 4px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.6), 0 0 24px rgba(255,255,255,0.4), 0 0 45px rgba(255,255,255,0.2)',
              }}
            >
              Alps OS
            </h1>
          </header>

          {/* =========================================
              CONTEÚDO PRINCIPAL SCROLLÁVEL (Cor #121212)
              ========================================= */}
          <div className="flex-1 w-full bg-[#121212] overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center pt-8 px-6 pb-32 z-10 relative animate-fade-in">

            {/* Efeito Aurora (Luz de fundo) */}
            <div className="absolute top-0 left-[20%] w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

            {/* SLIDER CARROSSEL ESTILO NETFLIX */}
            <div className="w-full max-w-md flex items-center justify-between mb-10 z-10">
              
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
                      
                      {/* Retângulos Coloridos dos Banners */}
                      <div className={`w-full h-24 rounded-[20px] ${slide.cor} shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/5 overflow-hidden relative`}>
                        {/* Dica: Quando for por imagem, apague a "cor" acima e coloque a tag img aqui dentro */}
                      </div>

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

              {/* CARD TITAN */}
              <div
                onClick={() => setTelaAtual('titan')}
                className="w-full rounded-[32px] overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.08)] aspect-[4/3] group cursor-pointer active:scale-95 transition-transform duration-300"
              >
                <img
                  src="/apps/titan-bg.webp"
                  alt="Titan App"
                  decoding="async"
                  fetchpriority="high"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              {/* CARD SEXTA */}
              <div
                onClick={() => setTelaAtual('sexta')}
                className="w-full rounded-[32px] overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.08)] aspect-[4/3] group cursor-pointer active:scale-95 transition-transform duration-300"
              >
                <img
                  src="/apps/sexta-bg.webp"
                  alt="Sexta App"
                  decoding="async"
                  fetchpriority="high"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              {/* CARD VIVART */}
              <div
                onClick={() => setTelaAtual('vivart')}
                className="w-full rounded-[32px] overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.08)] aspect-[4/3] group cursor-pointer active:scale-95 transition-transform duration-300"
              >
                <img
                  src="/apps/vivart-bg.webp"
                  alt="Vivart App"
                  decoding="async"
                  fetchpriority="high"
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
