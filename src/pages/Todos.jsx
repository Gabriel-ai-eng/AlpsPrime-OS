import React from 'react';
import { Sparkles, Gamepad2, Palette, Grip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const APPS = [
  { id: 'sexta', nome: 'Sexta-feira', desc: 'Sua assistente de inteligência artificial.', icon: Sparkles, corIcone: 'text-[#C9A24F]', bgIcone: 'bg-[#C9A24F]/10' },
  { id: 'titan', nome: 'Titan', desc: 'Jogo de ação e sobrevivência com gravidade.', icon: Gamepad2, corIcone: 'text-blue-400', bgIcone: 'bg-blue-500/10' },
  { id: 'vivart', nome: 'Vivart', desc: 'Estúdio de criação e galeria visual.', icon: Palette, corIcone: 'text-purple-400', bgIcone: 'bg-purple-500/10' },
];

export default function Todos() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col">
      
      {/* HEADER */}
      <div className="pt-12 pb-6 px-6 sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Grip className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Todos os Apps</h1>
        </div>
      </div>

      {/* LISTA DE APPS */}
      <div className="flex-1 px-6 pt-6 pb-32 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {APPS.map((app) => {
          const Icon = app.icon;
          return (
            <div 
              key={app.id}
              onClick={() => navigate('/home')} // Por enquanto, volta pra Home
              className="flex items-center gap-4 p-4 rounded-3xl bg-[#111111] border border-white/5 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${app.bgIcone}`}>
                <Icon className={`w-7 h-7 ${app.corIcone}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-white mb-0.5">{app.nome}</h3>
                <p className="text-[#8E8E93] text-[13px] leading-snug pr-4">{app.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
