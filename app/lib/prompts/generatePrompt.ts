import { SYSTEM_PROMPT, TARGET_TEST_PROMPT, ANALYSIS_KEYWORD_PROMPT } from './generateDialoguePrompt';
import { VOCABULARY_PROMPT } from './vocabularyTestPrompt';
import { RESULT_ANALYZ_PROMPT } from './resultAnalyzPrompt';

/**
 * 生成对话提示词的函数
 * @param scene 用户输入的场景描述
 * @returns 完整的提示词字符串
 */
export const generateDialoguePrompt = (keyword: string, newWordsPercent: string, masteryLevel: number, currentLevel: string, vocabularyAbility: string, vocabulary?: string, userLanguage: string = '中文', coreRequirements: string, difficultyLevel: string, supplementFocus: string, vocabularyRange: string, sentenceStructureFocus: string): string => {
  return SYSTEM_PROMPT(keyword, newWordsPercent, masteryLevel, currentLevel, vocabularyAbility, vocabulary, userLanguage, coreRequirements, difficultyLevel, supplementFocus, vocabularyRange, sentenceStructureFocus, coreRequirements, difficultyLevel, supplementFocus, vocabularyRange, sentenceStructureFocus);
};

export const generateVocabularyPrompt = (additionalText: string): string => {
  if(!additionalText) {
    additionalText = '无';
  }
  return VOCABULARY_PROMPT(additionalText);
}

export const generateResultAnalyzPrompt = (data: string, scene: string): string => {
  return RESULT_ANALYZ_PROMPT(data, scene);
}

export const generateAnalysisKeywordPrompt = (keyword: string): string => {
  return ANALYSIS_KEYWORD_PROMPT(keyword);
}

export const generateTargetTestPrompt = (keyword: string, coreRequirements: string, difficultyLevel: string, supplementFocus: string, vocabularyRange: string, sentenceStructureFocus: string): string => {
  return TARGET_TEST_PROMPT(keyword, coreRequirements, difficultyLevel, supplementFocus, vocabularyRange, sentenceStructureFocus);
}