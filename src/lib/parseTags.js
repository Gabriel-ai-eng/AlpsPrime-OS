/**
 * Extract #hashtags from post content.
 * Returns an array of lowercase tag strings (without #).
 */
export function parseTags(content) {
  if (!content) return [];
  const matches = content.match(/#([\p{L}\p{N}_]{2,30})/gu) || [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}