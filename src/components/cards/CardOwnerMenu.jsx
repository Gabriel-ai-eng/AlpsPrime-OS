import React, { useState } from 'react';
import { MoreVertical, Edit3, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Three-dot menu shown on the FRONT of a card, only to its author.
 * Lets the author edit (delegated to parent via onEdit) or delete the card.
 */
export default function CardOwnerMenu({ card, onEdit, onDeleted }) {
  const [busy, setBusy] = useState(false);

  const handleDelete = async (e) => {
    e?.stopPropagation?.();
    if (busy) return;
    if (!window.confirm('Excluir esta carta e todas as respostas?')) return;
    setBusy(true);
    try {
      // Delete answers first so nothing dangles
      const answers = await base44.entities.CardAnswer.filter({ card_id: card.id }, '-created_date', 200);
      await Promise.all(answers.map((a) => base44.entities.CardAnswer.delete(a.id).catch(() => null)));
      await base44.entities.QuestionCard.delete(card.id);
      toast.success('Carta excluída');
      onDeleted?.(card.id);
    } catch {
      toast.error('Erro ao excluir');
    }
    setBusy(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          aria-label="Opções"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(card);
          }}
        >
          <Edit3 className="w-3.5 h-3.5 mr-2" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={busy}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}