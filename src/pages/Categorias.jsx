import React from 'react';
import { Sparkles, Gamepad2, Palette, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIAS = [
  {
    titulo: 'Inteligência Artificial',
    apps: [
      { id: 'sexta', nome: 'Sexta-feira', icon: Sparkles, corIcone: 'text-[#C9A24F]', bgIcone: 'bg-[#C9A24F]/10' }
    ]
  },
  {
    titulo: 'Jogos & Entretenimento',
    apps: [
      { id: 'titan', nome: 'Titan', icon: Gamepad2, corIcone: 'text-blue-400', bgIcone: 'bg-blue-500/10' }
    ]
  },
  {
    titulo: 'Criatividade & Design',
    apps: [
      { id: 'vivart', nome: 'Vivart', icon: Palette, corIcone: 'text-purple-400', bgIcone: 'bg-purple-500/10' }
    ]
  }
];

export default function Categorias() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col">
      
      {/* HEADER */}
      <div className="pt-12 pb-6 px-6 sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
        </div>
      </div>

      {/* LISTA DE CATEGORIAS */}
      <div className="flex-1 px-6 pt-6 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {CATEGORIAS.map((categoria, idx) => (
          <div key={idx}>
            <h2 className="text-[#8E8E93] text-[13px] font-semibold uppercase tracking-widest mb-4 ml-2">
              {categoria.titulo}
            </h2>
            <div className="space-y-3">
              {categoria.apps.map((app) => {
                const Icon = app.icon;
                return (
                  <div 
                    key={app.id}
                    onClick={() => navigate('/feed')} 
                    className="flex items-center gap-4 p-3 rounded-[24px] bg-[#1C1C1E]/50 border border-white/5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center flex-shrink-0 ${app.bgIcone}`}>
                      <Icon className={`w-6 h-6 ${app.corIcone}`} />
                    </div>
                    <span className="text-[16px] font-medium text-white">{app.nome}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
