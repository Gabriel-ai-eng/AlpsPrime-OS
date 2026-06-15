import { base44 } from '@/api/base44Client';

export async function incrementUserStats(user, { messages = 0, images = 0, conversations = 0 }) {
  if (!user?.email) return;

  const existing = await base44.entities.UserStats.filter({ user_email: user.email }, '-created_date', 1);
  const score = messages * 1 + images * 5 + conversations * 2;

  if (existing && existing.length > 0) {
    const stat = existing[0];
    await base44.entities.UserStats.update(stat.id, {
      total_messages: (stat.total_messages || 0) + messages,
      total_images: (stat.total_images || 0) + images,
      total_conversations: (stat.total_conversations || 0) + conversations,
      score: (stat.score || 0) + score,
      user_name: user.full_name || stat.user_name,
    });
  } else {
    await base44.entities.UserStats.create({
      user_email: user.email,
      user_name: user.full_name || 'Usuário',
      total_messages: messages,
      total_images: images,
      total_conversations: conversations,
      score,
    });
  }
}