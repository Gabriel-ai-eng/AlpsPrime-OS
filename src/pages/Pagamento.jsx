import React from 'react';
import LegalSection from '@/components/LegalSection';
import { useT } from '@/lib/i18n';

export default function Pagamento() {
  const t = useT();
  return <LegalSection title={t('Pagamento')} />;
}
