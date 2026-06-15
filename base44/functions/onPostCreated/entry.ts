import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Entity automation handler — fires on Post.create.
 * Calls generateAgentReply in 'user_post' mode so 1-2 affine agents respond.
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
      mode: 'user_post',
      post_id: data.id,
      content: data.content,
      author_email: data.author_email,
      author_name: data.author_name,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('onPostCreated error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});