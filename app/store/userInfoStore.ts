import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserInfoState {
  userId: string;
  updateUserId: (id: string) => void;
  setUserId: (id: string) => void;
}

export const useUserInfoStore = create<UserInfoState>()(
  persist(
    (set) => ({
      userId: '',
      updateUserId: (id) =>
        set(() => ({
          userId: id,
        })),
      setUserId: (id) =>
        set(() => ({
          userId: id,
        })),
    }),
    {
      name: "lingua-pal-user-info-storage",
    },
  ),
);
