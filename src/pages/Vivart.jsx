import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, X, Loader2, Terminal, Download, Box, Tv, Gamepad2, MoreHorizontal, History, Settings } from 'lucide-react';
import { toast } from 'sonner';

import Historico from './Historico';
import Configuracoes from './Configuracoes';

const ALPS_WORKER_URL = "https://vivart-ia.alpsprimestudios.workers.dev"; 
const TIMEOUT_MS = 60000; 

export default function Vivart({ onVoltar }) {
  const [mounted, setMounted] = useState(false);
  const [textoDia, setTextoDia] = useState('');
  const [arteGerada, setArteGerada] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [logs, setLogs] = useState([]);
  const [estiloAtual, setEstiloAtual] = useState('3d');
  
  const [menuAberto, setMenuAberto] = useState(false);
  const [telaInterna, setTelaInterna] = useState('principal'); 

  const abortControllerRef = useRef(null);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { 
      document.body.style.overflow = 'auto';
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const rastrear = (mensagem) => {
    console.log("[VIVART CORE]:", mensagem);
    setLogs(prev => [mensagem, ...prev]); 
  };

  const processarHumor = async () => {
    if (textoDia.trim().length < 10) {
      toast.error("Escreva um pouco mais para a IA sentir o seu humor.");
      return;
    }

    setProcessando(true);
    setLogs([]);
    rastrear("--- INICIANDO MOTOR DE SÍNTESE VIVART ---");
    
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      abortControllerRef.current.abort();
    }, TIMEOUT_MS);

    try {
      rastrear("[1] Analisando e traduzindo contexto...");
      let textoEmIngles = textoDia;
      
      try {
        const resTraducao = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoDia)}&langpair=pt|en`);
        const dadosTraducao = await resTraducao.json();
        if (dadosTraducao.responseData && dadosTraducao.responseData.translatedText) {
          textoEmIngles = dadosTraducao.responseData.translatedText;
          rastrear(`[1.1] Contexto em Inglês: ${textoEmIngles.substring(0, 30)}...`);
        }
      } catch (err) {
        rastrear("[AVISO] Falha no tradutor, seguindo com o texto original.");
      }

      rastrear(`[2] Lente: ${estiloAtual}`);
      
      const guiasDeEstilo = {
        '3d': "Cinematic 3D render, minimalist luxury aesthetic, soft gold and white lighting, visionOS style, high detail.",
        'anime': "Studio Ghibli aesthetic, peaceful atmospheric landscape, cinematic anime style, pastel color palette.",
        'pixel': "Minimalist 16-bit pixel art, isometric view, clean aesthetics, retro-modern indie game style."
      };

      const promptFinal = `Main subject and scene: "${textoEmIngles}". Create a clear, literal, and highly detailed visual representation of this exact scene. Visual Style applied to the scene: ${guiasDeEstilo[estiloAtual]} 1:1 aspect ratio, perfectly centered composition, masterclass lighting.`;
      
      rastrear(`[3] Conectando à API Privada (Worker)...`);

      let imgResponse;
      try {
        imgResponse = await fetch(ALPS_WORKER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: promptFinal }),
          signal: abortControllerRef.current.signal
        });
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
           throw new Error("A conexão expirou. A internet pode estar lenta.");
        }
        throw new Error(`Falha de Rede: ${fetchError.message}`);
      }
      
      if (!imgResponse.ok) {
        const erroText = await imgResponse.text();
        rastrear(`[ERRO BRUTO] ${erroText.substring(0, 50)}...`);
        throw new Error(`Erro no Servidor ${imgResponse.status}`);
      }

      rastrear(`[4] Malha gráfica recebida. Processando...`);
      
      const imgBlob = await imgResponse.blob();
      
      if (imgBlob.size < 1000) {
        const erroOculto = await imgBlob.text();
        rastrear(`[ERRO DA IA] ${erroOculto}`);
        throw new Error(`Aviso da IA: ${erroOculto}`);
      }

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      
      const localUrl = URL.createObjectURL(imgBlob);
      blobUrlRef.current = localUrl;

      // ✅ ALTERAÇÃO 1 — Conversão e salvamento no localStorage
      const reader = new FileReader();
      reader.readAsDataURL(imgBlob);
      reader.onloadend = () => {
        const base64data = reader.result;
        const novaMemoria = {
          id: Date.now(),
          imagem: base64data,
          texto: textoDia,
          estilo: estiloAtual,
          data: new Date().toLocaleDateString('pt-PT')
        };
        
        const historicoAntigo = JSON.parse(localStorage.getItem('vivart_memories') || '[]');
        localStorage.setItem('vivart_memories', JSON.stringify([novaMemoria, ...historicoAntigo]));
      };

      rastrear("[5] Renderização completa e salva na memória!");
      setArteGerada(localUrl);
      toast.success("Memória materializada com sucesso.");

    } catch (error) {
      rastrear(`[ERRO CRÍTICO]: ${error.message}`);
      toast.error(`Falha: ${error.message}`, { duration: 8000 });
    } finally {
      clearTimeout(timeoutId);
      rastrear("--- FIM DO PROCESSO ---");
      setProcessando(false);
    }
  };

  const baixarArte = async () => {
    if (!arteGerada) return;
    try {
      const response = await fetch(arteGerada);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Vivart_CF_${estiloAtual}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch(err) {
      toast.error("Erro ao guardar a arte.");
    }
  };

  const fecharArte = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setArteGerada(null);
    setLogs([]);
  };

  if (telaInterna === 'historico') {
    return <Historico onVoltar={() => setTelaInterna('principal')} />;
  }
  
  if (telaInterna === 'configuracoes') {
    return <Configuracoes onVoltar={() => setTelaInterna('principal')} />;
  }

  const estilos = ['3d', 'anime', 'pixel'];
  const indiceEstilo = estilos.indexOf(estiloAtual);

  const conteudoApp = (
    <div className="fixed inset-0 z-[999999] flex flex-col bg-[#050505] text-white font-sans selection:bg-[#C9A24F]/30">
      
      <div className="flex-shrink-0 pt-12 pb-4 px-6 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-50">
        <button onClick={onVoltar} className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors outline-none">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <h2 className="text-[15px] font-medium tracking-wide">Vivart</h2>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setMenuAberto(!menuAberto)} 
            className="text-[#8E8E93] hover:text-white transition-colors outline-none p-1"
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>

          {menuAberto && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setMenuAberto(false)} 
              />
              <div className="absolute top-10 right-0 w-56 bg-[#18181A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => { setTelaInterna('historico'); setMenuAberto(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-white/90 hover:bg-white/10 transition-colors"
                >
                  <History className="w-4 h-4 text-[#C9A24F]" />
                  Histórico de Imagens
                </button>
                <div className="h-[1px] w-full bg-white/5 my-1" />
                <button 
                  onClick={() => { setTelaInterna('configuracoes'); setMenuAberto(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-white/90 hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#8E8E93]" />
                  Configurações
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-start overflow-hidden w-full h-full pt-6">
        
        {!arteGerada && (
          <div className="w-full h-full flex flex-col px-8 pb-8 max-w-md mx-auto transition-opacity duration-700">
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-[#8E8E93] text-sm tracking-widest uppercase mb-6 font-medium">
                {new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' })}
              </span>
              <textarea
                value={textoDia}
                onChange={(e) => setTextoDia(e.target.value)}
                placeholder="Ex: Hoje a chuva bateu na janela enquanto eu tomava café. Senti uma paz imensa..."
                disabled={processando}
                className="w-full bg-transparent text-[22px] font-light leading-relaxed text-white placeholder:text-[#333333] outline-none resize-none min-h-[150px] overflow-hidden"
                rows={4}
                spellCheck="false"
              />
            </div>

            <div className="w-full bg-[#1C1C1E] p-1.5 rounded-2xl flex items-center justify-between mb-8 relative border border-white/5">
              <div 
                className="absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-300 ease-out pointer-events-none"
                style={{ 
                  width: 'calc(33.33% - 4px)',
                  left: `calc(${indiceEstilo * 33.33}% + 6px)`,
                  backgroundColor: '#F2D99C'
                }}
              />
              <button onClick={() => setEstiloAtual('3d')} disabled={processando} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 z-10 ${estiloAtual === '3d' ? 'text-black' : 'text-[#8E8E93] hover:text-white'}`}>
                <Box className="w-4 h-4" /> 3D Pixar
              </button>
              <button onClick={() => setEstiloAtual('anime')} disabled={processando} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 z-10 ${estiloAtual === 'anime' ? 'text-black' : 'text-[#8E8E93] hover:text-white'}`}>
                <Tv className="w-4 h-4" /> Anime
              </button>
              <button onClick={() => setEstiloAtual('pixel')} disabled={processando} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 z-10 ${estiloAtual === 'pixel' ? 'text-black' : 'text-[#8E8E93] hover:text-white'}`}>
                <Gamepad2 className="w-4 h-4" /> Pixel Art
              </button>
            </div>

            <div className="pb-8 flex flex-col items-center relative">
              {processando ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider animate-pulse">
                    Modelando o seu dia...
                  </span>
                </div>
              ) : (
                <button 
                  onClick={processarHumor}
                  disabled={textoDia.length === 0}
                  className="w-20 h-20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                >
                  <img 
                    src="https://i.ibb.co/ZpcqqPb5/11-20260609-094907-0000.png" 
                    alt="Criar Arte" 
                    className="w-full h-full object-contain"
                  />
                </button>
              )}
            </div>

            {processando && logs.length > 0 && (
              <div className="absolute top-[5%] left-4 right-4 bg-[#111111]/95 border border-[#C9A24F]/40 rounded-2xl p-4 z-50 backdrop-blur-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#C9A24F]" />
                    <span className="text-xs font-bold text-[#C9A24F] uppercase tracking-wider">Console Neural</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
                  {logs.map((log, index) => (
                    <span key={index} className={`text-[11px] font-mono break-words leading-relaxed ${log.includes('[ERRO') ? 'text-red-400 font-bold' : 'text-white/80'}`}>
                      {log}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ✅ ALTERAÇÃO 2 — Layout da galeria corrigido sem caixa preta sobreposta */}
        {arteGerada && (
          <div className="absolute inset-0 w-full h-full bg-[#050505] flex flex-col overflow-y-auto animate-in fade-in duration-1000 z-[100]">
            
            {/* Header da Galeria com botão de fechar */}
            <div className="flex-shrink-0 w-full pt-12 pb-4 px-6 flex justify-end bg-[#050505]">
              <button onClick={fecharArte} className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem Pura */}
            <div className="w-full max-w-lg mx-auto aspect-square shadow-[0_0_50px_rgba(255,255,255,0.05)]">
               <img 
                 src={arteGerada} 
                 alt="Arte Emocional" 
                 className="w-full h-full object-cover rounded-3xl"
               />
            </div>

            {/* Área de Informações e Botão */}
            <div className="flex-1 w-full max-w-lg mx-auto px-6 pt-6 pb-12 flex flex-col gap-6">
              <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl">
                <p className="text-white/90 font-light text-[15px] leading-relaxed italic">
                  "{textoDia}"
                </p>
                <span className="block mt-3 text-[#C9A24F] text-[10px] uppercase tracking-widest font-bold">
                  RENDER: 1:1 {estiloAtual === '3d' ? '3D CINEMÁTICO' : estiloAtual === 'anime' ? 'STUDIO GHIBLI' : 'PIXEL ART 16-BIT'}
                </span>
              </div>

              <button 
                onClick={baixarArte} 
                className="w-full bg-[#C9A24F] text-black font-semibold py-4 rounded-2xl text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_0_40px_rgba(201,162,79,0.3)]"
              >
                <Download className="w-5 h-5" />
                Guardar Memória
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  if (!mounted) return <div className="fixed inset-0 bg-[#050505] z-[999999]" />;
  return createPortal(conteudoApp, document.body);
}