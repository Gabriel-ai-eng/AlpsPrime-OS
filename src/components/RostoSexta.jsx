import React, { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { useT } from '@/lib/i18n';
import { CIRCULO } from './rostoSextaKeyframes';

gsap.registerPlugin(MorphSVGPlugin);

// ============================================================
// ROSTO DA SEXTA-FEIRA — carinha em neon vetorial que se DEFORMA de
// verdade entre "feliz", "triste" e "brava", usando GSAP MorphSVGPlugin.
// Cada traço (2 olhos + boca) existe em 3 camadas de neon (halo difuso,
// brilho médio e núcleo nítido). O morph anima o atributo `d` das três
// camadas ao mesmo tempo, então o brilho acompanha a deformação. Os `d`
// iniciais no JSX são os da carinha FELIZ; a partir daí o GSAP passa a
// controlar os caminhos.
//
// IMPORTANTE — "esquerdo"/"direito" é do PONTO DE VISTA DA PRÓPRIA IA (como
// se ela estivesse olhando para fora da tela), não de quem está vendo o
// rosto. Por isso fica espelhado: o olho DIREITO da IA aparece do lado
// ESQUERDO da tela, e o olho ESQUERDO da IA aparece do lado DIREITO da
// tela. Mantenha essa convenção em qualquer alteração futura.
//
// O único botão abaixo do rosto alterna a expressão em ciclo:
// feliz → triste → brava → feliz.
// ============================================================

// viewBox 941x1672 · rosto centrado em (470,813), raio 193.
const FELIZ = {
  olhoDireitoIA: 'M 398 740 C 411.8 740 423 757.9 423 780 C 423 802.1 411.8 820 398 820 C 384.2 820 373 802.1 373 780 C 373 757.9 384.2 740 398 740 Z', // lado esquerdo da tela
  olhoEsquerdoIA: 'M 542 740 C 555.8 740 567 757.9 567 780 C 567 802.1 555.8 820 542 820 C 528.2 820 517 802.1 517 780 C 517 757.9 528.2 740 542 740 Z', // lado direito da tela — mesmo oval aberto, espelhado
  boca:  'M 393 882 Q 473 952 545 886',
};
const TRISTE = {
  // Os dois olhos são a mesma "lentinha" quase fechada (almôndega horizontal):
  // olhoEsquerdoIA é uma cópia de olhoDireitoIA deslocada para o lado direito da tela.
  olhoDireitoIA: 'M 372 788 C 384 774 414 773 424 783 C 414 791 388 794 372 788 Z', // lado esquerdo da tela
  olhoEsquerdoIA: 'M 516 788 C 528 774 558 773 568 783 C 558 791 532 794 516 788 Z', // lado direito da tela
  boca:  'M 397 918 Q 473 872 549 918',
};
const BRAVA = {
  // Olhos inclinados formando um franzir ("\  /"): no olho da direita da IA
  // (lado esquerdo da tela) o canto de fora fica alto e o de dentro baixo;
  // no olho da esquerda da IA (lado direito da tela) é o espelho.
  olhoDireitoIA: 'M 373 766 C 387 768 414 782 423 792 C 410 790 385 778 373 766 Z', // lado esquerdo da tela ("\")
  olhoEsquerdoIA: 'M 517 792 C 528 782 553 768 567 766 C 553 778 530 790 517 792 Z', // lado direito da tela ("/")
  boca:  'M 397 916 Q 473 866 549 916',
};

// Ciclo do botão e o que cada estado mostra.
const ORDEM = ['feliz', 'triste', 'brava'];
const FORMAS = { feliz: FELIZ, triste: TRISTE, brava: BRAVA };
const COR_PONTO = { feliz: '#e6b64c', triste: '#9db2d4', brava: '#d46b5a' };
const ROTULO = { feliz: 'Feliz', triste: 'Triste', brava: 'Brava' };

export default function RostoSexta({ onVoltar }) {
  const svgRef = useRef(null);
  const animandoRef = useRef(false);   // morph de expressão em andamento
  const [estado, setEstado] = useState('feliz');
  const t = useT();

  const alternar = useCallback(() => {
    if (animandoRef.current || !svgRef.current) return;
    const proximo = ORDEM[(ORDEM.indexOf(estado) + 1) % ORDEM.length];
    const alvo = FORMAS[proximo];
    const svg = svgRef.current;
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = reduz ? 0 : 0.72;

    animandoRef.current = true;
    // Cada feição tem 3 cópias (uma por camada de neon) — o morph atinge as
    // três de uma vez para o brilho deformar junto com o traço.
    gsap.to(svg.querySelectorAll('.f-olhoDireitoIA'), {
      duration: dur * 0.85, morphSVG: alvo.olhoDireitoIA, ease: 'power2.inOut',
    });
    gsap.to(svg.querySelectorAll('.f-olhoEsquerdoIA'), {
      duration: dur * 0.85, morphSVG: alvo.olhoEsquerdoIA, ease: 'power2.inOut',
    });
    gsap.to(svg.querySelectorAll('.f-boca'), {
      duration: dur, morphSVG: alvo.boca, ease: reduz ? 'none' : 'back.out(1.6)',
      onComplete: () => { animandoRef.current = false; },
    });
    setEstado(proximo);
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

        {/* rosto */}
        <g className="rosto-grupo">
          {/* HALO difuso */}
          <g filter="url(#rs-haloBig)" opacity="0.42" fill="none" stroke="#edcca2" strokeLinecap="round" strokeLinejoin="round">
            <path className="estela" d={CIRCULO} strokeWidth="11"/>
            <path className="f-olhoDireitoIA" d={FELIZ.olhoDireitoIA} strokeWidth="7"/>
            <path className="f-olhoEsquerdoIA" d={FELIZ.olhoEsquerdoIA} strokeWidth="7"/>
            <path className="f-boca" d={FELIZ.boca} strokeWidth="9"/>
          </g>
          {/* brilho MÉDIO */}
          <g filter="url(#rs-haloSoft)" fill="none" stroke="url(#rs-gold)" strokeLinecap="round" strokeLinejoin="round">
            <path className="estela" d={CIRCULO} strokeWidth="5.5"/>
            <path className="f-olhoDireitoIA" d={FELIZ.olhoDireitoIA} strokeWidth="4"/>
            <path className="f-olhoEsquerdoIA" d={FELIZ.olhoEsquerdoIA} strokeWidth="4"/>
            <path className="f-boca" d={FELIZ.boca} strokeWidth="4.6"/>
          </g>
          {/* NÚCLEO nítido */}
          <g fill="none" stroke="#fffdf6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
            <path className="estela" d={CIRCULO} strokeWidth="2.4"/>
            <path className="f-olhoDireitoIA" d={FELIZ.olhoDireitoIA} strokeWidth="1.8"/>
            <path className="f-olhoEsquerdoIA" d={FELIZ.olhoEsquerdoIA} strokeWidth="1.8"/>
            <path className="f-boca" d={FELIZ.boca} strokeWidth="2.2"/>
          </g>
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

      {/* Botão abaixo do rosto: alternar expressão (feliz → triste → brava) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center"
        style={{ top: '66%' }}
      >
        <button
          onClick={alternar}
          aria-label={t('Alternar expressão')}
          className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white/70 backdrop-blur px-5 py-3 text-[15px] font-medium text-black/70 shadow-sm active:scale-95 transition"
        >
          <span
            className="w-2.5 h-2.5 rounded-full transition-colors"
            style={{ backgroundColor: COR_PONTO[estado] }}
          />
          {t(ROTULO[estado])}
        </button>
      </div>
    </div>
  );

  return createPortal(conteudo, document.body);
}
