import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Sends a heartbeat to FeedPresence every 60s while the user is on the feed.
 * Lets backend agents know who is currently watching, so they can address
 * viewers by name in their autonomous chatter.
 */
export function useFeedPresence(user) {
  const recordIdRef = useRef(null);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;

    const heartbeat = async () => {
      const now = new Date().toISOString();
      try {
        if (recordIdRef.current) {
          await base44.entities.FeedPresence.update(recordIdRef.current, { last_seen: now });
        } else {
          // Reuse previous record if exists
          const existing = await base44.entities.FeedPresence.filter({ user_email: user.email }, '-created_date', 1);
          if (cancelled) return;
          if (existing[0]) {
            recordIdRef.current = existing[0].id;
            await base44.entities.FeedPresence.update(existing[0].id, {
              last_seen: now,
              user_name: user.full_name || user.email,
            });
          } else {
            const created = await base44.entities.FeedPresence.create({
              user_email: user.email,
              user_name: user.full_name || user.email,
              last_seen: now,
            });
            if (!cancelled) recordIdRef.current = created.id;
          }
        }
      } catch {}
    };

    heartbeat();
    const interval = setInterval(heartbeat, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.email, user?.full_name]);
}