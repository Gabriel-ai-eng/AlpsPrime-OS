import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import CachedImage from '@/components/CachedImage';

const Sexta = lazy(() => import('./Sexta'));
// Projeto Armor é um app standalone (repo/deploy próprio). O Alps OS não embute
// mais o jogo: o card apenas redireciona para o jogo publicado.
const PROJETO_ARMOR_URL = 'https://projeto-armor.vercel.app/';

const LoadingScreen = () => (
  <div className="absolute inset-0 z-[200000] flex flex-col items-center justify-center bg-white backdrop-blur-xl">
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
  
  // ESTADO NOVO: Controla a exibição da tela pedindo para girar o celular
  const [esperandoRotacao, setEsperandoRotacao] = useState(false); 

  const timerRef = useRef(null);
  const sliderRef = useRef(null);
  const touchRef = useRef({ startX: 0, dragging: false, moved: false });
  const location = useLocation();

  useEffect(() => {
    const app = location.state?.openApp;
    // Sexta-feira está indisponível: nunca abrir, mesmo que algum
    // fluxo tente navegar com esse openApp.
    if (app === 'armor') {
      // jogo externo: redireciona na mesma aba
      window.location.href = PROJETO_ARMOR_URL;
    } else if (app && app !== 'sexta') {
      setTelaAtual(app);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // LÓGICA NOVA: Fica escutando quando o usuário deita o celular
  useEffect(() => {
    if (!esperandoRotacao) return;

    const checkRotation = () => {
      // Verifica se a largura ficou maior que a altura (celular deitado)
      if (window.innerWidth > window.innerHeight) {
        setEsperandoRotacao(false);
        window.location.href = '/game/'; // Vai para o jogo imediatamente
      }
    };

    window.addEventListener('resize', checkRotation);
    window.addEventListener('orientationchange', checkRotation);

    // Checa logo de cara, vai que ele virou antes de o React processar
    checkRotation();

    return () => {
      window.removeEventListener('resize', checkRotation);
      window.removeEventListener('orientationchange', checkRotation);
    };
  }, [esperandoRotacao]);

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

  // LÓGICA NOVA: Clique no FKW
  const abrirJogoFKW = () => {
    if (touchRef.current.moved) return; // foi swipe, não clique
    
    const isPortrait = window.innerHeight > window.innerWidth;
    
    if (isPortrait) {
      // Se estiver em pé, mostra a tela pedindo para virar e NÃO faz mais nada
      setEsperandoRotacao(true);
    } else {
      // Se já estiver deitado, vai direto pro jogo
      window.location.href = '/game/';
    }
  };

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

  // Wrap-around robusto
  useEffect(() => {
    if (pos >= 1 && pos <= TOTAL) return; // posição real: nada a fazer
    const id = setTimeout(() => {
      setAnim(false);
      setPos(((((pos - 1) % TOTAL) + TOTAL) % TOTAL) + 1);
    }, 520);
    return () => clearTimeout(id);
  }, [pos]);

  // Reabilita a transição
  useEffect(() => {
    if (anim) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnim(true))
    );
    return () => cancelAnimationFrame(id);
  }, [anim]);

  return (
    <div className="w-full h-full bg-background text-foreground relative overflow-hidden flex flex-col">
      
      {/* --- OVERLAY DE TELA CHEIA: VIRE O CELULAR --- */}
      {esperandoRotacao && (
        <div 
          className="absolute inset-0 z-[300000] flex flex-col items-center justify-center text-center p-8" 
          style={{ background: 'radial-gradient(circle at 50% 38%, #0b1424, #05080f)' }}
        >
          <style>
            {`
              @keyframes tiltPhone {
                0%,16%   { transform:rotate(0deg); }
                46%,72%  { transform:rotate(-90deg); }
                96%,100% { transform:rotate(0deg); }
              }
              .phone-anim {
                width: 62px;
                height: 110px;
                border: 5px solid #7dd3fc;
                border-radius: 14px;
                position: relative;
                box-shadow: 0 0 26px rgba(125,211,252,.5);
                animation: tiltPhone 2.4s ease-in-out infinite;
                margin-bottom: 30px;
              }
              .phone-anim::before {
                content: '';
                position: absolute;
                left: 50%;
                bottom: 7px;
                width: 20px;
                height: 4px;
                border-radius: 3px;
                background: #7dd3fc;
                transform: translateX(-50%);
              }
              .phone-anim::after {
                content: '';
                position: absolute;
                inset: 7px;
                border-radius: 7px;
                background: rgba(125,211,252,.12);
              }
            `}
          </style>
          
          <div className="phone-anim"></div>
          <h2 
            className="text-[#7dd3fc] text-[clamp(20px,6vw,30px)] tracking-[2px] font-bold" 
            style={{ textShadow: '2px 2px 0 #0a3d62' }}
          >
            VIRE O CELULAR
          </h2>
          
          <button
            onClick={() => setEsperandoRotacao(false)}
            className="mt-8 px-6 py-3 text-sm text-white/50 underline active:text-white"
          >
            Cancelar
          </button>
        </div>
      )}

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
                    onClick={slide.id === 'branco' ? abrirJogoFKW : undefined}
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

            {/* APP — Projeto Armor */}
            <div
              onClick={() => { window.location.href = PROJETO_ARMOR_URL; }}
              className="w-full aspect-square overflow-hidden cursor-pointer active:scale-[0.99] transition-transform duration-300 group"
            >
              <CachedImage
                src="/apps/armor-bg.png"
                cacheKey="armor_bg"
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
        {telaAtual === 'sexta' && <Sexta onVoltar={() => setTelaAtual('hub')} />}
      </Suspense>
    </div>
  );
}