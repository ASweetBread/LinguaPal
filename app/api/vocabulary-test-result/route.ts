import { NextRequest, NextResponse } from "next/server";
import { UserService } from "../user/service";

// 处理用户词汇测试结果提交
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, finalScore, currentLevel, vocabularyAbility } = body;

    // 验证必要参数
    if (!userId || !finalScore || !currentLevel || !vocabularyAbility) {
      return NextResponse.json({ success: false, error: "缺少必要参数" }, { status: 400 });
    }

    // 更新用户信息
    const updatedUser = await UserService.updateUser(parseInt(userId), {
      currentLevel,
      vocabularyAbility,
      finalScore,
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("API处理词汇测试结果失败:", error);
    const errorMessage = error instanceof Error ? error.message : "处理词汇测试结果失败";
    const statusCode = errorMessage === "用户不存在" ? 404 : 500;

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}
