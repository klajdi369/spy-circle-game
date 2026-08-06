export interface Category {
  id: string;
  name: string;
  enabled: boolean;
  isPredefined: boolean;
  originalWords: string[];
  words: string[];
}

export interface WordLibrary {
  version: number;
  categories: Category[];
}

export const WORD_LIBRARY_VERSION = 1;
