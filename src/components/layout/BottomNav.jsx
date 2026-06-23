import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Grip, Star, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiquidRipple } from '@/lib/useLiquidRipple';
import { useAuth } from '@/lib/AuthContext';
import CachedImage from '@/components/CachedImage';

// Ícone de casinha com chaminé e porta em arco, recriado em SVG nos dois
// estados: contorno (inativo) e preenchido (ativo), mantendo a mesma silhueta.
function HomeIcon({ className, fill = 'none', style }) {
  const preenchido = fill && fill !== 'none';

  if (preenchido) {
    return (
      <svg
        viewBox="0 0 512 512"
        className={className}
        style={style}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M261.56 101.28a8 8 0 00-11.06 0L66.4 277.15a8 8 0 00-2.47 5.79L63.9 448a32 32 0 0032 32H192a16 16 0 0016-16V328a8 8 0 018-8h80a8 8 0 018 8v136a16 16 0 0016 16h96.06a32 32 0 0032-32V282.94a8 8 0 00-2.48-5.79z" />
        <path d="M490.91 244.15l-74.8-71.56V64a16 16 0 00-16-16h-48a16 16 0 00-16 16v32l-57.92-55.38C272.77 35.14 264.71 32 256 32c-8.68 0-16.72 3.14-23 8.63l-202 193.5c-10.74 10.49-13.06 27.4-4.51 39.65a26.79 26.79 0 0038.4 5l9.59-9.18v.78L256 96l225.49 215.69a26.27 26.27 0 0018.39 7.42 26.5 26.5 0 0018.49-44.96z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={34}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* corpo + porta em arco */}
      <path d="M80 212v236a16 16 0 0016 16h96V328a24 24 0 0124-24h80a24 24 0 0124 24v136h96a16 16 0 0016-16V212" />
      {/* telhado */}
      <path d="M480 256L266.89 52c-5-5.28-16.69-5.34-21.78 0L32 256" />
      {/* chaminé */}
      <path d="M400 179V64h-48v69" />
    </svg>
  );
}

const FRASES_IA = [
  'Em breve... 🚀',
  'Daqui a pouco te ajudo!',
  'Estou chegando... ⚡',
  'Novidades em breve!',
  'Me aguarda, tô quase lá 😄',
  'Em construção... 🔧',
  'Falta pouco!',
];

const ITEMS = [
  { label: 'Início', path: '/home', icon: HomeIcon },
  { label: 'Categorias', path: '/categorias', icon: LayoutGrid },
  { label: 'Perfil', path: '/profile', icon: User, isCenter: true },
  { label: 'Favoritos', path: '/favoritos', icon: Star },
  { label: 'IA', path: null, icon: Bot, isDead: true },
];

function NavItem({ item, active }) {
  const { ref, onPointerDown } = useLiquidRipple({ color: 'rgba(255,255,255,0.08)', duration: 400 });
  const Icon = item.icon;

  if (item.isDead) {
    const [balloon, setBalloon] = useState(null);
    const [anchor, setAnchor] = useState({ x: 0, bottom: 0 });
    const btnRef = useRef(null);
    const timerRef = useRef(null);

    const handleClick = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const frase = FRASES_IA[Math.floor(Math.random() * FRASES_IA.length)];
      if (btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        // Centraliza o balão acima do próprio ícone do robô
        setAnchor({ x: r.left + r.width / 2, bottom: window.innerHeight - r.top + 12 });
      }
      setBalloon(frase);
      timerRef.current = setTimeout(() => setBalloon(null), 2500);
    }, []);

    return (
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        className="flex-1 h-full flex items-center justify-center relative outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {createPortal(
          <AnimatePresence>
            {balloon && (
              <motion.div
                key={balloon}
                initial={{ opacity: 0, y: 8, scale: 0.92, x: '-50%' }}
                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                exit={{ opacity: 0, y: 4, scale: 0.92, x: '-50%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                style={{ left: anchor.x, bottom: anchor.bottom }}
                className="fixed whitespace-nowrap rounded-2xl bg-popover border border-border px-4 py-2 text-sm font-medium text-popover-foreground shadow-xl pointer-events-none z-[9999]"
              >
                {balloon}
                <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-popover border-b border-r border-border rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden">
          <Icon
            className="w-6 h-6 transition-all duration-300 relative z-10 text-foreground/70"
            fill="none"
            strokeWidth={2.4}
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
            'absolute inset-0 rounded-2xl bg-gold/15 transition-opacity duration-300 ease-out',
            active ? 'opacity-100' : 'opacity-0'
          )}
        />

        <Icon
          className={cn(
            'w-6 h-6 transition-all duration-300 relative z-10',
            active ? 'text-gold' : 'text-foreground/70 hover:text-foreground'
          )}
          fill={active ? 'currentColor' : 'none'}
          strokeWidth={active ? 2.6 : 2.4}
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
            ? 'bg-gold/15 shadow-sm ring-2 ring-gold/60'
            : 'bg-foreground/10 shadow-sm hover:bg-foreground/15 ring-1 ring-foreground/10'
        )}
      >
        {user?.profile_picture_url ? (
          <CachedImage
            src={user.profile_picture_url}
            cacheKey={`avatar_${user.email}`}
            alt="Perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <User
            className={cn(
              'w-6 h-6 transition-all duration-300',
              active ? 'text-gold' : 'text-foreground/70'
            )}
            fill={active ? 'currentColor' : 'none'}
            strokeWidth={active ? 2.6 : 2.4}
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
      (path !== '/home' && location.pathname.startsWith(path))
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
          'bg-card/80 backdrop-blur-3xl border border-border shadow-[0_20px_60px_rgba(0,0,0,0.25)]'
        )}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent rounded-full" />

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