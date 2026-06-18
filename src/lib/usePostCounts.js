import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Returns post counts for a user.
 * No daily limit — all users can post freely.
 */
export function usePostCounts(email) {
  const { data = [], ...rest } = useQuery({
    queryKey: ['post-counts', email],
    queryFn: () => base44.entities.Post.filter({ author_email: email }, '-created_date', 500),
    enabled: !!email,
    staleTime: 0,
  });

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const todayCount = data.filter((p) => new Date(p.created_date) >= start).length;

  return {
    total: data.length,
    today: todayCount,
    remainingToday: Infinity,
    limit: Infinity,
    ...rest,
  };
}
