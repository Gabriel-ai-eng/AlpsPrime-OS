import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const Vivart = lazy(() => import('./Vivart'));
const Sexta  = lazy(() => import('./Sexta'));
const Titan  = lazy(() => import('./Titan'));

const LoadingScreen = () => (
  <div className="absolute inset-0 z-[200000] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl">
    <Loader2 className="w-8 h-8 text-white/40 animate-spin mb-4" />
    <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium">Iniciando</span>
  </div>
);

const SLIDES = [
  { id: 'alps',     bg: null,      titulo: true  },
  { id: 'branco',   bg: '#FFFFFF', titulo: false },
  { id: 'vermelho', bg: '#FF5050', titulo: false },
  { id: 'verde',    bg: '#5CD65C', titulo: false },
];

const TOTAL = SLIDES.length;

export default function Feed() {
  const [telaAtual, setTelaAtual]   = useState('hub');
  const [slideAtual, setSlideAtual] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setSlideAtual(prev => (prev + 1) % TOTAL),
      5000
    );
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const navSlide = (dir) => {
    setSlideAtual(prev => ((prev + dir + TOTAL) % TOTAL));
    resetTimer();
  };

  return (
    <div className="w-full h-[100dvh] bg-black text-white relative overflow-hidden flex flex-col selection:bg-white/30">

      {telaAtual === 'hub' && (
        <>
          {/* ── SLIDER FULL-WIDTH ─────────────────── */}
          <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ height: '38vh' }}>

            {/* trilho dos slides */}
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{
                width: `${TOTAL * 100}%`,
                transform: `translateX(-${(slideAtual * 100) / TOTAL}%)`,
              }}
            >
              {SLIDES.map((slide) => (
                <div
                  key={slide.id}
                  className="h-full flex items-center justify-center"
                  style={{
                    width: `${100 / TOTAL}%`,
                    backgroundColor: slide.bg ?? 'transparent',
                  }}
                >
                  {slide.titulo && (
                    <div className="text-center px-6">
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
                  )}
                </div>
              ))}
            </div>

            {/* setas */}
            <button
              onClick={() => navSlide(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors outline-none active:scale-90"
              style={{ touchAction: 'manipulation' }}
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={() => navSlide(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors outline-none active:scale-90"
              style={{ touchAction: 'manipulation' }}
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          {/* ── CARDS ─────────────────────────────── */}
          <div className="flex-1 w-full bg-[#121212] overflow-y-auto scrollbar-none">
            <div className="flex flex-col items-center px-6 pt-8 pb-32 gap-8">

              <div
                onClick={() => setTelaAtual('titan')}
                className="w-full max-w-sm rounded-[32px] overflow-hidden aspect-[4/3] cursor-pointer active:scale-95 transition-transform duration-300 group"
              >
                <img
                  src="/apps/titan-bg.webp"
                  alt="Titan App"
                  decoding="async"
                  fetchpriority="high"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              <div
                onClick={() => setTelaAtual('sexta')}
                className="w-full max-w-sm rounded-[32px] overflow-hidden aspect-[4/3] cursor-pointer active:scale-95 transition-transform duration-300 group"
              >
                <img
                  src="/apps/sexta-bg.webp"
                  alt="Sexta App"
                  decoding="async"
                  fetchpriority="high"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              <div
                onClick={() => setTelaAtual('vivart')}
                className="w-full max-w-sm rounded-[32px] overflow-hidden aspect-[4/3] cursor-pointer active:scale-95 transition-transform duration-300 group"
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

      <Suspense fallback={<LoadingScreen />}>
        {telaAtual === 'vivart' && <Vivart onVoltar={() => setTelaAtual('hub')} />}
        {telaAtual === 'sexta'  && <Sexta  onVoltar={() => setTelaAtual('hub')} />}
        {telaAtual === 'titan'  && <Titan  onVoltar={() => setTelaAtual('hub')} />}
      </Suspense>

    </div>
  );
}
