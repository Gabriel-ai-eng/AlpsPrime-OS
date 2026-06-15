import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const CATEGORIES = ['Produtividade', 'Marketing', 'Vendas', 'Design', 'IA', 'Educação', 'Negócios', 'Saúde', 'Tecnologia'];

export default function SellAgentModal({ open, onClose, onSuccess }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'Produtividade', price: '', agent_url: '', tags: '' });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await base44.entities.MarketplaceAgent.create({
        seller_email: user.email,
        seller_name: user.full_name,
        seller_avatar: user.profile_picture_url || '',
        name: form.name,
        description: form.description,
        category: form.category.toLowerCase() || 'outro',
        price_brl: isFree ? 0 : parseFloat(form.price) || 0,
        is_free: isFree,
        agent_url: form.agent_url,
        tags: tagsArray,
        cover_color: '#1877F2',
        icon_emoji: '🤖',
        status: 'active',
      });
      toast.success('Agente publicado na Vitrine!');
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Erro ao publicar agente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-y-auto max-h-[90vh]"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">Vender Agente</h2>
              <p className="text-sm text-gray-500">Publique seu agente na Vitrine</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">

              {/* Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do agente</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition cursor-pointer bg-gray-50 overflow-hidden"
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImage} />
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="max-h-36 rounded-lg object-cover" />
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h16a4 4 0 004-4V12a4 4 0 00-4-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 26l7-7 7 7M14 14h.01M34 16h.01M34 24h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="font-medium text-blue-500 hover:text-blue-600 cursor-pointer">Clique para enviar</span>
                        <p className="pl-1 text-gray-500">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF até 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do agente *</label>
                <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Assistente de Vendas Pro"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="O que esse agente faz? Quais problemas resolve?"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none" />
              </div>

              {/* Categoria + Preço */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input type="number" min="0" step="0.01" disabled={isFree}
                    value={isFree ? '' : form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="29.90"
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50" />
                </div>
              </div>

              {/* Toggle gratuito */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Disponibilizar gratuitamente</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white relative" />
                </label>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Redirecionamento *</label>
                <input required type="url" value={form.agent_url} onChange={e => setForm(f => ({ ...f, agent_url: e.target.value }))}
                  placeholder="https://seu-agente.com/checkout"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                <p className="text-xs text-gray-400 mt-1">Link para onde o usuário será enviado ao comprar.</p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="vendas, automação, copywriting"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
              </div>

              {/* Botão */}
              <button type="submit" disabled={loading}
                className="w-full mt-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm">
                🚀 {loading ? 'Publicando...' : 'Publicar na Vitrine'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}