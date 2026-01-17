import { NextRequest, NextResponse } from "next/server";
import { UserService } from "./service";

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const id = searchParams.get("id");
    const username = searchParams.get("username");

    let result;
    if (id) {
      // 根据ID获取单个用户
      result = await UserService.getUserById(parseInt(id));
    } else if (username) {
      // 根据用户名获取单个用户
      result = await UserService.getUserByUsername(username);
    } else {
      // 获取用户列表
      result = await UserService.getUsers({ page, limit });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("API获取用户失败:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "获取用户失败" },
      { status: error instanceof Error && error.message === "用户不存在" ? 404 : 500 },
    );
  }
}

// 创建新用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, currentLevel, dailyGoal, vocabularyAbility } = body;

    const newUser = await UserService.createUser({
      username,
      password,
      currentLevel,
      dailyGoal,
      vocabularyAbility,
    });

    return NextResponse.json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    console.error("API创建用户失败:", error);
    const errorMessage = error instanceof Error ? error.message : "创建用户失败";
    const statusCode = errorMessage === "用户名已存在" ? 409 : errorMessage === "缺少必要参数" ? 400 : 500;

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}

// 更新用户
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, username, password, currentLevel, dailyGoal, vocabularyAbility, totalStudyMinutes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "缺少用户ID" }, { status: 400 });
    }

    const updatedUser = await UserService.updateUser(parseInt(id), {
      username,
      password,
      currentLevel,
      dailyGoal,
      vocabularyAbility,
      totalStudyMinutes,
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("API更新用户失败:", error);
    const errorMessage = error instanceof Error ? error.message : "更新用户失败";
    const statusCode = errorMessage === "用户不存在" ? 404 : errorMessage === "用户名已存在" ? 409 : 500;

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "缺少用户ID" }, { status: 400 });
    }

    await UserService.deleteUser(parseInt(id));

    return NextResponse.json({
      success: true,
      message: "用户删除成功",
    });
  } catch (error) {
    console.error("API删除用户失败:", error);
    const errorMessage = error instanceof Error ? error.message : "删除用户失败";
    const statusCode = errorMessage === "用户不存在" ? 404 : 500;

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}
