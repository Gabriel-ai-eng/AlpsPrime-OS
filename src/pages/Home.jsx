import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import CachedImage from '@/components/CachedImage';

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
  { id: 'branco', bg: '#FFFFFF', titulo: false, img: '/apps/fkw-bg.jpg' },
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
  const [dragX, setDragX] = useState(0); // deslocamento (px) enquanto arrasta com o dedo
  const timerRef = useRef(null);
  const sliderRef = useRef(null);
  const touchRef = useRef({ startX: 0, dragging: false, moved: false });
  const location = useLocation();

  useEffect(() => {
    const app = location.state?.openApp;
    // Sexta-feira e Vivart estão indisponíveis: nunca abrir, mesmo que algum
    // fluxo tente navegar com esse openApp.
    if (app && app !== 'sexta' && app !== 'vivart') {
      setTelaAtual(app);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setPos(p => p + 1), 2000);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const navSlide = (dir) => {
    setPos(p => p + dir);
    resetTimer();
  };

  // Arrastar com o dedo (swipe) para trocar de slide.
  const onTouchStart = (e) => {
    clearInterval(timerRef.current);
    touchRef.current = { startX: e.touches[0].clientX, dragging: true, moved: false };
    setAnim(false);
  };

  const onTouchMove = (e) => {
    if (!touchRef.current.dragging) return;
    const delta = e.touches[0].clientX - touchRef.current.startX;
    if (Math.abs(delta) > 5) touchRef.current.moved = true;
    setDragX(delta);
  };

  const onTouchEnd = () => {
    if (!touchRef.current.dragging) return;
    const delta = dragX;
    const largura = sliderRef.current?.offsetWidth || window.innerWidth;
    // Troca de slide se arrastou mais de 20% da largura (ou pelo menos 50px).
    const limiar = Math.min(largura * 0.2, 80);
    touchRef.current.dragging = false;
    setDragX(0);
    setAnim(true);
    if (Math.abs(delta) > limiar) {
      navSlide(delta < 0 ? 1 : -1);
    } else {
      resetTimer();
    }
  };

  // Wrap-around robusto: sempre que a posição sai do intervalo real [1..TOTAL]
  // (chegou num clone OU passou do limite), salta sem animação para o slide real
  // equivalente. Usa um timeout (logo após a transição de 500ms) em vez de
  // depender só do onTransitionEnd — que pode não disparar (aba desacelerada,
  // clique/timer no meio da transição) e deixar o carrossel "preso" no branco.
  // A aritmética de módulo recupera qualquer desvio (ex.: pos virou 4, 5, -1…).
  useEffect(() => {
    if (pos >= 1 && pos <= TOTAL) return; // posição real: nada a fazer
    const id = setTimeout(() => {
      setAnim(false);
      setPos(((((pos - 1) % TOTAL) + TOTAL) % TOTAL) + 1);
    }, 520);
    return () => clearTimeout(id);
  }, [pos]);

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
              ref={sliderRef}
              className="relative w-full flex-shrink-0 overflow-hidden"
              style={{ height: '28vh' }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
            >
              <div
                className="flex h-full touch-pan-y"
                style={{
                  width: `${EXT_LEN * 100}%`,
                  transform: `translateX(calc(-${(pos * 100) / EXT_LEN}% + ${dragX}px))`,
                  transition: anim ? 'transform 500ms ease-out' : 'none',
                }}
              >
                {EXT.map((slide, i) => (
                  <div
                    key={i}
                    onClick={slide.id === 'branco' ? () => { if (!touchRef.current.moved) window.location.href = '/game/'; } : undefined}
                    className={`h-full flex items-center justify-center${slide.id === 'branco' ? ' cursor-pointer' : ''}`}
                    style={{
                      width: `${100 / EXT_LEN}%`,
                      backgroundColor: slide.bg ?? 'transparent',
                    }}
                  >
                    {slide.titulo && (
                      <CachedImage
                        src="/apps/alps-os-bg.jpg"
                        cacheKey="alps_slide"
                        alt="Alps OS"
                        decoding="async"
                        className="w-full h-full object-cover select-none"
                      />
                    )}
                    {slide.img && (
                      <CachedImage
                        src={slide.img}
                        cacheKey="fkw_slide"
                        alt="Free Kick World"
                        decoding="async"
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
