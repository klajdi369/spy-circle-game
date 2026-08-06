import { useState, useCallback } from 'react';
import type { WordLibrary, Category } from '../types/words';
import {
  loadWordLibrary,
  saveWordLibrary,
  exportWordLibrary,
  importWordLibrary,
  restoreCategoryDefaults,
  restoreAllDefaults,
} from '../storage/wordLibrary';
import { removeDuplicateWords, validateCategoryName, isCategoryNameDuplicate } from '../logic/validation';
import { generateUUID } from '../logic/random';

export function useWordLibrary() {
  const [library, setLibrary] = useState<WordLibrary>(loadWordLibrary);

  const persist = useCallback((lib: WordLibrary) => {
    saveWordLibrary(lib);
    setLibrary(lib);
  }, []);

  const reload = useCallback(() => {
    setLibrary(loadWordLibrary());
  }, []);

  const addCategory = useCallback((name: string): { success: boolean; error?: string } => {
    const { valid, cleaned, error } = validateCategoryName(name);
    if (!valid) return { success: false, error };

    const existingNames = library.categories.map((c) => c.name);
    if (isCategoryNameDuplicate(cleaned, existingNames)) {
      return { success: false, error: 'A category with this name already exists.' };
    }

    const newCategory: Category = {
      id: generateUUID(),
      name: cleaned,
      enabled: true,
      isPredefined: false,
      originalWords: [],
      words: [],
    };

    persist({ ...library, categories: [...library.categories, newCategory] });
    return { success: true };
  }, [library, persist]);

  const renameCategory = useCallback((id: string, newName: string): { success: boolean; error?: string } => {
    const { valid, cleaned, error } = validateCategoryName(newName);
    if (!valid) return { success: false, error };

    const existingNames = library.categories
      .filter((c) => c.id !== id)
      .map((c) => c.name);
    if (isCategoryNameDuplicate(cleaned, existingNames)) {
      return { success: false, error: 'A category with this name already exists.' };
    }

    persist({
      ...library,
      categories: library.categories.map((c) =>
        c.id === id ? { ...c, name: cleaned } : c,
      ),
    });
    return { success: true };
  }, [library, persist]);

  const toggleCategory = useCallback((id: string) => {
    persist({
      ...library,
      categories: library.categories.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c,
      ),
    });
  }, [library, persist]);

  const deleteCategory = useCallback((id: string) => {
    persist({
      ...library,
      categories: library.categories.filter((c) => c.id !== id),
    });
  }, [library, persist]);

  const addWord = useCallback((categoryId: string, word: string): { success: boolean; error?: string } => {
    const trimmed = word.trim();
    if (trimmed === '') return { success: false, error: 'Word cannot be blank.' };

    const category = library.categories.find((c) => c.id === categoryId);
    if (!category) return { success: false, error: 'Category not found.' };

    const lower = trimmed.toLowerCase();
    if (category.words.some((w) => w.toLowerCase() === lower)) {
      return { success: false, error: 'This word already exists in this category.' };
    }

    persist({
      ...library,
      categories: library.categories.map((c) =>
        c.id === categoryId ? { ...c, words: [...c.words, trimmed] } : c,
      ),
    });
    return { success: true };
  }, [library, persist]);

  const addWordsBulk = useCallback((categoryId: string, text: string): { added: number; skipped: number } => {
    const category = library.categories.find((c) => c.id === categoryId);
    if (!category) return { added: 0, skipped: 0 };

    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l !== '');
    const existing = new Set(category.words.map((w) => w.toLowerCase()));
    const newWords: string[] = [];
    let skipped = 0;

    for (const line of lines) {
      if (existing.has(line.toLowerCase())) {
        skipped++;
      } else {
        newWords.push(line);
        existing.add(line.toLowerCase());
      }
    }

    if (newWords.length > 0 || skipped > 0) {
      persist({
        ...library,
        categories: library.categories.map((c) =>
          c.id === categoryId ? { ...c, words: [...c.words, ...newWords] } : c,
        ),
      });
    }

    return { added: newWords.length, skipped };
  }, [library, persist]);

  const editWord = useCallback((categoryId: string, oldIndex: number, newWord: string) => {
    const trimmed = newWord.trim();
    if (trimmed === '') return { success: false, error: 'Word cannot be blank.' };

    const category = library.categories.find((c) => c.id === categoryId);
    if (!category) return { success: false, error: 'Category not found.' };

    const lower = trimmed.toLowerCase();
    const duplicate = category.words.findIndex(
      (w, i) => i !== oldIndex && w.toLowerCase() === lower,
    );
    if (duplicate !== -1) {
      return { success: false, error: 'This word already exists in this category.' };
    }

    const newWords = [...category.words];
    newWords[oldIndex] = trimmed;

    persist({
      ...library,
      categories: library.categories.map((c) =>
        c.id === categoryId ? { ...c, words: newWords } : c,
      ),
    });
    return { success: true };
  }, [library, persist]);

  const deleteWord = useCallback((categoryId: string, index: number) => {
    const category = library.categories.find((c) => c.id === categoryId);
    if (!category) return;

    persist({
      ...library,
      categories: library.categories.map((c) =>
        c.id === categoryId
          ? { ...c, words: c.words.filter((_, i) => i !== index) }
          : c,
      ),
    });
  }, [library, persist]);

  const removeDuplicates = useCallback((categoryId: string) => {
    const category = library.categories.find((c) => c.id === categoryId);
    if (!category) return;

    const { unique } = removeDuplicateWords(category.words);
    persist({
      ...library,
      categories: library.categories.map((c) =>
        c.id === categoryId ? { ...c, words: unique } : c,
      ),
    });
  }, [library, persist]);

  const restoreCategory = useCallback((categoryId: string) => {
    const category = library.categories.find((c) => c.id === categoryId);
    if (!category) return;

    const restored = restoreCategoryDefaults(category);
    persist({
      ...library,
      categories: library.categories.map((c) =>
        c.id === categoryId ? restored : c,
      ),
    });
  }, [library, persist]);

  const restoreAll = useCallback(() => {
    const lib = restoreAllDefaults();
    setLibrary(lib);
  }, []);

  const exportLib = useCallback((): string => {
    return exportWordLibrary(library);
  }, [library]);

  const importLib = useCallback((json: string): { success: boolean; error?: string } => {
    const result = importWordLibrary(json);
    if (!result) {
      return { success: false, error: 'Invalid or corrupted import file. Check the JSON structure and try again.' };
    }
    setLibrary(result);
    return { success: true };
  }, []);

  return {
    library,
    addCategory,
    renameCategory,
    toggleCategory,
    deleteCategory,
    addWord,
    addWordsBulk,
    editWord,
    deleteWord,
    removeDuplicates,
    restoreCategory,
    restoreAll,
    exportLib,
    importLib,
    reload,
  };
}
