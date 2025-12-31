import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIService } from '../types';
import { LEARNING_MODES, LearningMode } from '@/config/app';

// 定义个人配置模块的状态类型
export interface UserConfigState {
  mode: LearningMode;
  aiServices: AIService;
  dialogueConfig: {
    newWordRatio: number;
    familiarWordLevel: number;
  };
  userId: string;
  currentLevel: string;
  vocabularyAbility: string;
  updateMode: (mode: LearningMode) => void;
  updateAIServices: (services: Partial<AIService>) => void;
  updateDialogueConfig: (config: Partial<{ newWordRatio: number; familiarWordLevel: number }>) => void;
  updateUserId: (id: string) => void;
  updateCurrentLevel: (level: string) => void;
  updateVocabularyAbility: (ability: string) => void;
  setUserInfo: (info: Partial<UserConfigState>) => void;
}



// 创建个人配置模块的store
export const useUserConfigStore = create<UserConfigState>()(
  persist(
    (set) => ({
      mode: LEARNING_MODES.NORMAL,
      aiServices: {
        textAI: 'zhipu',
        asrService: 'zhipu',
        ttsService: 'browser'
      },
      dialogueConfig: {
        newWordRatio: 30, // 默认生词比例30%
        familiarWordLevel: 3 // 默认熟词度3
      },
      userId: '',
      currentLevel: "A1", // 默认词汇水平A1
      vocabularyAbility: "初级学习者", // 默认能力描述
      updateMode: (mode) =>
        set(() => ({
          mode,
        })),
      updateAIServices: (services) =>
        set((state) => ({
          aiServices: {
            ...state.aiServices,
            ...services
          }
        })),
      updateDialogueConfig: (config) =>
        set((state) => ({
          dialogueConfig: {
            ...state.dialogueConfig,
            ...config
          }
        })),
      updateUserId: (id) =>
        set(() => ({
          userId: id,
        })),
      updateCurrentLevel: (level) =>
        set(() => ({
          currentLevel: level,
        })),
      updateVocabularyAbility: (ability) =>
        set(() => ({
          vocabularyAbility: ability,
        })),
      // 设置用户信息
      setUserInfo: (info) =>
        set((state) => ({
          ...state,
          ...info
        })),
    }),
    {
      name: "lingua-pal-user-config-storage", // localStorage的key
    },
  ),
);
