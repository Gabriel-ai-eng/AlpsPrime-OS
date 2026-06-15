import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { QrCode, Copy, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PixPayment({ planId, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);
  const [status, setStatus] = useState(null);

  const generatePix = async () => {
    setLoading(true);
    setPaymentData(null);
    setStatus(null);
    const res = await base44.functions.invoke('mpCreatePixPayment', { plan_id: planId });
    setPaymentData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    generatePix();
  }, [planId]);

  // Poll for payment confirmation
  useEffect(() => {
    if (!paymentData?.payment_id || status === 'approved') return;

    const interval = setInterval(async () => {
      if (polling) return;
      setPolling(true);
      const res = await base44.functions.invoke('mpCheckPaymentStatus', {
        payment_id: paymentData.payment_id,
        plan_id: planId,
      });
      setPolling(false);
      if (res.data?.status === 'approved') {
        setStatus('approved');
        clearInterval(interval);
        onSuccess?.();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentData, status, planId]);

  const copyCode = () => {
    navigator.clipboard.writeText(paymentData.qr_code);
    setCopied(true);
    toast.success('Código Pix copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-10">
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
      <p className="text-sm text-muted-foreground">Gerando código Pix...</p>
    </div>
  );

  if (status === 'approved') return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <CheckCircle2 className="w-14 h-14 text-emerald-500" />
      <h3 className="font-display text-xl text-emerald-400">Pagamento confirmado!</h3>
      <p className="text-sm text-muted-foreground">Seu plano já está ativo. Aproveite!</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Escaneie o QR code ou copie o código abaixo</p>
        <p className="text-xs text-muted-foreground/60 mt-1">O pagamento será confirmado automaticamente</p>
      </div>

      {/* QR Code */}
      {paymentData?.qr_code_base64 ? (
        <div className="p-3 bg-white rounded-2xl shadow-lg">
          <img
            src={`data:image/png;base64,${paymentData.qr_code_base64}`}
            alt="QR Code Pix"
            className="w-48 h-48"
          />
        </div>
      ) : (
        <div className="w-48 h-48 bg-muted rounded-2xl flex items-center justify-center">
          <QrCode className="w-16 h-16 text-muted-foreground" />
        </div>
      )}

      {/* Copy code */}
      {paymentData?.qr_code && (
        <div className="w-full">
          <p className="text-xs text-muted-foreground mb-2 text-center">Pix Copia e Cola</p>
          <div className="flex items-center gap-2 bg-muted rounded-xl p-3">
            <p className="text-xs text-foreground flex-1 truncate font-mono">{paymentData.qr_code.substring(0, 40)}...</p>
            <Button
              size="sm"
              onClick={copyCode}
              className={cn(
                'h-8 px-3 flex-shrink-0 text-xs',
                copied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gold hover:bg-gold-dark text-background'
              )}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className={cn('w-2 h-2 rounded-full', polling ? 'bg-gold animate-pulse' : 'bg-muted')} />
        Aguardando pagamento...
      </div>

      <Button variant="ghost" size="sm" onClick={generatePix} className="text-xs text-muted-foreground gap-1.5">
        <RefreshCw className="w-3.5 h-3.5" /> Gerar novo código
      </Button>
    </div>
  );
}