import React from 'react';
import { X, Activity, Zap, Mail, MessageCircle, ArrowRight } from 'lucide-react';

export default function AutomacoesAtivas({ onClose, historico }) {
  // A inteligência: Filtra a memória do chat e pega apenas os agentes "ativos"
  const automacoes = historico.filter(msg => msg.isCard && msg.status === 'active');

  const renderIcone = (appName) => {
    if (appName.toLowerCase().includes('gmail')) return <Mail className="w-5 h-5 text-red-400" />;
    if (appName.toLowerCase().includes('telegram')) return <MessageCircle className="w-5 h-5 text-blue-400" />;
    return <Zap className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-medium tracking-wide">Agentes Ativos</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors outline-none">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Automações */}
        <div className="p-5 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
          {automacoes.length === 0 ? (
            <div className="text-center text-[#8E8E93] py-10 font-light text-[14px]">
              Nenhum agente em execução.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {automacoes.map(auto => (
                <div key={auto.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 shadow-inner">
                  <p className="text-white/90 text-[14px] font-light leading-relaxed">{auto.summary}</p>
                  
                  {/* Fluxo Visual da Automação */}
                  <div className="flex items-center justify-between bg-[#1C1C1E] p-2.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#2C2C2E] p-2 rounded-lg">{renderIcone(auto.trigger)}</div>
                      <span className="text-[12px] text-white/60 font-mono capitalize">{auto.trigger}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8E8E93]" />
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-white/60 font-mono capitalize">{auto.action}</span>
                      <div className="bg-[#2C2C2E] p-2 rounded-lg">{renderIcone(auto.action)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
