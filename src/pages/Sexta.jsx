import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, X, Eye, EyeOff, Volume2, VolumeX, Mic, MicOff, Activity } from 'lucide-react';
import { chamarCerebroSexta } from '@/lib/sextaApi';

// ============================================================
// CHAVES
// ============================================================
// O cérebro (OpenRouter) roda no servidor (api/fn/sextaChat) — a chave fica
// só na Vercel (env var "OpenRouter"), nunca no navegador.
// A voz usa o SpeechSynthesis nativo do navegador (grátis, sem chave).
//
// A visão (Mistral, câmera) ainda chama a API direto do navegador — não foi
// migrada para o servidor nesta rodada.
// Obtem em: https://console.mistral.ai/api-keys
const MISTRAL_API_KEY = "MnfXDbULqv5vx0dcexB8yyXUd7goL0tw";
const MODELO_VISAO = "pixtral-12b-2409";

const EXPRESSOES = {
  neutra: {
    olhoE: "M 595.43 587.77 C 562.73 587.77 536.21 626.52 536.21 674.32 C 536.21 722.11 562.73 760.86 595.43 760.86 C 628.14 760.86 654.66 722.11 654.66 674.32 C 654.66 626.52 628.14 587.77 595.43 587.77 Z",
    olhoD: "M 920.72 587.77 C 888.01 587.77 861.50 626.52 861.50 674.32 C 861.50 722.11 888.01 760.86 920.72 760.86 C 953.43 760.86 979.95 722.11 979.95 674.32 C 979.95 626.52 953.43 587.77 920.72 587.77 Z",
    boca:  "M 768.00 955.02 C 873.76 955.02 959.56 957.51 959.56 960.57 C 959.56 963.63 873.76 966.12 768.00 966.12 C 662.23 966.12 576.44 963.63 576.44 960.57 C 576.44 957.51 662.23 955.02 768.00 955.02 Z",
  },
  impressionada: {
    olhoE: "M 595.43 587.77 C 562.73 587.77 536.21 626.52 536.21 674.32 C 536.21 722.11 562.73 760.86 595.43 760.86 C 628.14 760.86 654.66 722.11 654.66 674.32 C 654.66 626.52 628.14 587.77 595.43 587.77 Z",
    olhoD: "M 920.72 587.77 C 888.01 587.77 861.50 626.52 861.50 674.32 C 861.50 722.11 888.01 760.86 920.72 760.86 C 953.43 760.86 979.95 722.11 979.95 674.32 C 979.95 626.52 953.43 587.77 920.72 587.77 Z",
    boca:  "M 768.00 790.55 C 822.52 790.55 870.93 853.46 870.93 931.07 C 870.93 1008.67 822.52 1071.58 768.00 1071.58 C 713.48 1071.58 654.66 1008.67 654.66 931.07 C 654.66 853.46 713.48 790.55 768.00 790.55 Z",
  },
};

const SISTEMA_PROMPT = `Você é a Sexta-feira, uma IA com presença humana real, calorosa e direta. Conversa em português do Brasil de forma natural e curta (1 a 2 frases). NUNCA diga frases genéricas como "Estou ouvindo", "Pode falar", "Como posso ajudar". Responda SEMPRE ao que a pessoa acabou de dizer, comentando, perguntando ou opinando especificamente sobre isso. Sem markdown, sem listas, sem asteriscos — apenas fala direta como num diálogo humano.`;

const SISTEMA_VISAO = SISTEMA_PROMPT + ` Você está vendo o utilizador agora pela câmera. Descreva uma observação visual genuína (roupa, ambiente, expressão) numa frase curta se isso enriquecer a resposta. Não force a observação se não fizer sentido.`;

