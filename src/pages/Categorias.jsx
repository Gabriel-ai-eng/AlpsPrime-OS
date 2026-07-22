import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, GalleryVerticalEnd, Grid3x3, Star } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useFavorites } from '@/lib/useFavorites';
import { APPS, BLOQUEADOS } from '@/lib/apps';

// Ícone de cronômetro (selo "em breve") recriado em SVG — corpo sólido,
// coroa no topo, botão lateral e o mostrador em forma de "fatia" (ponteiro
// varrendo do topo até por volta das 10h) com o pivô central, igual ao
// ícone de referência.
function TimerIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="8.25" y="2" width="7.5" height="3.6" rx="1.8" fill="currentColor" />
      <g transform="rotate(45 18 7.2)">
        <rect x="14.7" y="5.5" width="6.6" height="3.4" rx="1.7" fill="currentColor" />
      </g>
      <circle cx="12" cy="13.8" r="8.8" fill="currentColor" />
      <path d="M12,13.8 L12,5 A8.8,8.8 0 0,0 4.81,9.65 Z" className="fill-black/60" />
      <circle cx="12" cy="13.8" r="2.3" className="fill-black/60" />
    </svg>
  );
}

// Filtros de categoria — "Todos" mostra tudo; "Em breve" mostra os ainda não
// lançados; os demais filtram por tipo.
const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ia', label: 'IA' },
  { id: 'jogos', label: 'Jogos' },
  { id: 'embreve', label: 'Em breve' },
];

// Modos de exibição da lista abaixo — "Lista", "Cards grandes" e "Grade"
// já estão implementados (ver render abaixo).
const MODOS_VISUAIS = [
  { id: 'lista', label: 'Lista', icon: List },
  { id: 'cards', label: 'Cards grandes', icon: GalleryVerticalEnd },
  { id: 'grade', label: 'Grade', icon: Grid3x3 },
];

// Serviços disponíveis (`APPS`/`BLOQUEADOS` vêm de `@/lib/apps`, compartilhado
// com a tela de Favoritos). `status: 'soon'` marca os que ainda não foram
// lançados. `logoQuadrado` é a arte própria pro modo "Cards grandes" (card
// quadrado, edge-to-edge, já vem enquadrada certa — nada de recortar o `logo`
// retangular usado na Lista).

// Modo de exibição escolhido fica salvo no aparelho — ao recarregar a
// página, continua na mesma opção (lista, cards grandes ou grade).
const MODO_VISUAL_KEY = 'sf_categorias_modo_visual';
const IDS_MODOS_VALIDOS = new Set(MODOS_VISUAIS.map((m) => m.id));

function lerModoVisualSalvo() {
  try {
    const salvo = localStorage.getItem(MODO_VISUAL_KEY);
    return IDS_MODOS_VALIDOS.has(salvo) ? salvo : 'lista';
  } catch {
    return 'lista';
  }
}

