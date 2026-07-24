import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { useT } from '@/lib/i18n';
import { CIRCULO } from './rostoSextaKeyframes';
import { chamarCerebroSexta } from '@/lib/sextaApi';

gsap.registerPlugin(MorphSVGPlugin);

// ============================================================
// ROSTO DA SEXTA-FEIRA — carinha em neon vetorial + assistente de voz.
// Tela única: o rosto e um botão "Falar". Ao tocar, ela pede câmera e
// microfone, comenta a aparência do usuário (visão via Mistral + cérebro
// via OpenRouter) como saudação, e a partir daí escuta e responde por voz
// continuamente (VAD + SpeechRecognition do navegador — hoje só Android).
//
// IMPORTANTE — "esquerdo"/"direito" é do PONTO DE VISTA DA PRÓPRIA IA (como
// se ela estivesse olhando para fora da tela), não de quem está vendo o
// rosto. Por isso fica espelhado: o olho DIREITO da IA aparece do lado
// ESQUERDO da tela, e o olho ESQUERDO da IA aparece do lado DIREITO da
// tela. Mantenha essa convenção em qualquer alteração futura.
// ============================================================

// viewBox 941x1672 · rosto centrado em (470,813), raio 193.
const FELIZ = {
  olhoDireitoIA: 'M 398 740 C 411.8 740 423 757.9 423 780 C 423 802.1 411.8 820 398 820 C 384.2 820 373 802.1 373 780 C 373 757.9 384.2 740 398 740 Z', // lado esquerdo da tela
  olhoEsquerdoIA: 'M 542 740 C 555.8 740 567 757.9 567 780 C 567 802.1 555.8 820 542 820 C 528.2 820 517 802.1 517 780 C 517 757.9 528.2 740 542 740 Z', // lado direito da tela — mesmo oval aberto, espelhado
  boca:  'M 393 882 Q 473 952 545 886',
};

// Bocas para o "lip-sync" — FECHADA e ABERTA têm A MESMA estrutura (M Q Q Z,
// dois cantos + dois pontos de controle), então o MorphSVG interpola entre
// elas de forma linear e suave. Enquanto ela fala, a abertura (0..1) é
// dirigida pelo ritmo da fala e trocamos a boca sorriso (FELIZ.boca) por
// estas; ao terminar, voltamos ao sorriso.
const BOCA_FECHADA = 'M 400 886 Q 470 894 540 886 Q 470 898 400 886 Z';
const BOCA_ABERTA  = 'M 400 886 Q 470 862 540 886 Q 470 928 400 886 Z';

// Chave da visão (Mistral) fica no navegador mesmo — não migrada pro
// servidor. O cérebro (OpenRouter) roda em api/fn/sextaChat.
const MISTRAL_API_KEY = "MnfXDbULqv5vx0dcexB8yyXUd7goL0tw";
const MODELO_VISAO = "pixtral-12b-2409";

const SISTEMA_PROMPT = `Você é a Sexta-feira, uma IA com presença humana real, calorosa e direta. Conversa em português do Brasil de forma natural e curta (1 a 2 frases). NUNCA diga frases genéricas como "Estou ouvindo", "Pode falar", "Como posso ajudar". Responda SEMPRE ao que a pessoa acabou de dizer, comentando, perguntando ou opinando especificamente sobre isso. Sem markdown, sem listas, sem asteriscos — apenas fala direta como num diálogo humano.`;

const SISTEMA_VISAO = SISTEMA_PROMPT + ` Você está vendo o utilizador agora pela câmera. Descreva uma observação visual genuína (roupa, ambiente, expressão) numa frase curta se isso enriquecer a resposta. Não force a observação se não fizer sentido.`;

