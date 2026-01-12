import { NextRequest, NextResponse } from 'next/server';
import { KeywordAnalysisService } from './service';

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

// 分析关键字
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, mode = 'normal', userId, aiService } = body as AnalyzeKeywordRequest;

    // 验证请求参数
    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '关键字不能为空' },
        { status: 400 }
      );
    }

    // 调用服务层进行关键字分析
    const result = await KeywordAnalysisService.analyzeKeyword({
      keyword,
      mode,
      userId,
      aiService
    });

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('API分析关键字失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '分析关键字失败' },
      { status: 500 }
    );
  }
}

// 获取关键字历史记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 验证请求参数
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    // 调用服务层获取关键字历史记录
    const result = await KeywordAnalysisService.getKeywords(parseInt(userId));

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('API获取关键字历史记录失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取关键字历史记录失败' },
      { status: 500 }
    );
  }
}
