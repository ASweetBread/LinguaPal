import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 关键字分析数据访问层
export class KeywordAnalysisDAL {
  // 保存关键字分析结果
  static async saveAnalysis(data: {
    keyword: string;
    analysis: {
      coreRequirements: string;
      difficultyLevel: string;
      supplements: string;
      vocabularyScope: string;
      keySentencePatterns: string;
    };
    userId?: number;
  }) {
    const { keyword, analysis, userId } = data;

    // 检查关键字是否已存在
    const existingKeyword = await prisma.keyword.findFirst({
      where: {
        name: keyword,
        userId: userId || undefined,
      },
    });

    if (existingKeyword) {
      // 更新现有关键字
      return prisma.keyword.update({
        where: {
          id: existingKeyword.id,
        },
        data: {
          coreRequirements: analysis.coreRequirements,
          difficultyLevel: analysis.difficultyLevel,
          supplements: analysis.supplements,
          vocabularyScope: analysis.vocabularyScope,
          keySentencePatterns: analysis.keySentencePatterns,
        },
      });
    } else {
      // 创建新关键字
      return prisma.keyword.create({
        data: {
          name: keyword,
          coreRequirements: analysis.coreRequirements,
          difficultyLevel: analysis.difficultyLevel,
          supplements: analysis.supplements,
          vocabularyScope: analysis.vocabularyScope,
          keySentencePatterns: analysis.keySentencePatterns,
          userId: userId as number, // userId是必填字段
        },
      });
    }
  }

  // 查找或创建关键字
  static async findOrCreateKeyword(params: { name: string; userId: number }) {
    const { name, userId } = params;

    // 查找关键字
    const existingKeyword = await prisma.keyword.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (existingKeyword) {
      return existingKeyword;
    } else {
      // 创建新关键字
      return prisma.keyword.create({
        data: {
          name,
          userId,
        },
      });
    }
  }

  // 根据名称查找关键字
  static async findKeyword(params: { name: string; userId?: number }) {
    const { name, userId } = params;

    return prisma.keyword.findFirst({
      where: {
        name,
        ...(userId !== undefined && { userId }),
      },
    });
  }

  // 获取用户的关键字分析历史
  static async getHistory(userId: number) {
    return prisma.keyword.findMany({
      where: {
        userId,
      },
      orderBy: {
        id: "desc", // 使用id代替createdAt排序
      },
    });
  }

  // 获取单个关键字分析结果
  static async getAnalysis(id: number) {
    return prisma.keyword.findUnique({
      where: {
        id,
      },
    });
  }
}
