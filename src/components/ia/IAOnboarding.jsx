import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const NAME_SUGGESTIONS = ['Tom', 'Alex', 'Theo', 'Léo', 'Nova'];
const PERSONALITIES = [
  { v: 'amiga', emoji: '🤝', label: 'Amigo próximo', desc: 'Leve, divertido, informal' },
  { v: 'mentora', emoji: '🧠', label: 'Mentor', desc: 'Direto, inteligente, motivador' },
  { v: 'parceira', emoji: '💛', label: 'Parceiro', desc: 'Carinhoso, presente, empático' },
  { v: 'coach', emoji: '⚡', label: 'Coach', desc: 'Objetivo, desafiador, focado em resultados' },
];

const COLOR_PRESETS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#14B8A6', '#0F172A',
];

export default function IAOnboarding({ initial = {}, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    ia_name: initial.ia_name || 'Tom',
    personality: initial.personality || 'amiga',
    color_hex: initial.color_hex || '#3B82F6',
  });
  const [notifGranted, setNotifGranted] = useState(false);

  const requestNotifs = async () => {
    if ('Notification' in window) {
      const r = await Notification.requestPermission();
      setNotifGranted(r === 'granted');
    }
  };

  const color = data.color_hex;
  const finish = () => onSave?.(data);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-background flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-xs font-mono text-muted-foreground">Passo {step} / 4</span>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 max-w-md w-full mx-auto">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl mb-2">Como você quer me chamar?</h2>
              <p className="text-sm text-muted-foreground mb-5">Escolha um nome livre ou use uma sugestão.</p>
              <Input
                value={data.ia_name}
                onChange={(e) => setData((d) => ({ ...d, ia_name: e.target.value }))}
                placeholder="Tom"
                className="h-12 mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {NAME_SUGGESTIONS.map((n) => {
                  const active = data.ia_name === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setData((d) => ({ ...d, ia_name: n }))}
                      className="px-3 py-1.5 rounded-full text-xs border transition-colors"
                      style={active ? { borderColor: color, backgroundColor: `${color}1A`, color } : {}}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl mb-2">Como eu devo ser com você?</h2>
              <p className="text-sm text-muted-foreground mb-5">Você pode mudar isso depois.</p>
              <div className="space-y-2">
                {PERSONALITIES.map((p) => {
                  const active = data.personality === p.v;
                  return (
                    <button
                      key={p.v}
                      onClick={() => setData((d) => ({ ...d, personality: p.v }))}
                      className="w-full p-4 rounded-xl border text-left transition-colors flex items-center gap-3"
                      style={active ? { borderColor: color, backgroundColor: `${color}0D` } : {}}
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold">{p.label}</p>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                      {active && <Check className="w-4 h-4 ml-auto" style={{ color }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl mb-2">Escolhe minha cor</h2>
              <p className="text-sm text-muted-foreground mb-5">Pode mudar depois quando quiser.</p>
              <div className="flex flex-wrap gap-3">
                {COLOR_PRESETS.map((c) => {
                  const active = data.color_hex === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setData((d) => ({ ...d, color_hex: c }))}
                      className={cn(
                        'w-12 h-12 rounded-full transition-transform hover:scale-110',
                        active && 'ring-2 ring-offset-2 ring-offset-background'
                      )}
                      style={{
                        backgroundColor: c,
                        '--tw-ring-color': c,
                      }}
                      aria-label={`Cor ${c}`}
                    />
                  );
                })}
                <label className="relative w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground/40">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setData((d) => ({ ...d, color_hex: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Cor personalizada"
                  />
                  <span className="text-xs text-muted-foreground">+</span>
                </label>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl mb-2">Pra eu ser presente de verdade...</h2>
              <p className="text-sm text-muted-foreground mb-5">Permissão de notificações (opcional). Você pode revogar quando quiser.</p>
              <div className="p-4 rounded-xl border border-border flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  <Bell className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Notificações</p>
                  <p className="text-xs text-muted-foreground">Pra falar com você quando você menos esperar.</p>
                </div>
                <button
                  onClick={requestNotifs}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: notifGranted ? '#10B981' : color }}
                >
                  {notifGranted ? '✓ Ativo' : 'Permitir'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1 h-12">
              Voltar
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !data.ia_name.trim()}
              className="flex-1 h-12 text-white"
              style={{ backgroundColor: color }}
            >
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={finish}
              className="flex-1 h-12 text-white font-semibold"
              style={{ backgroundColor: color }}
            >
              Pronto, pode começar!
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}