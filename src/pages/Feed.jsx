import React, { useState, Suspense, lazy } from 'react';
import { 
  Menu, X, Grid, LayoutList, Star, Sparkles, 
  User, Settings, HelpCircle, Loader2 
} from 'lucide-react';

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
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="w-full h-[100dvh] bg-black text-white font-sans relative overflow-hidden flex flex-col selection:bg-white/30">

      {/* =========================================
          MODAL DO MENU (CORRIGIDO PARA FIXED E Z-INDEX MAXIMO)
          ========================================= */}
      {menuAberto && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-6 bg-black/50 backdrop-blur-xl animate-in fade-in duration-300">
          
          {/* Overlay invisível para fechar ao clicar fora */}
          <div className="absolute inset-0" onClick={() => setMenuAberto(false)} />

          {/* Retângulo do Menu */}
          <div className="bg-[#1C1C1E]/80 backdrop-blur-3xl border border-white/10 p-2 rounded-[36px] w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative z-10 flex flex-col animate-in zoom-in-95 duration-300">
            
            {/* Botão Fechar */}
            <div className="flex justify-end p-2 pb-0">
              <button 
                onClick={() => setMenuAberto(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors outline-none"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            <div className="px-4 pb-6 pt-2 space-y-6">
              
              {/* Seção 1: Web-apps do Ecossistema */}
              <div className="space-y-1">
                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Grid className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Todos</span>
                </button>

                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <LayoutList className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Categorias</span>
                </button>

                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Favoritos</span>
                </button>

                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-[#C9A24F]/20 flex items-center justify-center text-[#C9A24F] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Em breve</span>
                </button>
              </div>

              {/* Divisor Elegante */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Seção 2: Sistema e Usuário */}
              <div className="space-y-1">
                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-white transition-colors">Perfil</span>
                </button>

                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-white transition-colors">Configurações</span>
                </button>

                <button onClick={() => setMenuAberto(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-white transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-white transition-colors">Suporte</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {telaAtual === 'hub' && (
        <>
          {/* HEADER DO FEED */}
          <div className="absolute top-0 left-0 w-full h-14 flex items-center justify-between px-4 z-50">
            <div className="w-10 flex-shrink-0 flex items-center justify-start">
              <button 
                onClick={() => setMenuAberto(true)}
                className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors outline-none"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            </div>

            <span className="flex-1 text-center text-[#8E8E93] font-light tracking-[0.32em] text-[18px] select-none pointer-events-none">
              Sexta-feira
            </span>

            <div className="w-10 flex-shrink-0" />
          </div>

          {/* CONTEÚDO PRINCIPAL */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center pt-32 px-6 pb-32 z-10 relative animate-fade-in">

            {/* Efeito Aurora */}
            <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Título */}
            <div className="text-center mb-12 z-10">
              <h1
                className="text-[46px] font-semibold tracking-tight text-white mb-2 select-none"
                style={{
                  textShadow:
                    '0 0 4px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.6), 0 0 24px rgba(255,255,255,0.4), 0 0 45px rgba(255,255,255,0.2)',
                }}
              >
                AlpsPrime-OS
              </h1>

              <p className="text-[#8E8E93] text-[14px] font-light tracking-wide">
                Um mundo de possibilidades.
              </p>
            </div>

            {/* CARDS */}
            <div className="w-full max-w-sm flex flex-col gap-8 z-10">

              <div
                onClick={() => setTelaAtual('titan')}
                className="w-full rounded-[32px] overflow-hidden relative shadow-[0_0_50px_rgba(37,99,235,0.12)] aspect-[4/3] group cursor-pointer active:scale-95 transition-transform duration-300"
              >
                <img
                  src="https://i.ibb.co/RkH2TW3t/In-Shot-20260612-004514736.jpg"
                  alt="Novo App Azul"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />
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
