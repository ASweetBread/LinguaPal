import { NextRequest, NextResponse } from "next/server";
import { VocabularyService } from "./service";

// 获取单词列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const difficulty = searchParams.get("difficulty");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await VocabularyService.getWords({
      userId: userId ? parseInt(userId) : undefined,
      search: search || undefined,
      difficulty: difficulty || undefined,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("API获取单词列表失败:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "获取单词列表失败" },
      { status: 500 },
    );
  }
}

// 添加新单词
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, phonetic, meanings, partOfSpeech, difficultyLevel, userId } = body;

    const newWord = await VocabularyService.createWord({
      word,
      phonetic,
      meanings,
      partOfSpeech,
      difficultyLevel,
      userId: parseInt(userId),
    });

    return NextResponse.json({
      success: true,
      data: newWord,
    });
  } catch (error) {
    console.error("API添加单词失败:", error);
    const errorMessage = error instanceof Error ? error.message : "添加单词失败";
    const statusCode = errorMessage === "单词已存在" ? 409 : errorMessage === "缺少必要参数" ? 400 : 500;

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}

// 更新单词
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, word, phonetic, meanings, partOfSpeech, difficultyLevel } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "缺少单词ID" }, { status: 400 });
    }

    const updatedWord = await VocabularyService.updateWord(parseInt(id), {
      word,
      phonetic,
      meanings,
      partOfSpeech,
      difficultyLevel,
    });

    return NextResponse.json({
      success: true,
      data: updatedWord,
    });
  } catch (error) {
    console.error("API更新单词失败:", error);
    const errorMessage = error instanceof Error ? error.message : "更新单词失败";
    const statusCode = errorMessage === "单词不存在" ? 404 : 500;

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}

// 删除单词
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "缺少单词ID" }, { status: 400 });
    }

    await VocabularyService.deleteWord(parseInt(id));

    return NextResponse.json({
      success: true,
      message: "单词删除成功",
    });
  } catch (error) {
    console.error("API删除单词失败:", error);
    const errorMessage = error instanceof Error ? error.message : "删除单词失败";
    const statusCode = errorMessage === "单词不存在" ? 404 : 500;

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}
