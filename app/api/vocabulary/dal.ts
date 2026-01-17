import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 单词数据访问层
export class VocabularyDAL {
  // 获取单词列表
  static async getWords(params: {
    userId?: number;
    search?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) {
    const { userId, search, difficulty, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { word: { contains: search, mode: "insensitive" } },
        { meanings: { contains: search, mode: "insensitive" } },
      ];
    }

    if (difficulty) {
      where.difficultyLevel = difficulty;
    }

    // 获取单词总数
    const total = await prisma.word.count({ where });

    // 获取单词列表
    const words = await prisma.word.findMany({
      where,
      include: {
        relations: {
          include: {
            phrase: true,
          },
        },
      },
      orderBy: {
        learnedAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    return {
      words,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 根据ID获取单个单词
  static async getWordById(id: number) {
    return await prisma.word.findUnique({
      where: { id },
      include: {
        relations: {
          include: {
            phrase: true,
          },
        },
      },
    });
  }

  // 检查单词是否已存在
  static async checkWordExists(word: string, userId: number) {
    return await prisma.word.findFirst({
      where: {
        word,
        userId,
      },
    });
  }

  // 创建新单词
  static async createWord(data: {
    word: string;
    phonetic?: string;
    meanings: string;
    partOfSpeech?: string;
    difficultyLevel?: string;
    userId: number;
  }) {
    return await prisma.word.create({
      data,
    });
  }

  // 更新单词
  static async updateWord(
    id: number,
    data: {
      word?: string;
      phonetic?: string;
      meanings?: string;
      partOfSpeech?: string;
      difficultyLevel?: string;
    },
  ) {
    return await prisma.word.update({
      where: { id },
      data,
    });
  }

  // 删除单词
  static async deleteWord(id: number) {
    return await prisma.word.delete({
      where: { id },
    });
  }

  // 获取用户的所有难度级别
  static async getDifficultyLevels(userId: number) {
    const result = await prisma.word.findMany({
      where: { userId },
      select: { difficultyLevel: true },
      distinct: ["difficultyLevel"],
    });

    return result
      .filter((item: { difficultyLevel: string | null }) => item.difficultyLevel)
      .map((item: { difficultyLevel: string | null }) => item.difficultyLevel);
  }

  // 获取用户单词统计信息
  static async getUserWordStats(userId: number) {
    const total = await prisma.word.count({
      where: { userId },
    });

    const byDifficulty = await prisma.word.groupBy({
      by: ["difficultyLevel"],
      where: { userId },
      _count: { difficultyLevel: true },
    });

    return {
      total,
      byDifficulty: byDifficulty.reduce(
        (
          acc: Record<string, number>,
          item: { difficultyLevel: string | null; _count: { difficultyLevel: number } },
        ) => {
          if (item.difficultyLevel) {
            acc[item.difficultyLevel] = item._count.difficultyLevel;
          }
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
