/**
 * Validate spy count against player count.
 * Spies must be >= 1 and <= players - 2.
 */
export function validateSpyCount(playerCount: number, spyCount: number): {
  valid: boolean;
  corrected: number;
  message?: string;
} {
  if (playerCount < 3) {
    return { valid: false, corrected: 1, message: 'Need at least 3 players.' };
  }
  const maxSpies = Math.max(1, playerCount - 2);
  if (spyCount < 1) {
    return { valid: false, corrected: 1, message: 'Need at least 1 spy.' };
  }
  if (spyCount > maxSpies) {
    return { valid: false, corrected: maxSpies, message: `Max ${maxSpies} spy${maxSpies > 1 ? 's' : ''} for ${playerCount} players.` };
  }
  return { valid: true, corrected: spyCount };
}

/**
 * Clamp spy count to valid range for given player count.
 */
export function clampSpyCount(playerCount: number, spyCount: number): number {
  const { corrected } = validateSpyCount(playerCount, spyCount);
  return corrected;
}

/**
 * Validate a word: non-empty after trim.
 */
export function validateWord(word: string): { valid: boolean; cleaned: string; error?: string } {
  const cleaned = word.trim();
  if (cleaned === '') {
    return { valid: false, cleaned: '', error: 'Word cannot be blank.' };
  }
  return { valid: true, cleaned };
}

/**
 * Validate a category name: non-empty after trim.
 */
export function validateCategoryName(name: string): { valid: boolean; cleaned: string; error?: string } {
  const cleaned = name.trim();
  if (cleaned === '') {
    return { valid: false, cleaned: '', error: 'Category name cannot be blank.' };
  }
  return { valid: true, cleaned };
}

/**
 * Check if a category name is a duplicate (case-insensitive).
 */
export function isCategoryNameDuplicate(name: string, existingNames: string[]): boolean {
  const lower = name.trim().toLowerCase();
  return existingNames.some((existing) => existing.toLowerCase() === lower);
}

/**
 * Check for duplicate words in a list (case-insensitive).
 * Returns the list with duplicates removed.
 */
export function removeDuplicateWords(words: string[]): { unique: string[]; removed: number } {
  const seen = new Set<string>();
  const unique: string[] = [];
  let removed = 0;
  for (const w of words) {
    const lower = w.trim().toLowerCase();
    if (lower === '') {
      removed++;
      continue;
    }
    if (seen.has(lower)) {
      removed++;
      continue;
    }
    seen.add(lower);
    unique.push(w.trim());
  }
  return { unique, removed };
}

/**
 * Check if there are any usable words available across enabled categories.
 */
export function hasUsableWords(enabledCategories: { words: string[] }[]): boolean {
  return enabledCategories.some((cat) => cat.words.length > 0);
}
