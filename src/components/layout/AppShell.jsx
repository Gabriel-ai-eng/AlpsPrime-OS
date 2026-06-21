import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { signOut } from '@/lib/auth';
import {
  User, LogOut, Menu, X, Search as SearchIcon,
  Settings, HelpCircle, Home, LayoutList, Star, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIUnlock } from '@/lib/useAIUnlock';
import { usePushNotifications } from '@/lib/usePushNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import AILockedFullscreen from '@/components/feed/AILockedFullscreen';
import AIUnlockedCelebration from '@/components/feed/AIUnlockedCelebration';
import NotificationsBell from '@/components/notifications/NotificationsBell';
import BottomNav from '@/components/layout/BottomNav';
import { useLiquidGlass } from '@/lib/useLiquidGlass';

const NAV_ITEMS = [];

/* ── Atmospheric orbs ── */
function AtmosphericOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Estáticas (sem animação infinita) — mantém o clima sem custo de repintura no scroll */}
      <div
        className="absolute"
        style={{
          width: 560, height: 560, borderRadius: '50%',
          top: '-160px', left: '-140px',
          background: 'radial-gradient(circle, rgba(201,162,79,0.22) 0%, rgba(201,162,79,0.08) 35%, transparent 70%)',
        }}
      />
      <div
        className="absolute"
        style={{
          width: 440, height: 440, borderRadius: '50%',
          bottom: '-100px', right: '-80px',
          background: 'radial-gradient(circle, rgba(160,120,220,0.16) 0%, rgba(160,120,220,0.06) 40%, transparent 70%)',
        }}
      />
    </div>
  );
}

/* ── Sidebar (Desktop) ── */
function Sidebar({ user, location, aiUnlocked, onNavigate, onAILocked }) {
  return (
    <div className="flex flex-col h-full bg-background border-r border-border relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="px-5 pt-5 pb-0 border-b border-border" />
      <div className="flex-1" />
      <div className="p-3 border-t border-border space-y-1">
        <Link to="/profile" onClick={onNavigate} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-gold/20 group-hover:ring-gold/50 transition-all">
            {user?.profile_picture_url ? (
              <img src={user.profile_picture_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-foreground group-hover:text-gold transition-colors">{user?.username || user?.full_name || 'Usuário'}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider mt-0.5">Ver Perfil</p>
          </div>
        </Link>
        <Link to="/favoritos" onClick={onNavigate} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Star className="w-4 h-4" />
          <span>Favoritos</span>
        </Link>
        <Link to="/settings" onClick={onNavigate} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </Link>
        <Link to="/suporte" onClick={onNavigate} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span>Suporte</span>
        </Link>
        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}

/* ── AppShell ── */
export default function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  // Na tela de Suporte escondemos o cabeçalho e a barra inferior (a própria
  // página oferece um botão "Voltar").
  const isSuporte = location.pathname === '/suporte';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiLockedOpen, setAiLockedOpen] = useState(false);
  const { aiUnlocked, showCelebration, dismissCelebration } = useAIUnlock();

  const { setMode } = useLiquidGlass();

  usePushNotifications(user?.email);

  useEffect(() => {
    const localTheme = localStorage.getItem('sf_theme_preference');

    if (localTheme) {
      if (localTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        if (setMode) setMode('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('data-theme');
        if (setMode) setMode('light');
      }
    } else if (user?.liquid_glass_mode) {
      if (user.liquid_glass_mode === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('sf_theme_preference', 'dark');
        if (setMode) setMode('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('sf_theme_preference', 'light');
        if (setMode) setMode('light');
      }
    }
  }, [user?.liquid_glass_mode, setMode]);

  const prevPathRef = useRef('');
  useEffect(() => {
    try {
      sessionStorage.setItem('sf_last_path', prevPathRef.current || '');
      prevPathRef.current = location.pathname;
    } catch {}
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarProps = {
    user, location, aiUnlocked,
    onAILocked: () => setAiLockedOpen(true),
  };

  return (
    <div className="flex h-screen w-full max-w-[100vw] overflow-hidden relative bg-black text-white selection:bg-white/30">

      {location.pathname !== '/suporte' && <AtmosphericOrbs />}

      <aside className="hidden lg:flex w-60 flex-shrink-0 relative z-10 border-r border-border">
        <Sidebar {...sidebarProps} />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[999999] flex items-center justify-center p-5 bg-black/40 backdrop-blur-xl animate-menu-overlay-in">
          <div className="absolute inset-0" onClick={() => setMobileOpen(false)} />

          <div
            className="relative z-10 w-full max-w-md rounded-[44px] flex flex-col overflow-hidden animate-menu-panel-in"
            style={{
              background: 'linear-gradient(160deg, rgba(38,38,42,0.92) 0%, rgba(18,18,22,0.90) 100%)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-transparent" />

            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            <div className="relative px-5 pb-8 pt-6 space-y-7">
              <div className="space-y-1">
                {/* Corrigido aqui: redirecionamento alterado de /todos para /feed */}
                <Link to="/feed" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Home</span>
                </Link>
                <Link to="/categorias" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <LayoutList className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Categorias</span>
                </Link>
                <Link to="/favoritos" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Favoritos</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none cursor-not-allowed opacity-50">
                  <div className="w-8 h-8 rounded-xl bg-[#C9A24F]/20 flex items-center justify-center text-[#C9A24F] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/90">Em breve</span>
                </button>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="space-y-1">
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-white transition-colors">Configurações</span>
                </Link>
                <Link to="/suporte" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-white transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-white transition-colors">Suporte</span>
                </Link>
                <button onClick={() => { setMobileOpen(false); signOut(window.location.origin); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-500/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:text-red-400 group-hover:border-red-400/20 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-white/80 group-hover:text-red-400 transition-colors">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {!isSuporte && (
        <header className="lg:hidden fixed top-0 left-0 w-full h-14 z-[90000] flex items-center justify-between px-4 bg-[#0A0A0B]/95 border-b border-white/10">
          <div>
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors outline-none"
              aria-label="Menu"
              style={{ touchAction: 'manipulation' }}
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>

          {location.pathname === '/feed' ? (
            <span className="flex-1 text-center text-[#8E8E93] font-light tracking-[0.32em] text-[18px] select-none px-2 truncate">
              Alps Prime
            </span>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex items-center gap-1">
            <Link to="/search" className="p-2 rounded-full hover:bg-white/10 transition-colors outline-none" aria-label="Buscar">
              <SearchIcon className="w-5 h-5 text-white/80 hover:text-white" />
            </Link>

            <div>
              <NotificationsBell userEmail={user?.email} />
            </div>
          </div>
        </header>
        )}

        {!isSuporte && (
        <header className="hidden lg:flex items-center justify-end px-6 h-12 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20">
          <NotificationsBell userEmail={user?.email} />
        </header>
        )}

        <main className={`flex-1 w-full overflow-x-hidden overflow-y-auto scrollbar-thin ${isSuporte ? '' : 'pb-24 lg:pb-0 pt-14 lg:pt-0'}`}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {!isSuporte && <BottomNav />}

      <AILockedFullscreen open={aiLockedOpen} onClose={() => setAiLockedOpen(false)} />
      <AIUnlockedCelebration open={showCelebration} onClose={dismissCelebration} />
    </div>
  );
}