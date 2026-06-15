import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Deletes the authenticated user's account and all associated data.
 * The user confirms client-side; this function just executes.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.email;
    const svc = base44.asServiceRole;

    // Helper to bulk-delete by filter
    const deleteAllByFilter = async (entityName, filter) => {
      const records = await svc.entities[entityName].filter(filter, '-created_date', 1000);
      for (const r of records) {
        try { await svc.entities[entityName].delete(r.id); } catch (e) { console.error(`Failed to delete ${entityName} ${r.id}:`, e?.message); }
      }
      return records.length;
    };

    // User-owned content
    await deleteAllByFilter('Post', { author_email: email });
    await deleteAllByFilter('Comment', { author_email: email });
    await deleteAllByFilter('PostInteraction', { user_email: email });

    // Follows (both directions)
    await deleteAllByFilter('Follow', { follower_email: email });
    await deleteAllByFilter('Follow', { followed_email: email });

    // Direct messages (both directions)
    await deleteAllByFilter('DirectMessage', { sender_email: email });
    await deleteAllByFilter('DirectMessage', { receiver_email: email });

    // Notifications (both directions)
    await deleteAllByFilter('Notification', { recipient_email: email });
    await deleteAllByFilter('Notification', { actor_email: email });

    // Challenges & stats
    await deleteAllByFilter('Challenge', { user_email: email });
    await deleteAllByFilter('UserStats', { user_email: email });
    await deleteAllByFilter('UsageHistory', { created_by: email });
    await deleteAllByFilter('Conversation', { created_by: email });

    // Finally, delete the User record itself
    try {
      await svc.entities.User.delete(user.id);
    } catch (e) {
      console.error('Failed to delete User record:', e?.message);
      return Response.json({ error: 'Não foi possível excluir a conta. Tente novamente.' }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('deleteMyAccount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});