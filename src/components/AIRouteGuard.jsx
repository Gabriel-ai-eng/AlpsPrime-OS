import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAIUnlock } from '@/lib/useAIUnlock';

/**
 * Protects the /chat route: only users who have unlocked Sexta-feira IA
 * (completed all 20 goals) can access it. Others are redirected to /feed.
 */
export default function AIRouteGuard({ children }) {
  const { aiUnlocked } = useAIUnlock();
  if (!aiUnlocked) return <Navigate to="/feed" replace />;
  return children;
}