export default function Sexta({ onVoltar }) {
  const [mounted, setMounted] = useState(false);
  // Reconhecimento de voz por navegador só existe no Chrome/Android — no
  // Safari/iOS a API nem existe. Por enquanto a Sexta por voz fica restrita
  // a quem tem suporte, em vez de abrir uma tela que nunca vai ouvir nada.
  const [suportado] = useState(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [expressao, setExpressao] = useState('neutra');
  const [estaFalando, setEstaFalando] = useState(false);
  const [estaOuvindo, setEstaOuvindo] = useState(false);
  const [status, setStatus] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);
  const [piscar, setPiscar] = useState(false);
  const [olhar, setOlhar] = useState({ x: 0, y: 0 });
  const [camaraAtiva, setCamaraAtiva] = useState(true);
  const [vozAtiva, setVozAtiva] = useState(true);
  const [micAtivo, setMicAtivo] = useState(true);
  const [logs, setLogs] = useState([]);
  const [painelAberto, setPainelAberto] = useState(true);
  const [volumeMic, setVolumeMic] = useState(0);
  // Só pede câmera/microfone quando o usuário toca no botão — não abre a
  // câmera sozinha ao montar o componente.
  const [iniciado, setIniciado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const log = useCallback((tipo, mensagem) => {
    const agora = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${tipo}] ${mensagem}`);
    setLogs(prev => [...prev.slice(-40), { tipo, mensagem, agora }]);
  }, []);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamVideoRef = useRef(null);
  const streamAudioRef = useRef(null);
  const bocaRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const vadAtivoRef = useRef(false);
  const reconhecendoRef = useRef(false);
  const falandoRef = useRef(false);
  const animacaoBocaRef = useRef(null);
  const historicoRef = useRef([]);
  const faceDetectorRef = useRef(null);
  const tempoComecouFalarRef = useRef(0);
  const ignorarMicAteRef = useRef(0);
  const ultimaDescricaoVisualRef = useRef(null); // cache de visão (não chama todas as vezes)

  useEffect(() => { falandoRef.current = estaFalando; }, [estaFalando]);

  // ==========================================
  // DIAGNÓSTICO INICIAL
  // ==========================================
  useEffect(() => {
    log('SISTEMA', `URL: ${window.location.protocol}//${window.location.host}`);
    log('SISTEMA', `HTTPS: ${window.location.protocol === 'https:' ? 'SIM ✓' : 'NÃO ✗'}`);
    const ua = navigator.userAgent;
    log('SISTEMA', `Navegador: ${ua.includes('OPR') ? 'Opera' : ua.includes('Chrome') ? 'Chrome' : 'Outro'}`);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    log('VOZ-IN', `SpeechRecognition: ${SR ? 'DISPONÍVEL ✓' : 'NÃO ✗'}`);
    log('VOZ-OUT', `SpeechSynthesis (fallback): ${window.speechSynthesis ? 'DISPONÍVEL ✓' : 'NÃO ✗'}`);

    const ck = (k, nome) => {
      const ok = k && !k.includes('COLA_AQUI') && k.length > 15;
      log('CHAVE', `${nome}: ${ok ? `OK (${k.slice(0, 8)}...)` : 'EM FALTA ✗'}`);
      return ok;
    };
    ck(MISTRAL_API_KEY, 'Mistral');
    log('CHAVE', 'Cérebro (OpenRouter): chave no servidor, ver /api/fn/sextaChat');
  }, [log]);

  // ==========================================
  // PISCAR
  // ==========================================
  useEffect(() => {
    let timer;
    const piscarNatural = () => {
      setPiscar(true);
      setTimeout(() => setPiscar(false), 140);
      timer = setTimeout(piscarNatural, 3000 + Math.random() * 4000);
    };
    timer = setTimeout(piscarNatural, 2500);
    return () => clearTimeout(timer);
  }, []);

  // ==========================================
  // CÂMERA
  // ==========================================
  const iniciarCamera = useCallback(async () => {
    try {
      log('CÂMERA', 'A pedir permissão...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 }
      });
      streamVideoRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      log('CÂMERA', 'Permissão CONCEDIDA ✓');
      if ('FaceDetector' in window) {
        faceDetectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        rastrearRosto();
      } else movimentoVivo();
    } catch (err) {
      log('CÂMERA', `ERRO: ${err.name} ✗`);
    }
  }, [log]);

  const rastrearRosto = useCallback(async () => {
    const detectar = async () => {
      if (!videoRef.current || !faceDetectorRef.current) return;
      try {
        const rostos = await faceDetectorRef.current.detect(videoRef.current);
        if (rostos.length > 0) {
          const r = rostos[0].boundingBox;
          const cx = (r.x + r.width / 2) / 320 * 2 - 1;
          const cy = (r.y + r.height / 2) / 240 * 2 - 1;
          setOlhar({ x: Math.max(-40, Math.min(40, -cx * 40)), y: Math.max(-25, Math.min(25, cy * 25)) });
        }
      } catch (e) {}
      setTimeout(detectar, 200);
    };
    detectar();
  }, []);

  const movimentoVivo = useCallback(() => {
    const mover = () => {
      setOlhar({ x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 18 });
      setTimeout(mover, 1800 + Math.random() * 2500);
    };
    mover();
  }, []);

  const capturarFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    canvas.width = 320; canvas.height = 240;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0, 320, 240);
    return canvas.toDataURL('image/jpeg', 0.55);
  }, []);

  // ==========================================
  // VISÃO — Mistral Pixtral (descreve a cena em texto curto)
  // É chamada UMA vez a cada ~30s, e o resultado fica em cache
  // para o cérebro saber o que vê sem chamar visão a cada turno
  // ==========================================
  const descreverCena = useCallback(async (frame) => {
    if (!MISTRAL_API_KEY || MISTRAL_API_KEY.includes('COLA_AQUI')) {
      log('VISÃO', 'Chave Mistral em falta, sem visão');
      return null;
    }
    log('VISÃO', 'A pedir descrição da cena ao Pixtral...');
    const t0 = performance.now();
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODELO_VISAO,
          max_tokens: 120,
          temperature: 0.4,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Descreva em 1-2 frases curtas o que vê: pessoa (roupa, expressão, idade aparente), ambiente, objetos relevantes. Em português, direto, sem opinar.' },
              { type: 'image_url', image_url: frame }
            ]
          }]
        })
      });
      const dt = Math.round(performance.now() - t0);
      log('VISÃO', `HTTP ${res.status} em ${dt}ms`);
      if (!res.ok) {
        const c = await res.text();
        log('VISÃO', `ERRO: ${c.slice(0, 80)}`);
        return null;
      }
      const data = await res.json();
      const desc = (data?.choices?.[0]?.message?.content || '').trim();
      log('VISÃO', `Vê: "${desc.slice(0, 60)}..."`);
      return desc;
    } catch (e) {
      log('VISÃO', `Erro de rede: ${e.message}`);
      return null;
    }
  }, [log]);

  // ==========================================
  // CÉREBRO — OpenRouter (via api/fn/sextaChat no servidor)
  // ==========================================
  const chamarCerebro = useCallback(async (texto, historico, descricaoVisual) => {
    log('CÉREBRO', 'A chamar o cérebro (OpenRouter)...');

    const mensagens = [
      { role: 'system', content: descricaoVisual ? SISTEMA_VISAO : SISTEMA_PROMPT }
    ];

    // Se há descrição visual, mete como "contexto do sistema"
    if (descricaoVisual) {
      mensagens.push({
        role: 'system',
        content: `[O que você vê agora pela câmera: ${descricaoVisual}]`
      });
    }

    for (const m of historico) {
      mensagens.push({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : ''
      });
    }
    mensagens.push({ role: 'user', content: texto });

    const t0 = performance.now();
    let resposta;
    try {
      resposta = await chamarCerebroSexta(mensagens);
    } catch (e) {
      log('CÉREBRO', `ERRO: ${e.message}`);
      throw e;
    }
    const dt = Math.round(performance.now() - t0);
    log('CÉREBRO', `Resposta em ${dt}ms: "${resposta.slice(0, 60)}${resposta.length > 60 ? '...' : ''}"`);
    return resposta;
  }, [log]);

  const processarMensagem = useCallback(async (textoUtilizador) => {
    log('FLUXO', `Utilizador: "${textoUtilizador}"`);
    setStatus('Pensando...');

    // Decide se chama visão (uma vez a cada 30s para não estourar limites)
    let descricaoVisual = ultimaDescricaoVisualRef.current?.texto || null;
    const agora = Date.now();
    const ultimaCalculada = ultimaDescricaoVisualRef.current?.quando || 0;
    if (camaraAtiva && (agora - ultimaCalculada > 30000)) {
      const frame = capturarFrame();
      if (frame) {
        const novaDesc = await descreverCena(frame);
        if (novaDesc) {
          descricaoVisual = novaDesc;
          ultimaDescricaoVisualRef.current = { texto: novaDesc, quando: agora };
        }
      }
    }

    let resposta = '';
    try {
      resposta = await chamarCerebro(textoUtilizador, historicoRef.current.slice(-8), descricaoVisual);
    } catch (e) {
      log('FLUXO', `Erro: ${e.message}`);
      falar(`Tive um problema: ${e.message}`);
      setStatus('');
      return;
    }

    resposta = resposta
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*+/g, '')
      .replace(/#+\s/g, '')
      .trim();

    if (!resposta) {
      log('FLUXO', 'Resposta vazia');
      falar('Não consegui formar uma resposta agora.');
      setStatus('');
      return;
    }

    historicoRef.current = [
      ...historicoRef.current.slice(-8),
      { role: 'user', content: textoUtilizador },
      { role: 'assistant', content: resposta }
    ].slice(-12);
    setStatus('');
    falar(resposta);
  }, [camaraAtiva, chamarCerebro, capturarFrame, descreverCena, log]);

  // ==========================================
  // RECONHECIMENTO DE FALA (STT do navegador)
  // ==========================================
  const dispararReconhecimento = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { log('VOZ-IN', 'Indisponível ✗'); return; }
    if (reconhecendoRef.current) return;
    if (falandoRef.current) return;

    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      reconhecendoRef.current = true;
      setEstaOuvindo(true);
      setStatus('Ouvindo...');
      log('VOZ-IN', 'INICIADO ✓');
    };
    rec.onresult = async (e) => {
      const texto = e.results[0][0].transcript.trim();
      setEstaOuvindo(false);
      log('VOZ-IN', `Reconhecido: "${texto}"`);
      if (texto && texto.length > 0) {
        setStatus(`"${texto}"`);
        await processarMensagem(texto);
      } else setStatus('');
    };
    rec.onend = () => { reconhecendoRef.current = false; setEstaOuvindo(false); };
    rec.onerror = (e) => {
      reconhecendoRef.current = false;
      setEstaOuvindo(false);
      log('VOZ-IN', `Erro: ${e.error}`);
      if (e.error === 'no-speech' || e.error === 'aborted') setStatus('');
      else if (e.error === 'not-allowed') setStatus('Microfone bloqueado');
      else setStatus(`Erro: ${e.error}`);
      setExpressao('neutra');
    };
    recognitionRef.current = rec;
    try { rec.start(); }
    catch (e) { log('VOZ-IN', `Falha: ${e.message}`); }
  }, [processarMensagem, log]);

  // ==========================================
  // VAD
  // ==========================================
  const iniciarVAD = useCallback(async () => {
    try {
      log('MIC', 'A pedir permissão...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false }
      });
      streamAudioRef.current = stream;
      log('MIC', 'Permissão CONCEDIDA ✓');

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) {} }

      const fonte = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      fonte.connect(analyser);

      vadAtivoRef.current = true;
      const dados = new Uint8Array(analyser.frequencyBinCount);
      let contadorVoz = 0;
      let ultimoVolumeLog = 0;

      const monitorar = () => {
        if (!vadAtivoRef.current) return;
        const agora = performance.now();
        if (agora < ignorarMicAteRef.current) {
          contadorVoz = 0;
          requestAnimationFrame(monitorar);
          return;
        }
        analyser.getByteFrequencyData(dados);
        let soma = 0;
        for (let i = 0; i < dados.length; i++) soma += dados[i];
        const volume = soma / dados.length;
        setVolumeMic(volume);

        if (agora - ultimoVolumeLog > 3000) {
          log('MIC', `Vol médio: ${volume.toFixed(1)}`);
          ultimoVolumeLog = agora;
        }

        if (falandoRef.current) {
          if (agora - tempoComecouFalarRef.current > 800 && volume > 75) {
            log('MIC', 'Interrupção!');
            pararFala();
            ignorarMicAteRef.current = performance.now() + 300;
            setTimeout(() => dispararReconhecimento(), 320);
          }
          contadorVoz = 0;
          requestAnimationFrame(monitorar);
          return;
        }

        if (volume > 24) {
          contadorVoz++;
          if (contadorVoz > 6 && !reconhecendoRef.current) {
            log('MIC', `Voz (${volume.toFixed(0)})`);
            setExpressao('neutra');
            dispararReconhecimento();
            contadorVoz = 0;
          }
        } else contadorVoz = Math.max(0, contadorVoz - 1);
        requestAnimationFrame(monitorar);
      };
      monitorar();
      log('MIC', 'Monitor ATIVO ✓');
    } catch (err) {
      log('MIC', `ERRO: ${err.name} ✗`);
      setStatus('Sem permissão de microfone');
    }
  }, [dispararReconhecimento, log]);

  // ==========================================
  // FALAR — voz nativa do navegador (SpeechSynthesis)
  // ==========================================
  const pararFala = useCallback(() => {
    window.speechSynthesis?.cancel();
    clearInterval(animacaoBocaRef.current);
    if (bocaRef.current) bocaRef.current.style.transform = 'scaleY(1)';
    setEstaFalando(false);
    setExpressao('neutra');
  }, []);

  const animarBoca = useCallback(() => {
    setEstaFalando(true);
    tempoComecouFalarRef.current = performance.now();
    setExpressao('impressionada');
    let fase = 0;
    animacaoBocaRef.current = setInterval(() => {
      fase++;
      const escala = 0.5 + Math.abs(Math.sin(fase * 0.45)) * 0.5;
      if (bocaRef.current) {
        bocaRef.current.style.transform = `scaleY(${escala})`;
        bocaRef.current.style.transformOrigin = 'center 931px';
      }
    }, 85);
  }, []);

  const acabarFala = useCallback(() => {
    clearInterval(animacaoBocaRef.current);
    if (bocaRef.current) bocaRef.current.style.transform = 'scaleY(1)';
    setEstaFalando(false);
    setExpressao('neutra');
    ignorarMicAteRef.current = performance.now() + 400;
  }, []);

  const falarComNavegador = useCallback((texto) => {
    log('VOZ-OUT', 'Usando voz NATIVA do navegador');
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    u.rate = 1.0;
    u.pitch = 1.05;
    const vozes = window.speechSynthesis.getVoices();
    const voz = vozes.find(v => v.name.includes('Google') && v.lang.includes('pt-BR'))
      || vozes.find(v => v.lang === 'pt-BR')
      || vozes.find(v => v.lang.includes('pt'));
    if (voz) u.voice = voz;
    u.onstart = animarBoca;
    u.onend = acabarFala;
    u.onerror = (e) => { log('VOZ-OUT', `Erro: ${e.error}`); acabarFala(); };
    window.speechSynthesis.speak(u);
  }, [log, animarBoca, acabarFala]);

  const falar = useCallback((texto) => {
    if (!texto) return;
    if (!vozAtiva) { setStatus(texto); return; }
    pararFala();
    falarComNavegador(texto);
  }, [vozAtiva, falarComNavegador, pararFala]);

  // ==========================================
  // SAUDAÇÃO INICIAL — comenta a aparência do usuário pela câmera,
  // assim que ele entra e concede as permissões.
  // ==========================================
  const gerarSaudacaoInicial = useCallback(async () => {
    log('FLUXO', 'Preparando saudação inicial...');
    setStatus('Te vendo...');

    let descricaoVisual = null;
    if (streamVideoRef.current) {
      const frame = capturarFrame();
      if (frame) {
        descricaoVisual = await descreverCena(frame);
        if (descricaoVisual) {
          ultimaDescricaoVisualRef.current = { texto: descricaoVisual, quando: Date.now() };
        }
      }
    }

    const instrucao = descricaoVisual
      ? 'Este é o primeiro contato: cumprimente o usuário agora, de um jeito criativo, caloroso e bem pessoal — comente algo genuíno e específico sobre a aparência ou o visual dele que você está vendo pela câmera agora (pode ser roupa, sorriso, estilo, penteado, o ambiente), como um elogio sincero, sem exagero. Termine perguntando como ele está.'
      : 'Este é o primeiro contato: cumprimente o usuário agora de um jeito criativo, caloroso e curto, perguntando como ele está.';

    let saudacao = '';
    try {
      saudacao = await chamarCerebro(instrucao, [], descricaoVisual);
    } catch (e) {
      log('FLUXO', `Erro na saudação: ${e.message}`);
    }

    saudacao = (saudacao || '')
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*+/g, '')
      .replace(/#+\s/g, '')
      .trim();

    if (!saudacao) saudacao = 'Oi! Que bom te ver por aqui — como você está?';

    historicoRef.current = [{ role: 'assistant', content: saudacao }];
    setStatus('');
    falar(saudacao);
  }, [capturarFrame, descreverCena, chamarCerebro, falar, log]);

  // Único botão da tela inicial: pede câmera + microfone e já entra
  // conversando (a saudação comenta o que a câmera está vendo).
  const iniciarConversa = useCallback(async () => {
    if (carregando || iniciado) return;
    setCarregando(true);
    document.body.style.overflow = 'hidden';
    log('FLUXO', 'Usuário tocou em começar — a pedir câmera e microfone...');
    try {
      await iniciarCamera();
      await iniciarVAD();
      // dá um tempinho pro vídeo ter um frame de verdade antes de capturar
      await new Promise((r) => setTimeout(r, 700));
      await gerarSaudacaoInicial();
    } finally {
      setIniciado(true);
      setCarregando(false);
    }
  }, [carregando, iniciado, iniciarCamera, iniciarVAD, gerarSaudacaoInicial, log]);

  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================
  useEffect(() => {
    setMounted(true);
    return () => {
      document.body.style.overflow = 'auto';
      vadAtivoRef.current = false;
      pararFala();
      if (streamVideoRef.current) streamVideoRef.current.getTracks().forEach(t => t.stop());
      if (streamAudioRef.current) streamAudioRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    };
    // eslint-disable-next-line
  }, []);

  // Ao trocar da tela inicial pra tela de conversa, o React monta um <video>
  // novo — reconecta o stream da câmera já aberto a esse elemento novo.
  useEffect(() => {
    if (videoRef.current && streamVideoRef.current) {
      videoRef.current.srcObject = streamVideoRef.current;
    }
  }, [iniciado]);

  const testarTudo = () => {
    log('TESTE', '=== TESTE ===');
    processarMensagem('Me cumprimente em uma frase e diga uma observação sobre o que está vendo agora se conseguir.');
  };

  const exp = EXPRESSOES[expressao] || EXPRESSOES.neutra;
  const olhoEFechado = "M 595.43 670 C 562.73 672 536.21 673 536.21 674.32 C 536.21 675.64 562.73 676.64 595.43 678 C 628.14 676.64 654.66 675.64 654.66 674.32 C 654.66 673 628.14 672 595.43 670 Z";
  const olhoDFechado = "M 920.72 670 C 888.01 672 861.50 673 861.50 674.32 C 861.50 675.64 888.01 676.64 920.72 678 C 953.43 676.64 979.95 675.64 979.95 674.32 C 979.95 673 953.43 672 920.72 670 Z";

  const corLog = (t) => ({
    SISTEMA: '#90A4FF', CÂMERA: '#FFB74D', MIC: '#81C784', 'VOZ-IN': '#4FC3F7',
    'VOZ-OUT': '#F06292', CÉREBRO: '#BA68C8', VISÃO: '#FFAB91', CHAVE: '#FFD54F',
    TESTE: '#FF8A65', FLUXO: '#AED581'
  })[t] || '#9E9E9E';

  const conteudo = (
    <div style={est.fundo}>
      <video ref={videoRef} autoPlay playsInline muted style={est.oculto} />
      <canvas ref={canvasRef} style={est.oculto} />
      <button onClick={onVoltar} style={est.voltar}>← Voltar</button>
      <button onClick={() => setPainelAberto(!painelAberto)} style={est.botaoDiag}>
        <Activity size={18} color={painelAberto ? '#4CAF50' : '#8E8E93'} />
      </button>

      <div style={est.menuContainer}>
        <button onClick={() => setMenuAberto(!menuAberto)} style={est.menuBotao}>
          <MoreHorizontal size={20} color="#8E8E93" />
        </button>
        {menuAberto && (
          <>
            <div style={est.menuOverlay} onClick={() => setMenuAberto(false)} />
            <div style={est.menuDropdown}>
              <p style={est.menuTitulo}>Sexta-feira</p>
              <button style={est.menuItem} onClick={() => {
                const novo = !camaraAtiva; setCamaraAtiva(novo);
                if (!novo && streamVideoRef.current) streamVideoRef.current.getTracks().forEach(tr => tr.stop());
                else if (novo) iniciarCamera();
              }}>
                {camaraAtiva ? <Eye size={16} /> : <EyeOff size={16} />}
                <span>{camaraAtiva ? 'Visão ativa' : 'Visão desativada'}</span>
              </button>
              <button style={est.menuItem} onClick={() => setVozAtiva(!vozAtiva)}>
                {vozAtiva ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{vozAtiva ? 'Voz ativa' : 'Voz desativada'}</span>
              </button>
              <button style={est.menuItem} onClick={() => {
                const novo = !micAtivo; setMicAtivo(novo); vadAtivoRef.current = novo;
                if (novo) iniciarVAD();
              }}>
                {micAtivo ? <Mic size={16} /> : <MicOff size={16} />}
                <span>{micAtivo ? 'Escuta ativa' : 'Escuta desativada'}</span>
              </button>
              <button style={{ ...est.menuItem, color: '#FF453A' }} onClick={() => {
                historicoRef.current = [];
                ultimaDescricaoVisualRef.current = null;
                setMenuAberto(false); setExpressao('neutra');
                falar('Memória limpa!');
              }}>
                <X size={16} /><span>Limpar conversa</span>
              </button>
            </div>
          </>
        )}
      </div>

      {status && (
        <div style={est.status}>
          <div style={{ ...est.ponto, backgroundColor: estaOuvindo ? '#4CAF50' : '#F0D290' }} />
          <span style={est.statusTexto}>{status}</span>
        </div>
      )}

      <div style={est.rostoWrapper}>
        {estaOuvindo && <div style={est.anel} />}
        <svg viewBox="0 0 1536 1536" style={est.svg}>
          <circle cx="768" cy="756" r="424" fill="#F7D89C" />
          <circle cx="768" cy="756" r="414" fill="#000000" />
          <g style={{ transform: `translate(${olhar.x}px, ${olhar.y}px)`, transition: 'transform 0.7s cubic-bezier(0.25, 0.8, 0.3, 1)' }}>
            <path d={piscar ? olhoEFechado : exp.olhoE} fill="#F5D599" style={est.tracoMorph} />
            <path d={piscar ? olhoDFechado : exp.olhoD} fill="#F5D599" style={est.tracoMorph} />
          </g>
          <path ref={bocaRef} d={exp.boca} fill="#F5D599" style={est.tracoMorphBoca} />
        </svg>
      </div>

      <div style={est.rodape}>
        {estaOuvindo ? (
          <div style={est.ondas}>
            <div style={{ ...est.onda, animationDelay: '0s' }} />
            <div style={{ ...est.onda, height: 14, animationDelay: '0.15s' }} />
            <div style={{ ...est.onda, animationDelay: '0.3s' }} />
          </div>
        ) : <p style={est.dica}>{estaFalando ? 'Falando — pode interromper' : 'Fale a qualquer momento'}</p>}
      </div>

      {painelAberto && (
        <div style={est.painelDiag}>
          <div style={est.painelHeader}>
            <span style={est.painelTitulo}>OPENROUTER + MISTRAL + VOZ NATIVA</span>
            <div style={est.painelBotoes}>
              <button onClick={testarTudo} style={est.btTeste}>Testar</button>
              <button onClick={() => setLogs([])} style={est.btLimpar}>Limpar</button>
              <button onClick={() => setPainelAberto(false)} style={est.btFechar}>×</button>
            </div>
          </div>
          <div style={est.barraVolume}>
            <div style={{ ...est.barraVolumePreench, width: `${Math.min(100, volumeMic * 1.5)}%`, backgroundColor: volumeMic > 24 ? '#4CAF50' : '#555' }} />
            <span style={est.barraVolumeTexto}>MIC: {volumeMic.toFixed(0)}</span>
          </div>
          <div style={est.logs}>
            {logs.length === 0 && <div style={est.logVazio}>Sem registos.</div>}
            {logs.slice().reverse().map((l, i) => (
              <div key={i} style={est.logLinha}>
                <span style={{ color: '#666', fontSize: 9 }}>{l.agora}</span>
                <span style={{ color: corLog(l.tipo), fontWeight: 700, fontSize: 9, marginLeft: 4 }}>{l.tipo}</span>
                <span style={{ color: '#DDD', fontSize: 10, marginLeft: 4 }}>{l.mensagem}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulsar { 0%,100% {transform:scale(1);opacity:.35} 50% {transform:scale(1.05);opacity:.65} }
        @keyframes onda { 0%,100% {height:7px} 50% {height:18px} }
      `}</style>
    </div>
  );

  const semSuporte = (
    <div style={est.fundo}>
      <button onClick={onVoltar} style={est.voltar}>← Voltar</button>
      <div style={est.semSuporte}>
        <p style={est.semSuporteTitulo}>Ainda não disponível neste aparelho</p>
        <p style={est.semSuporteTexto}>
          A Sexta-feira por voz funciona hoje só no Android (Chrome). Estamos trabalhando pra trazer pro iPhone em breve.
        </p>
      </div>
    </div>
  );

  // Tela inicial: só um botão. A câmera/mic precisam existir no DOM aqui
  // também, porque iniciarConversa() liga a câmera ANTES de "iniciado" virar
  // true (é só depois da saudação que trocamos pra tela de conversa).
  const telaInicial = (
    <div style={est.fundo}>
      <video ref={videoRef} autoPlay playsInline muted style={est.oculto} />
      <canvas ref={canvasRef} style={est.oculto} />
      <button onClick={onVoltar} style={est.voltar}>← Voltar</button>

      <div style={est.inicioWrapper}>
        <div style={est.rostoWrapper}>
          <svg viewBox="0 0 1536 1536" style={est.svg}>
            <circle cx="768" cy="756" r="424" fill="#F7D89C" />
            <circle cx="768" cy="756" r="414" fill="#000000" />
            <path d={EXPRESSOES.neutra.olhoE} fill="#F5D599" />
            <path d={EXPRESSOES.neutra.olhoD} fill="#F5D599" />
            <path d={EXPRESSOES.neutra.boca} fill="#F5D599" />
          </svg>
        </div>
        <p style={est.inicioTexto}>
          {carregando
            ? 'Te vendo e te ouvindo...'
            : 'Ela vai pedir acesso à câmera e ao microfone pra te ver e te ouvir.'}
        </p>
        <button
          onClick={iniciarConversa}
          disabled={carregando}
          style={{ ...est.botaoIniciar, opacity: carregando ? 0.6 : 1, cursor: carregando ? 'default' : 'pointer' }}
        >
          {carregando ? 'Só um instante...' : 'Falar com a Sexta-feira'}
        </button>
      </div>
    </div>
  );

  if (!mounted) return null;
  if (!suportado) return createPortal(semSuporte, document.body);
  return createPortal(iniciado ? conteudo : telaInicial, document.body);
}

const est = {
  fundo: { position: 'fixed', inset: 0, backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999999, overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  oculto: { position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' },
  voltar: { position: 'absolute', top: 52, left: 24, background: 'none', border: 'none', color: '#8E8E93', fontSize: 15, cursor: 'pointer', zIndex: 30 },
  botaoDiag: { position: 'absolute', top: 50, left: 100, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '7px 9px', cursor: 'pointer', zIndex: 30, display: 'flex' },
  menuContainer: { position: 'absolute', top: 48, right: 24, zIndex: 30 },
  menuBotao: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex' },
  menuOverlay: { position: 'fixed', inset: 0, zIndex: 10 },
  menuDropdown: { position: 'absolute', right: 0, top: 44, width: 215, backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', zIndex: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.8)' },
  menuTitulo: { color: '#8E8E93', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 16px 8px', margin: 0 },
  menuItem: { width: '100%', background: 'none', border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#EBEBF5', fontSize: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left' },
  status: { position: 'absolute', top: 100, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', zIndex: 25 },
  ponto: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  statusTexto: { color: '#8E8E93', fontSize: 12, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rostoWrapper: { position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  anel: { position: 'absolute', width: 308, height: 308, borderRadius: '50%', border: '1.5px solid #F0D290', opacity: 0.35, pointerEvents: 'none', animation: 'pulsar 1.2s ease-in-out infinite' },
  svg: { width: '100%', height: '100%', overflow: 'visible' },
  tracoMorph: { transition: 'd 0.7s cubic-bezier(0.45, 0.05, 0.25, 1)' },
  tracoMorphBoca: { transition: 'd 0.7s cubic-bezier(0.45, 0.05, 0.25, 1), transform 0.08s ease-out' },
  rodape: { marginTop: 36, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ondas: { display: 'flex', alignItems: 'center', gap: 4 },
  onda: { width: 3, height: 8, backgroundColor: '#4CAF50', borderRadius: 2, animation: 'onda 0.8s ease-in-out infinite' },
  dica: { color: '#3A3A3C', fontSize: 12, letterSpacing: '0.06em' },
  painelDiag: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%', backgroundColor: 'rgba(10,10,14,0.96)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', zIndex: 100 },
  painelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  painelTitulo: { color: '#4CAF50', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' },
  painelBotoes: { display: 'flex', gap: 6 },
  btTeste: { background: '#1E5B26', color: '#A5D6A7', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontFamily: 'monospace', cursor: 'pointer' },
  btLimpar: { background: 'rgba(255,255,255,0.08)', color: '#BBB', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontFamily: 'monospace', cursor: 'pointer' },
  btFechar: { background: 'none', color: '#888', border: 'none', fontSize: 16, padding: '0 6px', cursor: 'pointer' },
  barraVolume: { position: 'relative', height: 14, margin: '6px 14px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  barraVolumePreench: { height: '100%', transition: 'width 0.1s' },
  barraVolumeTexto: { position: 'absolute', right: 6, top: 0, fontSize: 9, color: '#FFF', lineHeight: '14px' },
  logs: { flex: 1, overflowY: 'auto', padding: '4px 14px 10px', display: 'flex', flexDirection: 'column' },
  logVazio: { color: '#555', fontSize: 11, textAlign: 'center', marginTop: 20 },
  logLinha: { padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', lineHeight: 1.3 },
  semSuporte: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: '100%', padding: '0 40px', textAlign: 'center' },
  semSuporteTitulo: { color: '#EBEBF5', fontSize: 17, fontWeight: 600, margin: 0 },
  semSuporteTexto: { color: '#8E8E93', fontSize: 14, lineHeight: 1.5, margin: 0, maxWidth: 320 },
  inicioWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '0 32px', textAlign: 'center' },
  inicioTexto: { color: '#8E8E93', fontSize: 14, lineHeight: 1.5, margin: 0, maxWidth: 300 },
  botaoIniciar: { background: '#F0D290', color: '#000', border: 'none', borderRadius: 999, padding: '15px 30px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: 1, transition: 'opacity 0.2s' },
};