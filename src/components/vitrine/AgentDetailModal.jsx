import React from 'react';
import { X, Star, ShoppingCart, Sparkles, Zap, Brain, TrendingUp, Heart, Code2, BadgeCheck, Tag, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ICON_MAP = { Sparkles, Zap, Brain, TrendingUp, Heart, Code2 };

export default function AgentDetailModal({ agent, onClose }) {
  const Icon = agent ? (ICON_MAP[agent.icon] || Sparkles) : Sparkles;

  const handleBuy = () => {
    toast.success(`Redirecionando para compra de ${agent.name}...`);
  };

  return (
    <AnimatePresence>
      {agent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <motion.div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            style={{
              position: 'relative', background: '#fff', borderRadius: 24,
              width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', zIndex: 1,
              boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            }}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Gradient header */}
            <div style={{
              background: `linear-gradient(135deg, ${agent.color}22, ${agent.color}08)`,
              borderBottom: `3px solid ${agent.color}`,
              padding: '24px 20px 20px', position: 'relative',
            }}>
              <button onClick={onClose} style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer',
              }}>
                <X style={{ width: 15, height: 15, color: '#6b7280' }} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 18,
                  background: agent.color + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${agent.color}44`,
                }}>
                  <Icon style={{ width: 30, height: 30, color: agent.color }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>{agent.name}</h2>
                    {agent.author_verified && <BadgeCheck style={{ width: 18, height: 18, color: '#1877f2' }} />}
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6b7280' }}>por {agent.author}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Avaliação', value: `⭐ ${agent.rating}`, sub: `${agent.reviews} reviews` },
                  { label: 'Vendas', value: agent.sales, sub: 'usuários' },
                  { label: 'Categoria', value: agent.category, sub: '' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: '#f9fafb', borderRadius: 12, padding: '10px 12px',
                    border: '1.5px solid #f3f4f6', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', textTransform: 'capitalize' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{s.sub || s.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#374151' }}>Sobre o agente</h3>
                <p style={{ margin: 0, fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>{agent.description}</p>
              </div>

              {/* Tags */}
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#374151' }}>Tags</h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {agent.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
                      background: agent.color + '14', color: agent.color,
                    }}>#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Price + CTA */}
              <div style={{
                background: `linear-gradient(135deg, ${agent.color}12, ${agent.color}05)`,
                border: `1.5px solid ${agent.color}30`,
                borderRadius: 16, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>PREÇO</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                    R${agent.price.toFixed(2).replace('.', ',')}
                  </div>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 3 }}>Pagamento único · Acesso vitalício</div>
                </div>
                <button
                  onClick={handleBuy}
                  style={{
                    background: agent.color, color: '#fff', border: 'none',
                    borderRadius: 14, padding: '13px 22px', fontSize: 14, fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: `0 6px 20px ${agent.color}44`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <ShoppingCart style={{ width: 16, height: 16 }} />
                  Comprar agora
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}