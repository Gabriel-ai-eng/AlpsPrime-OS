import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Loader2, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLAN_PRICES = { pro: 49.90, unlimited: 99.90 };

export default function BoletoPayment({ planId, onSuccess }) {
  const [step, setStep] = useState('form'); // form | generated
  const [loading, setLoading] = useState(false);
  const [boletoData, setBoletoData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ cpf: '', firstName: '', lastName: '' });

  const formatCPF = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await base44.functions.invoke('mpCreateBoletoPayment', {
      plan_id: planId,
      cpf: form.cpf.replace(/\D/g, ''),
      first_name: form.firstName,
      last_name: form.lastName,
    });
    setLoading(false);
    if (res.data?.barcode) {
      setBoletoData(res.data);
      setStep('generated');
    } else {
      toast.error(res.data?.error || 'Erro ao gerar boleto.');
    }
  };

  const copyBarcode = () => {
    navigator.clipboard.writeText(boletoData.barcode);
    setCopied(true);
    toast.success('Código de barras copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  if (step === 'generated') return (
    <div className="space-y-5">
      <div className="text-center">
        <FileText className="w-12 h-12 text-gold mx-auto mb-3" />
        <h3 className="font-semibold">Boleto gerado com sucesso!</h3>
        <p className="text-xs text-muted-foreground mt-1">Pague até o vencimento para ativar seu plano</p>
      </div>

      {boletoData?.barcode && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Linha digitável</p>
          <div className="flex items-center gap-2 bg-muted rounded-xl p-3">
            <p className="text-xs font-mono flex-1 truncate">{boletoData.barcode.substring(0, 35)}...</p>
            <Button
              size="sm"
              onClick={copyBarcode}
              className={cn('h-8 px-3 flex-shrink-0 text-xs', copied ? 'bg-emerald-500' : 'bg-gold hover:bg-gold-dark text-background')}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>
      )}

      {boletoData?.external_resource_url && (
        <a href={boletoData.external_resource_url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full border-gold/30 hover:border-gold/60 gap-2">
            <ExternalLink className="w-4 h-4" /> Abrir boleto em PDF
          </Button>
        </a>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Após o pagamento, seu plano será ativado automaticamente em até 1 dia útil.
      </p>
    </div>
  );

  return (
    <form onSubmit={handleGenerate} className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">Preencha seus dados para gerar o boleto</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Nome</label>
          <Input
            placeholder="João"
            value={form.firstName}
            onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
            className="bg-background border-border"
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Sobrenome</label>
          <Input
            placeholder="Silva"
            value={form.lastName}
            onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
            className="bg-background border-border"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">CPF</label>
        <Input
          placeholder="000.000.000-00"
          value={form.cpf}
          onChange={(e) => setForm(f => ({ ...f, cpf: formatCPF(e.target.value) }))}
          className="bg-background border-border"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-gradient-to-r from-gold-light via-gold to-gold-dark hover:opacity-90 text-background font-semibold"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando boleto...</> : (
          <><FileText className="w-4 h-4" /> Gerar Boleto — R$ {PLAN_PRICES[planId]?.toFixed(2).replace('.', ',')}</>
        )}
      </Button>
    </form>
  );
}