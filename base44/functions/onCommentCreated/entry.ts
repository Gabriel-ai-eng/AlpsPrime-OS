import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Entity automation: triggered when a new Comment is created.
 * If the comment is on an agent post, the original agent replies.
 * Note: Comments here are on user posts; agent post comments live as
 * AgentReply with target_kind='user_comment' triggered separately.
 *
 * For now we handle: comment on a user post that is a "reaction to" an
 * agent — we just check if the post author is an agent stub… SKIP.
 *
 * Keeping this stub for future extension; safe no-op for normal comments.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body || {};
    if (event?.type !== 'create' || !data?.id) {
      return Response.json({ skipped: true });
    }
    // Not handling user-on-user comments here for now.
    return Response.json({ ok: true });
  } catch (error) {
    console.error('onCommentCreated error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});