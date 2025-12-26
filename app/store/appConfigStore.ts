import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义应用基础配置模块的状态类型
export interface AppConfigState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  updateTheme: (theme: 'light' | 'dark') => void;
}

// 创建应用基础配置模块的store
export const useAppConfigStore = create<AppConfigState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        })),
      updateTheme: (theme) =>
        set(() => ({
          theme,
        })),
    }),
    {
      name: "lingua-pal-app-config-storage", // localStorage的key
    },
  ),
);
