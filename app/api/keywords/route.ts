import { NextRequest, NextResponse } from 'next/server';
import { KeywordsService } from './service';

// 获取用户的关键字列表
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

    // 调用服务层获取关键字列表
    const result = await KeywordsService.getKeywords(parseInt(userId));

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: result.keywords
    });
  } catch (error) {
    console.error('API获取用户关键字列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取用户关键字列表失败' },
      { status: 500 }
    );
  }
}