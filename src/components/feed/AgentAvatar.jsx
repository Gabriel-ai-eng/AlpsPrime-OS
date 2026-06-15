import React from 'react';
import { getAgentIcon } from '@/lib/agentIcons';

export default function AgentAvatar({ agent, size = 40 }) {
  if (!agent) return null;
  const Icon = getAgentIcon(agent.icon_name);
  return (
    <div
      className="rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${agent.color_hex}, ${agent.color_hex}dd)`,
        boxShadow: `0 4px 14px -4px ${agent.color_hex}80`,
      }}
    >
      <Icon size={size * 0.5} strokeWidth={2.5} />
    </div>
  );
}