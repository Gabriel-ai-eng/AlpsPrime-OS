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
    <div className="flex h-full w-full bg-transparent text-white relative overflow-hidden select-none">
      
      {/* =========================================
          COLUNA DA ESQUERDA: LISTA DE CONVERSAS
          ========================================= */}
      {/* No celular (sem chat ativo): Ocupa 100%. No PC: Fica presa em 380px */}
      <div 
        className={cn(
          "flex-shrink-0 h-full border-r border-white/10 transition-all duration-300 z-10",
          activeKey 
            ? "hidden lg:flex lg:w-[380px]" 
            : "flex-1 flex w-full lg:flex-none lg:w-[380px]"
        )}
      >
        {/* Fundo de Vidro Translúcido integrado ao fundo do AppShell */}
        <div className="w-full h-full bg-black/20 backdrop-blur-xl">
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
               {/* Brilho volumétrico dourado integrado com o tom Premium do AppShell */}
              <div className="absolute inset-0 bg-[#C9A24F]/15 blur-[50px] rounded-full pointer-events-none" />
              
              {/* Ícone de Pílula Liquid Glass (Estilo idêntico ao menu lateral) */}
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
                }}
              >
                <MessageCircle className="w-10 h-10 text-[#C9A24F] drop-shadow-[0_0_15px_rgba(201,162,79,0.4)]" strokeWidth={1.2} />
                <Sparkles className="w-5 h-5 text-[#C9A24F]/60 absolute top-5 right-5" strokeWidth={1.5} />
              </div>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[26px] font-semibold tracking-tight text-white mb-3"
              style={{ textShadow: '0 0 15px rgba(255,255,255,0.1)' }}
            >
              Alps Messenger
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[14px] text-white/60 max-w-[280px] leading-relaxed"
            >
              Selecione uma conversa ao lado ou inicie um novo chat de forma instantânea.
            </motion.p>
          </div>
        )}
      </div>
      
    </div>
  );
}
