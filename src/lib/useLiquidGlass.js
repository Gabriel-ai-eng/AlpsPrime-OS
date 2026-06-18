import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useLiquidGlass() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // 1. LOCAL STATE FOR INSTANT UI RESPONSE
  const [localEnabled, setLocalEnabled] = useState(false);
  const [localMode, setLocalMode] = useState('light');

  // 2. SYNC WITH DB ON FIRST LOAD
  useEffect(() => {
    if (user) {
      setLocalEnabled(user.liquid_glass_enabled === true);
      setLocalMode(user.liquid_glass_mode || 'light');
    }
  }, [user]);

  const isEnabled = localEnabled;
  const mode = localMode;

  const toggle = async () => {
    setSaving(true);
    const newVal = !localEnabled;

    // UPDATE UI INSTANTLY
    setLocalEnabled(newVal);

    // INJECT LIQUID GLASS INTO BODY IMMEDIATELY
    if (newVal) {
      document.body.classList.remove('liquid-light', 'liquid-dark');
      document.body.classList.add(`liquid-${localMode}`);
    } else {
      document.body.classList.remove('liquid-light', 'liquid-dark');
    }

    // SAVE SILENTLY TO DB
    try {
      await base44.auth.updateMe({ liquid_glass_enabled: newVal });
      toast.success(newVal ? '✦ Liquid Glass ativado!' : 'Liquid Glass desativado.');
    } catch (error) {
      // Revert on connection error
      setLocalEnabled(!newVal);
      toast.error('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const setMode = async (newMode) => {
    if (!localEnabled) return;
    setSaving(true);

    // UPDATE COLOR INSTANTLY
    setLocalMode(newMode);

    // INJECT NEW LIQUID GLASS COLOR IMMEDIATELY
    document.body.classList.remove('liquid-light', 'liquid-dark');
    document.body.classList.add(`liquid-${newMode}`);

    // SAVE SILENTLY TO DB
    try {
      await base44.auth.updateMe({ liquid_glass_mode: newMode });
      toast.success(newMode === 'dark' ? '🌑 Modo escuro ativado!' : '☀️ Modo claro ativado!');
    } catch (error) {
      setLocalMode(mode); // Revert on error
      toast.error('Erro de conexão ao trocar modo de cor.');
    } finally {
      setSaving(false);
    }
  };

  return { isEnabled, isPremium: true, toggle, saving, mode, setMode };
}
