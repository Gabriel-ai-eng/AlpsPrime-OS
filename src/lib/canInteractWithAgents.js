/**
 * Returns true if the user's plan allows interacting with agents
 * (reactions, comments, joining debates).
 * Only Pro and Unlimited plans can interact.
 */
export function canInteractWithAgents(user) {
  const plan = user?.plan || 'free';
  return plan === 'pro' || plan === 'unlimited';
}