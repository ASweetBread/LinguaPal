import { NextRequest, NextResponse } from 'next/server';
import { ConfigService } from './service';

// 获取配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const id = searchParams.get('id');

    let result;
    if (userId) {
      // 根据用户ID获取配置
      result = await ConfigService.getConfigByUserId(parseInt(userId));
    } else if (id) {
      // 根据ID获取配置
      result = await ConfigService.getConfigById(parseInt(id));
    } else {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('API获取配置失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取配置失败' },
      { status: error instanceof Error && error.message === '配置不存在' ? 404 : 500 }
    );
  }
}

// 创建新配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mode, aiTextService, aiAsrService, aiTtsService, dialogueNewWordRatio, dialogueFamiliarWordLevel } = body;

    const newConfig = await ConfigService.createConfig({
      userId: parseInt(userId),
      mode,
      aiTextService,
      aiAsrService,
      aiTtsService,
      dialogueNewWordRatio,
      dialogueFamiliarWordLevel
    });

    return NextResponse.json({
      success: true,
      data: newConfig
    });
  } catch (error) {
    console.error('API创建配置失败:', error);
    const errorMessage = error instanceof Error ? error.message : '创建配置失败';
    const statusCode = errorMessage === '配置已存在' ? 409 : 
                       errorMessage === '缺少必要参数' ? 400 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// 更新配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mode, aiTextService, aiAsrService, aiTtsService, dialogueNewWordRatio, dialogueFamiliarWordLevel } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const updatedConfig = await ConfigService.updateConfig(parseInt(userId), {
      mode,
      aiTextService,
      aiAsrService,
      aiTtsService,
      dialogueNewWordRatio,
      dialogueFamiliarWordLevel
    });

    return NextResponse.json({
      success: true,
      data: updatedConfig
    });
  } catch (error) {
    console.error('API更新配置失败:', error);
    const errorMessage = error instanceof Error ? error.message : '更新配置失败';
    const statusCode = errorMessage === '配置不存在' ? 404 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// 删除配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    await ConfigService.deleteConfig(parseInt(userId));

    return NextResponse.json({
      success: true,
      message: '配置删除成功'
    });
  } catch (error) {
    console.error('API删除配置失败:', error);
    const errorMessage = error instanceof Error ? error.message : '删除配置失败';
    const statusCode = errorMessage === '配置不存在' ? 404 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
