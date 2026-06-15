import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Loads the user directory once and provides live lookups for
 * avatar / name / plan by email.
 *
 * Why: Posts and comments store the author's avatar at creation time
 * as a snapshot. If the author later uploads/changes their photo,
 * the post still shows the old (or empty) snapshot. By looking up
 * the user directory we always show the LIVE profile picture.
 */
export function useUsersDirectory() {
  const { data: users = [] } = useQuery({
    queryKey: ['users-directory'],
    queryFn: async () => {
      const res = await base44.functions.invoke('listPublicUsers', {});
      return res?.data?.users || [];
    },
    staleTime: 60 * 1000,
  });

  const map = useMemo(() => {
    const m = {};
    users.forEach((u) => { if (u?.email) m[u.email] = u; });
    return m;
  }, [users]);

  const getUser = (email) => (email && map[email]) || null;
  const getAvatar = (email, fallback = '') => getUser(email)?.profile_picture_url || fallback || '';
  const getName = (email, fallback = '') => {
    const u = getUser(email);
    return u?.ranking_display_name || u?.full_name || fallback || '';
  };
  const getPlan = (email, fallback = 'free') => getUser(email)?.plan || fallback || 'free';

  return { users, map, getUser, getAvatar, getName, getPlan };
}