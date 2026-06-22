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

// Clones nas pontas para um carrossel infinito sem "pulo" visual:
// [último, ...slides, primeiro]
const EXT = [SLIDES[TOTAL - 1], ...SLIDES, SLIDES[0]];
const EXT_LEN = EXT.length; // TOTAL + 2

export default function Home() {
  const [telaAtual, setTelaAtual] = useState('hub');
  const [pos, setPos] = useState(1); // 1 = primeiro slide real (índice 0 é o clone)
  const [anim, setAnim] = useState(true);
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
    timerRef.current = setInterval(() => setPos(p => p + 1), 5000);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const navSlide = (dir) => {
    setPos(p => p + dir);
    resetTimer();
  };

  // Ao chegar num clone, salta sem animação para o slide real equivalente.
  const handleEnd = () => {
    if (pos === 0) {
      setAnim(false);
      setPos(TOTAL);
    } else if (pos === EXT_LEN - 1) {
      setAnim(false);
      setPos(1);
    }
  };

  // Reabilita a transição depois que o salto instantâneo é pintado.
  useEffect(() => {
    if (anim) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnim(true))
    );
    return () => cancelAnimationFrame(id);
  }, [anim]);

  return (
    <div className="w-full h-full bg-background text-foreground relative overflow-hidden flex flex-col">
      {telaAtual === 'hub' && (
        <>
          <div className="flex-1 w-full bg-background overflow-hidden flex flex-col min-h-0">

            {/* SLIDER */}
            <div
              className="relative w-full flex-shrink-0 overflow-hidden"
              style={{ height: '28vh' }}
            >
              <div
                className="flex h-full"
                style={{
                  width: `${EXT_LEN * 100}%`,
                  transform: `translateX(-${(pos * 100) / EXT_LEN}%)`,
                  transition: anim ? 'transform 500ms ease-out' : 'none',
                }}
                onTransitionEnd={handleEnd}
              >
                {EXT.map((slide, i) => (
                  <div
                    key={i}
                    className="h-full flex items-center justify-center"
                    style={{
                      width: `${100 / EXT_LEN}%`,
                      backgroundColor: slide.bg ?? 'transparent',
                    }}
                  >
                    {slide.titulo && (
                      <img
                        src="/apps/alps-os-bg.jpg"
                        alt="Alps OS"
                        decoding="async"
                        fetchpriority="high"
                        className="w-full h-full object-cover select-none"
                      />
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

            {/* APP — Projeto Armor (bloco quadrado, largura total, sem cantos arredondados) */}
            <div
              onClick={() => setTelaAtual('titan')}
              className="w-full aspect-square overflow-hidden cursor-pointer active:scale-[0.99] transition-transform duration-300 group"
            >
              <img
                src="/apps/armor-bg.webp"
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
