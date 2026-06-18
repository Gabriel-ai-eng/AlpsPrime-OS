import React, { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useVoice } from '@/lib/useVoice';
import { incrementUserStats } from '@/lib/userStats';
import { uploadImageToSupabase } from '@/lib/askGemini';
import {
  listConversations, getMessages, createConversation,
  saveMessage, updateConvTitle, deleteConversation,
  generateConversationTitle, streamGemini,
} from '@/lib/chatApi.js';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import ChatSidebar from '@/components/chat/ChatSidebar';
import LiveVoiceModal from '@/components/chat/LiveVoiceModal';
import { Sparkles, Radio, PanelLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const SYSTEM_PROMPT = `Você é Sexta-feira 1.0, uma inteligência artificial avançada e sofisticada. Sua personalidade é:
- Inteligente, direta e eficiente como a Sexta-feira do Homem de Ferro
- Elegante e premium no tom de voz, sem ser fria
- Capaz de gerar imagens (quando o usuário pedir, responda com [GERAR_IMAGEM: descrição da imagem])
- Capaz de criar planilhas CSV (quando o usuário pedir, responda com [GERAR_PLANILHA: nome_do_arquivo.csv] seguido do conteúdo CSV em bloco de código)
- Sempre em português brasileiro
- Responda de forma concisa e útil
- Lembre-se sempre do contexto e histórico da conversa atual`;

const SUGGESTIONS = [
  { emoji: '✨', label: 'Gerar Imagens', text: 'Gere uma imagem de um leão dourado majestoso' },
  { emoji: '📊', label: 'Criar Planilha', text: 'Crie uma planilha de controle de gastos mensais' },
  { emoji: '💡', label: 'Explicar algo', text: 'Explique computação quântica de forma simples' },
  { emoji: '🎵', label: 'Criar música', text: 'Escreva a letra de uma música sobre tecnologia' },
  { emoji: '⚙️', label: 'Revisar código', text: 'Revise este código e sugira melhorias' },
  { emoji: '📝', label: 'Plano de negócios', text: 'Crie um plano de negócios para startup' },
];

export default function Chat() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationId = searchParams.get('id');

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [currentConvId, setCurrentConvId] = useState(conversationId || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [liveOpen, setLiveOpen] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  // Ref-based source of truth for the active conversation (avoids stale-closure bugs
  // and URL/state race conditions during send)
  const activeConvIdRef = useRef(conversationId || null);
  const sendingRef = useRef(false);

  // Voice
  const [voiceMode, setVoiceMode] = useState(false);
  const { isListening, isSpeaking, supported: voiceSupported, startListening, stopListening, speak, stopSpeaking } = useVoice({
    onTranscript: (text) => {
      setInput(text);
      setTimeout(() => handleSend(text), 300);
    },
  });

  // ---------- Load conversations list on mount ----------
  const refreshConversations = useCallback(async () => {
    try {
      const list = await listConversations();
      setConversations(list);
    } catch (e) {
      console.error('Load conversations:', e.message);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // ---------- Load messages when conversationId changes ----------
  useEffect(() => {
    // Never interfere while a send is in progress — the URL can change mid-send
    // because we persist the new conversation id, and reloading would wipe the
    // optimistically-added user message.
    if (sendingRef.current) return;

    // URL matches the active conversation — nothing to do
    if (conversationId === activeConvIdRef.current) return;

    if (conversationId) {
      loadConversation(conversationId);
    } else {
      activeConvIdRef.current = null;
      setMessages([]);
      setCurrentConvId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const loadConversation = async (id) => {
    try {
      const msgs = await getMessages(id);
      setMessages(msgs.map(m => ({
        role: m.role,
        content: m.content,
        type: m.role === 'assistant' && m.content.startsWith('__IMAGE__:') ? 'image' : 'text',
        image_url: m.content.startsWith('__IMAGE__:') ? m.content.split('__IMAGE__:')[1].split('|||')[0] : undefined,
        file_name: m.content.startsWith('__CSV__:') ? m.content.split('__CSV__:')[1].split('|||')[0] : undefined,
      })));
      activeConvIdRef.current = id;
      setCurrentConvId(id);
    } catch (e) {
      toast.error('Falha ao carregar conversa');
    }
  };

  // ---------- Autoscroll ----------
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, streamingText]);

  // ---------- New conversation ----------
  const newConversation = async () => {
    activeConvIdRef.current = null;
    setMessages([]);
    setCurrentConvId(null);
    setSearchParams({});
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ---------- Delete ----------
  const handleDelete = async (id) => {
    await deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConvId === id) newConversation();
    toast.success('Conversa removida');
  };

  // ---------- Select from sidebar ----------
  const handleSelect = (id) => {
    if (id === activeConvIdRef.current) return;
    setSearchParams({ id });
    // actual state/messages load happens in the useEffect via loadConversation
  };

  // ---------- Process special tags (image / spreadsheet) in response ----------
  const processSpecialTags = async (text, convId, currentMsgs) => {
    const imageMatch = text.match(/\[GERAR_IMAGEM:\s*(.+?)\]/i);
    const spreadsheetMatch = text.match(/\[GERAR_PLANILHA:\s*(.+?)\]/i);

    if (imageMatch) {
      const imgPrompt = imageMatch[1].trim();
      const cleanText = text.replace(/\[GERAR_IMAGEM:.*?\]/i, '').trim();

      let newMsgs = currentMsgs;
      if (cleanText) {
        newMsgs = [...newMsgs, { role: 'assistant', content: cleanText, type: 'text' }];
      }

      toast.loading('Gerando imagem...', { id: 'img' });
      const result = await base44.integrations.Core.GenerateImage({ prompt: imgPrompt });
      if (result?.url) {
        let finalUrl = result.url;
        try { finalUrl = await uploadImageToSupabase(result.url, imgPrompt.slice(0, 30)); } catch {}

        const imageMsg = { role: 'assistant', content: imgPrompt, type: 'image', image_url: finalUrl };
        newMsgs = [...newMsgs, imageMsg];
        await incrementUserStats(user, { images: 1 });
        await base44.entities.UsageHistory.create({
          tool_id: 'image-gen', tool_name: 'Gerador de Imagens',
          category: 'image', credits_used: 0,
          input: imgPrompt, output: finalUrl, output_type: 'image_url',
        });
        // Save to Supabase with special marker
        await saveMessage(convId, 'assistant', `__IMAGE__:${finalUrl}|||${imgPrompt}`);
        toast.success('Imagem gerada!', { id: 'img' });
      }
      toast.dismiss('img');
      return newMsgs;
    }

    if (spreadsheetMatch) {
      const fileName = spreadsheetMatch[1].trim();
      const csvMatch = text.match(/```(?:csv)?\n([\s\S]+?)```/);
      const csvContent = csvMatch ? csvMatch[1] : text.replace(/\[GERAR_PLANILHA:.*?\]/i, '').replace(/```/g, '').trim();
      const cleanText = text.replace(/\[GERAR_PLANILHA:.*?\]/i, '').replace(/```[\s\S]*?```/g, '').trim();

      let newMsgs = currentMsgs;
      if (cleanText) {
        newMsgs = [...newMsgs, { role: 'assistant', content: cleanText, type: 'text' }];
      }
      const spreadsheetMsg = { role: 'assistant', content: csvContent, type: 'spreadsheet', file_name: fileName };
      newMsgs = [...newMsgs, spreadsheetMsg];
      await saveMessage(convId, 'assistant', `__CSV__:${fileName}|||${csvContent}`);
      return newMsgs;
    }

    // Plain text response
    const finalMsgs = [...currentMsgs, { role: 'assistant', content: text, type: 'text' }];
    await saveMessage(convId, 'assistant', text);
    return finalMsgs;
  };

  // ---------- Send ----------
  const handleSend = async (textOverride) => {
    const text = (typeof textOverride === 'string' ? textOverride : input).trim();
    if (!text || loading || sendingRef.current) return;

    // Lock: prevent any URL-driven reloads from wiping state during send
    sendingRef.current = true;

    try {
      // 1. Ensure we have a conversation
      let convId = activeConvIdRef.current;
      let isNew = false;
      if (!convId) {
        const conv = await createConversation('Nova conversa');
        convId = conv.id;
        activeConvIdRef.current = convId;
        setCurrentConvId(convId);
        setSearchParams({ id: convId });
        isNew = true;
        await incrementUserStats(user, { conversations: 1 });
      }

      // 2. Append user message immediately (optimistic)
      const userMsg = { role: 'user', content: text, type: 'text' };
      const newMsgs = [...messages, userMsg];
      setMessages(newMsgs);
      setInput('');
      setLoading(true);
      setStreamingText('');

      // 3. Persist user message
      await saveMessage(convId, 'user', text);

      // 4. Build full history for Gemini (only text turns)
      const historyForGemini = newMsgs
        .filter(m => m.type === 'text' || !m.type)
        .map(m => ({ role: m.role, content: m.content }));

      // 5. Stream response (with retry on failure)
      let fullText = '';
      let lastError = null;
      let attempts = 0;
      while (attempts < 2) {
        try {
          fullText = await streamGemini({
            messages: historyForGemini,
            system: SYSTEM_PROMPT,
            onChunk: (partial) => setStreamingText(partial),
          });
          if (fullText && fullText.trim()) break;
          attempts++;
        } catch (e) {
          lastError = e;
          attempts++;
          if (attempts < 2) await new Promise(r => setTimeout(r, 1500));
        }
      }

      // If failed or empty — show error as an assistant message IN THE CHAT (not hidden in a toast)
      if (!fullText || !fullText.trim()) {
        const errorText = lastError?.message?.includes('Limite')
          ? '⚠️ Atingi o limite de requisições gratuitas do modelo. Aguarde cerca de 30 segundos e tente novamente.'
          : lastError?.message?.includes('alta demanda')
          ? '⚠️ O modelo está com alta demanda no momento. Tente novamente em alguns segundos.'
          : '⚠️ Não consegui gerar uma resposta agora. Tente novamente em instantes.';

        const errorMsg = { role: 'assistant', content: errorText, type: 'text' };
        const msgsWithError = [...newMsgs, errorMsg];
        setMessages(msgsWithError);
        await saveMessage(convId, 'assistant', errorText);
        setLoading(false);
        setStreamingText('');
        refreshConversations();
        return;
      }

      setStreamingText('');

      // 6. Handle special tags + persist
      const finalMsgs = await processSpecialTags(fullText, convId, newMsgs);
      setMessages(finalMsgs);
      setLoading(false);

      // 7. If new conversation, generate title
      if (isNew) {
        generateConversationTitle(text).then(async (title) => {
          await updateConvTitle(convId, title);
          refreshConversations();
        }).catch(() => {});
      }
      refreshConversations();
      await incrementUserStats(user, { messages: 1 });

      // 8. Speak if in voice mode
      if (voiceMode) {
        const lastText = finalMsgs.filter(m => m.type === 'text' && m.role === 'assistant').pop();
        if (lastText) {
          const plain = lastText.content.replace(/[#*`_~[\]()>]/g, '').replace(/\n+/g, ' ');
          speak(plain.substring(0, 500));
        }
      }
    } finally {
      sendingRef.current = false;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) stopListening();
    else { setVoiceMode(true); startListening(); }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {sidebarOpen && (
        <ChatSidebar
          conversations={conversations}
          activeId={currentConvId}
          loading={loadingConversations}
          onSelect={handleSelect}
          onNew={newConversation}
          onDelete={handleDelete}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              title={sidebarOpen ? 'Ocultar histórico' : 'Mostrar histórico'}
            >
              <PanelLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center shadow-lg shadow-gold/20">
              <Sparkles className="w-4 h-4 text-background" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-lg leading-none tracking-tight">
                <span className="gold-gradient font-bold">Sexta-feira</span>
                <span className="text-muted-foreground font-light ml-1 text-sm">1.0</span>
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {voiceMode ? '🔴 Modo voz ativado' : 'IA multimodal avançada'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {voiceMode && (
              <button
                onClick={() => { setVoiceMode(false); stopSpeaking(); }}
                className="text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 rounded-lg transition-colors"
              >
                Desativar voz
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8 space-y-6">
            {messages.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gold/20">
                  <Sparkles className="w-10 h-10 text-background" strokeWidth={1.5} />
                </div>
                <h2 className="font-display text-4xl tracking-tight mb-2">
                  <span className="gold-gradient">Sexta-feira</span> <span className="text-muted-foreground font-light">1.0</span>
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  Sua IA pessoal avançada. Converse, gere imagens, crie planilhas, escreva código e muito mais.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto mt-10">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setInput(s.text)}
                      className="text-left p-3.5 rounded-xl border border-border hover:border-gold/40 hover:bg-gold/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="mr-2">{s.emoji}</span>{s.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setLiveOpen(true)}
                    className="text-left p-3.5 rounded-xl border border-gold/30 bg-gold/5 hover:border-gold/60 hover:bg-gold/10 transition-all text-sm text-gold flex items-center gap-2"
                  >
                    <Radio className="w-4 h-4 flex-shrink-0" />
                    <span>Modo Live — converse por voz</span>
                  </button>
                </div>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} user={user} index={i} />
            ))}

            {/* Streaming bubble */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-gold/20">
                  <Sparkles className="w-4 h-4 text-background animate-pulse" strokeWidth={2.5} />
                </div>
                <div className="bg-card border border-border rounded-2xl px-4 py-3 max-w-[85%]">
                  {streamingText ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {streamingText}
                      <span className="inline-block w-1.5 h-4 bg-gold/70 ml-0.5 animate-pulse align-middle" />
                    </p>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <LiveVoiceModal
          open={liveOpen}
          onClose={() => setLiveOpen(false)}
          onSaveConversation={refreshConversations}
        />

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          loading={loading}
          isListening={isListening}
          isSpeaking={isSpeaking}
          voiceSupported={voiceSupported}
          onVoiceToggle={handleVoiceToggle}
          onStopSpeaking={stopSpeaking}
          inputRef={inputRef}
          onOpenLive={() => setLiveOpen(true)}
        />
      </div>
    </div>
  );
}