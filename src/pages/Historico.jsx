import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Image as ImageIcon, Calendar, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Historico({ onVoltar }) {
  const [memorias, setMemorias] = useState([]);
  const [memoriaSelecionada, setMemoriaSelecionada] = useState(null);

  // Carrega o histórico salvo no LocalStorage assim que a tela abre
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('vivart_memories');
    if (dadosSalvos) {
      try {
        setMemorias(JSON.parse(dadosSalvos));
      } catch (e) {
        console.error("Erro ao ler o histórico do Vivart", e);
      }
    }
  }, []);

  // Função para eliminar uma memória permanentemente
  const eliminarMemoria = (id, e) => {
    e.stopPropagation(); // Evita abrir a imagem ao clicar no botão de eliminar
    
    const novasMemorias = memorias.filter(m => m.id !== id);
    setMemorias(novasMemorias);
    localStorage.setItem('vivart_memories', JSON.stringify(novasMemorias));
    
    if (memoriaSelecionada && memoriaSelecionada.id === id) {
      setMemoriaSelecionada(null);
    }
    
    toast.success("Memória esquecida com sucesso.");
  };

  const conteudoApp = (
    <div className="fixed inset-0 z-[999999] flex flex-col bg-[#050505] text-white font-sans animate-in slide-in-from-right-8 duration-300">
      
      {/* HEADER DA GALERIA */}
      <div className="flex-shrink-0 pt-12 pb-4 px-6 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-50">
        <button onClick={onVoltar} className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors outline-none">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <h2 className="text-[15px] font-medium tracking-wide">Histórico</h2>
        </div>
        <div className="w-5 h-5" />
      </div>

      {/* ÁREA DE CONTEÚDO COM ROLAGEM */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        
        {memorias.length === 0 ? (
          /* ESTADO VAZIO (APPLE MINI) */
          <div className="w-full h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <ImageIcon className="w-8 h-8 text-[#8E8E93]" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Nenhuma Memória</h3>
            <p className="text-[#8E8E93] text-sm leading-relaxed max-w-[260px]">
              As obras de arte geradas a partir do seu dia aparecerão aqui automaticamente.
            </p>
          </div>
        ) : (
          /* GRADE DE MEMÓRIAS SALVAS */
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {memorias.map((memoria) => (
              <div
                key={memoria.id}
                onClick={() => setMemoriaSelecionada(memoria)}
                className="group relative aspect-square w-full rounded-2xl bg-[#1C1C1E] overflow-hidden border border-white/5 cursor-pointer active:scale-95 transition-all duration-300 shadow-md"
              >
                {/* Imagem Pura de Fundo */}
                <img 
                  src={memoria.imagem} 
                  alt={memoria.texto} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Gradiente de proteção para o botão */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Ícone de Eliminar Discreto no Topo Direito */}
                <button
                  onClick={(e) => eliminarMemoria(memoria.id, e)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Data no Rodapé */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5 pointer-events-none">
                  <Calendar className="w-3 h-3 text-[#C9A24F]" />
                  <span className="text-[10px] text-white/90 font-medium tracking-wide">{memoria.data}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETALHE DA MEMÓRIA SELECIONADA (MODAL COM ECRÃ INTEIRO) */}
      {memoriaSelecionada && (
        <div className="fixed inset-0 w-full h-full bg-[#050505] flex flex-col overflow-y-auto animate-in fade-in duration-300 z-[200]">
          
          {/* Header da Moldura */}
          <div className="flex-shrink-0 w-full pt-12 pb-4 px-6 flex justify-between bg-[#050505]">
            <button 
              onClick={(e) => eliminarMemoria(memoriaSelecionada.id, e)} 
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-red-400 border border-white/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMemoriaSelecionada(null)} 
              className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Imagem Grande */}
          <div className="w-full max-w-lg mx-auto aspect-square shadow-[0_0_50px_rgba(255,255,255,0.05)] px-4">
             <img 
               src={memoriaSelecionada.imagem} 
               alt="Arte Emocional Salva" 
               className="w-full h-full object-cover rounded-[24px]"
             />
          </div>

          {/* Informações da Memória */}
          <div className="flex-1 w-full max-w-lg mx-auto px-6 pt-6 pb-12 flex flex-col gap-6">
            <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl">
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2 text-[#8E8E93]">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs">{memoriaSelecionada.data}</span>
              </div>
              <p className="text-white/90 font-light text-[15px] leading-relaxed italic">
                "{memoriaSelecionada.texto}"
              </p>
              <span className="block mt-4 text-[#C9A24F] text-[10px] uppercase tracking-widest font-bold">
                LENTE ORIGEM: {memoriaSelecionada.estilo === '3d' ? '3D CINEMÁTICO' : memoriaSelecionada.estilo === 'anime' ? 'STUDIO GHIBLI' : 'PIXEL ART 16-BIT'}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return createPortal(conteudoApp, document.body);
}
