import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 用户数据访问层
export class UserDAL {
  // 获取用户列表
  static async getUsers(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    // 获取用户总数
    const total = await prisma.user.count();

    // 获取用户列表
    const users = await prisma.user.findMany({
      include: {
        config: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 根据ID获取单个用户
  static async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        config: true,
      },
    });
  }

  // 根据用户名获取用户
  static async getUserByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username },
      include: {
        config: true,
      },
    });
  }

  // 创建新用户
  static async createUser(data: {
    username: string;
    password: string;
    currentLevel?: string;
    dailyGoal?: number;
    vocabularyAbility?: string;
  }) {
    return await prisma.user.create({
      data,
      include: {
        config: true,
      },
    });
  }

  // 更新用户
  static async updateUser(
    id: number,
    data: {
      username?: string;
      password?: string;
      currentLevel?: string;
      dailyGoal?: number;
      vocabularyAbility?: string;
      totalStudyMinutes?: number;
      finalScore?: string;
    },
  ) {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        config: true,
      },
    });
  }

  // 删除用户
  static async deleteUser(id: number) {
    return await prisma.user.delete({
      where: { id },
      include: {
        config: true,
      },
    });
  }

  // 检查用户名是否已存在
  static async checkUsernameExists(username: string) {
    return await prisma.user.findFirst({
      where: {
        username,
      },
    });
  }
}
