import { SYSTEM_PROMPT, TARGET_TEST_PROMPT, ANALYSIS_KEYWORD_PROMPT } from './generateDialoguePrompt';
import { VOCABULARY_PROMPT } from './vocabularyTestPrompt';
import { RESULT_ANALYZ_PROMPT } from './resultAnalyzPrompt';

/**
 * 生成对话提示词的函数
 * @param keyword 用户输入的学习目标/关键字
 * @param newWordsPercent 新单词比例 (0-100)
 * @param masteryLevel 熟练度等级
 * @param currentLevel 用户当前词汇水平
 * @param vocabularyAbility 用户能力描述
 * @param vocabulary 用户单词本数据 (JSON字符串)
 * @param userLanguage 用户使用的语言 (默认: '中文')
 * @param keywordAnalysis 关键字分析结果 (可选，包含核心诉求、难度等级等信息)
 * @param alreadyTrainedScopes 已训练的核心诉求范围 (JSON字符串)
 * @param alreadyTrainedScopeIndex 已训练范围索引 (undefined或null时默认为0)
 * @returns 完整的提示词字符串
 */
export const generateDialoguePrompt = (
  keyword: string, 
  newWordsPercent: string, 
  masteryLevel: number, 
  currentLevel: string, 
  vocabularyAbility: string, 
  vocabulary: string, 
  userLanguage: string = '中文', 
  keywordAnalysis: {
    coreRequirements: string;
    difficultyLevel: string;
    supplements: string;
    vocabularyScope: string;
    keySentencePatterns: string;
  },
  alreadyTrainedScopes: string = '[]', // 默认值为空数组的JSON字符串
  alreadyTrainedScopeIndex: number | undefined | null = undefined // 默认值为undefined
): string => {
  // 如果有keywordAnalysis，使用其中的参数覆盖传入的参数
  const finalCoreRequirements = keywordAnalysis?.coreRequirements;
  const finalDifficultyLevel = keywordAnalysis?.difficultyLevel;
  const finalSupplementFocus = keywordAnalysis?.supplements;
  const finalVocabularyRange = keywordAnalysis?.vocabularyScope;
  const finalSentenceStructureFocus = keywordAnalysis?.keySentencePatterns;

  // 处理alreadyTrainedScopeIndex，undefined和null的时候为0
  const finalAlreadyTrainedScopeIndex = alreadyTrainedScopeIndex ?? 0;

  return SYSTEM_PROMPT(
    keyword, 
    newWordsPercent, 
    masteryLevel, 
    currentLevel, 
    vocabularyAbility, 
    vocabulary, 
    userLanguage, 
    finalCoreRequirements, 
    finalDifficultyLevel, 
    finalSupplementFocus, 
    finalVocabularyRange, 
    finalSentenceStructureFocus,
    alreadyTrainedScopes,
    finalAlreadyTrainedScopeIndex
  );
};

/**
 * 生成词汇测试提示词的函数
 * @param additionalText 附加文本 (可提供额外测试要求)
 * @returns 完整的提示词字符串
 */
export const generateVocabularyPrompt = (additionalText: string): string => {
  if(!additionalText) {
    additionalText = '无';
  }
  return VOCABULARY_PROMPT(additionalText);
};

/**
 * 生成练习结果分析提示词的函数
 * @param data 练习数据 (JSON字符串)
 * @param scene 练习场景
 * @returns 完整的提示词字符串
 */
export const generateResultAnalyzPrompt = (data: string, scene: string): string => {
  return RESULT_ANALYZ_PROMPT(data, scene);
};

/**
 * 生成关键字分析提示词的函数
 * @param keyword 用户输入的学习目标/关键字
 * @returns 完整的提示词字符串
 */
export const generateAnalysisKeywordPrompt = (keyword: string): string => {
  return ANALYSIS_KEYWORD_PROMPT(keyword);
};

/**
 * 生成目标测试提示词的函数
 * @param keyword 用户输入的学习目标/关键字
 * @param coreRequirements 核心诉求
 * @param difficultyLevel 难度等级
 * @param supplementFocus 侧重补充
 * @param vocabularyRange 词汇范围
 * @param sentenceStructureFocus 句型重点
 * @returns 完整的提示词字符串
 */
export const generateTargetTestPrompt = (
  keyword: string, 
  coreRequirements: string, 
  difficultyLevel: string, 
  supplementFocus: string, 
  vocabularyRange: string, 
  sentenceStructureFocus: string
): string => {
  return TARGET_TEST_PROMPT(keyword, coreRequirements, difficultyLevel, supplementFocus, vocabularyRange, sentenceStructureFocus);
};