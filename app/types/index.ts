// 定义单词类型
export interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  example: string;
  timestamp: number;
}

// 定义AI服务类型
export type AIService = {
  textAI: "zhipu" | "openai" | "claude";
  asrService: "zhipu" | "baidu" | "ali";
  ttsService: "browser" | "zhipu" | "baidu" | "ali";
};

// 定义配置类型
export interface AppConfig {
  mode: "normal" | "prompt";
  aiServices: AIService;
  theme: "light" | "dark";
  // 对话生成配置
  dialogueConfig: {
    newWordRatio: number; // 生词比例 (0-100)
    familiarWordLevel: number; // 熟词度 (1-5)
  };
}
