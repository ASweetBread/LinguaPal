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
  alreadyTrainedScope: string[]; // 本次训练核心诉求范围
  alreadyTrainedScopeIndex: number | undefined | null; // 已训练范围索引
}

// 定义关键字store的状态类型
export interface KeywordState {
  currentKeyword: KeywordData;
  keywordList: KeywordData[];
  isAnalyzing: boolean;
  setCurrentKeyword: (keywordData: KeywordData) => void;
  addKeywordToList: (keywordData: KeywordData) => void;
  updateKeyword: (id: string, updates: Partial<KeywordData>) => void;
  deleteKeyword: (id: string) => void;
  clearKeywords: () => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  updateKeywordTrainedScope: (keywordId: string, scope: string[], index: number | undefined | null) => void;
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
      id: '',
      keyword: '',
      analysis: {
        coreRequirements: '',
        difficultyLevel: '',
        supplements: '',
        vocabularyScope: '',
        keySentencePatterns: ''
      },
      alreadyTrainedScope: [], // 初始化本次训练核心诉求范围为空数组
      alreadyTrainedScopeIndex: undefined, // 初始化已训练范围索引为0
    },
    keywordList: [],
    isAnalyzing: false,
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
        // 如果更新的是当前关键字，同时更新currentKeyword
        currentKeyword: state.currentKeyword.id === id ? {
          ...state.currentKeyword,
          ...updates,
        } : state.currentKeyword,
      })),
    deleteKeyword: (id) =>
      set((state) => ({
        keywordList: state.keywordList.filter((item) => item.id !== id),
      })),
    clearKeywords: () =>
      set(() => ({
        keywordList: [],
        currentKeyword: {
          id: '',
          keyword: '',
          analysis: {
            coreRequirements: '',
            difficultyLevel: '',
            supplements: '',
            vocabularyScope: '',
            keySentencePatterns: ''
          },
          alreadyTrainedScope: [],
          alreadyTrainedScopeIndex: 0,
        },
      })),
    setIsAnalyzing: (analyzing) =>
      set(() => ({
        isAnalyzing: analyzing,
      })),
    updateKeywordTrainedScope: (keywordId, scope, index) =>
      set((state) => ({
        // 更新关键字列表中的对应关键字
        keywordList: state.keywordList.map((item) => {
          if (item.id === keywordId) {
            return {
              ...item,
              alreadyTrainedScope: scope,
              alreadyTrainedScopeIndex: index,
            };
          }
          return item;
        }),
        // 如果更新的是当前关键字，同时更新currentKeyword
        currentKeyword: state.currentKeyword.id === keywordId ? {
          ...state.currentKeyword,
          alreadyTrainedScope: scope,
          alreadyTrainedScopeIndex: index,
        } : state.currentKeyword,
      })),
  })
);
