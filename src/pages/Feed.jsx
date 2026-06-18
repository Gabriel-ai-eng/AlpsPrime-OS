import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const slides = [
    { id: 'banner1', type: 'imagem', cor: 'bg-white/10' },
    { id: 'banner2', type: 'imagem', cor: 'bg-white/5' },
    { id: 'banner3', type: 'imagem', cor: 'bg-white/10' },
  ];

  // FUNÇÃO PROXIMO (COM LOOP INFINITO)
  const proximoSlide = useCallback(() => {
    setSlideAtual((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // FUNÇÃO ANTERIOR (COM LOOP INFINITO)
  const slideAnterior = useCallback(() => {
    setSlideAtual((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // TIMER DE 5 SEGUNDOS
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
          <header className="w-full bg-black pt-14 pb-5 flex flex-col items-center justify-center z-20 relative shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <h1 className="text-[32px] font-semibold tracking-tight text-white select-none"
              style={{ textShadow: '0 0 4px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.6)' }}>
              Alps OS
            </h1>
            <p className="text-[#8E8E93] text-[12px] font-light tracking-wide mt-1">Um mundo de possibilidades.</p>
          </header>

          <div className="flex-1 w-full bg-[#121212] overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center pt-8 px-6 pb-32 z-10 relative animate-fade-in">
            <div className="absolute top-0 left-[20%] w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

            {/* CARROSSEL */}
            <div className="w-full max-w-md flex items-center justify-between mb-10 z-10">
              <button onClick={slideAnterior} className="p-2 text-white/40 hover:text-white transition-colors active:scale-90"><ChevronLeft className="w-7 h-7" /></button>
              <div className="flex-1 overflow-hidden relative h-28 flex items-center justify-center">
                <div className="flex w-full h-full items-center transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${slideAtual * 100}%)` }}>
                  {slides.map((slide) => (
                    <div key={slide.id} className="w-full flex-shrink-0 px-2">
                      <div className={`w-full h-24 rounded-[20px] ${slide.cor} border border-white/5 shadow-inner`}></div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={proximoSlide} className="p-2 text-white/40 hover:text-white transition-colors active:scale-90"><ChevronRight className="w-7 h-7" /></button>
            </div>

            {/* CARDS */}
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

      <Suspense fallback={<LoadingScreen />}>
        {telaAtual === 'vivart' && <Vivart onVoltar={() => setTelaAtual('hub')} />}
        {telaAtual === 'sexta' && <Sexta onVoltar={() => setTelaAtual('hub')} />}
        {telaAtual === 'titan' && <Titan onVoltar={() => setTelaAtual('hub')} />}
      </Suspense>
    </div>
  );
}
