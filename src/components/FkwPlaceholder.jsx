import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { useT } from '@/lib/i18n';

// ============================================================
// FREE KICK WORLD — ainda não tem jogo implementado; isto é um destino
// simples para quem já tem acesso antecipado via "Recursos beta" (em vez de
// cair numa tela em branco ao tocar no card). Quando o jogo em si existir,
// troca-se este componente pela experiência real.
// ============================================================
export default function FkwPlaceholder({ onVoltar }) {
  const t = useT();

  const conteudo = (
    <div className="fixed inset-0 z-[999999] bg-black">
      <img
        src="/apps/fkw-hero.webp"
        alt="Free Kick World"
        draggable="false"
        className="absolute inset-0 w-full h-full object-cover select-none opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

      <button
        onClick={onVoltar}
        aria-label={t('Voltar')}
        className="absolute top-6 left-5 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:text-white active:scale-90 transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-6 pb-16 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
          {t('Acesso antecipado')}
        </span>
        <h1 className="text-2xl font-semibold text-white">{t('Free Kick World')}</h1>
        <p className="text-sm text-white/60 max-w-xs">
          {t('O jogo ainda está em construção. Como testador beta, você será um dos primeiros a jogar assim que ele estiver pronto.')}
        </p>
      </div>
    </div>
  );

  return createPortal(conteudo, document.body);
}
