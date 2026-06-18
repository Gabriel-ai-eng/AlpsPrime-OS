import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BIO_LINK_PRESETS, getBioLinkMeta } from '@/lib/bioLinkPresets';

const MAX_LINKS = 10;

export default function BioLinksEditor({ user }) {
  const [links, setLinks] = useState(Array.isArray(user?.bio_links) ? user.bio_links : []);
  const [saving, setSaving] = useState(false);

  const addLink = () => {
    if (links.length >= MAX_LINKS) {
      toast.error(`Limite de ${MAX_LINKS} links.`);
      return;
    }
    setLinks([...links, { title: '', url: '', type: 'link' }]);
  };

  const updateLink = (i, patch) => {
    setLinks(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };

  const removeLink = (i) => {
    setLinks(links.filter((_, idx) => idx !== i));
  };

  const moveLink = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    setLinks(next);
  };

  const handleSave = async () => {
    const cleaned = links
      .map((l) => ({
        title: (l.title || '').trim().slice(0, 50),
        url: (l.url || '').trim(),
        type: l.type || 'link',
      }))
      .filter((l) => l.title && l.url);

    setSaving(true);
    try {
      await base44.auth.updateMe({ bio_links: cleaned });
      setLinks(cleaned);
      toast.success('Links salvos!');
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.17 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <LinkIcon className="w-4 h-4 text-gold" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Link na Bio Inteligente
        </h2>
      </div>
      <p className="text-[11px] text-muted-foreground mb-4">
        Mini landing page que aparece no seu perfil público. Até {MAX_LINKS} links.
      </p>

      <div className="space-y-2 mb-4">
        {links.length === 0 && (
          <div className="border border-dashed border-border rounded-xl p-6 text-center">
            <p className="text-xs text-muted-foreground">Nenhum link ainda. Adicione o primeiro abaixo.</p>
          </div>
        )}

        {links.map((link, i) => {
          const meta = getBioLinkMeta(link.type);
          const Icon = meta.icon;
          return (
            <div key={i} className="border border-border rounded-xl p-3 bg-background space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveLink(i, -1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-gold disabled:opacity-30 leading-none"
                    aria-label="Mover para cima"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveLink(i, 1)}
                    disabled={i === links.length - 1}
                    className="text-muted-foreground hover:text-gold disabled:opacity-30 leading-none"
                    aria-label="Mover para baixo"
                  >
                    ▼
                  </button>
                </div>
                <select
                  value={link.type}
                  onChange={(e) => updateLink(i, { type: e.target.value })}
                  className="bg-card border border-border rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-gold/50"
                >
                  {Object.entries(BIO_LINK_PRESETS).map(([key, m]) => (
                    <option key={key} value={key}>{m.label}</option>
                  ))}
                </select>
                <div className="w-7 h-7 rounded-md bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-gold" />
                </div>
                <button
                  onClick={() => removeLink(i)}
                  className="ml-auto p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Input
                value={link.title}
                onChange={(e) => updateLink(i, { title: e.target.value })}
                placeholder="Título (ex: Meu WhatsApp)"
                maxLength={50}
                className="bg-card border-border focus-visible:ring-gold/50 h-9 text-sm"
              />
              <Input
                value={link.url}
                onChange={(e) => updateLink(i, { url: e.target.value })}
                placeholder={meta.hint}
                className="bg-card border-border focus-visible:ring-gold/50 h-9 text-sm"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={addLink}
          disabled={links.length >= MAX_LINKS}
          className="flex-1 border-border hover:border-gold/40 hover:bg-gold/5 hover:text-gold gap-2"
        >
          <Plus className="w-4 h-4" /> Adicionar link {links.length}/{MAX_LINKS}
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold hover:opacity-90 gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar</>}
        </Button>
      </div>
    </motion.div>
  );
}