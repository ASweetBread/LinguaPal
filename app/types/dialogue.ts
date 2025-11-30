// Shared types for dialogue feature (used by server and client)
export interface DialogueItem {
  // 角色标识，例如 'A' 或 'B'
  role: string
  // 英文文本
  text: string
  // 中文翻译文本
  text_cn: string
}

export interface GenerateDialogueResponse {
  dialogue: DialogueItem[]
}

// 说明：服务端应该返回一个符合 GenerateDialogueResponse 的 JSON 对象。
// 示例：
// {
//   "dialogue": [
//     { "role": "A", "text": "Hello.", "text_cn": "你好。" },
//     { "role": "B", "text": "Hi!", "text_cn": "嗨！" }
//   ]
// }
