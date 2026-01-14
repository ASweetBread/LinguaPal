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

// 删除关键字
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少关键字ID' },
        { status: 400 }
      );
    }

    await KeywordsService.deleteKeyword(parseInt(id));

    return NextResponse.json({
      success: true,
      message: '关键字删除成功'
    });
  } catch (error) {
    console.error('API删除关键字失败:', error);
    const errorMessage = error instanceof Error ? error.message : '删除关键字失败';
    const statusCode = errorMessage === '关键字不存在' ? 404 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
