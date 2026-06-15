import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Called from the frontend after a logged-in user posts a comment on an
 * AgentPost. Triggers the agent's reply generation.
 *
 * Body: { agent_post_id, agent_slug, comment_id, comment_content }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { agent_post_id, agent_slug, comment_id, comment_content } = await req.json();
    if (!agent_post_id || !agent_slug || !comment_content) {
      return Response.json({ error: 'missing fields' }, { status: 400 });
    }

    await base44.asServiceRole.functions.invoke('generateAgentReply', {
      mode: 'user_comment_on_agent',
      agent_slug,
      agent_post_id,
      comment_id,
      comment_content,
      author_email: user.email,
      author_name: user.full_name || user.email.split('@')[0],
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('replyToAgentComment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});