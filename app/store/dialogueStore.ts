import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DialogueItem } from '../types/dialogue';

// 定义生成对话模块的状态类型
export interface DialogueState {
  dialogue: DialogueItem[];
  currentScene: string;
  currentSentenceIndex: number;
  isLoading: boolean;
  setDialogue: (dialogue: DialogueItem[]) => void;
  setCurrentScene: (scene: string) => void;
  setCurrentSentenceIndex: (index: number) => void;
  setIsLoading: (loading: boolean) => void;
}

// 创建生成对话模块的store
export const useDialogueStore = create<DialogueState>()(
  persist(
    (set) => ({
      dialogue: [],
      currentScene: "",
      currentSentenceIndex: -1,
      isLoading: false,
      setDialogue: (dialogue) =>
        set(() => ({
          dialogue,
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
    }),
    {
      name: "lingua-pal-dialogue-storage", // localStorage的key
    },
  ),
);
