import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, ImageIcon, FileSpreadsheet, Radio } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ACTION_BUTTONS = [
  { icon: ImageIcon, label: 'Gerar imagem', prefix: 'Gere uma imagem de: ' },
  { icon: FileSpreadsheet, label: 'Criar planilha', prefix: 'Crie uma planilha com: ' },
];

export default function ChatInput({
  value, onChange, onSend, onKeyDown, loading,
  isListening, isSpeaking, voiceSupported,
  onVoiceToggle, onStopSpeaking, inputRef,
  onOpenLive,
}) {
  const handleSend = () => onSend(value.trim());

  return (
    <TooltipProvider>
      <div className="border-t border-border bg-background/95 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto">
          {/* Quick action chips */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {ACTION_BUTTONS.map(({ icon: Icon, label, prefix }) => (
              <button
                key={label}
                onClick={() => onChange(prefix)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border hover:border-gold/40 hover:bg-gold/5 hover:text-gold text-muted-foreground transition-all"
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
            <button
              onClick={onOpenLive}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-gold/30 bg-gold/5 hover:border-gold/60 hover:bg-gold/10 text-gold transition-all"
            >
              <Radio className="w-3 h-3" />
              Modo Live
            </button>
          </div>

          <div className="relative flex items-end gap-2 p-2 bg-card rounded-2xl border border-border focus-within:border-gold/50 transition-colors shadow-lg shadow-black/20">
            <Textarea
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
              placeholder={isListening ? "Ouvindo... fale agora" : loading ? "Aguardando resposta..." : "Pergunte qualquer coisa — texto, imagem, planilha, código..."}
              rows={1}
              className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-40 py-2.5 placeholder:text-muted-foreground/70 disabled:opacity-60"
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <VoiceButton
                isListening={isListening}
                isSpeaking={isSpeaking}
                supported={voiceSupported}
                onToggle={onVoiceToggle}
                onStopSpeaking={onStopSpeaking}
              />
              <Button
                onClick={handleSend}
                disabled={!value.trim() || loading}
                size="icon"
                className="bg-gold hover:bg-gold-dark text-background rounded-xl h-10 w-10 flex-shrink-0 shadow-lg shadow-gold/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
            Sexta-feira 1.0 pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}