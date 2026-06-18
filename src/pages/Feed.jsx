import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Crown, Sparkles, Diamond, Compass } from 'lucide-react';

// OTIMIZAÇÃO: Carregamento Preguiçoso
const Vivart = lazy(() => import('./Vivart'));
const Sexta = lazy(() => import('./Sexta'));
const Titan = lazy(() => import('./Titan'));

const LoadingScreen = () => (
  <div className="absolute inset-0 z-[200000] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
    <Loader2 className="w-8 h-8 text-white/40 animate-spin mb-4" />
    <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium">Iniciando</span>
  </div>
);

export default function Feed() {
  const [telaAtual, setTelaAtual] = useState('hub');
  const [slideAtual, setSlideAtual] = useState(0);

  // DADOS DOS SLIDES (Baseado no design das suas imagens)
  const slides = [
    { 
      id: 'banner1', 
      title: 'Descubra o futuro', 
      subtitle: 'Navegue pelo ecossistema Alps.', 
      icon: Compass, 
      iconColor: 'text-blue-400', 
      bgGlow: 'bg-blue-500/20' 
    },
    { 
      id: 'banner2', 
      title: 'Assine o Alps Prime', 
      subtitle: 'Desbloqueie o poder ilimitado.', 
      buttonText: 'Ver planos', 
      icon: Crown, 
      iconColor: 'text-yellow-400', 
      bgGlow: 'bg-yellow-500/20' 
    },
    { 
      id: 'banner3', 
      title: 'Crie com Vivart', 
      subtitle: 'Gere imagens em alta definição.', 
      buttonText: 'Abrir Vivart', 
      action: 'vivart',
      icon: Sparkles, 
      iconColor: 'text-purple-400', 
      bgGlow: 'bg-purple-500/20' 
    },
    { 
      id: 'banner4', 
      title: 'Automação Titan', 
      subtitle: 'Construa fluxos de trabalho.', 
      buttonText: 'Acessar', 
      action: 'titan',
      icon: Diamond, 
      iconColor: 'text-emerald-400', 
      bgGlow: 'bg-emerald-500/20' 
    }
  ];

  // FUNÇÃO PROXIMO (COM LOOP INFINITO SUTIL)
  const proximoSlide = useCallback(() => {
    setSlideAtual((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // FUNÇÃO ANTERIOR
  const slideAnterior = useCallback(() => {
    setSlideAtual((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // TIMER DE 5 SEGUNDOS (Com pausa ao interagir)
  useEffect(() => {
    const timer = setInterval(() => {
      proximoSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [proximoSlide]);

  return (
    <div className="w-full h-[100dvh] bg-black text-white font-sans relative overflow-hidden flex flex-col selection:bg-white/30">
      {telaAtual === 'hub' && (
        <>
          {/* CABEÇALHO */}
          <header className="w-full bg-black pt-14 pb-5 flex flex-col items-center justify-center z-20 relative shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <h1 className="text-[32px] font-semibold tracking-tight text-white select-none"
              style={{ textShadow: '0 0 4px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.6)' }}>
              Alps OS
            </h1>
            <p className="text-[#8E8E93] text-[12px] font-light tracking-wide mt-1">Um mundo de possibilidades.</p>
          </header>

          <div className="flex-1 w-full bg-[#121212] overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center pt-8 px-6 pb-32 z-10 relative animate-fade-in">
            <div className="absolute top-0 left-[20%] w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

            {/* CARROSSEL PREMIUM */}
            <div className="w-full max-w-md flex flex-col items-center mb-10 z-10 relative">
              <div className="w-full flex items-center justify-between">
                <button onClick={slideAnterior} className="p-2 text-white/40 hover:text-white transition-colors active:scale-90 absolute left-[-16px] z-20">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex-1 overflow-hidden relative h-36 flex items-center justify-center px-4 rounded-[24px]">
                  <div className="flex w-full h-full items-center transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${slideAtual * 100}%)` }}>
                    {slides.map((slide) => (
                      <div key={slide.id} className="w-full h-full flex-shrink-0 px-1 py-1">
                        
                        {/* DESIGN DO CARD DO SLIDE */}
                        <div className="w-full h-full rounded-[24px] bg-[#1C1C1E] border border-white/10 shadow-lg p-5 flex items-center justify-between relative overflow-hidden group">
                          {/* Efeito de luz de fundo */}
                          <div className={`absolute -right-8 -top-8 w-32 h-32 blur-[40px] opacity-40 transition-all duration-1000 ${slide.bgGlow}`} />

                          {/* Textos e Botão */}
                          <div className="flex flex-col items-start justify-center z-10 max-w-[65%]">
                            <h3 className="text-white font-semibold text-[17px] leading-tight mb-1 tracking-tight">{slide.title}</h3>
                            <p className="text-[#8E8E93] text-[13px] leading-snug mb-3">{slide.subtitle}</p>
                            {slide.buttonText && (
                              <button 
                                onClick={() => slide.action && setTelaAtual(slide.action)}
                                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white text-[12px] font-medium transition-all backdrop-blur-md"
                              >
                                {slide.buttonText}
                              </button>
                            )}
                          </div>

                          {/* Ícone */}
                          <div className="z-10 flex-shrink-0 mr-1">
                            <slide.icon className={`w-12 h-12 ${slide.iconColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]`} strokeWidth={1.5} />
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={proximoSlide} className="p-2 text-white/40 hover:text-white transition-colors active:scale-90 absolute right-[-16px] z-20">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* INDICADORES DE SLIDE (PONTOS) */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {slides.map((_, index) => (
                  <div 
                    key={index} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${slideAtual === index ? 'w-4 bg-white' : 'w-1.5 bg-white/20'}`}
                  />
                ))}
              </div>
            </div>

            {/* CARDS DOS APLICATIVOS (TITAN, SEXTA, VIVART) */}
            <div className="w-full max-w-sm flex flex-col gap-8 z-10">
              {['titan', 'sexta', 'vivart'].map((app) => (
                <div key={app} onClick={() => setTelaAtual(app)}
                  className="w-full rounded-[32px] overflow-hidden relative aspect-[4/3] group cursor-pointer active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.08)]">
                  <img src={`/apps/${app}-bg.webp`} alt={`${app} App`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* TELAS INTERNAS */}
      <Suspense fallback={<LoadingScreen />}>
        {telaAtual === 'vivart' && <Vivart onVoltar={() => setTelaAtual('hub')} />}
        {telaAtual === 'sexta' && <Sexta onVoltar={() => setTelaAtual('hub')} />}
        {telaAtual === 'titan' && <Titan onVoltar={() => setTelaAtual('hub')} />}
      </Suspense>
    </div>
  );
}
