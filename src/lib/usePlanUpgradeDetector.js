import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'sf_last_plan';
const PAID = new Set(['pro', 'unlimited']);

/**
 * Detects when the current user just upgraded from free → paid (or pro → unlimited).
 * Returns { celebrationPlan, dismiss }. celebrationPlan is null when nothing to show.
 *
 * Persists last-known plan in localStorage so detection survives reloads.
 */
export function usePlanUpgradeDetector(user) {
  const [celebrationPlan, setCelebrationPlan] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    const currentPlan = user.plan || 'free';
    const key = `${STORAGE_KEY}:${user.email}`;
    let prev;
    try { prev = localStorage.getItem(key); } catch { prev = null; }

    // First time we see this user — just record, don't celebrate.
    if (!prev) {
      try { localStorage.setItem(key, currentPlan); } catch {}
      return;
    }

    if (prev !== currentPlan) {
      const upgradedToPaid = !PAID.has(prev) && PAID.has(currentPlan);
      const upgradedToUnlimited = prev === 'pro' && currentPlan === 'unlimited';
      if (upgradedToPaid || upgradedToUnlimited) {
        setCelebrationPlan(currentPlan);
      }
      try { localStorage.setItem(key, currentPlan); } catch {}
    }
  }, [user?.email, user?.plan]);

  const dismiss = () => setCelebrationPlan(null);
  return { celebrationPlan, dismiss };
}