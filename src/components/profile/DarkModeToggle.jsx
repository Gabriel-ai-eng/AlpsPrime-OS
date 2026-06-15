import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/useTheme';

const LOTTIE_URL = 'https://media.base44.com/files/public/69e44004c1822ff0840cc105/e51398a60_Toogle.json';

export default function DarkModeToggle() {
  const { isDark, toggle } = useTheme();
  const lottieRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const res = await fetch(LOTTIE_URL);
      const lottieData = await res.json();

      if (!window.lottie) {
        await new Promise((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';
          s.onload = resolve;
          document.head.appendChild(s);
        });
      }

      if (cancelled || !lottieRef.current) return;

      const anim = window.lottie.loadAnimation({
        container: lottieRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: lottieData,
      });
      animRef.current = anim;
      anim.addEventListener('DOMLoaded', () => {
        anim.goToAndStop(isDark ? 80 : 0, true);
      });
    };

    init().catch(() => {});
    return () => {
      cancelled = true;
      animRef.current?.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = () => {
    const anim = animRef.current;
    if (anim) {
      if (!isDark) {
        anim.playSegments([20, 80], true);
      } else {
        anim.playSegments([120, 200], true);
      }
    }
    toggle();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px 20px',
        borderRadius: 24,
        background: isDark ? 'rgba(34,32,29,0.88)' : '#fffdf7',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(212,169,58,0.12)'}`,
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'background 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* Header — static sun icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={isDark ? '#e8d5b0' : '#b8860b'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'stroke 0.4s', flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: isDark ? '#e8d5b0' : '#7a6040',
            transition: 'color 0.4s',
          }}
        >
          Aparência
        </span>
      </div>

      {/* Title + Lottie toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{
            margin: 0, fontSize: 15, fontWeight: 600,
            color: isDark ? '#f0e6cc' : '#2d1f0e',
            transition: 'color 0.4s',
          }}>
            {isDark ? 'Modo Escuro ativado' : 'Modo Claro ativado'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9e8a6a' }}>
            {isDark
              ? 'Interface escura com visual elegante.'
              : 'Interface clara com visual moderno.'}
          </p>
        </div>

        {/* Lottie pill toggle */}
        <div
          ref={lottieRef}
          onClick={handleToggle}
          title={isDark ? 'Mudar para Claro' : 'Mudar para Escuro'}
          style={{
            flexShrink: 0,
            width: 64,
            height: 36,
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Claro / Escuro buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => { if (isDark) handleToggle(); }}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 12,
            border: !isDark ? '1.5px solid #d4b896' : '1.5px solid rgba(255,255,255,0.08)',
            background: !isDark ? '#fdf3e0' : 'transparent',
            color: !isDark ? '#b8860b' : isDark ? 'rgba(255,255,255,0.35)' : '#5a4a3a',
            fontWeight: 600, fontSize: 14,
            cursor: isDark ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          ☀️ Claro
        </button>
        <button
          onClick={() => { if (!isDark) handleToggle(); }}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 12,
            border: isDark ? '1.5px solid rgba(201,162,79,0.45)' : '1.5px solid rgba(0,0,0,0.08)',
            background: isDark ? 'rgba(201,162,79,0.10)' : 'transparent',
            color: isDark ? '#f0e6cc' : '#6b5a45',
            fontWeight: 600, fontSize: 14,
            cursor: !isDark ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          🌙 Escuro
        </button>
      </div>
    </div>
  );
}