export default function RostoSexta({ onVoltar }) {
  const svgRef = useRef(null);
  const t = useT();

  // Reconhecimento de voz por navegador só existe no Chrome/Android — no
  // Safari/iOS a API nem existe.
  const [suportado] = useState(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [iniciado, setIniciado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [estaFalando, setEstaFalando] = useState(false);
  const [estaOuvindo, setEstaOuvindo] = useState(false);
  const [status, setStatus] = useState('');

  const log = useCallback((tipo, mensagem) => { console.log(`[${tipo}] ${mensagem}`); }, []);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamVideoRef = useRef(null);
  const streamAudioRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const vadAtivoRef = useRef(false);
  const reconhecendoRef = useRef(false);
  const falandoRef = useRef(false);
  const morphBocaRef = useRef(null);   // tween pausado (fechada→aberta), dirigido por .progress()
  const rafBocaRef = useRef(null);     // loop de animação da boca
  const aberturaRef = useRef(0);       // abertura suavizada da boca (0..1)
  const picoBocaRef = useRef(0);       // "sotaque" que sobe a cada início de palavra (boundary)
  const historicoRef = useRef([]);
  const tempoComecouFalarRef = useRef(0);
  const ignorarMicAteRef = useRef(0);
  const ultimaDescricaoVisualRef = useRef(null);

  useEffect(() => { falandoRef.current = estaFalando; }, [estaFalando]);

  // ==========================================
  // CÂMERA
  // ==========================================
  const iniciarCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 }
      });
      streamVideoRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      log('CÂMERA', `ERRO: ${err.name}`);
    }
  }, [log]);

  const capturarFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    canvas.width = 320; canvas.height = 240;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0, 320, 240);
    return canvas.toDataURL('image/jpeg', 0.55);
  }, []);

  // ==========================================
  // VISÃO — Mistral Pixtral (descreve a cena em texto curto)
  // ==========================================
  const descreverCena = useCallback(async (frame) => {
    if (!MISTRAL_API_KEY) return null;
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
      if (!res.ok) { log('VISÃO', `ERRO HTTP ${res.status}`); return null; }
      const data = await res.json();
      return (data?.choices?.[0]?.message?.content || '').trim();
    } catch (e) {
      log('VISÃO', `Erro de rede: ${e.message}`);
      return null;
    }
  }, [log]);

  // ==========================================
  // CÉREBRO — OpenRouter (via api/fn/sextaChat no servidor)
  // ==========================================
  const chamarCerebro = useCallback(async (texto, historico, descricaoVisual) => {
    const mensagens = [
      { role: 'system', content: descricaoVisual ? SISTEMA_VISAO : SISTEMA_PROMPT }
    ];
    if (descricaoVisual) {
      mensagens.push({ role: 'system', content: `[O que você vê agora pela câmera: ${descricaoVisual}]` });
    }
    for (const m of historico) {
      mensagens.push({ role: m.role, content: typeof m.content === 'string' ? m.content : '' });
    }
    mensagens.push({ role: 'user', content: texto });

    try {
      return await chamarCerebroSexta(mensagens);
    } catch (e) {
      log('CÉREBRO', `ERRO: ${e.message}`);
      throw e;
    }
  }, [log]);

  const processarMensagem = useCallback(async (textoUtilizador) => {
    setStatus('Pensando...');

    let descricaoVisual = ultimaDescricaoVisualRef.current?.texto || null;
    const agora = Date.now();
    const ultimaCalculada = ultimaDescricaoVisualRef.current?.quando || 0;
    if (streamVideoRef.current && (agora - ultimaCalculada > 30000)) {
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
      falar('Tive um problema pra pensar agora, tenta de novo.');
      setStatus('');
      return;
    }

    resposta = resposta
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*+/g, '')
      .replace(/#+\s/g, '')
      .trim();

    if (!resposta) { falar('Não consegui formar uma resposta agora.'); setStatus(''); return; }

    historicoRef.current = [
      ...historicoRef.current.slice(-8),
      { role: 'user', content: textoUtilizador },
      { role: 'assistant', content: resposta }
    ].slice(-12);
    setStatus('');
    falar(resposta);
    // eslint-disable-next-line
  }, [chamarCerebro, capturarFrame, descreverCena]);

  // ==========================================
  // RECONHECIMENTO DE FALA (STT do navegador)
  // ==========================================
  const dispararReconhecimento = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
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
    };
    rec.onresult = async (e) => {
      const texto = e.results[0][0].transcript.trim();
      setEstaOuvindo(false);
      if (texto && texto.length > 0) {
        setStatus(`"${texto}"`);
        await processarMensagem(texto);
      } else setStatus('');
    };
    rec.onend = () => { reconhecendoRef.current = false; setEstaOuvindo(false); };
    rec.onerror = (e) => {
      reconhecendoRef.current = false;
      setEstaOuvindo(false);
      if (e.error === 'no-speech' || e.error === 'aborted') setStatus('');
      else if (e.error === 'not-allowed') setStatus('Microfone bloqueado');
      else setStatus('');
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch (e) {}
  }, [processarMensagem]);

  // ==========================================
  // VAD — detecta quando o usuário começa a falar
  // ==========================================
  const iniciarVAD = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false }
      });
      streamAudioRef.current = stream;

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

        if (falandoRef.current) {
          if (agora - tempoComecouFalarRef.current > 800 && volume > 75) {
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
            dispararReconhecimento();
            contadorVoz = 0;
          }
        } else contadorVoz = Math.max(0, contadorVoz - 1);
        requestAnimationFrame(monitorar);
      };
      monitorar();
    } catch (err) {
      setStatus('Sem permissão de microfone');
    }
    // eslint-disable-next-line
  }, [dispararReconhecimento]);

  // ==========================================
  // FALAR — voz nativa do navegador (SpeechSynthesis), com boca animada
  // ==========================================
  // Para a animação da boca. `voltarSorriso` faz ela voltar ao sorriso de repouso.
  const pararMorphBoca = useCallback((voltarSorriso) => {
    if (rafBocaRef.current) { cancelAnimationFrame(rafBocaRef.current); rafBocaRef.current = null; }
    if (morphBocaRef.current) { morphBocaRef.current.kill(); morphBocaRef.current = null; }
    aberturaRef.current = 0;
    picoBocaRef.current = 0;
    const els = svgRef.current?.querySelectorAll('.f-boca');
    if (els?.length && voltarSorriso) {
      gsap.to(els, { morphSVG: { shape: FELIZ.boca, type: 'linear', shapeIndex: 0 }, duration: 0.25, ease: 'power2.out' });
    }
  }, []);

  const pararFala = useCallback(() => {
    window.speechSynthesis?.cancel();
    pararMorphBoca(true);
    setEstaFalando(false);
  }, [pararMorphBoca]);

  // Boca "falando": MorphSVG entre FECHADA e ABERTA, com a abertura (progress
  // 0..1) dirigida por um envelope que imita sílabas moduladas por um ritmo de
  // palavras — e um "pico" a cada evento de boundary (início real de palavra).
  const animarBoca = useCallback(() => {
    setEstaFalando(true);
    tempoComecouFalarRef.current = performance.now();
    const els = svgRef.current?.querySelectorAll('.f-boca');
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!els?.length || reduz) return;

    if (rafBocaRef.current) cancelAnimationFrame(rafBocaRef.current);
    if (morphBocaRef.current) morphBocaRef.current.kill();

    // baseline fechada + tween pausado até a boca aberta (progress = abertura)
    gsap.set(els, { attr: { d: BOCA_FECHADA } });
    morphBocaRef.current = gsap.to(els, {
      morphSVG: { shape: BOCA_ABERTA, type: 'linear', shapeIndex: 0 },
      duration: 1, paused: true, ease: 'none',
    });

    let fase = Math.random() * 10;
    const loop = () => {
      fase += 0.9;
      const silaba = Math.sin(fase * 0.55) * 0.5 + 0.5;            // vai e volta rápido (sílabas)
      const palavra = 0.4 + 0.6 * Math.abs(Math.sin(fase * 0.13)); // envelope mais lento (palavras/frases)
      let alvo = silaba * palavra + picoBocaRef.current;
      picoBocaRef.current *= 0.85;                                 // o pico do boundary decai
      alvo = Math.max(0, Math.min(1, alvo));
      aberturaRef.current += (alvo - aberturaRef.current) * 0.35;  // suaviza (sem pulos)
      morphBocaRef.current?.progress(aberturaRef.current);
      rafBocaRef.current = requestAnimationFrame(loop);
    };
    rafBocaRef.current = requestAnimationFrame(loop);
  }, []);

  const acabarFala = useCallback(() => {
    pararMorphBoca(true);
    setEstaFalando(false);
    ignorarMicAteRef.current = performance.now() + 400;
  }, [pararMorphBoca]);

  const falarComNavegador = useCallback((texto) => {
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
    // A cada início de palavra (quando o navegador suporta boundary), dá um
    // "sotaque" na boca — abre um pouco mais, deixando o movimento no ritmo
    // real das palavras que ela está falando.
    u.onboundary = () => { picoBocaRef.current = 0.55; };
    u.onend = acabarFala;
    u.onerror = () => acabarFala();
    window.speechSynthesis.speak(u);
  }, [animarBoca, acabarFala]);

  const falar = useCallback((texto) => {
    if (!texto) return;
    pararFala();
    falarComNavegador(texto);
  }, [falarComNavegador, pararFala]);

  // ==========================================
  // SAUDAÇÃO INICIAL — comenta a aparência do usuário pela câmera
  // ==========================================
  const gerarSaudacaoInicial = useCallback(async () => {
    setStatus('Te vendo...');

    let descricaoVisual = null;
    if (streamVideoRef.current) {
      const frame = capturarFrame();
      if (frame) {
        descricaoVisual = await descreverCena(frame);
        if (descricaoVisual) ultimaDescricaoVisualRef.current = { texto: descricaoVisual, quando: Date.now() };
      }
    }

    const instrucao = descricaoVisual
      ? 'Este é o primeiro contato: cumprimente o usuário agora, de um jeito criativo, caloroso e bem pessoal — comente algo genuíno e específico sobre a aparência ou o visual dele que você está vendo pela câmera agora (pode ser roupa, sorriso, estilo, penteado, o ambiente), como um elogio sincero, sem exagero. Termine perguntando como ele está.'
      : 'Este é o primeiro contato: cumprimente o usuário agora de um jeito criativo, caloroso e curto, perguntando como ele está.';

    let saudacao = '';
    try {
      saudacao = await chamarCerebro(instrucao, [], descricaoVisual);
    } catch (e) {}

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
  }, [capturarFrame, descreverCena, chamarCerebro, falar]);

  // Único botão da tela: pede câmera + microfone e já entra conversando
  // (a saudação comenta o que a câmera está vendo).
  const iniciarConversa = useCallback(async () => {
    if (carregando || iniciado) return;
    setCarregando(true);
    try {
      await iniciarCamera();
      await iniciarVAD();
      await new Promise((r) => setTimeout(r, 700));
      await gerarSaudacaoInicial();
    } finally {
      setIniciado(true);
      setCarregando(false);
    }
  }, [carregando, iniciado, iniciarCamera, iniciarVAD, gerarSaudacaoInicial]);

  // ==========================================
  // MONTAGEM / DESMONTAGEM
  // ==========================================
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
      vadAtivoRef.current = false;
      window.speechSynthesis?.cancel();
      if (rafBocaRef.current) cancelAnimationFrame(rafBocaRef.current);
      if (morphBocaRef.current) morphBocaRef.current.kill();
      if (streamVideoRef.current) streamVideoRef.current.getTracks().forEach(t => t.stop());
      if (streamAudioRef.current) streamAudioRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    };
  }, []);

  const semSuporte = (
    <div className="fixed inset-0 z-[999999] bg-[#f1ece5] flex flex-col items-center justify-center gap-3 px-10 text-center">
      <button onClick={onVoltar} aria-label={t('Voltar')} className="absolute top-6 left-5 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/[0.06] backdrop-blur-sm text-black/50 hover:text-black/80 active:scale-90 transition">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <p className="text-black/80 text-[17px] font-semibold">Ainda não disponível neste aparelho</p>
      <p className="text-black/50 text-sm leading-relaxed max-w-[300px]">
        A Sexta-feira por voz funciona hoje só no Android (Chrome). Estamos trabalhando pra trazer pro iPhone em breve.
      </p>
    </div>
  );

  const conteudo = (
    <div className="fixed inset-0 z-[999999] bg-[#f1ece5] overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />

      <svg
        ref={svgRef}
        viewBox="0 0 941 1672"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full select-none"
      >
        <defs>
          <linearGradient id="rs-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6f2ec"/>
            <stop offset="0.5" stopColor="#efe9e3"/>
            <stop offset="0.72" stopColor="#f1ebe4"/>
            <stop offset="1" stopColor="#eae4df"/>
          </linearGradient>
          <radialGradient id="rs-top" cx="0.5" cy="0.04" r="0.75">
            <stop offset="0" stopColor="#fffdf7" stopOpacity="0.95"/>
            <stop offset="0.35" stopColor="#fbf5ec" stopOpacity="0.45"/>
            <stop offset="1" stopColor="#fbf5ec" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="rs-vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.62" stopColor="#000000" stopOpacity="0"/>
            <stop offset="1" stopColor="#cabfad" stopOpacity="0.10"/>
          </radialGradient>
          <radialGradient id="rs-horiz" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff7ea" stopOpacity="0.85"/>
            <stop offset="1" stopColor="#fff7ea" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="rs-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffef9"/>
            <stop offset="0.5" stopColor="#f7e4cc"/>
            <stop offset="1" stopColor="#f0d6b8"/>
          </linearGradient>
          <filter id="rs-haloBig" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"/></filter>
          <filter id="rs-haloSoft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2"/></filter>
          <filter id="rs-blurLine" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14"/></filter>
        </defs>

        {/* fundo */}
        <rect width="941" height="1672" fill="url(#rs-bg)"/>
        <rect width="941" height="1672" fill="url(#rs-top)"/>
        <ellipse cx="470" cy="1200" rx="430" ry="46" fill="url(#rs-horiz)" filter="url(#rs-blurLine)"/>
        <rect x="120" y="1196" width="700" height="6" rx="3" fill="#fff8ec" opacity="0.5" filter="url(#rs-haloSoft)"/>
        <rect width="941" height="1672" fill="url(#rs-vig)"/>

        {/* rosto */}
        <g className={estaOuvindo ? 'rosto-grupo rosto-ouvindo' : 'rosto-grupo'} style={{ transformOrigin: '470px 813px' }}>
          {/* HALO difuso */}
          <g filter="url(#rs-haloBig)" opacity="0.42" fill="none" stroke="#edcca2" strokeLinecap="round" strokeLinejoin="round">
            <path className="estela" d={CIRCULO} strokeWidth="11"/>
            <path d={FELIZ.olhoDireitoIA} strokeWidth="7"/>
            <path d={FELIZ.olhoEsquerdoIA} strokeWidth="7"/>
            <path className="f-boca" d={FELIZ.boca} strokeWidth="9"/>
          </g>
          {/* brilho MÉDIO */}
          <g filter="url(#rs-haloSoft)" fill="none" stroke="url(#rs-gold)" strokeLinecap="round" strokeLinejoin="round">
            <path className="estela" d={CIRCULO} strokeWidth="5.5"/>
            <path d={FELIZ.olhoDireitoIA} strokeWidth="4"/>
            <path d={FELIZ.olhoEsquerdoIA} strokeWidth="4"/>
            <path className="f-boca" d={FELIZ.boca} strokeWidth="4.6"/>
          </g>
          {/* NÚCLEO nítido */}
          <g fill="none" stroke="#fffdf6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
            <path className="estela" d={CIRCULO} strokeWidth="2.4"/>
            <path d={FELIZ.olhoDireitoIA} strokeWidth="1.8"/>
            <path d={FELIZ.olhoEsquerdoIA} strokeWidth="1.8"/>
            <path className="f-boca" d={FELIZ.boca} strokeWidth="2.2"/>
          </g>
        </g>
      </svg>

      {/* Voltar */}
      <button
        onClick={onVoltar}
        aria-label={t('Voltar')}
        className="absolute top-6 left-5 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/[0.06] backdrop-blur-sm text-black/50 hover:text-black/80 active:scale-90 transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Único botão da tela: falar com ela */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ top: '66%' }}>
        {status && (
          <p className="text-black/50 text-[13px] max-w-[260px] truncate text-center">{status}</p>
        )}
        {!iniciado && (
          <button
            onClick={iniciarConversa}
            disabled={carregando}
            className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white/70 backdrop-blur px-6 py-3.5 text-[15px] font-semibold text-black/80 shadow-sm active:scale-95 transition disabled:opacity-60"
          >
            {carregando ? 'Só um instante...' : 'Falar'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes rosto-pulsar { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02); } }
        .rosto-ouvindo { animation: rosto-pulsar 1.4s ease-in-out infinite; }
      `}</style>
    </div>
  );

  if (!suportado) return createPortal(semSuporte, document.body);
  return createPortal(conteudo, document.body);
}
