import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Verified check badge next to a user's name.
 * - Pro: blue check
 * - Unlimited: gold check (rarer, more prestigious)
 * Accepts the user's plan and optional sizing.
 */
export default function VerifiedBadge({ plan, className, size = 14 }) {
  if (plan !== 'pro' && plan !== 'unlimited') return null;

  const isGold = plan === 'unlimited';
  const title = isGold ? 'Verificado Unlimited' : 'Verificado Pro';

  return (
    <span
      title={title}
      aria-label={title}
      className={cn('inline-flex items-center align-middle', className)}
    >
      <BadgeCheck
        width={size}
        height={size}
        className={cn(
          'drop-shadow',
          isGold ? 'text-gold' : 'text-sky-400'
        )}
        strokeWidth={2.5}
        fill={isGold ? 'rgba(212,175,55,0.15)' : 'rgba(56,189,248,0.15)'}
      />
    </span>
  );
}