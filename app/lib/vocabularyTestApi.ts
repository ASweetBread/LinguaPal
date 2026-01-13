import clientFetch from './clientApi';

// 词汇测试相关的API客户端
export interface VocabularyTestParams {
  mode: string;
  aiService: string;
  userInput?: string;
}

// 词汇测试结果响应
export interface VocabularyTestResponse {
  success: boolean;
  data: {
    test?: string;
    feedback?: string;
  };
}

// 词汇测试结果更新参数
export interface VocabularyTestResultParams {
  userId: number;
  finalScore: string;
  currentLevel: string;
  vocabularyAbility: string;
}

// 生成词汇测试
export async function generateVocabularyTest(params: VocabularyTestParams) {
  return clientFetch('/api/vocabulary-test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    name: 'generate-vocabulary-test',
  });
}

// 提交词汇测试结果
export async function submitVocabularyTest(params: VocabularyTestParams) {
  return clientFetch('/api/vocabulary-test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    name: 'submit-vocabulary-test',
  });
}

// 更新用户词汇测试结果
export async function updateVocabularyTestResult(params: VocabularyTestResultParams) {
  return clientFetch('/api/vocabulary-test-result', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    name: 'update-vocabulary-test-result',
  });
}