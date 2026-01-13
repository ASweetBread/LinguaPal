import clientFetch from './clientApi';

// 关键字范围相关的API客户端
export interface KeywordScopeParams {
  userId: number;
  keywordName: string;
  alreadyTrainedScope: string;
  isFullTrained: boolean;
}

// 更新关键字范围
export async function updateKeywordScope(params: KeywordScopeParams) {
  return clientFetch('/api/keyword-scope', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    name: 'update-keyword-scope',
  });
}