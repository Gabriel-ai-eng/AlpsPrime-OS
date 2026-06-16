import React from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, User, Shield, ImagePlus, Info, ChevronRight } from 'lucide-react';

export default function Configuracoes({ onVoltar }) {
  
  const ItemConfig = ({ icon: Icon, titulo, subtitulo, cor }) => (
    <button className="w-full flex items-center justify-between p-4 bg-[#1C1C1E] first:rounded-t-2xl last:rounded-b-2xl border-b border-black/50 last:border-0 hover:bg-[#2C2C2E] transition-colors active:bg-[#3C3C3E]">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cor}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[15px] font-medium text-white">{titulo}</span>
          {subtitulo && <span className="text-[12px] text-[#8E8E93] mt-0.5">{subtitulo}</span>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-[#8E8E93]/50" />
    </button>
  );

  const conteudoApp = (
    <div className="fixed inset-0 z-[999999] flex flex-col bg-[#050505] text-white font-sans animate-in slide-in-from-right-8 duration-300">
      
      {/* HEADER */}
      <div className="flex-shrink-0 pt-12 pb-4 px-6 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-50">
        <button onClick={onVoltar} className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors outline-none">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <h2 className="text-[15px] font-medium tracking-wide">Configurações</h2>
        </div>
        <div className="w-5 h-5" />
      </div>

      {/* BODY CONFIGURAÇÕES */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        
        <h3 className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider ml-4 mb-2">Conta & Privacidade</h3>
        <div className="flex flex-col mb-8">
          <ItemConfig icon={User} titulo="Perfil do AlpsPrime-OS" subtitulo="Gerencie seus dados" cor="bg-blue-500" />
          <ItemConfig icon={Shield} titulo="Privacidade" subtitulo="As fotos são processadas localmente" cor="bg-green-500" />
        </div>

        <h3 className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider ml-4 mb-2">Motor Gráfico (IA)</h3>
        <div className="flex flex-col mb-8">
          <ItemConfig icon={ImagePlus} titulo="Qualidade de Renderização" subtitulo="Padrão (1:1 Cinematic)" cor="bg-[#C9A24F]" />
        </div>

        <h3 className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider ml-4 mb-2">Sobre</h3>
        <div className="flex flex-col mb-8">
          <ItemConfig icon={Info} titulo="Sobre o Vivart" subtitulo="Versão 1.0.0" cor="bg-gray-600" />
        </div>

      </div>
    </div>
  );

  return createPortal(conteudoApp, document.body);
}