export default function Categorias() {
  const navigate = useNavigate();
  const t = useT();
  const [filtro, setFiltro] = useState('todos');
  const [modoVisual, setModoVisual] = useState(lerModoVisualSalvo);
  const { isFavorite, toggleFavorite } = useFavorites();

  const selecionarModoVisual = (id) => {
    setModoVisual(id);
    try { localStorage.setItem(MODO_VISUAL_KEY, id); } catch {}
  };

  const appsVisiveis =
    filtro === 'todos' ? APPS
    : filtro === 'embreve' ? APPS.filter((a) => a.status === 'soon')
    : APPS.filter((a) => a.cat === filtro);

  return (
    <div className="w-full min-h-screen bg-background text-foreground font-sans overflow-x-hidden flex flex-col">

      {/* HEADER */}
      <div className="pt-4 pb-5 px-6 sticky top-0 z-20 bg-white backdrop-blur-xl border-b border-border">
        <h1 className="text-2xl font-semibold tracking-tight">{t('Categorias')}</h1>
        <p className="text-muted-foreground text-[14px] mt-1">{t('Escolha uma categoria para explorar.')}</p>

        {/* FILTROS */}
        <div className="flex gap-2 mt-5 overflow-x-auto -mx-6 px-6 pb-1 scrollbar-none">
          {FILTROS.map((f) => {
            const ativo = filtro === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[14px] font-medium transition-all active:scale-95 ${
                  ativo
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground border border-border hover:text-foreground hover:bg-muted/70'
                }`}
              >
                {t(f.label)}
              </button>
            );
          })}
        </div>

        {/* MODO DE EXIBIÇÃO */}
        <div className="flex gap-2 mt-3">
          {MODOS_VISUAIS.map((m) => {
            const ativo = modoVisual === m.id;
            const Icone = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => selecionarModoVisual(m.id)}
                aria-label={t(m.label)}
                title={t(m.label)}
                className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all active:scale-95 ${
                  ativo
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-muted text-muted-foreground border-border hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <Icone className="w-[18px] h-[18px]" strokeWidth={2.2} />
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTA DE SERVIÇOS */}
      <div className={`flex-1 px-6 pt-6 pb-32 ${modoVisual === 'grade' ? 'grid grid-cols-3 gap-3' : 'space-y-3'}`}>
        {modoVisual === 'cards' ? (
          appsVisiveis.map((app) => (
            <div
              key={app.id}
              onClick={() => {
                if (BLOQUEADOS.has(app.id)) return;
                if (app.url) { window.location.href = app.url; return; }
                navigate('/home');
              }}
              className={`relative aspect-square w-full rounded-3xl bg-card border border-border overflow-hidden transition-all ${BLOQUEADOS.has(app.id) ? '' : 'active:scale-[0.98] cursor-pointer'}`}
            >
              <img
                src={app.logoQuadrado || app.logo}
                alt={app.nome}
                className="w-full h-full object-cover"
                decoding="async"
                fetchpriority="high"
              />
              {app.status === 'soon' && (
                <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider text-gold bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full leading-none">
                  {t('Em breve')}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(app.id); }}
                aria-label={t('Adicionar aos favoritos')}
                title={isFavorite(app.id) ? t('Remover dos favoritos') : t('Adicionar aos favoritos')}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm active:scale-90 transition-transform"
              >
                <Star className={`w-4 h-4 ${isFavorite(app.id) ? 'text-gold fill-gold' : 'text-white'}`} />
              </button>
            </div>
          ))
        ) : modoVisual === 'grade' ? (
          appsVisiveis.map((app) => (
            <div
              key={app.id}
              onClick={() => {
                if (BLOQUEADOS.has(app.id)) return;
                if (app.url) { window.location.href = app.url; return; }
                navigate('/home');
              }}
              className={`relative aspect-square w-full rounded-3xl bg-card border border-border overflow-hidden transition-all ${BLOQUEADOS.has(app.id) ? '' : 'active:scale-[0.98] cursor-pointer'}`}
            >
              <img
                src={app.logoQuadrado || app.logo}
                alt={app.nome}
                className="w-full h-full object-cover"
                decoding="async"
                fetchpriority="high"
              />
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(app.id); }}
                aria-label={t('Adicionar aos favoritos')}
                title={isFavorite(app.id) ? t('Remover dos favoritos') : t('Adicionar aos favoritos')}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm active:scale-90 transition-transform"
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite(app.id) ? 'text-gold fill-gold' : 'text-white'}`} />
              </button>
            </div>
          ))
        ) : (
          appsVisiveis.map((app) => {
            // FKW, Projeto Armor e Sexta-feira são cards "hero": a arte ocupa
            // a altura inteira do card, colada na borda esquerda (sem padding).
            const hero = app.id === 'fkw' || app.id === 'armor' || app.id === 'sexta';
            return (
              <div
                key={app.id}
                onClick={() => {
                  if (BLOQUEADOS.has(app.id)) return;
                  if (app.url) { window.location.href = app.url; return; }
                  navigate('/home');
                }}
                className={`relative flex items-center gap-4 rounded-3xl bg-card border border-border transition-all overflow-hidden ${hero ? '' : 'p-4'} ${BLOQUEADOS.has(app.id) ? '' : 'active:scale-[0.98] cursor-pointer'}`}
              >
                <div className={hero
                  ? 'relative w-20 self-stretch flex-shrink-0'
                  : 'relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white overflow-hidden'}>
                  <img src={app.logo} alt={app.nome} className={`w-full h-full ${hero ? 'object-cover' : 'object-contain'}`} decoding="async" fetchpriority="high" />
                </div>
                <div className={`flex-1 min-w-0 ${hero ? 'py-4 pr-14' : 'pr-10'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[17px] font-semibold text-foreground">{app.nome}</h3>
                    {!hero && app.status === 'soon' && (
                      <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
                        {t('Em breve')}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-[13px] leading-snug pr-2">{t(app.desc)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(app.id); }}
                  aria-label={t('Adicionar aos favoritos')}
                  title={isFavorite(app.id) ? t('Remover dos favoritos') : t('Adicionar aos favoritos')}
                  className={`absolute z-10 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform ${hero ? 'top-3 right-3 bg-black/60 backdrop-blur-sm' : 'top-1/2 -translate-y-1/2 right-4 bg-muted border border-border'}`}
                >
                  <Star className={`w-4 h-4 ${isFavorite(app.id) ? 'text-gold fill-gold' : hero ? 'text-white' : 'text-muted-foreground'}`} />
                </button>
                {hero && app.status === 'soon' && (
                  <span className="absolute top-[50px] right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <TimerIcon className="w-4 h-4 text-white" />
                  </span>
                )}
              </div>
            );
          })
        )}

        {appsVisiveis.length === 0 && (
          <p className="text-center text-muted-foreground text-sm pt-10">
            {t('Nenhum serviço nesta categoria ainda.')}
          </p>
        )}
      </div>

    </div>
  );
}
