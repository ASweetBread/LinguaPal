// 应用程序配置文件
// 存储应用程序中使用的常量和配置信息

// 学习模式常量
export const LEARNING_MODES = {
  NORMAL: 'normal',
  PROMPT: 'prompt'
} as const;

export type LearningMode = typeof LEARNING_MODES[keyof typeof LEARNING_MODES];
