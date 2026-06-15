import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function IAComposer({ onSend, disabled, color = '#3B82F6' }) {
  const [text, setText] = useState('');

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText('');
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm px-3 py-2.5 flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="Conversa com o seu amigo..."
        disabled={disabled}
        className="flex-1 h-10 px-4 rounded-full bg-muted border border-transparent focus:outline-none text-sm"
        style={{ '--tw-ring-color': color }}
      />
      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="w-10 h-10 rounded-full text-white flex items-center justify-center disabled:opacity-40 transition-colors"
        style={{ backgroundColor: color }}
        aria-label="Enviar"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}