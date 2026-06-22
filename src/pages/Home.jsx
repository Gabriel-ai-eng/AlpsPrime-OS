import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const Vivart = lazy(() => import('./Vivart'));
const Sexta = lazy(() => import('./Sexta'));
const Titan = lazy(() => import('./Titan'));

const LoadingScreen = () => (
  <div className="absolute inset-0 z-[200000] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
    <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
    <span className="text-muted-foreground text-xs tracking-[0.2em] uppercase font-medium">
      Iniciando
    </span>
  </div>
);

const SLIDES = [
  { id: 'alps', bg: null, titulo: true },
  { id: 'branco', bg: '#FFFFFF', titulo: false },
  { id: 'vermelho', bg: '#FF5050', titulo: false },
  { id: 'verde', bg: '#5CD65C', titulo: false },
];

const TOTAL = SLIDES.length;

export default function Home() {
  const [telaAtual, setTelaAtual] = useState('hub');
  const [slideAtual, setSlideAtual] = useState(0);
  const timerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openApp) {
      setTelaAtual(location.state.openApp);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
    <div className="w-full h-[100dvh] bg-background text-foreground relative overflow-hidden flex flex-col">
      {telaAtual === 'hub' && (
        <>
          <div className="flex-1 w-full bg-background overflow-y-auto scrollbar-none flex flex-col">

            {/* SLIDER */}
            <div
              className="relative w-full flex-shrink-0 overflow-hidden"
              style={{ height: '38vh' }}
            >
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
                        <h1 className="text-[46px] font-semibold tracking-tight gold-gradient mb-2 select-none">
                          Alps OS
                        </h1>

                        <p className="text-muted-foreground text-[14px] font-light tracking-wide">
                          Um mundo de possibilidades.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navSlide(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors outline-none active:scale-90"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              <button
                onClick={() => navSlide(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors outline-none active:scale-90"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>

            {/* APP — Projeto Armor (bloco único, ocupa toda a largura e o resto da tela) */}
            <div
              onClick={() => setTelaAtual('titan')}
              className="flex-1 w-full min-h-[55vh] overflow-hidden cursor-pointer active:scale-[0.99] transition-transform duration-300 group"
            >
              <img
                src="/apps/titan-bg.webp"
                alt="Projeto Armor"
                decoding="async"
                fetchpriority="high"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            </div>
          </div>
        </>
      )}

      <Suspense fallback={<LoadingScreen />}>
        {telaAtual === 'vivart' && <Vivart onVoltar={() => setTelaAtual('hub')} />}
        {telaAtual === 'sexta' && <Sexta onVoltar={() => setTelaAtual('hub')} />}
        {telaAtual === 'titan' && <Titan onVoltar={() => setTelaAtual('hub')} />}
      </Suspense>
    </div>
  );
}
