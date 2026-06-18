import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Verified check badge next to a user's name.
 * Single neutral gold color for all verified users.
 */
export default function VerifiedBadge({ className, size = 14 }) {
  return (
    <span
      title="Verificado"
      aria-label="Verificado"
      className={cn('inline-flex items-center align-middle', className)}
    >
      <BadgeCheck
        width={size}
        height={size}
        className="text-gold drop-shadow"
        strokeWidth={2.5}
        fill="rgba(212,175,55,0.15)"
      />
    </span>
  );
}
