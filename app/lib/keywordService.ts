import { getKeywordsByUserId } from './apiCalls';
import { KeywordData } from '@/app/store/keyWordStore';

/**
 * 关键字服务类，封装关键字相关的API调用
 */
export class KeywordService {
  /**
   * 根据用户ID获取用户关键字列表
   * @param userId 用户ID
   * @returns 用户关键字列表
   */
  static async getKeywords(userId: number) {
    try {
      const response = await getKeywordsByUserId(userId);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || '获取用户关键字列表失败');
      }
    } catch (error) {
      console.error('获取用户关键字列表失败:', error);
      throw error;
    }
  }

  /**
   * 将API返回的关键字数据转换为客户端需要的格式
   * @param keywordsData API返回的关键字数据
   * @returns 转换后的关键字列表
   */
  static mapKeywords(keywordsData: any[]): KeywordData[] {
    return keywordsData.map((keyword) => ({
      id: keyword.id?.toString() || '',
      keyword: keyword.keyword,
      analysis: keyword.analysis || {
        coreRequirements: '',
        difficultyLevel: '',
        supplements: '',
        vocabularyScope: '',
        keySentencePatterns: ''
      },
      alreadyTrainedScope: keyword.alreadyTrainedScope || [],
      alreadyTrainedScopeIndex: keyword.alreadyTrainedScopeIndex || 0
    }));
  }
}