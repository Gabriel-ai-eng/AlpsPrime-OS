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
import { initAppearance, applyTheme, getThemePref } from '@/lib/theme';
import { addUsage, getPrefs } from '@/lib/appPrefs';
import { toast } from 'sonner';

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
  // página oferece um botão "Voltar"). Em Configurações escondemos apenas o
  // cabeçalho superior (Top Bar).
  const isSuporte = location.pathname === '/suporte';
  const hideHeader = isSuporte || location.pathname === '/settings';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiLockedOpen, setAiLockedOpen] = useState(false);
  const { aiUnlocked, showCelebration, dismissCelebration } = useAIUnlock();

  const { setMode } = useLiquidGlass();

  usePushNotifications(user?.email);

  useEffect(() => {
    // Sem preferência local ainda? Usa a do perfil (liquid_glass_mode) como semente.
    if (!localStorage.getItem('sf_theme_preference') && user?.liquid_glass_mode) {
      applyTheme(user.liquid_glass_mode === 'dark' ? 'dark' : 'light');
    }
    const resolved = initAppearance();
    if (setMode) setMode(resolved);

    // No modo "automático", acompanha a mudança do sistema em tempo real.
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (getThemePref() === 'auto') {
        const r = applyTheme('auto');
        if (setMode) setMode(r);
      }
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [user?.liquid_glass_mode, setMode]);

  // Rastreia tempo de uso (aba visível) e dispara lembretes de pausa.
  useEffect(() => {
    const STEP = 30;
    let activeSeconds = 0;
    let lastReminder = 0;
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      addUsage(STEP);

      const prefs = getPrefs();
      if (prefs.pause_enabled) {
        activeSeconds += STEP;
        const limit = (prefs.pause_minutes || 60) * 60;
        if (activeSeconds - lastReminder >= limit) {
          lastReminder = activeSeconds;
          toast(`Você está há ${Math.round(activeSeconds / 60)} min no Alps OS. Que tal uma pausa?`);
        }
      }
    }, STEP * 1000);
    return () => clearInterval(id);
  }, []);

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
    <div className="flex h-screen w-full max-w-[100vw] overflow-hidden relative bg-background text-foreground selection:bg-foreground/20">

      {location.pathname !== '/suporte' && <AtmosphericOrbs />}

      <aside className="hidden lg:flex w-60 flex-shrink-0 relative z-10 border-r border-border">
        <Sidebar {...sidebarProps} />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[999999] flex items-center justify-center p-5 bg-black/40 backdrop-blur-xl animate-menu-overlay-in">
          <div className="absolute inset-0" onClick={() => setMobileOpen(false)} />

          <div
            className="relative z-10 w-full max-w-md rounded-[44px] flex flex-col overflow-hidden animate-menu-panel-in bg-popover/95 backdrop-blur-xl border border-border shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-foreground/5 to-transparent" />

            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 outline-none bg-muted border border-border"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="relative px-5 pb-8 pt-6 space-y-7">
              <div className="space-y-1">
                <Link to="/home" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-foreground">Home</span>
                </Link>
                <Link to="/categorias" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <LayoutList className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-foreground">Categorias</span>
                </Link>
                <Link to="/favoritos" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-foreground">Favoritos</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted transition-colors group outline-none cursor-not-allowed opacity-50">
                  <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-foreground">Em breve</span>
                </button>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />

              <div className="space-y-1">
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border group-hover:text-foreground transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-foreground/80 group-hover:text-foreground transition-colors">Configurações</span>
                </Link>
                <Link to="/suporte" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border group-hover:text-foreground transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-foreground/80 group-hover:text-foreground transition-colors">Suporte</span>
                </Link>
                <button onClick={() => { setMobileOpen(false); signOut(window.location.origin); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-500/10 transition-colors group outline-none">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border group-hover:text-red-500 group-hover:border-red-400/20 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-medium text-foreground/80 group-hover:text-red-500 transition-colors">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {!hideHeader && (
        <header className="lg:hidden fixed top-0 left-0 w-full h-14 z-[90000] flex items-center justify-between px-4 bg-background/95 backdrop-blur-xl border-b border-border">
          <div>
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors outline-none"
              aria-label="Menu"
              style={{ touchAction: 'manipulation' }}
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <span className="flex-1 text-center text-muted-foreground font-light tracking-[0.32em] text-[18px] select-none px-2 truncate">
            Alps Prime
          </span>

          <div className="flex items-center gap-1">
            <Link to="/search" className="p-2 rounded-full hover:bg-muted transition-colors outline-none" aria-label="Buscar">
              <SearchIcon className="w-5 h-5 text-foreground/80 hover:text-foreground" />
            </Link>

            <div>
              <NotificationsBell userEmail={user?.email} />
            </div>
          </div>
        </header>
        )}

        {!hideHeader && (
        <header className="hidden lg:flex items-center justify-end px-6 h-12 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20">
          <NotificationsBell userEmail={user?.email} />
        </header>
        )}

        <main className={`flex-1 w-full overflow-x-hidden overflow-y-auto scrollbar-thin ${isSuporte ? '' : hideHeader ? 'pb-24 lg:pb-0' : 'pb-24 lg:pb-0 pt-14 lg:pt-0'}`}>
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