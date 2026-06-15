import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Download, X, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Gallery() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | mine

  const { data: allImages = [], isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: () => base44.entities.UsageHistory.filter({ output_type: 'image_url' }, '-created_date', 200),
  });

  const filtered = allImages.filter(img => {
    const matchesSearch = !search || img.input?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || img.created_by === user?.email;
    return matchesSearch && matchesFilter && img.output;
  });

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-gold/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative px-6 py-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Comunidade</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tight mb-1">
            Galeria de <span className="gold-gradient italic">Imagens</span>
          </h1>
          <p className="text-muted-foreground text-sm">Imagens criadas pelos usuários com IA.</p>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por prompt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border h-9"
              />
            </div>
            <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'mine', label: 'Minhas' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                    filter === f.id ? 'bg-gold text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhuma imagem encontrada.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Gere imagens na seção de Imagens!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="group relative rounded-2xl overflow-hidden border border-border hover:border-gold/40 transition-all cursor-pointer aspect-square"
                onClick={() => setSelected(img)}
              >
                <img src={img.output} alt={img.input} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1">{img.input}</p>
                  <p className="text-[9px] text-muted-foreground/60">{img.created_by?.split('@')[0]}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selected.output} alt={selected.input} className="w-full max-h-[60vh] object-contain bg-black" />
              <div className="p-5">
                <p className="text-sm text-foreground mb-1">{selected.input}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="w-3 h-3 text-gold" />
                    <span>{selected.created_by?.split('@')[0]}</span>
                    {selected.created_date && (
                      <span>· {format(new Date(selected.created_date), "d MMM yyyy", { locale: ptBR })}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={selected.output}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs bg-gold text-background px-3 py-2 rounded-lg font-medium hover:bg-gold-dark transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar
                    </a>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}