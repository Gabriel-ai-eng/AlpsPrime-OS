import React from 'react';
import { Gamepad2, Grip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/lib/i18n';
import { useBetaFeatures } from '@/lib/appPrefs';

// Sexta-feira não aparece aqui — só é acessível pelo bloco dela em Categorias.
const APPS = [
  { id: 'wonderbound', nome: 'Wonderbound', desc: 'Jogo de ação e sobrevivência com gravidade.', icon: Gamepad2, corIcone: 'text-blue-400', bgIcone: 'bg-blue-500/10' },
];

// Apps indisponíveis: só ficam acessíveis para quem ativou "Recursos beta".
const BLOQUEADOS = new Set();

export default function Todos() {
  const navigate = useNavigate();
  const t = useT();
  const betaAtivo = useBetaFeatures();
  const clicavel = (app) => !BLOQUEADOS.has(app.id) || betaAtivo;

  return (
    <div className="w-full min-h-screen bg-background text-foreground font-sans overflow-x-hidden flex flex-col">

      {/* HEADER */}
      <div className="pt-12 pb-6 px-6 sticky top-0 z-20 bg-white backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
            <Grip className="w-5 h-5 text-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('Todos os Apps')}</h1>
        </div>
      </div>

      {/* LISTA DE APPS */}
      <div className="flex-1 px-6 pt-6 pb-32 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {APPS.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              onClick={() => {
                if (BLOQUEADOS.has(app.id)) return;
                navigate('/home');
              }}
              className={`flex items-center gap-4 p-4 rounded-3xl bg-card border border-border shadow-sm transition-all ${clicavel(app) ? 'active:scale-[0.98] cursor-pointer' : ''}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${app.bgIcone}`}>
                <Icon className={`w-7 h-7 ${app.corIcone}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-foreground mb-0.5">{app.nome}</h3>
                <p className="text-muted-foreground text-[13px] leading-snug pr-4">{t(app.desc)}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
