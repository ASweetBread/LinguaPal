import { KeywordAnalysisDAL } from './dal';
import { generateAnalysisKeywordPrompt } from '@/app/lib/prompts/generatePrompt';
import { apiRequest } from '../apiWrapper';
import { textAIServices } from '@/config/ai-services';

// 定义请求参数接口
interface AnalyzeKeywordRequest {
  keyword: string;
  mode?: 'normal' | 'prompt';
  userId?: number;
  aiService?: string;
}

// 定义响应数据接口
interface AnalyzeKeywordResponse {
  keyword: string;
  analysis: {
    coreRequirements: string;
    difficultyLevel: string;
    supplements: string;
    vocabularyScope: string;
    keySentencePatterns: string;
  };
  id?: string;
}

export class KeywordAnalysisService {
  /**
   * 分析关键字
   * @param data 请求数据
   * @returns 分析结果
   */
  static async analyzeKeyword(data: AnalyzeKeywordRequest): Promise<AnalyzeKeywordResponse> {
    const { keyword, mode = 'normal', userId, aiService = 'zhipu' } = data;

    if (!keyword) {
      throw new Error('关键字不能为空');
    }

    if (mode === 'prompt') {
      // 提示词模式：只返回提示词，不调用AI
      const prompt = generateAnalysisKeywordPrompt(keyword);
      return {
        keyword,
        analysis: {
          coreRequirements: '',
          difficultyLevel: '',
          supplements: '',
          vocabularyScope: '',
          keySentencePatterns: ''
        }
      };
    } else {
      // 正常模式：调用AI进行分析
      const selectedService = textAIServices[aiService as keyof typeof textAIServices];
      
      if (!selectedService) {
        throw new Error(`不支持的AI服务: ${aiService}`);
      }

      // 生成提示词
      const prompt = generateAnalysisKeywordPrompt(keyword);

      // 准备发送给AI的消息内容
      const messages = [
        {
          role: 'system',
          content: '你是一位专业的英语教育规划师，拥有丰富的英语教学和学习目标拆解经验。'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      // 获取API密钥和设置请求参数
      let apiKey: string | undefined;
      let requestBody: any;
      let requestHeaders: any = {
        'Content-Type': 'application/json'
      };

      switch (selectedService.provider) {
        case 'zhipu':
          apiKey = process.env.ZHIPUAI_API_KEY;
          if (!apiKey) {
            throw new Error('未配置ZhipuAI API密钥');
          }
          requestHeaders.Authorization = `Bearer ${apiKey}`;
          requestBody = {
            model: selectedService.model,
            messages: messages,
            temperature: 0.7,
            "thinking": {
              "type": "disabled"
            },
            "response_format": {
              "type": "json_object"
            },
            "stream": false,
          };
          break;
          
        case 'openai':
          apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            throw new Error('未配置OpenAI API密钥');
          }
          requestHeaders.Authorization = `Bearer ${apiKey}`;
          requestBody = {
            model: selectedService.model,
            messages: messages,
            temperature: 0.7,
            response_format: {
              type: "json_object"
            },
            stream: false,
          };
          break;
          
        case 'anthropic':
          apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            throw new Error('未配置Anthropic API密钥');
          }
          requestHeaders['x-api-key'] = apiKey;
          requestHeaders['anthropic-version'] = '2023-06-01';
          requestBody = {
            model: selectedService.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000,
            response_format: {
              type: "json_object"
            }
          };
          break;
          
        default:
          throw new Error(`不支持的AI服务提供商: ${selectedService.provider}`);
      }

      // 调用AI API
      const aiResponse = await apiRequest<any>(
        selectedService.apiUrl,
        {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestBody)
        },
        `${selectedService.name}-KeywordAnalysis`
      );

      // 解析响应
      let generatedContent: string;
      
      switch (selectedService.provider) {
        case 'zhipu':
        case 'openai':
          generatedContent = aiResponse.choices[0]?.message?.content;
          break;
          
        case 'anthropic':
          generatedContent = aiResponse.content?.[0]?.text;
          break;
          
        default:
          throw new Error(`不支持的AI服务提供商: ${selectedService.provider}`);
      }

      if (!generatedContent) {
        throw new Error('未从AI模型获取到有效的响应');
      }

      // 解析AI生成的分析结果
      const analysis = JSON.parse(generatedContent);

      // 构建分析结果
      const result: AnalyzeKeywordResponse = {
        keyword,
        analysis: {
          coreRequirements: analysis.coreRequirements || '',
          difficultyLevel: analysis.difficultyLevel || '',
          supplements: analysis.supplements || analysis.supplementFocus || '',
          vocabularyScope: analysis.vocabularyScope || analysis.vocabularyRange || '',
          keySentencePatterns: analysis.keySentencePatterns || analysis.sentenceStructureFocus || ''
        }
      };

      // 如果有用户ID，存储到数据库
      if (userId) {
        try {
          const savedKeyword = await KeywordAnalysisDAL.saveAnalysis({
            userId,
            keyword,
            analysis: result.analysis
          });
          result.id = savedKeyword.id?.toString() || '';
        } catch (error) {
          console.error('存储关键字分析结果失败:', error);
          // 存储失败不影响返回结果
        }
      }

      return result;
    }
  }

  /**
   * 获取用户的关键字列表
   * @param userId 用户ID
   * @returns 关键字列表
   */
  static async getKeywords(userId: number) {
    return KeywordAnalysisDAL.getHistory(userId);
  }

  /**
   * 保存关键字分析结果
   * @param data 关键字数据
   * @returns 保存结果
   */
  static async saveKeywordAnalysis(data: {
    userId: number;
    keyword: string;
    analysis: {
      coreRequirements: string;
      difficultyLevel: string;
      supplements: string;
      vocabularyScope: string;
      keySentencePatterns: string;
    };
  }) {
    return KeywordAnalysisDAL.saveAnalysis({
      userId: data.userId,
      keyword: data.keyword,
      analysis: data.analysis
    });
  }
}
