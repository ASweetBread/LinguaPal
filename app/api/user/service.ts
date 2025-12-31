import { UserDAL } from './dal';

// 用户服务层
export class UserService {
  // 获取用户列表
  static async getUsers(params: {
    page?: number;
    limit?: number;
  }) {
    try {
      return await UserDAL.getUsers(params);
    } catch (error) {
      console.error('服务层获取用户列表失败:', error);
      throw new Error('获取用户列表失败');
    }
  }

  // 根据ID获取单个用户
  static async getUserById(id: number) {
    try {
      const user = await UserDAL.getUserById(id);
      if (!user) {
        throw new Error('用户不存在');
      }
      return user;
    } catch (error) {
      console.error('服务层获取用户失败:', error);
      throw error;
    }
  }

  // 根据用户名获取用户
  static async getUserByUsername(username: string) {
    try {
      const user = await UserDAL.getUserByUsername(username);
      if (!user) {
        throw new Error('用户不存在');
      }
      return user;
    } catch (error) {
      console.error('服务层根据用户名获取用户失败:', error);
      throw error;
    }
  }

  // 创建新用户
  static async createUser(data: {
    username: string;
    password: string;
    currentLevel?: string;
    dailyGoal?: number;
    vocabularyAbility?: string;
  }) {
    try {
      // 验证必要字段
      if (!data.username || !data.password) {
        throw new Error('缺少必要参数');
      }

      // 检查用户名是否已存在
      const existingUser = await UserDAL.checkUsernameExists(data.username);
      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 创建新用户
      return await UserDAL.createUser(data);
    } catch (error) {
      console.error('服务层创建用户失败:', error);
      throw error;
    }
  }

  // 更新用户
  static async updateUser(id: number, data: {
    username?: string;
    password?: string;
    currentLevel?: string;
    dailyGoal?: number;
    vocabularyAbility?: string;
    totalStudyMinutes?: number;
  }) {
    try {
      // 检查用户是否存在
      const existingUser = await UserDAL.getUserById(id);
      if (!existingUser) {
        throw new Error('用户不存在');
      }

      // 如果更新用户名，检查新用户名是否已存在
      if (data.username && data.username !== existingUser.username) {
        const existingUsername = await UserDAL.checkUsernameExists(data.username);
        if (existingUsername) {
          throw new Error('用户名已存在');
        }
      }

      // 更新用户
      return await UserDAL.updateUser(id, data);
    } catch (error) {
      console.error('服务层更新用户失败:', error);
      throw error;
    }
  }

  // 删除用户
  static async deleteUser(id: number) {
    try {
      // 检查用户是否存在
      const existingUser = await UserDAL.getUserById(id);
      if (!existingUser) {
        throw new Error('用户不存在');
      }

      // 删除用户
      return await UserDAL.deleteUser(id);
    } catch (error) {
      console.error('服务层删除用户失败:', error);
      throw error;
    }
  }
}
