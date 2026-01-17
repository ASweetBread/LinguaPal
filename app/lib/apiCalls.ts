import clientFetch from "./clientApi";

// 生成对话的API封装
export async function generateDialogue(
  scene: string,
  mode: "normal" | "prompt" = "normal",
  aiService?: string,
  dialogueConfig?: { newWordRatio: number; familiarWordLevel: number },
  userId?: string,
  currentLevel?: string,
  vocabularyAbility?: string,
  alreadyTrainedScope?: string[],
  alreadyTrainedScopeIndex?: number | undefined | null,
) {
  return clientFetch("/api/generate-dialogue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scene,
      mode,
      aiService,
      dialogueConfig,
      userId,
      currentLevel,
      vocabularyAbility,
      alreadyTrainedScope,
      alreadyTrainedScopeIndex,
    }),
    name: "generate-dialogue-client",
  });
}

// 语音识别的API封装
export async function recognizeSpeech(audioData: string) {
  return clientFetch("/api/speech-recognition", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audioData }),
    name: "speech-recognition-client",
  });
}

// 获取用户信息（通过ID）
export async function getUserById(id: number) {
  return clientFetch(`/api/user?id=${id}`, {
    method: "GET",
    name: "get-user-by-id-client",
  });
}

// 获取用户信息（通过用户名）
export async function getUserByUsername(username: string) {
  return clientFetch(`/api/user?username=${username}`, {
    method: "GET",
    name: "get-user-by-username-client",
  });
}

// 更新用户信息
export async function updateUser(
  id: number,
  data: {
    username?: string;
    password?: string;
    currentLevel?: string;
    dailyGoal?: number;
    vocabularyAbility?: string;
    totalStudyMinutes?: number;
  },
) {
  return clientFetch("/api/user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...data }),
    name: "update-user-client",
  });
}

// 获取配置信息（通过用户ID）
export async function getConfigByUserId(userId: number) {
  return clientFetch(`/api/config?user_id=${userId}`, {
    method: "GET",
    name: "get-config-by-user-id-client",
  });
}

// 更新配置信息
export async function updateConfig(
  userId: number,
  data: {
    mode?: string;
    aiTextService?: string;
    aiAsrService?: string;
    aiTtsService?: string;
    dialogueNewWordRatio?: number;
    dialogueFamiliarWordLevel?: number;
  },
) {
  return clientFetch("/api/config", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, ...data }),
    name: "update-config-client",
  });
}

// 获取用户关键字列表
export async function getKeywordsByUserId(userId: number) {
  return clientFetch(`/api/keywords?userId=${userId}`, {
    method: "GET",
    name: "get-keywords-by-user-id-client",
  });
}
