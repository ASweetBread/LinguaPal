import { ConfigDAL } from "./dal";

// 配置服务层
export class ConfigService {
  // 根据用户ID获取配置
  static async getConfigByUserId(userId: number) {
    try {
      const config = await ConfigDAL.getConfigByUserId(userId);
      if (!config) {
        throw new Error("配置不存在");
      }
      return config;
    } catch (error) {
      console.error("服务层获取配置失败:", error);
      throw error;
    }
  }

  // 根据ID获取配置
  static async getConfigById(id: number) {
    try {
      const config = await ConfigDAL.getConfigById(id);
      if (!config) {
        throw new Error("配置不存在");
      }
      return config;
    } catch (error) {
      console.error("服务层根据ID获取配置失败:", error);
      throw error;
    }
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
    try {
      // 验证必要字段
      if (!data.userId) {
        throw new Error("缺少必要参数");
      }

      // 检查配置是否已存在
      const existingConfig = await ConfigDAL.checkConfigExists(data.userId);
      if (existingConfig) {
        throw new Error("配置已存在");
      }

      // 创建新配置
      return await ConfigDAL.createConfig(data);
    } catch (error) {
      console.error("服务层创建配置失败:", error);
      throw error;
    }
  }

  // 更新配置
  static async updateConfig(
    userId: number,
    data: {
      mode?: string;
      aiTextService?: string;
      aiAsrService?: string;
      aiTtsService?: string;
      dialogueNewWordRatio?: number;
      dialogueFamiliarWordLevel?: number;
    },
  ) {
    try {
      // 检查配置是否存在
      const existingConfig = await ConfigDAL.getConfigByUserId(userId);
      if (!existingConfig) {
        throw new Error("配置不存在");
      }

      // 更新配置
      return await ConfigDAL.updateConfig(userId, data);
    } catch (error) {
      console.error("服务层更新配置失败:", error);
      throw error;
    }
  }

  // 删除配置
  static async deleteConfig(userId: number) {
    try {
      // 检查配置是否存在
      const existingConfig = await ConfigDAL.getConfigByUserId(userId);
      if (!existingConfig) {
        throw new Error("配置不存在");
      }

      // 删除配置
      return await ConfigDAL.deleteConfig(userId);
    } catch (error) {
      console.error("服务层删除配置失败:", error);
      throw error;
    }
  }
}
