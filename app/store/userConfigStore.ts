import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIService } from '../types';
import { LEARNING_MODES, LearningMode } from '@/config/app';

// 定义个人配置模块的状态类型
export interface UserConfigState {
  mode: LearningMode;
  aiServices: AIService;
  updateMode: (mode: LearningMode) => void;
  updateAIServices: (services: Partial<AIService>) => void;
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
    }),
    {
      name: "lingua-pal-user-config-storage", // localStorage的key
    },
  ),
);
