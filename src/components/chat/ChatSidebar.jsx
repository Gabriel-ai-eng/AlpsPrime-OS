import React from 'react';
import { Plus, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ChatSidebar({
  conversations,
  activeId,
  loading,
  onSelect,
  onNew,
  onDelete,
}) {
  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm('Remover esta conversa?')) onDelete(id);
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-sidebar-border">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-gold/20"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nova conversa
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-3">
            <MessageSquare className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma conversa ainda.</p>
          </div>
        ) : (
          conversations.map((c) => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  'group w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-2',
                  active
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'hover:bg-sidebar-accent text-sidebar-foreground/80 border border-transparent'
                )}
              >
                <MessageSquare className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', active && 'text-gold')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium truncate', active && 'text-gold')}>
                    {c.title}
                  </p>
                  {c.updated_at && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 -m-1 rounded hover:bg-destructive/20 hover:text-destructive transition-all flex-shrink-0"
                  title="Remover conversa"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}