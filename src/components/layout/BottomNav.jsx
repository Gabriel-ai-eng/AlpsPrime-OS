import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Grip, Star, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiquidRipple } from '@/lib/useLiquidRipple';
import { useAuth } from '@/lib/AuthContext';

const ITEMS = [
  { label: 'Início', path: '/feed', icon: Home },
  { label: 'Categorias', path: '/categorias', icon: LayoutGrid },
  { label: 'Perfil', path: '/profile', icon: User, isCenter: true },
  { label: 'Favoritos', path: '/favoritos', icon: Star },
  { label: 'IA', path: null, icon: Bot, isDead: true },
];

function NavItem({ item, active }) {
  const { ref, onPointerDown } = useLiquidRipple({ color: 'rgba(255,255,255,0.08)', duration: 400 });
  const Icon = item.icon;

  if (item.isDead) {
    return (
      <button
        type="button"
        className="flex-1 h-full flex items-center justify-center relative outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden">
          <Icon
            className="w-6 h-6 transition-all duration-300 relative z-10 text-white/50"
            fill="none"
            strokeWidth={1.8}
          />
        </div>
      </button>
    );
  }

  return (
    <Link
      to={item.path}
      className="flex-1 h-full flex items-center justify-center relative outline-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <motion.div
        ref={ref}
        onPointerDown={onPointerDown}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ripple-surface"
      >
        <div
          className={cn(
            'absolute inset-0 rounded-2xl bg-white/10 transition-opacity duration-300 ease-out',
            active ? 'opacity-100' : 'opacity-0'
          )}
        />

        <Icon
          className={cn(
            'w-6 h-6 transition-all duration-300 relative z-10',
            active ? 'text-white' : 'text-white/50 hover:text-white/70'
          )}
          fill={active ? 'currentColor' : 'none'}
          strokeWidth={active ? 2 : 1.8}
          style={{ willChange: 'transform, color, fill' }}
        />
      </motion.div>
    </Link>
  );
}

function AppCenterpiece({ active, path }) {
  const { ref, onPointerDown } = useLiquidRipple({ color: 'rgba(255,255,255,0.15)', duration: 400 });
  const { user } = useAuth();

  return (
    <Link
      to={path}
      className="flex-1 h-full flex items-center justify-center relative z-50 outline-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <motion.div
        ref={ref}
        onPointerDown={onPointerDown}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center overflow-hidden relative ripple-surface transition-all duration-300',
          active
            ? 'bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-2 ring-white/40'
            : 'bg-white/10 shadow-sm hover:bg-white/15 ring-1 ring-white/10'
        )}
      >
        {user?.profile_picture_url ? (
          <img
            src={user.profile_picture_url}
            alt="Perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <User
            className={cn(
              'w-6 h-6 transition-all duration-300',
              active ? 'text-white' : 'text-white/80'
            )}
          />
        )}
      </motion.div>
    </Link>
  );
}

export default function BottomNav() {
  const location = useLocation();

  const hideOnRoutes = ['/settings'];

  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = (e) => {
      const currentScrollY = e.target.scrollTop || window.scrollY || 0;

      if (currentScrollY <= 10) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current + 8) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  const isActive = (path) =>
    path !== null && (
      location.pathname === path ||
      (path !== '/feed' && location.pathname.startsWith(path))
    );

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 px-4 pointer-events-none"
      aria-label="Navegação"
      style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
    >
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : 120,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 28, mass: 0.8 }}
        className={cn(
          'mx-auto max-w-sm h-[64px] rounded-[2rem] relative overflow-hidden pointer-events-auto',
          'bg-[#1C1C1E]/80 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
        )}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />

        <div className="absolute inset-0 max-w-sm mx-auto h-full flex items-center justify-around px-2 z-10">
          {ITEMS.map((item) => {
            const active = isActive(item.path);
            if (item.isCenter) {
              return <AppCenterpiece key={item.path} active={active} path={item.path} />;
            }
            return <NavItem key={item.label} item={item} active={active} />;
          })}
        </div>
      </motion.div>
    </nav>
  );
}