import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 配置数据访问层
export class ConfigDAL {
  // 根据用户ID获取配置
  static async getConfigByUserId(userId: number) {
    return await prisma.config.findUnique({
      where: { userId },
      include: {
        user: true
      }
    });
  }

  // 根据ID获取配置
  static async getConfigById(id: number) {
    return await prisma.config.findUnique({
      where: { id },
      include: {
        user: true
      }
    });
  }

  // 创建配置
  static async createConfig(data: {
    userId: number;
    mode?: string;
    aiTextService?: string;
    aiAsrService?: string;
    aiTtsService?: string;
    dialogueNewWordRatio?: number;
    dialogueFamiliarWordLevel?: number;
  }) {
    return await prisma.config.create({
      data,
      include: {
        user: true
      }
    });
  }

  // 更新配置
  static async updateConfig(userId: number, data: {
    mode?: string;
    aiTextService?: string;
    aiAsrService?: string;
    aiTtsService?: string;
    dialogueNewWordRatio?: number;
    dialogueFamiliarWordLevel?: number;
  }) {
    return await prisma.config.update({
      where: { userId },
      data,
      include: {
        user: true
      }
    });
  }

  // 删除配置
  static async deleteConfig(userId: number) {
    return await prisma.config.delete({
      where: { userId },
      include: {
        user: true
      }
    });
  }

  // 检查配置是否存在
  static async checkConfigExists(userId: number) {
    return await prisma.config.findFirst({
      where: {
        userId
      }
    });
  }
}
