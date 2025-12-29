import { VocabularyDAL } from './dal';

// 单词服务层
export class VocabularyService {
  // 获取单词列表
  static async getWords(params: {
    userId?: number;
    search?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      return await VocabularyDAL.getWords(params);
    } catch (error) {
      console.error('服务层获取单词列表失败:', error);
      throw new Error('获取单词列表失败');
    }
  }

  // 根据ID获取单个单词
  static async getWordById(id: number) {
    try {
      const word = await VocabularyDAL.getWordById(id);
      if (!word) {
        throw new Error('单词不存在');
      }
      return word;
    } catch (error) {
      console.error('服务层获取单词失败:', error);
      throw error;
    }
  }

  // 添加新单词
  static async createWord(data: {
    word: string;
    phonetic?: string;
    meanings: string;
    partOfSpeech?: string;
    difficultyLevel?: string;
    userId: number;
  }) {
    try {
      // 验证必要字段
      if (!data.word || !data.meanings || !data.userId) {
        throw new Error('缺少必要参数');
      }

      // 检查单词是否已存在
      const existingWord = await VocabularyDAL.checkWordExists(data.word, data.userId);
      if (existingWord) {
        throw new Error('单词已存在');
      }

      // 创建新单词
      return await VocabularyDAL.createWord(data);
    } catch (error) {
      console.error('服务层创建单词失败:', error);
      throw error;
    }
  }

  // 更新单词
  static async updateWord(id: number, data: {
    word?: string;
    phonetic?: string;
    meanings?: string;
    partOfSpeech?: string;
    difficultyLevel?: string;
  }) {
    try {
      // 检查单词是否存在
      const existingWord = await VocabularyDAL.getWordById(id);
      if (!existingWord) {
        throw new Error('单词不存在');
      }

      // 更新单词
      return await VocabularyDAL.updateWord(id, data);
    } catch (error) {
      console.error('服务层更新单词失败:', error);
      throw error;
    }
  }

  // 删除单词
  static async deleteWord(id: number) {
    try {
      // 检查单词是否存在
      const existingWord = await VocabularyDAL.getWordById(id);
      if (!existingWord) {
        throw new Error('单词不存在');
      }

      // 删除单词
      return await VocabularyDAL.deleteWord(id);
    } catch (error) {
      console.error('服务层删除单词失败:', error);
      throw error;
    }
  }

  // 获取用户单词统计信息
  static async getUserWordStats(userId: number) {
    try {
      return await VocabularyDAL.getUserWordStats(userId);
    } catch (error) {
      console.error('服务层获取用户单词统计失败:', error);
      throw new Error('获取用户单词统计失败');
    }
  }

  // 获取用户的所有难度级别
  static async getDifficultyLevels(userId: number) {
    try {
      return await VocabularyDAL.getDifficultyLevels(userId);
    } catch (error) {
      console.error('服务层获取难度级别失败:', error);
      throw new Error('获取难度级别失败');
    }
  }
}