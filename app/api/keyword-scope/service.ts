import { KeywordScopeDAL } from './dal';
import { KeywordAnalysisDAL } from '../analyze-keyword/dal';

// KeywordScope服务层
export class KeywordScopeService {
  // 处理关键字范围的创建和存储
  static async handleKeywordScopes(params: {
    userId: number;
    keywordName: string;
    alreadyTrainedScope: string;
    isFullTrained: boolean;
  }) {
    const { userId, keywordName, alreadyTrainedScope, isFullTrained } = params;
    
    try {
      // 查找或创建关键字
      const keyword = await KeywordAnalysisDAL.findOrCreateKeyword({
        name: keywordName,
        userId
      });
      
      if (!keyword) {
        throw new Error('创建或查找关键字失败');
      }
      
      // 存储已训练范围
      if (alreadyTrainedScope) {
        await KeywordScopeDAL.createKeywordScope({
          keywordId: keyword.id,
          scope: alreadyTrainedScope
        });
      }
      
      // 如果isFullTrained为true，更新关键字的scope索引为0
      if (isFullTrained) {
        await KeywordScopeDAL.updateKeywordScopesIndex({
          keywordId: keyword.id,
          index: 0
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('处理关键字范围时出错:', error);
      return { success: false, error: '处理关键字范围失败' };
    }
  }
  
  // 获取关键字的所有训练范围
  static async getKeywordScopes(params: {
    userId: number;
    keywordName: string;
  }) {
    const { userId, keywordName } = params;
    
    try {
      // 查找关键字
      const keyword = await KeywordAnalysisDAL.findKeyword({
        name: keywordName,
        userId
      });
      
      if (!keyword) {
        return { success: false, error: '未找到关键字' };
      }
      
      // 获取关键字的所有范围
      const scopes = await KeywordScopeDAL.getKeywordScopes({
        keywordId: keyword.id
      });
      
      return { success: true, data: scopes };
    } catch (error) {
      console.error('获取关键字范围时出错:', error);
      return { success: false, error: '获取关键字范围失败' };
    }
  }
}
