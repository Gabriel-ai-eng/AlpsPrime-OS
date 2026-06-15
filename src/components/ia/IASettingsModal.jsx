import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Brain, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PERSONALITIES = [
  { v: 'amiga', label: 'Amigo' },
  { v: 'mentora', label: 'Mentor' },
  { v: 'parceira', label: 'Parceiro' },
  { v: 'coach', label: 'Coach' },
];
const FREQUENCIES = [
  { v: 'low', label: 'Baixa' },
  { v: 'normal', label: 'Normal' },
  { v: 'high', label: 'Alta' },
];

const COLOR_PRESETS = [
  '#3B82F6', // azul (padrão)
  '#8B5CF6', // roxo
  '#EC4899', // rosa
  '#EF4444', // vermelho
  '#F59E0B', // âmbar
  '#10B981', // verde
  '#14B8A6', // teal
  '#0F172A', // grafite
];

export default function IASettingsModal({ settings, onClose, onUpdated }) {
  const [data, setData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [memory, setMemory] = useState([]);
  const [showMemory, setShowMemory] = useState(false);
  const [loadingMem, setLoadingMem] = useState(false);

  const color = data.color_hex || '#3B82F6';

  const save = async () => {
    setSaving(true);
    await base44.entities.IASettings.update(data.id, data);
    setSaving(false);
    onUpdated?.(data);
    toast.success('Configurações salvas');
    onClose();
  };

  const loadMemory = async () => {
    setLoadingMem(true);
    const list = await base44.entities.IAMemory.filter({ user_email: data.user_email }, '-relevance', 100);
    setMemory(list);
    setShowMemory(true);
    setLoadingMem(false);
  };

  const clearMemory = async () => {
    if (!confirm('Limpar tudo que o agente sabe sobre você? Isso não pode ser desfeito.')) return;
    const list = await base44.entities.IAMemory.filter({ user_email: data.user_email }, '-created_date', 500);
    await Promise.all(list.map((m) => base44.entities.IAMemory.delete(m.id).catch(() => null)));
    setMemory([]);
    toast.success('Memória limpa');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="font-display text-lg">Configurações do amigo</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <Field label="Nome">
              <Input value={data.ia_name} onChange={(e) => setData((d) => ({ ...d, ia_name: e.target.value }))} placeholder="Tom" />
            </Field>

            <Field label="Personalidade">
              <ChipGroup options={PERSONALITIES} value={data.personality} onChange={(v) => setData((d) => ({ ...d, personality: v }))} color={color} />
            </Field>

            <Field label="Cor">
              <div className="flex flex-wrap gap-2 items-center">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setData((d) => ({ ...d, color_hex: c }))}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                      data.color_hex === c ? 'ring-2 ring-offset-2 ring-offset-card' : ''
                    )}
                    style={{
                      backgroundColor: c,
                      borderColor: data.color_hex === c ? c : 'transparent',
                      '--tw-ring-color': c,
                    }}
                    aria-label={`Cor ${c}`}
                  />
                ))}
                <label className="relative w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground/40">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setData((d) => ({ ...d, color_hex: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Cor personalizada"
                  />
                  <span className="text-[10px] text-muted-foreground">+</span>
                </label>
              </div>
            </Field>

            <ToggleField
              label="Mensagens proativas"
              checked={data.proactive_enabled}
              onChange={(v) => setData((d) => ({ ...d, proactive_enabled: v }))}
              color={color}
            />
            {data.proactive_enabled && (
              <Field label="Frequência">
                <ChipGroup options={FREQUENCIES} value={data.proactive_frequency} onChange={(v) => setData((d) => ({ ...d, proactive_frequency: v }))} color={color} />
              </Field>
            )}

            <div className="pt-3 border-t border-border space-y-2">
              <Button variant="outline" onClick={loadMemory} disabled={loadingMem} className="w-full justify-start">
                {loadingMem ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                Ver o que sabe sobre mim
              </Button>
              <Button variant="outline" onClick={clearMemory} className="w-full justify-start hover:border-destructive/40 hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Limpar memória
              </Button>
            </div>

            {showMemory && (
              <div className="bg-muted/40 rounded-xl p-3 max-h-60 overflow-y-auto space-y-2">
                {memory.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Ainda não aprendeu nada sobre você.</p>
                ) : (
                  memory.map((m) => (
                    <div key={m.id} className="text-xs">
                      <span className="uppercase tracking-widest text-[9px]" style={{ color }}>{m.category}</span>
                      <p className="text-foreground">{m.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-border sticky bottom-0 bg-card">
            <Button
              onClick={save}
              disabled={saving}
              className="w-full h-11 text-white"
              style={{ backgroundColor: color }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function ChipGroup({ options, value, onChange, color = '#3B82F6' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className="px-3 py-1.5 rounded-full text-xs border transition-colors"
            style={
              active
                ? { borderColor: color, backgroundColor: `${color}1A`, color }
                : {}
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ToggleField({ label, checked, onChange, color = '#3B82F6' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={cn('w-10 h-6 rounded-full relative transition-colors', !checked && 'bg-muted')}
        style={checked ? { backgroundColor: color } : {}}
      >
        <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
      </button>
    </div>
  );
}