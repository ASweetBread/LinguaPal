import { PrismaClient } from '@prisma/client';
import { KeywordData } from '@/app/store/keyWordStore';

const prisma = new PrismaClient();

// 定义响应数据接口
export interface GetKeywordsResponse {
  keywords: KeywordData[];
}

export class KeywordsService {
  /**
   * 获取用户的关键字列表和关键字范围数据
   * @param userId 用户ID
   * @returns 关键字列表
   */
  static async getKeywords(userId: number): Promise<GetKeywordsResponse> {
    try {
      // 查询用户的所有关键字，包括关联的关键字范围
      const keywords = await prisma.keyword.findMany({
        where: {
          userId,
        },
        include: {
          keywordScopes: true,
        },
        orderBy: {
          id: 'desc',
        },
      });

      // 转换为客户端需要的数据格式
      const formattedKeywords: KeywordData[] = keywords.map((keyword) => {
        // 提取关键字范围
        const alreadyTrainedScope = keyword.keywordScopes
          ?.map((scope) => scope.scope)
          .filter(Boolean) || [];

        return {
          id: keyword.id.toString(),
          keyword: keyword.name,
          analysis: {
            coreRequirements: keyword.coreRequirements || '',
            difficultyLevel: keyword.difficultyLevel || '',
            supplements: keyword.supplements || '',
            vocabularyScope: keyword.vocabularyScope || '',
            keySentencePatterns: keyword.keySentencePatterns || '',
          },
          alreadyTrainedScope,
          alreadyTrainedScopeIndex: keyword.keywordScopesIndex || 0,
        };
      });

      return {
        keywords: formattedKeywords,
      };
    } catch (error) {
      console.error('获取用户关键字列表失败:', error);
      throw new Error('获取用户关键字列表失败');
    }
  }
}