import React, { useState } from 'react';
import { toast } from 'sonner';
import { Megaphone, AppWindow, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SettingsSection from '@/components/settings/SettingsSection';

/**
 * Seção visível apenas para admin: dispara um comunicado (notificação) para
 * TODOS os usuários — avisos de atualização ('update') ou novo web app ('app').
 */
export default function AdminBroadcastSection() {
  const [type, setType] = useState('update');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim()) {
      toast.error('Escreva um título para o comunicado.');
      return;
    }
    setSending(true);
    try {
      const res = await base44.functions.invoke('broadcastNotification', {
        type,
        title: title.trim(),
        body: body.trim(),
      });
      const data = res?.data || {};
      if (data.ok) {
        toast.success(`Comunicado enviado para ${data.sent} usuário(s).`);
        setTitle('');
        setBody('');
      } else {
        toast.error(data.error || 'Não foi possível enviar o comunicado.');
      }
    } catch (e) {
      toast.error('Erro ao enviar o comunicado.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SettingsSection
      icon={Megaphone}
      title="Comunicados (Admin)"
      description="Envie um aviso de atualização ou novo web app para todos os usuários."
      delay={0.02}
    >
      <div className="space-y-4">
        {/* Tipo do comunicado */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('update')}
            className={cn(
              'h-12 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all',
              type === 'update'
                ? 'bg-gold/10 text-gold border-gold/40'
                : 'text-muted-foreground border-border hover:bg-muted'
            )}
          >
            <Megaphone className="w-4 h-4" /> Atualização
          </button>
          <button
            type="button"
            onClick={() => setType('app')}
            className={cn(
              'h-12 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all',
              type === 'app'
                ? 'bg-blue-400/10 text-blue-400 border-blue-400/40'
                : 'text-muted-foreground border-border hover:bg-muted'
            )}
          >
            <AppWindow className="w-4 h-4" /> Novo web app
          </button>
        </div>

        {/* Título */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'update' ? 'Ex: Nova atualização disponível' : 'Ex: Novo web app disponível'}
            maxLength={80}
          />
        </div>

        {/* Mensagem */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Mensagem (opcional)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Detalhes do comunicado..."
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>

        <Button
          onClick={send}
          disabled={sending}
          className="w-full h-11 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold hover:opacity-90"
        >
          {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {sending ? 'Enviando...' : 'Enviar para todos'}
        </Button>
      </div>
    </SettingsSection>
  );
}
