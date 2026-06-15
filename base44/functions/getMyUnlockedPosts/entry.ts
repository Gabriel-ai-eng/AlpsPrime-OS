import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Returns the list of post IDs the current user has unlocked.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const unlocks = await base44.asServiceRole.entities.PostUnlock.filter(
      { buyer_email: me.email },
      '-created_date',
      500,
    );
    return Response.json({ unlocked_post_ids: unlocks.map((u) => u.post_id) });
  } catch (error) {
    console.error('getMyUnlockedPosts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});