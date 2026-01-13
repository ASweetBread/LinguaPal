import clientFetch from './clientApi';

// 练习结果相关的API客户端
export interface PracticeAnalysisParams {
  analysisData: string;
  scene: string;
}

// 分析练习结果
export async function analyzePracticeResult(params: PracticeAnalysisParams) {
  return clientFetch('/api/practice-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    name: 'analyze-practice-result',
  });
}