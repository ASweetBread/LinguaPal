import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserInfoState {
  userId: string;
  username?: string;
  currentLevel: string;
  lastLoginAt?: Date | null;
  totalStudyMinutes?: number;
  vocabularyAbility: string;
  updateUserId: (id: string) => void;
  setUserId: (id: string) => void;
  setUserInfo: (info: {
    userId?: string;
    username?: string;
    currentLevel?: string;
    createdAt?: Date;
    lastLoginAt?: Date | null;
    totalStudyMinutes?: number;
    vocabularyAbility?: string;
  }) => void;
  clearUserInfo: () => void;
}

export const useUserInfoStore = create<UserInfoState>()(
  persist(
    (set) => ({
      userId: '',
      username: undefined,
      currentLevel: '',
      lastLoginAt: undefined,
      totalStudyMinutes: undefined,
      vocabularyAbility: '',
      updateUserId: (id) =>
        set(() => ({
          userId: id,
        })),
      setUserId: (id) =>
        set(() => ({
          userId: id,
        })),
      setUserInfo: (info) =>
        set((state) => ({
          ...state,
          ...info,
        })),
      clearUserInfo: () =>
        set(() => ({
          userId: '',
          username: undefined,
          currentLevel: undefined,
          lastLoginAt: undefined,
          totalStudyMinutes: undefined,
          vocabularyAbility: undefined,
        })),
    }),
    {
      name: "lingua-pal-user-info-storage",
    },
  ),
);
