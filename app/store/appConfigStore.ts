import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义应用基础配置模块的状态类型
export interface AppConfigState {
  theme: "light" | "dark";
  isLoading: boolean;
  error: string | null;
  toggleTheme: () => void;
  updateTheme: (theme: "light" | "dark") => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetError: () => void;
}

// 创建应用基础配置模块的store
export const useAppConfigStore = create<AppConfigState>()(
  persist(
    (set) => ({
      theme: "light",
      isLoading: false,
      error: null,
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      updateTheme: (theme) =>
        set(() => ({
          theme,
        })),
      setIsLoading: (isLoading) =>
        set(() => ({
          isLoading,
        })),
      setError: (error) =>
        set(() => ({
          error,
        })),
      resetError: () =>
        set(() => ({
          error: null,
        })),
    }),
    {
      name: "lingua-pal-app-config-storage", // localStorage的key
      // 不需要持久化isLoading和error状态
      partialize: (state) => ({
        theme: state.theme,
      }),
    },
  ),
);
