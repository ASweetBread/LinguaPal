import { NextRequest, NextResponse } from "next/server";
import { SaveKeywordAnalysisService, SaveKeywordAnalysisRequest } from "./service";

// 保存关键字分析结果
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, userId, analysis } = body as SaveKeywordAnalysisRequest;

    // 验证请求参数
    if (!keyword || !userId || !analysis) {
      return NextResponse.json({ success: false, error: "关键字、用户ID和分析结果不能为空" }, { status: 400 });
    }

    // 调用服务层保存关键字分析结果
    const result = await SaveKeywordAnalysisService.saveKeywordAnalysis({
      keyword,
      userId,
      analysis,
    });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          data: result.data,
        },
        { status: 201 },
      );
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("API保存关键字分析结果失败:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "保存关键字分析结果失败" },
      { status: 500 },
    );
  }
}
