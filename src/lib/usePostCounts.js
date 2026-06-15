import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const DAILY_POST_LIMIT = {
  free: 10,
  pro: 50,
  unlimited: Infinity,
};

/**
 * Returns post counts for a user:
 *  - total: total posts ever published
 *  - today: posts published today (local time)
 *  - remainingToday: posts remaining today based on plan (Infinity for unlimited)
 */
export function usePostCounts(email, plan = 'free') {
  const { data = [], ...rest } = useQuery({
    queryKey: ['post-counts', email],
    queryFn: () => base44.entities.Post.filter({ author_email: email }, '-created_date', 500),
    enabled: !!email,
    staleTime: 0,
  });

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const todayCount = data.filter((p) => new Date(p.created_date) >= start).length;
  const limit = DAILY_POST_LIMIT[plan] ?? DAILY_POST_LIMIT.free;
  const remainingToday = limit === Infinity ? Infinity : Math.max(0, limit - todayCount);

  return {
    total: data.length,
    today: todayCount,
    remainingToday,
    limit,
    ...rest,
  };
}