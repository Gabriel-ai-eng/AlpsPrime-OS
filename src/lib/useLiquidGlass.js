import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const PREMIUM_PLANS = ['pro', 'unlimited'];

export function useLiquidGlass() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const isPremium = PREMIUM_PLANS.includes(user?.plan);

  // 1. CRIAMOS UMA MEMÓRIA LOCAL PARA A TELA REAGIR INSTANTANEAMENTE
  const [localEnabled, setLocalEnabled] = useState(false);
  const [localMode, setLocalMode] = useState('light');

  // 2. SINCRONIZA COM O BANCO DE DADOS NA PRIMEIRA VEZ QUE CARREGA
  useEffect(() => {
    if (user) {
      setLocalEnabled(user.liquid_glass_enabled === true);
      setLocalMode(user.liquid_glass_mode || 'light');
    }
  }, [user]);

  // A tela passa a obedecer a memória local, não mais o atraso do banco de dados
  const isEnabled = isPremium && localEnabled;
  const mode = localMode;

  const toggle = async () => {
    if (!isPremium) {
      toast.error('Interface Liquid Glass é exclusiva para assinantes Pro e Unlimited.');
      return;
    }
    
    setSaving(true);
    const newVal = !localEnabled;
    
    // ATUALIZA A TELA E O BOTÃO INSTANTANEAMENTE!
    setLocalEnabled(newVal);

    // INJETA O VIDRO LÍQUIDO DIRETO NO CORPO DO SITE NA HORA
    if (newVal) {
      document.body.classList.remove('liquid-light', 'liquid-dark');
      document.body.classList.add(`liquid-${localMode}`);
    } else {
      document.body.classList.remove('liquid-light', 'liquid-dark');
    }

    // SALVA NO BANCO SILENCIOSAMENTE
    try {
      await base44.auth.updateMe({ liquid_glass_enabled: newVal });
      toast.success(newVal ? '✦ Liquid Glass ativado!' : 'Liquid Glass desativado.');
    } catch (error) {
      // Se der erro de internet, desfaz a animação do botão
      setLocalEnabled(!newVal);
      toast.error('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const setMode = async (newMode) => {
    if (!isPremium || !localEnabled) return;
    setSaving(true);
    
    // ATUALIZA A COR DO BOTÃO INSTANTANEAMENTE
    setLocalMode(newMode);

    // INJETA A NOVA COR DO VIDRO LÍQUIDO NA TELA NA HORA
    document.body.classList.remove('liquid-light', 'liquid-dark');
    document.body.classList.add(`liquid-${newMode}`);

    // SALVA NO BANCO SILENCIOSAMENTE
    try {
      await base44.auth.updateMe({ liquid_glass_mode: newMode });
      toast.success(newMode === 'dark' ? '🌑 Modo escuro ativado!' : '☀️ Modo claro ativado!');
    } catch (error) {
      setLocalMode(mode); // Desfaz em caso de erro
      toast.error('Erro de conexão ao trocar modo de cor.');
    } finally {
      setSaving(false);
    }
  };

  return { isEnabled, isPremium, toggle, saving, mode, setMode };
}
