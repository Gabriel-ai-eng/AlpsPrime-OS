import React, { useState } from 'react';
import { Share2, Copy, Check, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

/**
 * Lets a user share their profile (or any profile) so others can install
 * the Sexta-feira PWA on their device by simply opening the link.
 *
 * Strategy:
 * - On mobile (or browsers that support navigator.share): use native share sheet.
 * - Fallback: copy a friendly invite text + link to clipboard.
 */
export default function ShareProfileButton({ profileEmail, displayName }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // The link people open. Going to the root will:
  //  - sign-in / sign-up flow
  //  - browser will show "Add to Home Screen" PWA prompt thanks to manifest.webmanifest
  const url = `${window.location.origin}/?ref=${encodeURIComponent(profileEmail)}`;

  const inviteText =
    `${displayName || 'Eu'} te convidou para a Sexta-feira ✨\n` +
    `Baixe o app no seu celular (Android/iOS) abrindo este link e adicionando à tela inicial:\n${url}`;

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Sexta-feira · Convite',
          text: inviteText,
          url,
        });
        return;
      }
    } catch {
      // user cancelled — silent
      return;
    }
    setOpen(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Não foi possível copiar.');
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleNativeShare}
        className="h-8 gap-1.5 border-border hover:border-gold/40 hover:text-gold"
        title="Compartilhar perfil"
      >
        <Share2 className="w-3.5 h-3.5" />
        Compartilhar
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-5 w-full max-w-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Compartilhar perfil</h3>
                  <p className="text-[11px] text-muted-foreground">Quem abrir o link pode instalar o app PWA na tela inicial.</p>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-3 text-xs text-muted-foreground break-all mb-3">
                {url}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="h-9 border-border"
                >
                  Fechar
                </Button>
                <Button
                  size="sm"
                  onClick={copyLink}
                  className="h-9 gap-1.5 bg-gold hover:bg-gold-dark text-background flex-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar convite'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}