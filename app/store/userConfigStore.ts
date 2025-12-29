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
  updateMode: (mode: LearningMode) => void;
  updateAIServices: (services: Partial<AIService>) => void;
  updateDialogueConfig: (config: Partial<{ newWordRatio: number; familiarWordLevel: number }>) => void;
  updateUserId: (id: string) => void;
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
    }),
    {
      name: "lingua-pal-user-config-storage", // localStorage的key
    },
  ),
);
