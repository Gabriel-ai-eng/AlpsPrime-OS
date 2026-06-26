import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Grip, Star, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiquidRipple } from '@/lib/useLiquidRipple';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18n';
import { getPrefs } from '@/lib/appPrefs';
import CachedImage from '@/components/CachedImage';
import homeFilledUrl from '@/assets/icons/home-filled.png';
import homeOutlineUrl from '@/assets/icons/home-outline.png';

// Ícone da casinha = as artes oficiais (PNG) renderizadas como máscara CSS.
// Assim a silhueta é exatamente a das imagens, mas a cor vem de `currentColor`
// (ativo = dourado, inativo = foreground) e acompanha o tema claro/escuro.
// As duas artes ficam empilhadas e fazem cross-fade entre contorno e preenchido.
const MASK_BASE = {
  backgroundColor: 'currentColor',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
};

function CasaLayer({ url, visible }) {
  return (
    <span
      className="absolute inset-0 transition-opacity duration-300 ease-out"
      style={{
        ...MASK_BASE,
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        opacity: visible ? 1 : 0,
      }}
    />
  );
}

// Mantém a mesma interface dos ícones lucide (deriva o estado pelo prop `fill`),
// então os pontos de uso continuam idênticos.
function HomeIcon({ className, fill = 'none', style }) {
  const preenchido = fill && fill !== 'none';

  return (
    <span
      className={cn('relative inline-block', className)}
      style={style}
      aria-hidden="true"
    >
      <CasaLayer url={homeOutlineUrl} visible={!preenchido} />
      <CasaLayer url={homeFilledUrl} visible={preenchido} />
    </span>
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
  const t = useT();
  const Icon = item.icon;

  if (item.isDead) {
    const [balloon, setBalloon] = useState(null);
    const [anchor, setAnchor] = useState({ x: 0, bottom: 0 });
    const btnRef = useRef(null);
    const timerRef = useRef(null);

    const handleClick = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const frase = t(FRASES_IA[Math.floor(Math.random() * FRASES_IA.length)]);
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
  const t = useT();

  const [isVisible, setIsVisible] = useState(true);
  const [navStyle, setNavStyle] = useState(() => getPrefs().navbar_style || 'floating');
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

  // Reflete na hora a escolha "flutuante / fixa" feita nas Configurações.
  useEffect(() => {
    const onPrefChange = (e) => {
      if (e.detail?.key === 'navbar_style') {
        setNavStyle(e.detail.value || 'floating');
      }
    };
    window.addEventListener('alps:prefchange', onPrefChange);
    return () => window.removeEventListener('alps:prefchange', onPrefChange);
  }, []);

  const hideOnRoutes = ['/settings'];

  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  const isActive = (path) =>
    path !== null && (
      location.pathname === path ||
      (path !== '/home' && location.pathname.startsWith(path))
    );

  // Barra fixa: acoplada à base, largura total e borda no topo. Barra flutuante:
  // "pílula" centralizada com margem. Em ambos os casos a barra desliza para
  // baixo e some ao rolar a tela para baixo (mesma lógica de y/opacity).
  const isFixedBar = navStyle === 'fixed';

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 inset-x-0 z-50 pointer-events-none',
        !isFixedBar && 'px-4'
      )}
      aria-label={t('Navegação')}
      style={isFixedBar ? undefined : { paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
    >
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : 120,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 28, mass: 0.8 }}
        className={cn(
          'relative overflow-hidden pointer-events-auto bg-card/80 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)]',
          isFixedBar
            ? 'w-full border-t border-border'
            : 'mx-auto max-w-sm h-[64px] rounded-[2rem] border border-border'
        )}
        style={
          isFixedBar
            ? { willChange: 'transform, opacity', paddingBottom: 'env(safe-area-inset-bottom)' }
            : { willChange: 'transform, opacity' }
        }
      >
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent rounded-full" />

        <div className="relative max-w-sm mx-auto h-[64px] flex items-center justify-around px-2 z-10">
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