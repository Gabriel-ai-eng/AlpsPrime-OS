import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Loads all active agents and exposes a helper to find one by slug.
 */
export function useAgents() {
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents-all'],
    queryFn: () => base44.entities.Agent.filter({ active: true }, '-created_date', 20),
    staleTime: 1000 * 60 * 5,
  });

  const bySlug = useMemo(() => {
    const m = new Map();
    agents.forEach((a) => m.set(a.slug, a));
    return m;
  }, [agents]);

  return { agents, bySlug, isLoading };
}