import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Users } from 'lucide-react';

export default function TeamCreateForm({ onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Dê um nome ao seu time.');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createTeam', {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success('Time criado!');
      onCreated?.(res.data?.team);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erro ao criar time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-gold" />
        <h2 className="font-semibold">Criar um time</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Junte amigos para conquistar metas em equipe e desbloquear o badge "Time Invencível".
      </p>
      <div className="space-y-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          placeholder="Nome do time"
          maxLength={40}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 200))}
          placeholder="Descrição (opcional)"
          rows={2}
          className="resize-none"
        />
        <Button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-gold hover:bg-gold-dark text-background font-semibold"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar time'}
        </Button>
      </div>
    </div>
  );
}