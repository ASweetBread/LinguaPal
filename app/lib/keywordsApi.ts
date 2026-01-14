import clientFetch from './clientApi';

// 关键字相关的API客户端

// 删除关键字
export async function deleteKeyword(keywordId: string) {
  return clientFetch(`/api/keywords?id=${keywordId}`, {
    method: 'DELETE',
    name: 'delete-keyword',
  });
}
