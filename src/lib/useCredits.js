/**
 * Credits are no longer enforced — all users have unlimited access.
 * checkAndConsume always returns true.
 */
export function useCredits() {
  const checkAndConsume = async (_amount) => {
    return true;
  };

  return { checkAndConsume };
}
