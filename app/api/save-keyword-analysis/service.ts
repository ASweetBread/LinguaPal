import { KeywordAnalysisDAL } from '../analyze-keyword/dal';

// 定义请求参数接口
export interface SaveKeywordAnalysisRequest {
  keyword: string;
  userId: number;
  analysis: {
    coreRequirements: string;
    difficultyLevel: string;
    supplements: string;
    vocabularyScope: string;
    keySentencePatterns: string;
  };
}

// 定义响应数据接口
export interface SaveKeywordAnalysisResponse {
  success: boolean;
  data?: {
    id: string;
    keyword: string;
  };
  error?: string;
}

export class SaveKeywordAnalysisService {
  /**
   * 保存关键字分析结果
   * @param data 请求数据
   * @returns 保存结果
   */
  static async saveKeywordAnalysis(data: SaveKeywordAnalysisRequest): Promise<SaveKeywordAnalysisResponse> {
    const { keyword, userId, analysis } = data;

    if (!keyword || !userId || !analysis) {
      return {
        success: false,
        error: '关键字、用户ID和分析结果不能为空'
      };
    }

    try {
      const savedKeyword = await KeywordAnalysisDAL.saveAnalysis({
        keyword,
        analysis,
        userId
      });

      return {
        success: true,
        data: {
          id: savedKeyword.id?.toString() || '',
          keyword: savedKeyword.name
        }
      };
    } catch (error) {
      console.error('保存关键字分析结果失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存关键字分析结果失败'
      };
    }
  }
}