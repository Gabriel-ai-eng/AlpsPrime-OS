import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, LogOut, LogIn } from 'lucide-react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { useT } from '@/lib/i18n';
import { CIRCULO, ESPIRAL, COIL, ONDA, RISCO } from './rostoSextaKeyframes';

gsap.registerPlugin(MorphSVGPlugin);

// ============================================================
// ROSTO DA SEXTA-FEIRA — carinha em neon vetorial que se DEFORMA de
// verdade entre "feliz" (padrão) e "triste", usando GSAP MorphSVGPlugin.
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
// SAÍDA / ENTRADA ("Sair"/"Entrar") — o anel do rosto é um `path` de 140
// pontos (o CIRCULO de rostoSextaKeyframes, visualmente idêntico ao antigo
// <circle>). O botão "Sair" toca um timeline que desenrola esse fio de luz
// como no sprite sheet: CIRCULO → ESPIRAL → COIL → ONDA → RISCO (some para
// a direita), enquanto os olhos/boca se dissolvem. "Entrar" é o MESMO
// timeline tocado ao contrário (reverse), então a IA volta exatamente como
// saiu. Nada disso altera a aparência em repouso.
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

export default function RostoSexta({ onVoltar }) {
  const svgRef = useRef(null);
  const animandoRef = useRef(false);   // morph feliz/triste em andamento
  const saidaTlRef = useRef(null);     // timeline de saída/entrada
  const saidaAtivaRef = useRef(false); // saída/entrada em andamento
  const [estado, setEstado] = useState('feliz');
  const [saiu, setSaiu] = useState(false);
  const t = useT();

  // Monta o timeline da saída uma vez (fica pausado no início = rosto presente).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(svg);
      const est = q('.estela');          // anel (3 camadas de neon)
      const feats = q('.exit-feature');  // olhos + boca (9 = 3 traços × 3 camadas)
      const grupo = q('.rosto-grupo');   // wrapper p/ o "respiro" da saída
      const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const k = reduz ? 0 : 1; // encolhe as durações se o usuário pediu menos animação
      const mo = (shape) => ({ shape, type: 'linear', shapeIndex: 0 });

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => { saidaAtivaRef.current = false; setSaiu(true); },
        onReverseComplete: () => { saidaAtivaRef.current = false; setSaiu(false); },
      });

      // "respiro" sutil do rosto antes de desenrolar (frames 1–5 do sprite)
      tl.to(grupo, { scale: 1.04, duration: 0.35 * k, ease: 'sine.out', svgOrigin: '470 813' }, 0)
        .to(grupo, { scale: 1.0, duration: 1.85 * k, ease: 'sine.inOut', svgOrigin: '470 813' }, 0.35 * k);

      // olhos e boca se dissolvem enquanto o anel começa a desenrolar
      tl.to(feats, { opacity: 0, duration: 0.4 * k, ease: 'power1.in' }, 0.2 * k);

      // o fio de luz se rearranja: círculo → espiral → coil+cauda → onda → risco
      tl.to(est, { morphSVG: mo(ESPIRAL), duration: 0.6 * k, ease: 'power1.inOut' }, 0.3 * k)
        .to(est, { morphSVG: mo(COIL),    duration: 0.5 * k, ease: 'power1.inOut' }, `>${-0.05 * k}`)
        .to(est, { morphSVG: mo(ONDA),    duration: 0.5 * k, ease: 'power1.inOut' }, `>${-0.05 * k}`)
        .to(est, { morphSVG: mo(RISCO),   duration: 0.6 * k, ease: 'power2.in'   }, `>${-0.05 * k}`);

      // o risco de luz se apaga ao voar para a direita
      tl.to(est, { opacity: 0, duration: 0.5 * k, ease: 'power1.in' }, `>${-0.55 * k}`);

      saidaTlRef.current = tl;
    }, svgRef);
    return () => ctx.revert();
  }, []);

  const alternar = useCallback(() => {
    if (animandoRef.current || saidaAtivaRef.current || saiu || !svgRef.current) return;
    const alvo = estado === 'feliz' ? TRISTE : FELIZ;
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
    setEstado((e) => (e === 'feliz' ? 'triste' : 'feliz'));
  }, [estado, saiu]);

  // "Sair" toca o timeline; "Entrar" toca o MESMO timeline ao contrário.
  const sairEntrar = useCallback(() => {
    const tl = saidaTlRef.current;
    if (!tl || saidaAtivaRef.current || animandoRef.current) return;
    saidaAtivaRef.current = true;
    if (!saiu) tl.play();
    else tl.reverse();
  }, [saiu]);

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

        {/* rosto (wrapper p/ o "respiro" da saída) */}
        <g className="rosto-grupo">
          {/* HALO difuso */}
          <g filter="url(#rs-haloBig)" opacity="0.42" fill="none" stroke="#edcca2" strokeLinecap="round" strokeLinejoin="round">
            <path className="estela" d={CIRCULO} strokeWidth="11"/>
            <path className="f-olhoDireitoIA exit-feature" d={FELIZ.olhoDireitoIA} strokeWidth="7"/>
            <path className="f-olhoEsquerdoIA exit-feature" d={FELIZ.olhoEsquerdoIA} strokeWidth="7"/>
            <path className="f-boca exit-feature" d={FELIZ.boca} strokeWidth="9"/>
          </g>
          {/* brilho MÉDIO */}
          <g filter="url(#rs-haloSoft)" fill="none" stroke="url(#rs-gold)" strokeLinecap="round" strokeLinejoin="round">
            <path className="estela" d={CIRCULO} strokeWidth="5.5"/>
            <path className="f-olhoDireitoIA exit-feature" d={FELIZ.olhoDireitoIA} strokeWidth="4"/>
            <path className="f-olhoEsquerdoIA exit-feature" d={FELIZ.olhoEsquerdoIA} strokeWidth="4"/>
            <path className="f-boca exit-feature" d={FELIZ.boca} strokeWidth="4.6"/>
          </g>
          {/* NÚCLEO nítido */}
          <g fill="none" stroke="#fffdf6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
            <path className="estela" d={CIRCULO} strokeWidth="2.4"/>
            <path className="f-olhoDireitoIA exit-feature" d={FELIZ.olhoDireitoIA} strokeWidth="1.8"/>
            <path className="f-olhoEsquerdoIA exit-feature" d={FELIZ.olhoEsquerdoIA} strokeWidth="1.8"/>
            <path className="f-boca exit-feature" d={FELIZ.boca} strokeWidth="2.2"/>
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

      {/* Botões abaixo do rosto: alternar expressão + sair/entrar */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3"
        style={{ top: '66%' }}
      >
        <button
          onClick={alternar}
          disabled={saiu}
          aria-label={t('Alternar expressão')}
          className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white/70 backdrop-blur px-5 py-3 text-[15px] font-medium text-black/70 shadow-sm active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
        >
          <span
            className="w-2.5 h-2.5 rounded-full transition-colors"
            style={{ backgroundColor: estado === 'feliz' ? '#e6b64c' : '#9db2d4' }}
          />
          {estado === 'feliz' ? t('Feliz') : t('Triste')}
        </button>

        {/* Rótulos literais (o dicionário mapeia "Sair"/"Entrar" para o sentido
            de autenticação — aqui é sair/voltar do rosto, então não usamos t()). */}
        <button
          onClick={sairEntrar}
          aria-label={saiu ? 'Entrar' : 'Sair'}
          className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 backdrop-blur px-5 py-3 text-[15px] font-medium text-black/70 shadow-sm active:scale-95 transition"
        >
          {saiu ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
          {saiu ? 'Entrar' : 'Sair'}
        </button>
      </div>
    </div>
  );

  return createPortal(conteudo, document.body);
}
