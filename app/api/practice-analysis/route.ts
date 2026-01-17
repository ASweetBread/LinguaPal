import { NextRequest, NextResponse } from "next/server";
import { RESULT_ANALYZ_PROMPT } from "@/app/lib/prompts/resultAnalyzPrompt";
import { apiRequest } from "../apiWrapper";
import { textAIServices } from "@/config/ai-services";

interface AnalysisRequest {
  analysisData: string;
  scene: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { analysisData, scene } = body;

    // 验证请求数据
    if (analysisData || !scene) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // 生成分析提示词
    const prompt = RESULT_ANALYZ_PROMPT(analysisData, scene);

    // 获取选定的AI服务配置
    const aiService = "zhipu";
    const selectedService = textAIServices[aiService as keyof typeof textAIServices];

    if (!selectedService) {
      throw new Error(`不支持的AI服务: ${aiService}`);
    }

    // 准备发送给AI的消息内容
    const messages = [
      {
        role: "system",
        content: "你是一个专业的语言学习诊断专家，擅长分析学习者的语言错误并提供详细的改进建议。",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

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
            type: "json_object",
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
            type: "json_object",
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
          max_tokens: 2000,
          response_format: {
            type: "json_object",
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
      `${selectedService.name}-Analysis`, // API名称标识
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

    // 提取AI的分析结果
    const analysisResult = generatedContent;

    // 返回分析结果给前端
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("分析练习结果时出错:", error);
    return NextResponse.json({ error: "分析练习结果失败，请稍后重试" }, { status: 500 });
  }
}
