import { SYSTEM_PROMPT } from './generateDialoguePrompt';
import { VOCABULARY_PROMPT } from './vocabularyTestPrompt';

/**
 * 生成对话提示词的函数
 * @param scene 用户输入的场景描述
 * @returns 完整的提示词字符串
 */
export const generateDialoguePrompt = (scene: string, newWordsPercent: string, masteryLevel: number, currentLevel: string, vocabularyAbility: string, vocabulary?: string): string => {
  return SYSTEM_PROMPT(scene, newWordsPercent, masteryLevel, currentLevel, vocabularyAbility, vocabulary);
};

export const generateVocabularyPrompt = (additionalText: string): string => {
  if(!additionalText) {
    additionalText = '无';
  }
  return VOCABULARY_PROMPT(additionalText);
}