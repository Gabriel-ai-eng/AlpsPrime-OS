import React, { useEffect, useState } from 'react';
import { Smartphone, Apple, MonitorSmartphone, Share, Plus, MoreVertical, Bookmark, ChevronDown } from 'lucide-react';
import { LOGO_URL } from '@/lib/branding';
import { cn } from '@/lib/utils';

/**
 * Card de "Atalho na tela inicial" — sem PWA.
 * Mostra instruções por sistema operacional (iOS, Android, Desktop)
 * para o usuário criar um atalho/favorito que abre a Sexta-feira.
 */
export default function InstallShortcutCard() {
  const [os, setOs] = useState('android');

  useEffect(() => {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) setOs('ios');
    else if (/Android/i.test(ua)) setOs('android');
    else setOs('desktop');
  }, []);

  return (
    <div className="space-y-3">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/8 via-transparent to-transparent p-5">
        <div className="absolute -top-20 -right-16 w-56 h-56 bg-gold/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <img
            src={LOGO_URL}
            alt="Sexta-feira"
            className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-gold/30 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">
              Instalação como app
            </p>
            <h3 className="font-display text-lg leading-tight mb-1">
              Instale o <span className="gold-gradient italic">app oficial</span> no seu dispositivo
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Abra como um app, sem barra do navegador, direto da sua tela inicial.
            </p>
            <p className="text-[10px] text-muted-foreground/80 mt-1.5 leading-relaxed">
              Instalação 100% segura, feita pelo próprio navegador (PWA). Não baixa arquivos no seu aparelho.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl border border-border bg-background">
        <TabButton active={os === 'ios'} onClick={() => setOs('ios')} icon={Apple} label="iPhone" />
        <TabButton active={os === 'android'} onClick={() => setOs('android')} icon={Smartphone} label="Android" />
        <TabButton active={os === 'desktop'} onClick={() => setOs('desktop')} icon={MonitorSmartphone} label="Computador" />
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-border bg-background p-4 space-y-3">
        {os === 'ios' && (
          <>
            <p className="text-xs text-muted-foreground">
              No <strong className="text-foreground">Safari</strong>, em 3 passos:
            </p>
            <Step n={1} icon={Share} text={<>Toque no botão <strong className="text-foreground">Compartilhar</strong> na barra inferior</>} />
            <Step n={2} icon={Plus} text={<>Role e escolha <strong className="text-foreground">Adicionar à Tela de Início</strong></>} />
            <Step n={3} icon={Bookmark} text={<>Confirme com <strong className="text-foreground">Adicionar</strong> no canto superior direito</>} />
          </>
        )}

        {os === 'android' && (
          <>
            <p className="text-xs text-muted-foreground">
              No <strong className="text-foreground">Chrome</strong>, em 3 passos:
            </p>
            <Step n={1} icon={MoreVertical} text={<>Toque no menu <strong className="text-foreground">⋮</strong> no canto superior direito</>} />
            <Step n={2} icon={Plus} text={<>Escolha <strong className="text-foreground">Instalar app</strong> ou <strong className="text-foreground">Adicionar à tela inicial</strong></>} />
            <Step n={3} icon={Bookmark} text={<>Confirme tocando em <strong className="text-foreground">Instalar</strong></>} />
          </>
        )}

        {os === 'desktop' && (
          <>
            <p className="text-xs text-muted-foreground">
              No <strong className="text-foreground">computador</strong>, salve como favorito ou crie um atalho:
            </p>
            <Step n={1} icon={Bookmark} text={<>Pressione <strong className="text-foreground">Ctrl + D</strong> (Windows) ou <strong className="text-foreground">⌘ + D</strong> (Mac) para favoritar</>} />
            <Step n={2} icon={MoreVertical} text={<>Ou no menu do navegador, escolha <strong className="text-foreground">Salvar e compartilhar → Criar atalho</strong></>} />
            <Step n={3} icon={ChevronDown} text={<>Arraste a aba para a área de trabalho para um atalho rápido</>} />
          </>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        Instalação segura via navegador (PWA). Você pode desinstalar a qualquer momento.
      </p>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-medium transition-colors',
        active
          ? 'bg-gold/10 text-gold border border-gold/30'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function Step({ n, icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
        {n}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-1">
        <Icon className="w-4 h-4 text-gold flex-shrink-0" />
        <span>{text}</span>
      </div>
    </div>
  );
}