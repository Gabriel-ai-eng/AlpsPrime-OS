import React, { useState } from 'react';
import { Sparkles, Gamepad2, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Filtros de categoria — "Todos" mostra tudo; os demais filtram por tipo.
const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ia', label: 'IA' },
  { id: 'jogos', label: 'Jogos' },
  { id: 'design', label: 'Design' },
];

// Serviços disponíveis, cada um marcado com a sua categoria.
const APPS = [
  { id: 'sexta', nome: 'Sexta-feira', desc: 'Sua assistente de inteligência artificial.', cat: 'ia', icon: Sparkles, corIcone: 'text-[#C9A24F]', bgIcone: 'bg-[#C9A24F]/10' },
  { id: 'titan', nome: 'Titan', desc: 'Jogo de ação e sobrevivência com gravidade.', cat: 'jogos', icon: Gamepad2, corIcone: 'text-blue-400', bgIcone: 'bg-blue-500/10' },
  { id: 'vivart', nome: 'Vivart', desc: 'Estúdio de criação e galeria visual.', cat: 'design', icon: Palette, corIcone: 'text-purple-400', bgIcone: 'bg-purple-500/10' },
];

export default function Categorias() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('todos');

  const appsVisiveis = filtro === 'todos' ? APPS : APPS.filter((a) => a.cat === filtro);

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col">

      {/* HEADER */}
      <div className="pt-12 pb-5 px-6 sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
        <p className="text-[#8E8E93] text-[14px] mt-1">Escolha uma categoria para explorar.</p>

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
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-[#8E8E93] border border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTA DE SERVIÇOS */}
      <div className="flex-1 px-6 pt-6 pb-32 space-y-3">
        {appsVisiveis.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              onClick={() => navigate('/home')}
              className="flex items-center gap-4 p-4 rounded-3xl bg-[#1C1C1E]/50 border border-white/5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${app.bgIcone}`}>
                <Icon className={`w-7 h-7 ${app.corIcone}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-semibold text-white mb-0.5">{app.nome}</h3>
                <p className="text-[#8E8E93] text-[13px] leading-snug pr-2">{app.desc}</p>
              </div>
            </div>
          );
        })}

        {appsVisiveis.length === 0 && (
          <p className="text-center text-[#8E8E93] text-sm pt-10">
            Nenhum serviço nesta categoria ainda.
          </p>
        )}
      </div>

    </div>
  );
}
