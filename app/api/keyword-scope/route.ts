import { NextResponse } from "next/server";
import { KeywordScopeService } from "./service";

// 定义请求参数接口
interface KeywordScopeRequest {
  userId: number;
  keywordName: string;
  alreadyTrainedScope: string;
  isFullTrained: boolean;
}

// 定义获取范围请求接口
interface GetKeywordScopesRequest {
  userId: number;
  keywordName: string;
}

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { userId, keywordName, alreadyTrainedScope, isFullTrained } = body as KeywordScopeRequest;

    if (!userId || !keywordName) {
      return NextResponse.json({ error: "用户ID和关键字名称不能为空" }, { status: 400 });
    }

    const result = await KeywordScopeService.handleKeywordScopes({
      userId,
      keywordName,
      alreadyTrainedScope,
      isFullTrained,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("处理关键字范围时出错:", error);
    return NextResponse.json({ error: "处理关键字范围失败，请稍后重试" }, { status: 500 });
  }
};

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const userId = parseInt(url.searchParams.get("userId") || "");
    const keywordName = url.searchParams.get("keywordName") || "";

    if (!userId || !keywordName) {
      return NextResponse.json({ error: "用户ID和关键字名称不能为空" }, { status: 400 });
    }

    const result = await KeywordScopeService.getKeywordScopes({
      userId,
      keywordName,
    });

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("获取关键字范围时出错:", error);
    return NextResponse.json({ error: "获取关键字范围失败，请稍后重试" }, { status: 500 });
  }
};
