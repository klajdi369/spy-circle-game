import type { WordLibrary, Category } from '../types/words';
import { WORD_LIBRARY_VERSION } from '../types/words';
import { safeGetJSON, safeSetJSON, safeRemoveItem } from './safeStorage';
import { createDefaultCategories, DEFAULT_WORDS } from '../data/defaultWords';

const STORAGE_KEY = 'spy-circle-word-library';

function seedDefaultLibrary(): WordLibrary {
  const categories = createDefaultCategories();
  for (const cat of categories) {
    const words = DEFAULT_WORDS[cat.name] ?? [];
    cat.words = [...words];
    cat.originalWords = [...words];
  }
  return { version: WORD_LIBRARY_VERSION, categories };
}

export function loadWordLibrary(): WordLibrary {
  const stored = safeGetJSON<WordLibrary | null>(STORAGE_KEY, null);
  if (stored && stored.version === WORD_LIBRARY_VERSION && Array.isArray(stored.categories)) {
    return stored;
  }
  // If corrupted or missing, seed defaults
  const lib = seedDefaultLibrary();
  saveWordLibrary(lib);
  return lib;
}

export function saveWordLibrary(library: WordLibrary): boolean {
  return safeSetJSON(STORAGE_KEY, library);
}

export function exportWordLibrary(library: WordLibrary): string {
  return JSON.stringify(library, null, 2);
}

export function validateImportData(data: unknown): data is WordLibrary {
  if (!data || typeof data !== 'object') return false;
  const lib = data as Record<string, unknown>;
  if (lib.version !== WORD_LIBRARY_VERSION) return false;
  if (!Array.isArray(lib.categories)) return false;
  for (const cat of lib.categories) {
    if (!cat || typeof cat !== 'object') return false;
    const c = cat as Record<string, unknown>;
    if (typeof c.id !== 'string') return false;
    if (typeof c.name !== 'string' || c.name.trim() === '') return false;
    if (typeof c.enabled !== 'boolean') return false;
    if (!Array.isArray(c.words)) return false;
    if (!Array.isArray(c.originalWords)) return false;
  }
  return true;
}

export function importWordLibrary(json: string): WordLibrary | null {
  try {
    const data = JSON.parse(json);
    if (!validateImportData(data)) return null;
    // Set version and ensure internal consistency
    const lib = data as WordLibrary;
    lib.version = WORD_LIBRARY_VERSION;
    saveWordLibrary(lib);
    return lib;
  } catch {
    return null;
  }
}

export function restoreCategoryDefaults(category: Category): Category {
  const defaults = DEFAULT_WORDS[category.name];
  if (!defaults) return category;
  return {
    ...category,
    words: [...defaults],
    originalWords: [...defaults],
  };
}

export function restoreAllDefaults(): WordLibrary {
  const lib = seedDefaultLibrary();
  saveWordLibrary(lib);
  return lib;
}

export function resetWordLibrary(): void {
  safeRemoveItem(STORAGE_KEY);
}
