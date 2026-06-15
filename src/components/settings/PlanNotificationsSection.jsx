import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import SettingsSection from './SettingsSection';
import ToggleRow from './ToggleRow';

export default function PlanNotificationsSection({ user }) {
  const [notifPlanUpdates, setNotifPlanUpdates] = useState(user?.notify_plan_updates !== false);
  const [pushStatus, setPushStatus] = useState('idle'); // idle | requesting | granted | denied

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') setPushStatus('granted');
      else if (Notification.permission === 'denied') setPushStatus('denied');
    }
  }, []);

  const updateField = async (key, value, setter) => {
    setter(value);
    try {
      await base44.auth.updateMe({ [key]: value });
      toast.success(value ? 'Notificações ativadas!' : 'Notificações desativadas.');
    } catch {
      toast.error('Não foi possível salvar.');
      setter(!value);
    }
  };

  const handleRequestPush = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações push.');
      return;
    }
    setPushStatus('requesting');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPushStatus('granted');
      toast.success('Notificações push ativadas! 🔔');
    } else {
      setPushStatus('denied');
      toast.error('Permissão negada. Verifique as configurações do seu navegador.');
    }
  };

  const pushLabel = {
    idle: 'Ativar notificações push no navegador',
    requesting: 'Solicitando permissão...',
    granted: 'Notificações push ativas ✅',
    denied: 'Permissão negada — verifique o navegador',
  }[pushStatus];

  const pushDesc = {
    idle: 'Receba alertas mesmo com o app fechado, diretamente no seu navegador ou celular.',
    requesting: 'Por favor, permita as notificações no pop-up do navegador.',
    granted: 'Você já receberá notificações push. Para desativar, acesse as configurações do navegador.',
    denied: 'Para reativar, clique no cadeado na barra de endereços do navegador e permita notificações.',
  }[pushStatus];

  return (
    <SettingsSection
      icon={Bell}
      title="Notificações de Planos & Atualizações"
      description="Fique por dentro das novidades e recursos exclusivos de cada plano."
      delay={0.12}
    >
      {/* In-app plan updates toggle */}
      <ToggleRow
        icon={notifPlanUpdates ? Bell : BellOff}
        label="Novidades de planos e funcionalidades"
        description="Receba notificações dentro do app sobre atualizações, novos recursos e benefícios exclusivos dos planos Pro e Unlimited."
        checked={notifPlanUpdates}
        onChange={(v) => updateField('notify_plan_updates', v, setNotifPlanUpdates)}
      />

      {/* Plan info cards */}
      {notifPlanUpdates && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            { plan: 'free', label: 'Free', color: 'from-zinc-400 to-zinc-600', desc: 'Recursos básicos da plataforma.' },
            { plan: 'pro', label: 'Pro', color: 'from-sky-400 to-sky-600', desc: 'Selo verificado, ghost mode, bio links e mais.' },
            { plan: 'unlimited', label: 'Unlimited', color: 'from-yellow-400 via-amber-400 to-amber-600', desc: 'Aura exclusiva, posts premium, monetização.' },
          ].map(({ plan, label, color, desc }) => (
            <div
              key={plan}
              className={`relative rounded-xl border p-3 overflow-hidden ${user?.plan === plan ? 'border-gold/40 bg-gold/5' : 'border-border bg-background'}`}
            >
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${color}`} />
              <div className="relative">
                <span className={`text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                  {label}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                {user?.plan === plan && (
                  <span className="inline-block mt-1.5 text-[10px] text-gold font-semibold">✓ Seu plano atual</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Push notification button */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background">
        <Smartphone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{pushLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{pushDesc}</p>
        </div>
        {pushStatus === 'idle' && (
          <button
            onClick={handleRequestPush}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-colors"
          >
            Ativar
          </button>
        )}
        {pushStatus === 'requesting' && (
          <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin flex-shrink-0 mt-0.5" />
        )}
      </div>
    </SettingsSection>
  );
}