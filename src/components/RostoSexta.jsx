import React, { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { useT } from '@/lib/i18n';

gsap.registerPlugin(MorphSVGPlugin);

// ============================================================
// ROSTO DA SEXTA-FEIRA — carinha em neon vetorial que se DEFORMA de
// verdade entre "feliz" (padrão) e "triste", usando GSAP MorphSVGPlugin.
// Cada traço (olho esquerdo, olho direito, boca) existe em 3 camadas de
// neon (halo difuso, brilho médio e núcleo nítido). O morph anima o
// atributo `d` das três camadas ao mesmo tempo, então o brilho acompanha
// a deformação. Os `d` iniciais no JSX são os da carinha FELIZ; a partir
// daí o GSAP passa a controlar os caminhos.
// ============================================================

// viewBox 941x1672 · rosto centrado em (470,813), raio 193.
const FELIZ = {
  olhoE: 'M 398 740 C 411.8 740 423 757.9 423 780 C 423 802.1 411.8 820 398 820 C 384.2 820 373 802.1 373 780 C 373 757.9 384.2 740 398 740 Z',
  olhoD: 'M 506 795 Q 546 753 586 794',
  boca:  'M 393 882 Q 473 952 545 886',
};
const TRISTE = {
  // Os dois olhos são a mesma "lentinha" quase fechada (almôndega horizontal):
  // o olhoD é uma cópia do olhoE deslocada para a direita.
  olhoE: 'M 372 788 C 384 774 414 773 424 783 C 414 791 388 794 372 788 Z',
  olhoD: 'M 516 788 C 528 774 558 773 568 783 C 558 791 532 794 516 788 Z',
  boca:  'M 397 918 Q 473 872 549 918',
};

export default function RostoSexta({ onVoltar }) {
  const svgRef = useRef(null);
  const animandoRef = useRef(false);
  const [estado, setEstado] = useState('feliz');
  const t = useT();

  const alternar = useCallback(() => {
    if (animandoRef.current || !svgRef.current) return;
    const alvo = estado === 'feliz' ? TRISTE : FELIZ;
    const svg = svgRef.current;
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = reduz ? 0 : 0.72;

    animandoRef.current = true;
    // Cada feição tem 3 cópias (uma por camada de neon) — o morph atinge as
    // três de uma vez para o brilho deformar junto com o traço.
    gsap.to(svg.querySelectorAll('.f-olhoE'), {
      duration: dur * 0.85, morphSVG: alvo.olhoE, ease: 'power2.inOut',
    });
    gsap.to(svg.querySelectorAll('.f-olhoD'), {
      duration: dur * 0.85, morphSVG: alvo.olhoD, ease: 'power2.inOut',
    });
    gsap.to(svg.querySelectorAll('.f-boca'), {
      duration: dur, morphSVG: alvo.boca, ease: reduz ? 'none' : 'back.out(1.6)',
      onComplete: () => { animandoRef.current = false; },
    });
    setEstado((e) => (e === 'feliz' ? 'triste' : 'feliz'));
  }, [estado]);

  const conteudo = (
    <div className="fixed inset-0 z-[999999] bg-[#f1ece5] overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 941 1672"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full select-none"
      >
        <defs>
          <linearGradient id="rs-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6f2ec"/>
            <stop offset="0.5" stopColor="#efe9e3"/>
            <stop offset="0.72" stopColor="#f1ebe4"/>
            <stop offset="1" stopColor="#eae4df"/>
          </linearGradient>
          <radialGradient id="rs-top" cx="0.5" cy="0.04" r="0.75">
            <stop offset="0" stopColor="#fffdf7" stopOpacity="0.95"/>
            <stop offset="0.35" stopColor="#fbf5ec" stopOpacity="0.45"/>
            <stop offset="1" stopColor="#fbf5ec" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="rs-vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.62" stopColor="#000000" stopOpacity="0"/>
            <stop offset="1" stopColor="#cabfad" stopOpacity="0.10"/>
          </radialGradient>
          <radialGradient id="rs-horiz" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff7ea" stopOpacity="0.85"/>
            <stop offset="1" stopColor="#fff7ea" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="rs-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffef9"/>
            <stop offset="0.5" stopColor="#f7e4cc"/>
            <stop offset="1" stopColor="#f0d6b8"/>
          </linearGradient>
          <filter id="rs-haloBig" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"/></filter>
          <filter id="rs-haloSoft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2"/></filter>
          <filter id="rs-blurLine" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14"/></filter>
        </defs>

        {/* fundo */}
        <rect width="941" height="1672" fill="url(#rs-bg)"/>
        <rect width="941" height="1672" fill="url(#rs-top)"/>
        <ellipse cx="470" cy="1200" rx="430" ry="46" fill="url(#rs-horiz)" filter="url(#rs-blurLine)"/>
        <rect x="120" y="1196" width="700" height="6" rx="3" fill="#fff8ec" opacity="0.5" filter="url(#rs-haloSoft)"/>
        <rect width="941" height="1672" fill="url(#rs-vig)"/>

        {/* HALO difuso */}
        <g filter="url(#rs-haloBig)" opacity="0.42" fill="none" stroke="#edcca2" strokeLinecap="round">
          <circle cx="470" cy="813" r="193" strokeWidth="11"/>
          <path className="f-olhoE" d={FELIZ.olhoE} strokeWidth="7"/>
          <path className="f-olhoD" d={FELIZ.olhoD} strokeWidth="9"/>
          <path className="f-boca"  d={FELIZ.boca}  strokeWidth="9"/>
        </g>
        {/* brilho MÉDIO */}
        <g filter="url(#rs-haloSoft)" fill="none" stroke="url(#rs-gold)" strokeLinecap="round">
          <circle cx="470" cy="813" r="193" strokeWidth="5.5"/>
          <path className="f-olhoE" d={FELIZ.olhoE} strokeWidth="4"/>
          <path className="f-olhoD" d={FELIZ.olhoD} strokeWidth="4.6"/>
          <path className="f-boca"  d={FELIZ.boca}  strokeWidth="4.6"/>
        </g>
        {/* NÚCLEO nítido */}
        <g fill="none" stroke="#fffdf6" strokeLinecap="round" opacity="0.95">
          <circle cx="470" cy="813" r="193" strokeWidth="2.4"/>
          <path className="f-olhoE" d={FELIZ.olhoE} strokeWidth="1.8"/>
          <path className="f-olhoD" d={FELIZ.olhoD} strokeWidth="2.2"/>
          <path className="f-boca"  d={FELIZ.boca}  strokeWidth="2.2"/>
        </g>
      </svg>

      {/* Voltar */}
      <button
        onClick={onVoltar}
        aria-label={t('Voltar')}
        className="absolute top-6 left-5 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/[0.06] backdrop-blur-sm text-black/50 hover:text-black/80 active:scale-90 transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Alternar expressão — abaixo do rosto */}
      <button
        onClick={alternar}
        aria-label={t('Alternar expressão')}
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-full border border-black/10 bg-white/70 backdrop-blur px-6 py-3 text-[15px] font-medium text-black/70 shadow-sm active:scale-95 transition"
        style={{ top: '66%' }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full transition-colors"
          style={{ backgroundColor: estado === 'feliz' ? '#e6b64c' : '#9db2d4' }}
        />
        {estado === 'feliz' ? t('Feliz') : t('Triste')}
      </button>
    </div>
  );

  return createPortal(conteudo, document.body);
}
