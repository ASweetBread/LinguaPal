import clientFetch from './clientApi';

// 单词相关的API客户端
export interface Word {
  id: number;
  word: string;
  phonetic?: string;
  meanings: string;
  partOfSpeech?: string;
  difficultyLevel?: string;
  userId: number;
  learnedAt: string;
  relations?: {
    phrase: {
      id: number;
      phrase: string;
    }
  }[];
}

export interface VocabularyResponse {
  success: boolean;
  data: {
    words: Word[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface VocabularyParams {
  userId?: number;
  search?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}

// 获取单词列表
export async function getVocabulary(params: VocabularyParams) {
  const searchParams = new URLSearchParams();
  
  if (params.userId) searchParams.append('userId', params.userId.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.difficulty) searchParams.append('difficulty', params.difficulty);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  return clientFetch(`/api/vocabulary?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    name: 'get-vocabulary',
  });
}

// 添加新单词
export async function addWord(wordData: {
  word: string;
  phonetic?: string;
  meanings: string;
  partOfSpeech?: string;
  difficultyLevel?: string;
  userId: number;
}) {
  return clientFetch('/api/vocabulary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wordData),
    name: 'add-word',
  });
}

// 更新单词
export async function updateWord(wordData: {
  id: number;
  word?: string;
  phonetic?: string;
  meanings?: string;
  partOfSpeech?: string;
  difficultyLevel?: string;
}) {
  return clientFetch('/api/vocabulary', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wordData),
    name: 'update-word',
  });
}

// 删除单词
export async function deleteWord(id: number) {
  return clientFetch(`/api/vocabulary?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    name: 'delete-word',
  });
}