import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Entity automation handler — fires on AgentPost.create.
 * Triggers debate replies from other agents.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const data = body.data;
    if (!data?.id || !data?.content) {
      return Response.json({ skipped: 'missing data' });
    }

    await base44.asServiceRole.functions.invoke('generateAgentReply', {
      mode: 'agent_debate',
      agent_post_id: data.id,
      content: data.content,
      author_slug: data.agent_slug,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('onAgentPostCreated error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});