import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/lib/i18n';

// Filtros de categoria — "Todos" mostra tudo; "Em breve" mostra os ainda não
// lançados; os demais filtram por tipo.
const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ia', label: 'IA' },
  { id: 'jogos', label: 'Jogos' },
  { id: 'embreve', label: 'Em breve' },
];

// Serviços disponíveis, cada um marcado com a sua categoria. `status: 'soon'`
// marca os que ainda não foram lançados.
const APPS = [
  { id: 'armor', nome: 'Projeto Armor', desc: 'Jogo de ação e sobrevivência com gravidade.', cat: 'jogos', logo: '/apps/armor-logo.webp', status: 'live', url: '/jogo' },
  { id: 'fkw', nome: 'Free Kick World', desc: 'Jogo de futebol: mire e cobre a falta perfeita.', cat: 'jogos', logo: '/apps/fkw-logo.webp', status: 'soon' },
  { id: 'sexta', nome: 'Sexta-feira', desc: 'Sua assistente de inteligência artificial.', cat: 'ia', logo: '/apps/sexta-logo.webp', status: 'soon' },
];

// Apps indisponíveis: aparecem na lista, mas clicar neles NÃO faz nada.
const BLOQUEADOS = new Set(['sexta', 'fkw']);

export default function Categorias() {
  const navigate = useNavigate();
  const t = useT();
  const [filtro, setFiltro] = useState('todos');

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
      </div>

      {/* LISTA DE SERVIÇOS */}
      <div className="flex-1 px-6 pt-6 pb-32 space-y-3">
        {appsVisiveis.map((app) => {
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
              className={`flex items-center gap-4 rounded-3xl bg-card border border-border transition-all overflow-hidden ${hero ? '' : 'p-4'} ${BLOQUEADOS.has(app.id) ? '' : 'active:scale-[0.98] cursor-pointer'}`}
            >
              <div className={hero
                ? 'w-20 self-stretch flex-shrink-0'
                : 'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white overflow-hidden'}>
                <img src={app.logo} alt={app.nome} className={`w-full h-full ${hero ? 'object-cover' : 'object-contain'}`} decoding="async" fetchpriority="high" />
              </div>
              <div className={`flex-1 min-w-0 ${hero ? 'py-4 pr-4' : ''}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-[17px] font-semibold text-foreground">{app.nome}</h3>
                  {app.status === 'soon' && (
                    <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
                      {t('Em breve')}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-[13px] leading-snug pr-2">{t(app.desc)}</p>
              </div>
            </div>
          );
        })}

        {appsVisiveis.length === 0 && (
          <p className="text-center text-muted-foreground text-sm pt-10">
            {t('Nenhum serviço nesta categoria ainda.')}
          </p>
        )}
      </div>

    </div>
  );
}
