/**
 * Generate default player names: "Player 1", "Player 2", etc.
 */
export function generateDefaultNames(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `Player ${i + 1}`);
}

/**
 * Preserve entered names when player count changes.
 * New players get default names; removed players' names are dropped.
 */
export function preserveNames(
  previousNames: string[],
  newCount: number,
): string[] {
  const result: string[] = [];
  for (let i = 0; i < newCount; i++) {
    if (i < previousNames.length && previousNames[i].trim() !== '') {
      result.push(previousNames[i]);
    } else {
      result.push(`Player ${i + 1}`);
    }
  }
  return result;
}
