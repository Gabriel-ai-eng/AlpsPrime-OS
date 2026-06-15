import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useCredits() {
  const { user, refetchUser } = useAuth();

  const checkAndConsume = async (amount) => {
    if (!user) return false;
    if (user.plan === 'unlimited') return true;
    if ((user.credits ?? 0) < amount) {
      toast.error('Créditos insuficientes', {
        description: 'Faça upgrade do seu plano para continuar.',
      });
      return false;
    }
    await base44.auth.updateMe({
      credits: (user.credits ?? 0) - amount,
      total_credits_used: (user.total_credits_used ?? 0) + amount,
    });
    if (refetchUser) await refetchUser();
    return true;
  };

  return { checkAndConsume };
}