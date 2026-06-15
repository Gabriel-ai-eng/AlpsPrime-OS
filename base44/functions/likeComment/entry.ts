import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Toggle a like on a comment. Used to support Meta 14 — Melhor Comentarista.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { comment_id } = await req.json();
    if (!comment_id) return Response.json({ error: 'comment_id required' }, { status: 400 });

    const svc = base44.asServiceRole;
    const comment = await svc.entities.Comment.get(comment_id).catch(() => null);
    if (!comment) return Response.json({ error: 'Comentário não encontrado.' }, { status: 404 });

    const existing = await svc.entities.CommentLike.filter({ comment_id, user_email: me.email });
    if (existing.length) {
      await svc.entities.CommentLike.delete(existing[0].id);
      return Response.json({ ok: true, liked: false });
    }
    await svc.entities.CommentLike.create({
      comment_id,
      user_email: me.email,
      comment_author_email: comment.author_email,
    });
    return Response.json({ ok: true, liked: true });
  } catch (error) {
    console.error('likeComment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});