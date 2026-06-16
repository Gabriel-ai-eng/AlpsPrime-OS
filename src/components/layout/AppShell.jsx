import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import {
  User, LogOut, Menu, Search as SearchIcon, 
  Settings, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIUnlock } from '@/lib/useAIUnlock';
import { usePostCounts } from '@/lib/usePostCounts';
import { usePushNotifications } from '@/lib/usePushNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import AILockedFullscreen from '@/components/feed/AILockedFullscreen';
import AIUnlockedCelebration from '@/components/feed/AIUnlockedCelebration';
import PlanUpgradeCelebration from '@/components/celebrations/PlanUpgradeCelebration';
import { usePlanUpgradeDetector } from '@/lib/usePlanUpgradeDetector';
import NotificationsBell from '@/components/notifications/NotificationsBell';
import PrioritySupportButton from '@/components/support/PrioritySupportButton';
import BottomNav from '@/components/layout/BottomNav';
import { useLiquidGlass } from '@/lib/useLiquidGlass';

// Lista de itens do menu principal totalmente limpa!
const NAV_ITEMS = [];

/* ── Atmospheric orbs ── */
function AtmosphericOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute animate-atmo-drift"
        style={{
          width: 560, height: 560, borderRadius: '50%',
          top: '-160px', left: '-140px',
          background: 'radial-gradient(circle, rgba(201,162,79,0.22) 0%, rgba(201,162,79,0.08) 35%, transparent 70%)',
          animationDelay: '0s',
        }}
      />
      <div
        className="absolute animate-atmo-drift"
        style={{
          width: 440, height: 440, borderRadius: '50%',
          bottom: '-100px', right: '-80px',
          background: 'radial-gradient(circle, rgba(160,120,220,0.16) 0%, rgba(160,120,220,0.06) 40%, transparent 70%)',
          animationDelay: '-5s', animationDuration: '18s',
        }}
      />
      <div
        className="absolute animate-atmo-drift"
        style={{
          width: 320, height: 320, borderRadius: '50%',
          top: '40%', right: '-60px',
          background: 'radial-gradient(circle, rgba(232,199,122,0.14) 0%, transparent 70%)',
          animationDelay: '-8s', animationDuration: '22s',
        }}
      />
      <div
        className="absolute animate-atmo-drift"
        style={{
          width: 280, height: 280, borderRadius: '50%',
          bottom: '20%', left: '-40px',
          background: 'radial-gradient(circle, rgba(180,150,210,0.12) 0%, transparent 70%)',
          animationDelay: '-11s', animationDuration: '20s',
        }}
      />
    </div>
  );
}

/* ── Sidebar ── */
function Sidebar({ user, location, aiUnlocked, plan, postsDisplay, postsLimitDisplay, onNavigate, onAILocked }) {
  return (
    <div className="flex flex-col h-full bg-background border-r border-border relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Logo Placeholder */}
      <div className="px-5 pt-5 pb-0 border-b border-border" />

      {/* Espaçador flexível que empurra o rodapé para baixo, substituindo o menu antigo */}
      <div className="flex-1" />

      {/* User footer (Mantido intacto apenas com as opções solicitadas) */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          to="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted transition-colors group"
        >
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
        <Link
          to="/settings"
          onClick={onNavigate}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </Link>
        <a
          href="https://www.alpsprime.com.br/suporte"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Suporte</span>
        </a>
        <button
          onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiLockedOpen, setAiLockedOpen] = useState(false);
  const { aiUnlocked, showCelebration, dismissCelebration } = useAIUnlock();
  const { celebrationPlan, dismiss: dismissPlanCelebration } = usePlanUpgradeDetector(user);
  
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

  const plan = user?.plan ?? 'free';
  const { remainingToday, limit } = usePostCounts(user?.email, plan);
  const postsDisplay = remainingToday === Infinity ? '∞' : remainingToday;
  const postsLimitDisplay = limit === Infinity ? '∞' : limit;

  const sidebarProps = {
    user, location, aiUnlocked, plan, postsDisplay, postsLimitDisplay,
    onAILocked: () => setAiLockedOpen(true),
  };

  return (
    <div className="flex h-screen w-full max-w-[100vw] overflow-hidden relative bg-black text-white selection:bg-white/30">

      <AtmosphericOrbs />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 relative z-10 border-r border-border">
        <Sidebar {...sidebarProps} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[60] flex">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="relative w-72 flex-shrink-0 bg-background shadow-2xl"
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            >
              <Sidebar {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-transparent absolute w-full top-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors">
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Título centralizado (apenas no feed) — fica no meio entre o menu (☰) e os ícones */}
          {location.pathname === '/feed' && (
            <span className="flex-1 text-center text-[#8E8E93] font-light tracking-[0.32em] text-[18px] select-none pointer-events-none px-2 truncate">
              Sexta-feira
            </span>
          )}

          <div className="flex items-center gap-1 pointer-events-auto">
            <Link to="/search" className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Buscar">
              <SearchIcon className="w-5 h-5 text-white/80 hover:text-white" />
            </Link>
            <div className="pointer-events-auto">
              <NotificationsBell userEmail={user?.email} />
            </div>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-end px-6 h-12 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20">
          <NotificationsBell userEmail={user?.email} />
        </header>

        {/* Page outlet */}
        <main className="flex-1 w-full overflow-x-hidden overflow-y-auto scrollbar-thin pb-24 lg:pb-0">
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

      <BottomNav />

      <AILockedFullscreen open={aiLockedOpen} onClose={() => setAiLockedOpen(false)} />
      <AIUnlockedCelebration open={showCelebration} onClose={dismissCelebration} />
      <PlanUpgradeCelebration open={!!celebrationPlan} plan={celebrationPlan} onClose={dismissPlanCelebration} />
      <PrioritySupportButton user={user} />
    </div>
  );
}
