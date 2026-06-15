import { base44 } from '@/api/base44Client';
import { askGemini } from '@/lib/askGemini';

// ---------- Conversations (list / create / update title / delete) ----------

export async function listConversations() {
  const list = await base44.entities.Conversation.list('-updated_date', 100);
  return list.map(c => ({
    id: c.id,
    title: c.title,
    updated_at: c.updated_date,
    message_count: c.message_count || 0,
  }));
}

export async function createConversation(title = 'Nova conversa') {
  const conv = await base44.entities.Conversation.create({ title, messages: [], message_count: 0 });
  return { id: conv.id, title: conv.title };
}

export async function updateConvTitle(id, title) {
  await base44.entities.Conversation.update(id, { title });
}

export async function deleteConversation(id) {
  await base44.entities.Conversation.delete(id);
}

// ---------- Messages (stored inside Conversation.messages array) ----------

export async function getMessages(conversationId) {
  const conv = await base44.entities.Conversation.get(conversationId);
  return conv?.messages || [];
}

export async function saveMessage(conversationId, role, content) {
  const conv = await base44.entities.Conversation.get(conversationId);
  const messages = [...(conv.messages || []), { role, content }];
  await base44.entities.Conversation.update(conversationId, {
    messages,
    message_count: messages.length,
  });
}

// ---------- Title generation (local, no API call to save quota) ----------

export async function generateConversationTitle(firstUserMessage) {
  if (!firstUserMessage) return 'Nova conversa';
  // Take first meaningful words, capitalize, limit length
  const cleaned = firstUserMessage.trim().replace(/\s+/g, ' ');
  const words = cleaned.split(' ').slice(0, 6).join(' ');
  const title = words.length > 50 ? words.slice(0, 50) + '…' : words;
  return title.charAt(0).toUpperCase() + title.slice(1);
}

// ---------- Streaming (fake-stream: calls askGemini and reveals gradually) ----------

export async function streamGemini({ messages, system, onChunk }) {
  // Build a single prompt from system + conversation history
  const history = messages
    .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
    .join('\n\n');
  const fullPrompt = `${system}\n\n${history}\n\nAssistente:`;

  const fullText = await askGemini(fullPrompt);

  // Simulate streaming by revealing text in small chunks
  const words = fullText.split(/(\s+)/);
  let acc = '';
  for (let i = 0; i < words.length; i++) {
    acc += words[i];
    onChunk?.(acc);
    // small delay to feel like streaming
    await new Promise(r => setTimeout(r, 12));
  }
  return fullText;
}