import React from 'react';
import { Star, ShoppingCart, Sparkles, Zap, Brain, TrendingUp, Heart, Code2, BadgeCheck } from 'lucide-react';

const ICON_MAP = { Sparkles, Zap, Brain, TrendingUp, Heart, Code2 };

export default function AgentCard({ agent, onClick }) {
  const Icon = ICON_MAP[agent.icon] || Sparkles;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1.5px solid #f3f4f6',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.10)';
        e.currentTarget.style.borderColor = agent.color + '55';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = '#f3f4f6';
      }}
    >
      {/* Color bar top */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${agent.color}, ${agent.color}99)` }} />

      <div style={{ padding: '16px 16px 14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: agent.color + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon style={{ width: 22, height: 22, color: agent.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{agent.name}</span>
              {agent.author_verified && (
                <BadgeCheck style={{ width: 14, height: 14, color: '#1877f2', flexShrink: 0 }} />
              )}
            </div>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>por {agent.author}</span>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
              R${agent.price.toFixed(2).replace('.', ',')}
            </div>
            <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>{agent.sales} vendas</div>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13, color: '#4b5563', lineHeight: 1.5,
          marginBottom: 10, display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {agent.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          {agent.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
              background: agent.color + '14', color: agent.color,
            }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star style={{ width: 13, height: 13, color: '#f59e0b', fill: '#f59e0b' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{agent.rating}</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>({agent.reviews})</span>
          </div>
          <button
            style={{
              background: agent.color, color: '#fff', border: 'none',
              borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <ShoppingCart style={{ width: 12, height: 12 }} />
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}