import { getUserById, updateUser as updateUserApi } from './apiCalls';
import { UserConfigState } from '@/app/store/userConfigStore';

/**
 * 用户服务类，封装用户信息相关的API调用
 */
export class UserService {
  /**
   * 根据用户ID获取用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  static async getUserInfo(userId: number) {
    try {
      const response = await getUserById(userId);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param data 用户信息
   * @returns 更新后的用户信息
   */
  static async updateUser(
    id: number, 
    data: {
      username?: string;
      password?: string;
      currentLevel?: string;
      dailyGoal?: number;
      vocabularyAbility?: string;
      totalStudyMinutes?: number;
    }
  ) {
    try {
      const response = await updateUserApi(id, data);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || '更新用户信息失败');
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 将API返回的用户信息转换为用户配置格式
   * @param userData API返回的用户信息
   * @returns 用户配置对象
   */
  static mapUserToConfig(userData: any): Partial<UserConfigState> {
    return {
      currentLevel: userData.currentLevel || 'A1',
      vocabularyAbility: userData.vocabularyAbility || '初级学习者'
    };
  }

  /**
   * 将API返回的用户信息转换为用户信息格式
   * @param userData API返回的用户信息
   * @returns 用户信息对象
   */
  static mapUserInfo(userData: any) {
    return {
      userId: userData.id?.toString() || '',
      username: userData.username,
      currentLevel: userData.currentLevel,
      lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined,
      totalStudyMinutes: userData.totalStudyMinutes,
      vocabularyAbility: userData.vocabularyAbility
    };
  }
}
