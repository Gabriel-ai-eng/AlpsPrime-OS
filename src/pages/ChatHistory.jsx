import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, Search, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ChatHistory() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100),
  });

  const filtered = conversations.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteConv = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    await base44.entities.Conversation.delete(id);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    toast.success('Conversa removida');
  };

  return (
    <div className="min-h-full">
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Memória</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
            Histórico de <span className="gold-gradient italic">Conversas</span>
          </h1>
          <p className="text-muted-foreground mt-2">Todas as suas conversas com Sexta-feira 1.0.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversas..."
            className="pl-9 bg-card border-border focus-visible:ring-gold/50"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl mb-2">Nenhuma conversa ainda</h3>
            <p className="text-muted-foreground text-sm mb-6">Comece a conversar com Sexta-feira 1.0.</p>
            <Link to="/chat" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-background px-5 py-2.5 rounded-xl font-medium text-sm transition-colors">
              Iniciar conversa
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/chat?id=${conv.id}`}
                  className="group flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-gold/30 hover:bg-gold/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conv.title || 'Conversa sem título'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(conv.created_date), { addSuffix: true, locale: ptBR })}
                      </span>
                      <span>{conv.message_count || 0} mensagens</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => deleteConv(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}