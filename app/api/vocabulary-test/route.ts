import { NextResponse } from "next/server";
import { apiRequest } from "../apiWrapper";
import { generateVocabularyPrompt } from "@/app/lib/prompts/generatePrompt";
import { textAIServices } from "@/config/ai-services";

// 定义请求参数接口
interface VocabularyTestRequest {
  mode?: "normal" | "prompt";
  aiService?: string; // AI服务标识
  userInput?: string; // 用户输入的测试结果
}

// 定义响应数据接口
interface VocabularyTestResponse {
  prompt?: string;
  test?: string;
  feedback?: string;
}

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { mode = "normal", aiService = "zhipu", userInput } = body as VocabularyTestRequest;

    // 根据模式返回不同的响应
    if (mode === "prompt") {
      // 提示词模式：返回提示词，不调用AI
      const fullPrompt = generateVocabularyPrompt("");

      return NextResponse.json<VocabularyTestResponse>({
        prompt: fullPrompt,
      });
    } else {
      // 正常模式：调用AI生成测试或反馈
      // 获取选定的AI服务配置
      const selectedService = textAIServices[aiService as keyof typeof textAIServices];

      if (!selectedService) {
        throw new Error(`不支持的AI服务: ${aiService}`);
      }

      // 准备发送给AI的消息内容
      const messages = [
        {
          role: "system",
          content: generateVocabularyPrompt(""),
        },
      ];

      // 如果有用户输入，添加到消息中
      if (userInput) {
        messages.push({
          role: "user",
          content: userInput,
        });
      }

      // 获取API密钥
      let apiKey: string | undefined;
      let requestBody: any;
      let requestHeaders: any = {
        "Content-Type": "application/json",
      };

      // 根据不同的AI服务设置不同的请求参数
      switch (selectedService.provider) {
        case "zhipu":
          apiKey = process.env.ZHIPUAI_API_KEY;
          if (!apiKey) {
            throw new Error("未配置ZhipuAI API密钥");
          }
          requestHeaders.Authorization = `Bearer ${apiKey}`;
          requestBody = {
            model: selectedService.model,
            messages: messages,
            temperature: 0.7,
            thinking: {
              type: "disabled",
            },
            response_format: {
              type: "text",
            },
            stream: false,
          };
          break;

        case "openai":
          apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            throw new Error("未配置OpenAI API密钥");
          }
          requestHeaders.Authorization = `Bearer ${apiKey}`;
          requestBody = {
            model: selectedService.model,
            messages: messages,
            temperature: 0.7,
            response_format: {
              type: "text",
            },
            stream: false,
          };
          break;

        case "anthropic":
          apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            throw new Error("未配置Anthropic API密钥");
          }
          requestHeaders["x-api-key"] = apiKey;
          requestHeaders["anthropic-version"] = "2023-06-01";
          requestBody = {
            model: selectedService.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 4000,
            response_format: {
              type: "text",
            },
          };
          break;

        default:
          throw new Error(`不支持的AI服务提供商: ${selectedService.provider}`);
      }

      // 使用apiRequest替换fetch调用
      const data = await apiRequest<any>(
        selectedService.apiUrl,
        {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
        },
        `${selectedService.name}-Vocabulary-Test`, // API名称标识
      );

      // 解析响应，不同AI服务的响应格式可能不同
      let generatedContent: string;

      switch (selectedService.provider) {
        case "zhipu":
        case "openai":
          generatedContent = data.choices[0]?.message?.content;
          break;

        case "anthropic":
          generatedContent = data.content?.[0]?.text;
          break;

        default:
          throw new Error(`不支持的AI服务提供商: ${selectedService.provider}`);
      }

      if (!generatedContent) {
        throw new Error("未从AI模型获取到有效的响应");
      }

      // 构建响应对象
      const responseData: VocabularyTestResponse = {
        // 根据是否有用户输入返回不同的字段
        ...(userInput ? { feedback: generatedContent } : { test: generatedContent }),
      };

      return NextResponse.json<VocabularyTestResponse>(responseData);
    }
  } catch (error) {
    console.error("生成词汇测试时出错:", error);
    return NextResponse.json({ error: "生成词汇测试失败，请稍后重试" }, { status: 500 });
  }
};
