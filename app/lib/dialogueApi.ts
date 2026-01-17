import clientFetch from "./clientApi";
import { UserConfigState } from "../store/userConfigStore";

// 关键字分析相关的接口
export interface KeywordAnalysisResult {
  coreRequirements: string;
  difficultyLevel: string;
  supplements: string;
  vocabularyScope: string;
  keySentencePatterns: string;
}

// 关键字相关的接口
export interface Keyword {
  keyword: string;
  analysis: KeywordAnalysisResult;
}

// 生成对话的请求参数
export interface GenerateDialogueParams {
  scene: string;
  mode: string;
  aiService: string;
  dialogueConfig: UserConfigState["dialogueConfig"];
  userId: string;
  currentLevel: string;
  vocabularyAbility: string;
  alreadyTrainedScope: string[];
  alreadyTrainedScopeIndex: number | undefined | null;
}

// 生成对话的响应
export interface GenerateDialogueResponse {
  success: boolean;
  data: {
    dialogue: any[];
    vocabulary: any[];
    rolename: string;
    alreadyTrainedScope?: string;
    isFullTrained?: boolean;
  };
}

// 分析关键字
export async function analyzeKeyword(params: { keyword: string; mode: string; userId: string; aiService: string }) {
  return clientFetch("/api/analyze-keyword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
    name: "analyze-keyword",
  });
}

// 存储关键字分析结果
export async function storeKeywordAnalysisResult(params: {
  keyword: string;
  analysis: KeywordAnalysisResult;
  userId: string;
}) {
  return clientFetch("/api/save-keyword-analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...params,
      userId: parseInt(params.userId),
    }),
    name: "store-keyword-analysis-result",
  });
}

// 生成对话
export async function generateDialogue(params: GenerateDialogueParams) {
  return clientFetch("/api/generate-dialogue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
    name: "generate-dialogue",
  });
}
