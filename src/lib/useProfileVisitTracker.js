import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Determines the source of a profile visit based on the document referrer
 * (within the same SPA, we can use session-stored "lastPath").
 */
function detectSource() {
  try {
    const last = sessionStorage.getItem('sf_last_path') || '';
    if (last.startsWith('/feed')) return 'feed';
    if (last.startsWith('/search')) return 'search';
    if (last.startsWith('/verified')) return 'verified';
    if (last.startsWith('/sextou')) return 'sextou';
    if (last.startsWith('/chat-dm')) return 'dm';
    if (last.startsWith('/ranking')) return 'ranking';
    if (last.includes('notification')) return 'notification';
    if (!last) return 'direct';
    return 'other';
  } catch {
    return 'direct';
  }
}

/**
 * Records a profile visit when the page mounts and updates the duration on unmount.
 * - Skips when visitor is the profile owner (is_self=true → ignored in analytics)
 * - Skips when visitor is in ghost mode (handled in entity create RLS via is_ghost flag)
 *
 * Privacy: visitor_email is recorded, but only aggregate numbers are shown to the
 * profile owner (no individual visitor identification is exposed in the analytics UI).
 */
export function useProfileVisitTracker({ profileEmail, visitorEmail, visitorIsGhost }) {
  const visitIdRef = useRef(null);
  const startedAtRef = useRef(null);

  useEffect(() => {
    if (!profileEmail || !visitorEmail) return;

    const isSelf = profileEmail === visitorEmail;
    if (isSelf) return; // don't record self-visits

    if (visitorIsGhost) return; // ghost mode: don't record at all

    let cancelled = false;

    (async () => {
      try {
        const visit = await base44.entities.ProfileVisit.create({
          profile_email: profileEmail,
          visitor_email: visitorEmail,
          source: detectSource(),
          duration_seconds: 0,
          is_self: false,
        });
        if (cancelled) return;
        visitIdRef.current = visit.id;
        startedAtRef.current = Date.now();
      } catch {
        // silent
      }
    })();

    return () => {
      cancelled = true;
      const id = visitIdRef.current;
      const startedAt = startedAtRef.current;
      if (id && startedAt) {
        const duration = Math.min(3600, Math.round((Date.now() - startedAt) / 1000));
        // Fire & forget — no need to await on unmount
        base44.entities.ProfileVisit.update(id, { duration_seconds: duration }).catch(() => {});
      }
    };
  }, [profileEmail, visitorEmail, visitorIsGhost]);
}

/**
 * Records a "post clicked" event by attaching the post id to the most recent
 * visit record (best-effort; if no recent visit exists, creates a lightweight one).
 */
export async function trackPostClick({ profileEmail, visitorEmail, postId, visitorIsGhost }) {
  if (!profileEmail || !visitorEmail || !postId) return;
  if (profileEmail === visitorEmail) return;
  if (visitorIsGhost) return;

  try {
    // Find the most recent visit by this visitor on this profile (last 30 min)
    const recent = await base44.entities.ProfileVisit.filter(
      { profile_email: profileEmail, visitor_email: visitorEmail },
      '-created_date',
      1
    );
    const last = recent[0];
    if (last && Date.now() - new Date(last.created_date).getTime() < 30 * 60 * 1000) {
      await base44.entities.ProfileVisit.update(last.id, { post_clicked_id: postId });
    } else {
      await base44.entities.ProfileVisit.create({
        profile_email: profileEmail,
        visitor_email: visitorEmail,
        source: detectSource(),
        duration_seconds: 0,
        post_clicked_id: postId,
      });
    }
  } catch {
    // silent
  }
}