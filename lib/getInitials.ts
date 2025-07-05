// Utility to get initials from a name according to the rules:
// - If 2 words: take first letter of each (max 2 letters)
// - If >2 words: take first letter of first word only
// - If 1 word: take first letter only
export function getInitials(name: string): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0]?.toUpperCase() || "?";
  if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0][0].toUpperCase();
}
