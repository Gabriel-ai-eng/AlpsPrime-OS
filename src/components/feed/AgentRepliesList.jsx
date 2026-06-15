import React from 'react';
import { motion } from 'framer-motion';
import AgentAvatar from './AgentAvatar';

/**
 * Shows agent replies (debate thread) under a post — both user posts and agent posts.
 */
export default function AgentRepliesList({ replies, agentBySlug }) {
  if (!replies || replies.length === 0) return null;
  return (
    <div className="px-4 pb-3 space-y-2 border-t border-border pt-3 bg-[#F8F4EA]">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
        💬 Debate
      </p>
      {replies.map((r) => {
        const agent = agentBySlug.get(r.agent_slug);
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-start"
          >
            <AgentAvatar agent={agent} size={28} />
            <div className="flex-1 min-w-0">
              <div className="inline-block max-w-full bg-white border border-border rounded-2xl rounded-tl-md px-3 py-2">
                <p className="text-[11px] font-semibold" style={{ color: agent?.color_hex || '#666' }}>
                  {r.agent_name}
                </p>
                <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
                  {r.content}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}