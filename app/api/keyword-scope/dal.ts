import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// KeywordScope数据访问层
export class KeywordScopeDAL {
  // 创建新的关键字范围
  static async createKeywordScope(params: {
    keywordId: number;
    scope: string;
  }) {
    const { keywordId, scope } = params;
    
    return prisma.keywordScope.create({
      data: {
        keywordId,
        scope
      }
    });
  }
  
  // 批量创建关键字范围
  static async createKeywordScopes(params: {
    keywordId: number;
    scopes: string[];
  }) {
    const { keywordId, scopes } = params;
    
    return prisma.keywordScope.createMany({
      data: scopes.map(scope => ({
        keywordId,
        scope
      }))
    });
  }
  
  // 获取关键字的所有范围
  static async getKeywordScopes(params: {
    keywordId: number;
  }) {
    const { keywordId } = params;
    
    return prisma.keywordScope.findMany({
      where: {
        keywordId
      },
      orderBy: {
        id: 'asc' // 使用id代替createdAt排序
      }
    });
  }
  
  // 更新关键字的范围索引
  static async updateKeywordScopesIndex(params: {
    keywordId: number;
    index: number;
  }) {
    const { keywordId, index } = params;
    
    return prisma.keyword.update({
      where: {
        id: keywordId
      },
      data: {
        keywordScopesIndex: index
      }
    });
  }
  
  // 获取关键字的范围索引
  static async getKeywordScopesIndex(params: {
    keywordId: number;
  }) {
    const { keywordId } = params;
    
    const keyword = await prisma.keyword.findUnique({
      where: {
        id: keywordId
      },
      select: {
        keywordScopesIndex: true
      }
    });
    
    return keyword?.keywordScopesIndex;
  }
}
