import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Clock, MessageSquare, ImageIcon, Code2, Music, Coins } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  text: MessageSquare,
  image: ImageIcon,
  code: Code2,
  audio: Music,
};

export default function History() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['usage-history'],
    queryFn: () => base44.entities.UsageHistory.list('-created_date', 50),
  });

  return (
    <div className="min-h-full">
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Atividade</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
            Histórico de <span className="gold-gradient italic">Uso</span>
          </h1>
          <p className="text-muted-foreground mt-2">Suas últimas interações com as ferramentas.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl mb-2">Nenhuma atividade ainda</h3>
            <p className="text-muted-foreground text-sm">Comece a usar as ferramentas para ver seu histórico aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => {
              const Icon = CATEGORY_ICONS[item.category] || MessageSquare;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex items-start gap-4 bg-card border border-border rounded-xl p-4 hover:border-gold/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-medium text-sm">{item.tool_name}</h4>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_date), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    {item.input && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.input}</p>
                    )}
                    {item.output_type === 'image_url' && item.output && (
                      <img src={item.output} alt="" className="w-20 h-20 rounded-lg object-cover mt-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gold flex-shrink-0">
                    <Coins className="w-3 h-3" />
                    <span className="font-medium">{item.credits_used}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}