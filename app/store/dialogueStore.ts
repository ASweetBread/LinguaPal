import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DialogueItem, VocabularyItem } from '../types/dialogue';

// 定义角色名称类型
interface RoleName {
  role: string;
  name: string;
}

// 定义生成对话模块的状态类型
export interface DialogueState {
  dialogue: DialogueItem[];
  rolename: RoleName[];
  vocabulary: VocabularyItem[];
  currentScene: string;
  currentSentenceIndex: number;
  isLoading: boolean;
  showPractice: boolean;
  setDialogue: (dialogue: DialogueItem[]) => void;
  setRolename: (rolename: RoleName[]) => void;
  setVocabulary: (vocabulary: VocabularyItem[]) => void;
  setDialogueAndVocabulary: (data: { dialogue: DialogueItem[]; vocabulary: VocabularyItem[] }) => void;
  setCurrentScene: (scene: string) => void;
  setCurrentSentenceIndex: (index: number) => void;
  setIsLoading: (loading: boolean) => void;
  setShowPractice: (show: boolean) => void;
  updateVocabularyErrorCount: (word: string) => void;
}

// 创建生成对话模块的store
export const useDialogueStore = create<DialogueState>()(
  // persist(
  //   ,
  //   {
  //     name: "lingua-pal-dialogue-storage", // localStorage的key
  //   },
  // ),
  (set) => ({
    dialogue: [],
    rolename: [
      // { "role": "A", "name": "" },
      // { "role": "B", "name": "" }
    ],
    vocabulary: [],
    currentScene: "",
    currentSentenceIndex: -1,
    isLoading: false,
    showPractice: false,
    setDialogue: (dialogue) =>
      set(() => ({
        dialogue,
      })),
    setRolename: (rolename) =>
      set(() => ({
        rolename,
      })),
    setVocabulary: (vocabulary) =>
      set(() => ({
        vocabulary,
      })),
    setDialogueAndVocabulary: (data) =>
      set(() => ({
        dialogue: data.dialogue,
        vocabulary: data.vocabulary,
      })),
    setCurrentScene: (scene) =>
      set(() => ({
        currentScene: scene,
      })),
    setCurrentSentenceIndex: (index) =>
      set(() => ({
        currentSentenceIndex: index,
      })),
    setIsLoading: (loading) =>
      set(() => ({
        isLoading: loading,
      })),
    setShowPractice: (show) =>
      set(() => ({
        showPractice: show,
      })),
    updateVocabularyErrorCount: (word) =>
      set((state) => ({
        vocabulary: state.vocabulary.map((item) => {
          if (item.word === word) {
            return {
              ...item,
              errorCount: Math.min((item.errorCount || 0) + 1, 1)
            };
          }
          return item;
        }),
      })),
  })
);
