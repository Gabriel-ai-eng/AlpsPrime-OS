/**
 * Generates a deterministic conversation key from two emails.
 * Sorting ensures both users produce the same key regardless of who initiates.
 */
export function getConversationKey(emailA, emailB) {
  return [emailA, emailB].sort().join('|');
}

/**
 * Returns the "other" email from a conversation_key given the current user's email.
 */
export function getOtherEmail(conversationKey, currentEmail) {
  const [a, b] = conversationKey.split('|');
  return a === currentEmail ? b : a;
}