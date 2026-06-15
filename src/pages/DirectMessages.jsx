import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useSearchParams } from 'react-router-dom';
import ConversationList from '@/components/dm/ConversationList';
import MessageThread from '@/components/dm/MessageThread';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DirectMessages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeKey = searchParams.get('c');

  if (!user) return null;

  const handleSelect = (key) => setSearchParams({ c: key });
  const handleBack = () => setSearchParams({});

  return (
    <div className="flex h-full w-full bg-background relative overflow-hidden">
      
      {/* Coluna da Esquerda: Lista de Conversas */}
      {/* No celular (sem chat ativo): Ocupa 100% (w-full). No PC: Fica presa em 320px (lg:w-80) */}
      <div 
        className={cn(
          "flex-shrink-0 h-full border-r border-border transition-all duration-300",
          activeKey 
            ? "hidden lg:flex lg:w-80" 
            : "flex-1 flex w-full lg:flex-none lg:w-80"
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

      {/* Coluna da Direita: Sala de Bate-Papo */}
      <div 
        className={cn(
          "flex-col min-w-0 h-full bg-background transition-all duration-300",
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mb-4 shadow-lg shadow-gold/5">
              <MessageCircle className="w-7 h-7 text-gold" />
            </div>
            <h2 className="font-display text-2xl tracking-tight mb-1">
              Suas <span className="gold-gradient italic">mensagens</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Selecione uma conversa ao lado ou busque pessoas para iniciar um novo chat.
            </p>
          </div>
        )}
      </div>
      
    </div>
  );
}
