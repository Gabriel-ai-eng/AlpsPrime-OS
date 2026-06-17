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

      {telaAtual === 'hub' && (
        <>
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
                /* CORREÇÃO: Removi arredondamento de bordas externo para deixar somente o retângulo da imagem */
                className="w-full overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.05)] aspect-[4/3] group cursor-pointer active:scale-95 transition-transform duration-300"
              >
                <img
                  /* NOVA IMAGEM RECORTADA SEM BORDA CINZA */
                  src="image_0.png"
                  alt="Titan App"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-500" />
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
