import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

const PLAN_PRICES = { pro: 49.90, unlimited: 99.90 };

export default function CardPayment({ planId, onSuccess }) {
  const [mp, setMp] = useState(null);
  const [cardForm, setCardForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    cpf: '',
    installments: 1,
  });

  // Load MP SDK
  useEffect(() => {
    if (window.MercadoPago) {
      setMp(new window.MercadoPago(MP_PUBLIC_KEY));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => setMp(new window.MercadoPago(MP_PUBLIC_KEY));
    document.head.appendChild(script);
  }, []);

  const formatCardNumber = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  const formatExpiry = (v) => {
    const clean = v.replace(/\D/g, '');
    if (clean.length >= 2) return clean.substring(0, 2) + '/' + clean.substring(2, 6);
    return clean;
  };
  const formatCPF = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mp) { toast.error('SDK do Mercado Pago não carregou ainda.'); return; }

    setLoading(true);

    const [month, year] = formData.expiry.split('/');
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');

    // Get card token
    let tokenData;
    try {
      tokenData = await mp.createCardToken({
        cardNumber: cardNumberClean,
        cardholderName: formData.cardName,
        cardExpirationMonth: month,
        cardExpirationYear: year,
        securityCode: formData.cvv,
        identificationType: 'CPF',
        identificationNumber: formData.cpf.replace(/\D/g, ''),
      });
    } catch (err) {
      toast.error('Dados do cartão inválidos. Verifique e tente novamente.');
      setLoading(false);
      return;
    }

    // Get payment method
    let paymentMethodId = 'visa';
    try {
      const methods = await mp.getPaymentMethods({ bin: cardNumberClean.substring(0, 6) });
      paymentMethodId = methods?.results?.[0]?.id || 'visa';
    } catch (_) {}

    const res = await base44.functions.invoke('mpCreateCardPayment', {
      plan_id: planId,
      token: tokenData.id,
      payment_method_id: paymentMethodId,
      installments: formData.installments,
      payer: {
        identification: { type: 'CPF', number: formData.cpf.replace(/\D/g, '') },
      },
    });

    setLoading(false);

    if (res.data?.status === 'approved') {
      setStatus('approved');
      onSuccess?.();
    } else if (res.data?.status === 'in_process' || res.data?.status === 'pending') {
      toast.info('Pagamento em análise. Você será notificado em breve.');
    } else {
      toast.error(res.data?.error || 'Pagamento recusado. Tente outro cartão.');
    }
  };

  if (status === 'approved') return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <CheckCircle2 className="w-14 h-14 text-emerald-500" />
      <h3 className="font-display text-xl text-emerald-400">Pagamento aprovado!</h3>
      <p className="text-sm text-muted-foreground">Seu plano já está ativo. Aproveite!</p>
    </div>
  );

  const price = PLAN_PRICES[planId] || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Número do cartão</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="0000 0000 0000 0000"
              value={formData.cardNumber}
              onChange={(e) => setFormData(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
              className="pl-9 bg-background border-border"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Nome no cartão</label>
          <Input
            placeholder="NOME SOBRENOME"
            value={formData.cardName}
            onChange={(e) => setFormData(f => ({ ...f, cardName: e.target.value.toUpperCase() }))}
            className="bg-background border-border"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Validade</label>
            <Input
              placeholder="MM/AAAA"
              value={formData.expiry}
              onChange={(e) => setFormData(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
              className="bg-background border-border"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">CVV</label>
            <Input
              placeholder="123"
              value={formData.cvv}
              onChange={(e) => setFormData(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) }))}
              className="bg-background border-border"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">CPF do titular</label>
          <Input
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => setFormData(f => ({ ...f, cpf: formatCPF(e.target.value) }))}
            className="bg-background border-border"
            required
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Parcelas</label>
          <select
            value={formData.installments}
            onChange={(e) => setFormData(f => ({ ...f, installments: Number(e.target.value) }))}
            className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>
                {n}x de R$ {(price / n).toFixed(2).replace('.', ',')} {n === 1 ? '(à vista)' : 'sem juros'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || !mp}
        className="w-full h-12 bg-gradient-to-r from-gold-light via-gold to-gold-dark hover:opacity-90 text-background font-semibold"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</> : (
          <><Lock className="w-4 h-4" /> Pagar R$ {price.toFixed(2).replace('.', ',')}</>
        )}
      </Button>

      <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Pagamento seguro via Mercado Pago
      </p>
    </form>
  );
}