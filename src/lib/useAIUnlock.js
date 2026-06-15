import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { TOTAL_GOALS } from '@/lib/goals';

/**
 * Hook: tracks whether the user has unlocked Sexta-feira IA
 * (i.e. has completed all 20 goals / challenges).
 *
 * Returns:
 *   - aiUnlocked: true/false based on completion count
 *   - completedCount: number of goals completed
 *   - showCelebration: true only once, right after the user reaches 20
 *   - dismissCelebration(): call after the celebration animation is shown
 */
export function useAIUnlock() {
  const [showCelebration, setShowCelebration] = useState(false);
  const auth = useAuth();
  const user = auth?.user ?? null;

  const { data: completions = [] } = useQuery({
    queryKey: ['challenges', user?.email],
    queryFn: () => base44.entities.Challenge.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const completedCount = new Set(completions.map((c) => c.challenge_id)).size;
  const aiUnlocked = completedCount >= TOTAL_GOALS;

  // Trigger celebration the first time the user reaches 20 goals.
  // We persist a flag on the user record (ai_unlock_celebrated) to avoid re-firing.
  useEffect(() => {
    if (!user) return;
    if (aiUnlocked && !user.ai_unlock_celebrated) {
      setShowCelebration(true);
    }
  }, [aiUnlocked, user]);

  const dismissCelebration = async () => {
    setShowCelebration(false);
    try {
      await base44.auth.updateMe({ ai_unlock_celebrated: true });
    } catch {}
  };

  return { aiUnlocked, completedCount, showCelebration, dismissCelebration };
}