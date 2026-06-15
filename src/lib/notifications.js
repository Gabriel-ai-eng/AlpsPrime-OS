import { base44 } from '@/api/base44Client';

/**
 * Creates a notification for a recipient. Silently skips if the
 * recipient is the same as the actor (no self-notifications).
 */
export async function createNotification({
  recipientEmail,
  actor,
  type,
  postId,
  postPreview,
  commentPreview,
  messagePreview,
  conversationKey,
}) {
  if (!recipientEmail || !actor?.email) return;
  if (recipientEmail === actor.email) return;

  await base44.entities.Notification.create({
    recipient_email: recipientEmail,
    actor_email: actor.email,
    actor_name: actor.ranking_display_name || actor.full_name || 'Usuário',
    actor_avatar: actor.profile_picture_url || '',
    type,
    post_id: postId,
    post_preview: postPreview ? postPreview.slice(0, 100) : undefined,
    comment_preview: commentPreview ? commentPreview.slice(0, 100) : undefined,
    message_preview: messagePreview ? messagePreview.slice(0, 100) : undefined,
    conversation_key: conversationKey,
    read: false,
  });
}

/**
 * Removes a "like" notification when the user unlikes a post.
 */
export async function removeLikeNotification({ recipientEmail, actorEmail, postId }) {
  if (!recipientEmail || recipientEmail === actorEmail) return;
  const list = await base44.entities.Notification.filter({
    recipient_email: recipientEmail,
    actor_email: actorEmail,
    type: 'like',
    post_id: postId,
  });
  await Promise.all(list.map((n) => base44.entities.Notification.delete(n.id)));
}