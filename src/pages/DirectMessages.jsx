import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useSearchParams } from 'react-router-dom';
import ConversationList from '@/components/dm/ConversationList';
import MessageThread from '@/components/dm/MessageThread';
import { MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DirectMessages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeKey = searchParams.get('c');

  if (!user) return null;

  const handleSelect = (key) => setSearchParams({ c: key });
  const handleBack = () => setSearchParams({});

  return (
    <div className="flex h-[100dvh] w-full bg-black text-white relative overflow-hidden select-none">
      
      {/* Luz ambiente sutil no fundo (Aurora centralizada) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none" />

      {/* =========================================
          COLUNA DA ESQUERDA: LISTA DE CONVERSAS
          ========================================= */}
      {/* No celular (sem chat ativo): Ocupa 100%. No PC: Fica presa em 320px/384px */}
      <div 
        className={cn(
          "flex-shrink-0 h-full border-r border-white/5 bg-black/50 backdrop-blur-3xl transition-all duration-300 z-10",
          activeKey 
            ? "hidden lg:flex lg:w-80 xl:w-96" 
            : "flex-1 flex w-full lg:flex-none lg:w-80 xl:w-96"
        )}
      >
        <div className="w-full h-full">
          <ConversationList
            currentEmail={user.email}
            activeKey={activeKey}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* =========================================
          COLUNA DA DIREITA: SALA DE BATE-PAPO
          ========================================= */}
      <div 
        className={cn(
          "flex-col min-w-0 h-full bg-transparent transition-all duration-300 relative z-20",
          activeKey 
            ? "flex flex-1" 
            : "hidden lg:flex flex-1"
        )}
      >
        {activeKey ? (
          <MessageThread
            conversationKey={activeKey}
            currentUser={user}
            onBack={handleBack}
          />
        ) : (
          /* TELA VAZIA PREMIUM (Quando nenhum chat está aberto no PC) */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative"
            >
               {/* Brilho volumétrico dourado no fundo do ícone */}
              <div className="absolute inset-0 bg-[#FFD700]/10 blur-[50px] rounded-full pointer-events-none" />
              
              {/* Ícone de Pílula Liquid Glass */}
              <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center justify-center mb-6 relative shadow-2xl">
                <MessageCircle className="w-10 h-10 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]" strokeWidth={1.2} />
                <Sparkles className="w-5 h-5 text-white/40 absolute top-5 right-5" strokeWidth={1.5} />
              </div>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[26px] font-semibold tracking-tight text-white mb-3"
              style={{ textShadow: '0 0 15px rgba(255,255,255,0.2)' }}
            >
              Suas Mensagens
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[14px] text-[#8E8E93] max-w-[280px] leading-relaxed"
            >
              Selecione uma conversa ao lado ou inicie um novo chat de forma instantânea.
            </motion.p>
          </div>
        )}
      </div>
      
    </div>
  );
}
