import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Wallet, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function WithdrawDialog({ open, onClose, balance, userEmail, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const numericAmount = parseFloat(String(amount).replace(',', '.')) || 0;
  const canSubmit = numericAmount > 0 && numericAmount <= balance && pixKey.trim().length > 3;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await base44.functions.invoke('processWithdrawal', {
        amount: numericAmount,
        pix_key: pixKey.trim(),
      });
      toast.success('Solicitação enviada! Você receberá o PIX assim que for confirmado pelo administrador.');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erro ao solicitar saque. Tente novamente.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-card border border-gold/30 rounded-2xl p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5 text-gold" />
          </div>

          <h2 className="font-display text-2xl tracking-tight mb-1">Sacar saldo</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Saldo disponível:{' '}
            <span className="text-gold font-semibold">
              {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Valor (R$)
              </label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="bg-background border-border focus-visible:ring-gold/50"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Chave PIX
              </label>
              <Input
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                className="bg-background border-border focus-visible:ring-gold/50"
                disabled={submitting}
              />
            </div>

            {numericAmount > balance && (
              <div className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  Valor maior que o saldo disponível.
                </p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full h-11 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-background font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Solicitar saque'}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              O status só muda para "Pago" após o administrador confirmar o envio do PIX para sua chave.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}