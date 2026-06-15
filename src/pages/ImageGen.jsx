import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useCredits } from '@/lib/useCredits';
import { generateDalle, uploadImageToSupabase } from '@/lib/askGemini';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Download, Loader2, ImageIcon, Coins, Wand2, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EXAMPLE_PROMPTS = [
  'Um leão majestoso em uma floresta dourada ao pôr do sol, estilo cinematográfico',
  'Cidade futurista com arranha-céus dourados, luzes néon, arquitetura art déco',
  'Retrato de uma mulher elegante com vestido dourado, luz suave, foto profissional',
  'Paisagem montanhosa com nebulosa dourada, ultra-realista, 8k',
];

const MODELS = [
  {
    id: 'standard',
    name: 'Padrão',
    desc: 'Rápido e versátil',
    icon: Zap,
    cost: 10,
    badge: null,
  },
  {
    id: 'dalle3',
    name: 'DALL-E 3',
    desc: 'Alta fidelidade · OpenAI',
    icon: Crown,
    cost: 25,
    badge: 'HD',
  },
];

export default function ImageGen() {
  const { checkAndConsume } = useCredits();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [modelId, setModelId] = useState('standard');

  const activeModel = MODELS.find(m => m.id === modelId);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    const ok = await checkAndConsume(activeModel.cost);
    if (!ok) return;

    setLoading(true);
    let url = null;
    try {
      if (modelId === 'dalle3') {
        const result = await generateDalle(prompt, { size: '1024x1024', quality: 'hd', style: 'vivid' });
        url = result.url;
      } else {
        const response = await base44.integrations.Core.GenerateImage({ prompt });
        url = response?.url;
      }
    } catch (e) {
      toast.error(`Falha: ${e.message}`);
      setLoading(false);
      return;
    }

    if (url) {
      // Persiste no Supabase Storage
      let finalUrl = url;
      try {
        finalUrl = await uploadImageToSupabase(url, prompt.slice(0, 30));
      } catch (e) {
        console.warn('Supabase upload falhou:', e.message);
      }

      setImages(prev => [{ url: finalUrl, prompt, model: modelId, timestamp: Date.now() }, ...prev]);
      await base44.entities.UsageHistory.create({
        tool_id: modelId === 'dalle3' ? 'image-gen-dalle3' : 'image-gen',
        tool_name: modelId === 'dalle3' ? 'DALL-E 3' : 'Gerador de Imagens',
        category: 'image',
        credits_used: activeModel.cost,
        input: prompt,
        output: finalUrl,
        output_type: 'image_url',
      });
      toast.success('Imagem gerada com sucesso');
    } else {
      toast.error('Falha ao gerar imagem');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-full">
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ferramenta de Imagem</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
            Gerador de <span className="gold-gradient italic">Imagens</span>
          </h1>
          <p className="text-muted-foreground mt-2">Descreva o que você imagina e deixe a IA criar.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Model selector */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-gold" />
            <label className="text-sm font-medium">Escolha o modelo</label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODELS.map((m) => {
              const Icon = m.icon;
              const active = modelId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setModelId(m.id)}
                  className={cn(
                    'relative flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                    active
                      ? 'border-gold/50 bg-gold/5 shadow-lg shadow-gold/10'
                      : 'border-border bg-background hover:border-gold/30'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    active ? 'bg-gradient-to-br from-gold-light via-gold to-gold-dark text-background' : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-semibold text-sm', active && 'text-gold')}>{m.name}</span>
                      {m.badge && (
                        <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-bold">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Coins className="w-3 h-3 text-gold" />
                    <span className="font-medium">{m.cost}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-4 h-4 text-gold" />
            <label className="text-sm font-medium">Descrição da imagem</label>
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Um castelo medieval cercado por neblina dourada ao amanhecer, fotografia cinematográfica..."
            rows={4}
            className="resize-none bg-background border-border focus-visible:ring-gold/50"
          />
          <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Coins className="w-3.5 h-3.5 text-gold" />
              <span className="font-medium text-foreground">{activeModel.cost}</span>
              <span>créditos · {activeModel.name}</span>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="bg-gradient-to-r from-gold-light via-gold to-gold-dark hover:opacity-90 text-background font-semibold h-11 px-6"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Gerar Imagem</>
              )}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Inspire-se:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-gold/40 hover:bg-gold/5 transition-all"
                >
                  {p.substring(0, 40)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-square max-w-md mx-auto rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              <div className="text-center relative">
                <Sparkles className="w-12 h-12 text-gold mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-muted-foreground">Criando com {activeModel.name}...</p>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {images.length > 0 && (
            <div>
              <h2 className="font-display text-xl mb-4">Suas Criações</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <motion.div
                    key={img.timestamp}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative rounded-2xl overflow-hidden border border-border hover:border-gold/40 transition-all"
                  >
                    <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
                    {img.model === 'dalle3' && (
                      <div className="absolute top-2 right-2 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-gold border border-gold/30 font-bold">
                        DALL-E 3
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{img.prompt}</p>
                      <a
                        href={img.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs bg-gold text-background px-3 py-2 rounded-lg font-medium hover:bg-gold-dark transition-colors w-fit"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>

        {images.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Suas imagens geradas aparecerão aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}