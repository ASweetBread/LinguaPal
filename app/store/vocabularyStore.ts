import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VocabularyItem } from '../types';

// 定义词汇表模块的状态类型
export interface VocabularyState {
  vocabulary: VocabularyItem[];
  addToVocabulary: (word: VocabularyItem) => void;
  removeFromVocabulary: (id: string) => void;
}

// 创建词汇表模块的store
export const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set) => ({
      vocabulary: [],
      addToVocabulary: (word) =>
        set((state) => ({
          vocabulary: [...state.vocabulary, word],
        })),
      removeFromVocabulary: (id) =>
        set((state) => ({
          vocabulary: state.vocabulary.filter((word) => word.id !== id),
        })),
    }),
    {
      name: "lingua-pal-vocabulary-storage", // localStorage的key
    },
  ),
);
