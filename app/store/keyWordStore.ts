import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义关键字分析结果类型
export interface KeywordAnalysisResult {
  coreRequirements: string;
  difficultyLevel: string;
  supplements: string;
  vocabularyScope: string;
  keySentencePatterns: string;
}

// 定义关键字数据类型
export interface KeywordData {
  id?: string;
  keyword: string;
  analysis: KeywordAnalysisResult;
  createdAt?: Date;
  updatedAt?: Date;
}

// 定义关键字store的状态类型
export interface KeywordState {
  currentKeyword: KeywordData;
  keywordList: KeywordData[];
  isAnalyzing: boolean;
  alreadyTrainedScope: string[]; // 本次训练核心诉求范围
  alreadyTrainedScopeIndex: number | undefined | null; // 已训练范围索引
  setCurrentKeyword: (keywordData: KeywordData) => void;
  addKeywordToList: (keywordData: KeywordData) => void;
  updateKeyword: (id: string, updates: Partial<KeywordData>) => void;
  deleteKeyword: (id: string) => void;
  clearKeywords: () => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAlreadyTrainedScope: (scope: string[]) => void;
  setAlreadyTrainedScopeIndex: (index: number | undefined | null) => void;
  updateTrainedScope: (scope: string[], index: number | undefined | null) => void;
}

// 创建关键字store
export const useKeywordStore = create<KeywordState>()(
  // persist(
  //   ,
  //   {
  //     name: "lingua-pal-keyword-storage", // localStorage的key
  //   },
  // ),
  (set) => ({
    currentKeyword: {
      keyword: '',
      analysis: {
        coreRequirements: '',
        difficultyLevel: '',
        supplements: '',
        vocabularyScope: '',
        keySentencePatterns: ''
      }
    },
    keywordList: [],
    isAnalyzing: false,
    alreadyTrainedScope: [], // 初始化本次训练核心诉求范围为空数组
    alreadyTrainedScopeIndex: 0, // 初始化已训练范围索引为0
    setCurrentKeyword: (keywordData) =>
      set(() => ({
        currentKeyword: keywordData,
      })),
    addKeywordToList: (keywordData) =>
      set((state) => ({
        keywordList: [keywordData, ...state.keywordList],
      })),
    updateKeyword: (id, updates) =>
      set((state) => ({
        keywordList: state.keywordList.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              ...updates,
            };
          }
          return item;
        }),
      })),
    deleteKeyword: (id) =>
      set((state) => ({
        keywordList: state.keywordList.filter((item) => item.id !== id),
      })),
    clearKeywords: () =>
      set(() => ({
        keywordList: [],
        currentKeyword: {
          keyword: '',
          analysis: {
            coreRequirements: '',
            difficultyLevel: '',
            supplements: '',
            vocabularyScope: '',
            keySentencePatterns: ''
          }
        },
        alreadyTrainedScope: [],
        alreadyTrainedScopeIndex: 0,
      })),
    setIsAnalyzing: (analyzing) =>
      set(() => ({
        isAnalyzing: analyzing,
      })),
    setAlreadyTrainedScope: (scope) =>
      set(() => ({
        alreadyTrainedScope: scope,
      })),
    setAlreadyTrainedScopeIndex: (index) =>
      set(() => ({
        alreadyTrainedScopeIndex: index,
      })),
    updateTrainedScope: (scope, index) =>
      set(() => ({
        alreadyTrainedScope: scope,
        alreadyTrainedScopeIndex: index,
      })),
  })
);
