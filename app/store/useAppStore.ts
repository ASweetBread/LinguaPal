// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import type { AppState } from './types';

// // 创建store，使用persist中间件保存到localStorage
// export const useAppStore = create<AppState>()(
//   persist(
//     (set) => ({
//       vocabulary: [],
//       currentScene: "",
//       dialogue: [],
//       isLoading: false,
//       currentSentenceIndex: -1,
//       config: {
//         mode: 'normal',
//         aiServices: {
//           textAI: 'zhipu',
//           asrService: 'zhipu',
//           ttsService: 'browser'
//         },
//         theme: 'light'
//       },
//       addToVocabulary: (word) =>
//         set((state) => ({
//           vocabulary: [...state.vocabulary, word],
//         })),
//       removeFromVocabulary: (id) =>
//         set((state) => ({
//           vocabulary: state.vocabulary.filter((word) => word.id !== id),
//         })),
//       setCurrentScene: (scene) =>
//         set(() => ({
//           currentScene: scene,
//         })),
//       setDialogue: (dialogue) =>
//         set(() => ({
//           dialogue,
//         })),
//       setIsLoading: (loading) =>
//         set(() => ({
//           isLoading: loading,
//         })),
//       setCurrentSentenceIndex: (index) =>
//         set(() => ({
//           currentSentenceIndex: index,
//         })),
//       updateConfig: (config) =>
//         set((state) => ({
//           config: {
//             ...state.config,
//             ...config
//           }
//         })),
//       toggleTheme: () =>
//         set((state) => ({
//           config: {
//             ...state.config,
//             theme: state.config.theme === 'light' ? 'dark' : 'light'
//           }
//         })),
//       updateAIServices: (services) =>
//         set((state) => ({
//           config: {
//             ...state.config,
//             aiServices: {
//               ...state.config.aiServices,
//               ...services
//             }
//           }
//         }))
//     }),
//     {
//       name: "lingua-pal-storage", // localStorage的key
//     },
//   ),
// );
