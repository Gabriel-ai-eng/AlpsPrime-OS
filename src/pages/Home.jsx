import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CachedImage from '@/components/CachedImage';

// Wonderbound continua num repositório/deploy próprio, mas é servido SOB o
// domínio da plataforma (rewrite/proxy da Vercel em /jogo). Por ser a mesma
// origem, o jogo reaproveita a sessão de login já feita aqui — o jogador não
// precisa logar/cadastrar de novo e o progresso fica salvo na mesma conta.
const WONDERBOUND_URL = '/jogo';

const SLIDES = [
  { id: 'alps', bg: null, titulo: true },
  { id: 'branco', bg: '#FFFFFF', titulo: false, img: '/apps/fkw-bg-v2.jpg' },
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
    // Sexta-feira não passa por aqui: quem abre o bloco dela em Categorias
    // vê o rosto SVG (RostoSexta) direto, liberado só com "Recursos beta".
    if (app === 'wonderbound') {
      // jogo externo: redireciona na mesma aba
      window.location.href = WONDERBOUND_URL;
    } else if (app && app !== 'sexta') {
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
                    className="h-full flex items-center justify-center"
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

            {/* APP — Wonderbound (bloco quadrado, largura total, sem cantos arredondados) */}
            <div
              onClick={() => { window.location.href = WONDERBOUND_URL; }}
              className="w-full aspect-square overflow-hidden cursor-pointer active:scale-[0.99] transition-transform duration-300 group"
            >
              <CachedImage
                src="/apps/armor-bg.webp"
                cacheKey="armor_bg"
                alt="Wonderbound"
                decoding="async"
                fetchpriority="high"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}