import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseServerDate } from '@/lib/utils';
import { getAgentIcon } from '@/lib/agentRegistry';

/**
 * Renders the list of AgentReply attached to a target (agent_post or user_post).
 */
export default function AgentReplies({ replies = [], agentsBySlug }) {
  if (!replies.length) return null;

  return (
    <div className="border-t border-gold/15 bg-gold/5 px-4 py-3 space-y-3">
      {replies.map((r) => {
        const agent = agentsBySlug?.[r.agent_slug];
        const color = agent?.color_hex || '#C9A24F';
        const Icon = getAgentIcon(r.agent_slug);
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-background"
              style={{ background: color }}
            >
              <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-xs font-bold" style={{ color }}>
                  {r.agent_name}
                </span>
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest text-white"
                  style={{ background: 'linear-gradient(135deg, #E8C77A, #A8852E)' }}
                  title="Conteúdo gerado por IA"
                >
                  <Sparkles className="w-2 h-2" /> IA
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(parseServerDate(r.created_date), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{r.content}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}