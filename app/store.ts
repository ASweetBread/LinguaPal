import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DialogueItem } from "./types/dialogue";

// 定义单词类型
interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  example: string;
  timestamp: number;
}

// 定义AI服务类型
type AIService = {
  textAI: 'zhipu' | 'openai' | 'claude';
  asrService: 'zhipu' | 'baidu' | 'ali';
  ttsService: 'browser' | 'zhipu' | 'baidu' | 'ali';
};

// 定义配置类型
interface AppConfig {
  mode: 'normal' | 'prompt';
  aiServices: AIService;
  theme: 'light' | 'dark';
}

// 定义应用状态类型
interface AppState {
  vocabulary: VocabularyItem[];
  currentScene: string;
  dialogue: DialogueItem[];
  isLoading: boolean;
  currentSentenceIndex: number;
  config: AppConfig;
  // 练习状态由组件本地管理，不在store中公开
  addToVocabulary: (word: VocabularyItem) => void;
  removeFromVocabulary: (id: string) => void;
  setCurrentScene: (scene: string) => void;
  setDialogue: (dialogue: DialogueItem[]) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentSentenceIndex: (index: number) => void;
  updateConfig: (config: Partial<AppConfig>) => void;
  updateAIServices: (services: Partial<AIService>) => void;
  toggleTheme: () => void;
}

// 创建store，使用persist中间件保存到localStorage
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      vocabulary: [],
      currentScene: "",
      dialogue: [],
      isLoading: false,
      currentSentenceIndex: -1,
      config: {
        mode: 'normal',
        aiServices: {
          textAI: 'zhipu',
          asrService: 'zhipu',
          ttsService: 'browser'
        },
        theme: 'light'
      },
      addToVocabulary: (word) =>
        set((state) => ({
          vocabulary: [...state.vocabulary, word],
        })),
      removeFromVocabulary: (id) =>
        set((state) => ({
          vocabulary: state.vocabulary.filter((word) => word.id !== id),
        })),
      setCurrentScene: (scene) =>
        set(() => ({
          currentScene: scene,
        })),
      setDialogue: (dialogue) =>
        set(() => ({
          dialogue,
        })),
      setIsLoading: (loading) =>
        set(() => ({
          isLoading: loading,
        })),
      setCurrentSentenceIndex: (index) =>
        set(() => ({
          currentSentenceIndex: index,
        })),
      updateConfig: (config) =>
        set((state) => ({
          config: {
            ...state.config,
            ...config
          }
        })),
      toggleTheme: () =>
        set((state) => ({
          config: {
            ...state.config,
            theme: state.config.theme === 'light' ? 'dark' : 'light'
          }
        })),
      updateAIServices: (services) =>
        set((state) => ({
          config: {
            ...state.config,
            aiServices: {
              ...state.config.aiServices,
              ...services
            }
          }
        }))
    }),
    {
      name: "lingua-pal-storage", // localStorage的key
    },
  ),
);
