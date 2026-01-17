// AI服务配置文件
// 以模块化方式存储不同AI服务的配置信息，便于扩展

export interface AIServiceConfig {
  id: string;
  name: string;
  provider: string;
  apiUrl: string;
  model?: string;
  supportedFeatures: Array<"text" | "asr" | "tts">;
  default?: boolean;
}

export interface AIServiceGroup {
  [key: string]: AIServiceConfig;
}

// 文本AI服务配置
export const textAIServices: AIServiceGroup = {
  zhipu: {
    id: "zhipu",
    name: "智谱AI",
    provider: "zhipu",
    apiUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    model: "glm-4.6",
    supportedFeatures: ["text"],
    default: true,
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    provider: "openai",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
    supportedFeatures: ["text"],
    default: false,
  },
  claude: {
    id: "claude",
    name: "Claude",
    provider: "anthropic",
    apiUrl: "https://api.anthropic.com/v1/messages",
    model: "claude-3-sonnet-20240229",
    supportedFeatures: ["text"],
    default: false,
  },
};

// ASR服务配置
export const asrServices: AIServiceGroup = {
  zhipu: {
    id: "zhipu",
    name: "智谱ASR",
    provider: "zhipu",
    apiUrl: "https://api.openai.com/v1/audio/transcriptions",
    supportedFeatures: ["asr"],
    default: true,
  },
  baidu: {
    id: "baidu",
    name: "百度ASR",
    provider: "baidu",
    apiUrl: "https://vop.baidu.com/server_api",
    supportedFeatures: ["asr"],
    default: false,
  },
  ali: {
    id: "ali",
    name: "阿里云ASR",
    provider: "ali",
    apiUrl: "https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr",
    supportedFeatures: ["asr"],
    default: false,
  },
};

// TTS服务配置
export const ttsServices: AIServiceGroup = {
  browser: {
    id: "browser",
    name: "浏览器内置",
    provider: "browser",
    apiUrl: "",
    supportedFeatures: ["tts"],
    default: true,
  },
  zhipu: {
    id: "zhipu",
    name: "智谱TTS",
    provider: "zhipu",
    apiUrl: "https://api.openai.com/v1/audio/speech",
    supportedFeatures: ["tts"],
    default: false,
  },
  baidu: {
    id: "baidu",
    name: "百度TTS",
    provider: "baidu",
    apiUrl: "https://tsn.baidu.com/text2audio",
    supportedFeatures: ["tts"],
    default: false,
  },
  ali: {
    id: "ali",
    name: "阿里云TTS",
    provider: "ali",
    apiUrl: "https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts",
    supportedFeatures: ["tts"],
    default: false,
  },
};

// 导出所有服务配置
export const aiServiceConfigs = {
  textAI: textAIServices,
  asr: asrServices,
  tts: ttsServices,
};

// 获取默认服务配置
export const getDefaultService = (serviceType: "textAI" | "asr" | "tts"): string => {
  const services = serviceType === "textAI" ? textAIServices : serviceType === "asr" ? asrServices : ttsServices;

  for (const [key, service] of Object.entries(services)) {
    if (service.default) {
      return key;
    }
  }

  // 如果没有默认服务，返回第一个服务
  return Object.keys(services)[0] || "";
};
