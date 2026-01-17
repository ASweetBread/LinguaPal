"use client";
import type { Metadata } from "next";
import "./globals.css";
import "./component.css";
import { useEffect, useState } from "react";
import { useAppConfigStore, useUserConfigStore, useUserInfoStore, useKeywordStore } from "@/app/store";
import { Toaster } from "@/components/ui/toaster";
import LoadingWrapper from "@/app/components/LoadingWrapper";
import { UserService } from "@/app/lib/userService";
import { KeywordService } from "@/app/lib/keywordService";

const metadata: Metadata = {
  title: "LinguaPal",
  description: "AI语言学习助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, isLoading, error, setIsLoading, setError, resetError } = useAppConfigStore();
  const { setUserConfig } = useUserConfigStore();
  const { userId, setUserId, setUserInfo } = useUserInfoStore();

  // 根据主题状态更新html的dark类
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // 预加载用户信息
  const preloadUserInfo = async () => {
    try {
      resetError();
      setIsLoading(true);

      let storedUserId = "1";
      if (storedUserId) {
        // 获取用户信息
        const userData = await UserService.getUserInfo(parseInt(storedUserId));
        // 更新用户配置
        // setUserConfig(UserService.mapUserToConfig(userData));
        // 更新用户信息
        const userInfo = UserService.mapUserInfo(userData);
        console.log("userInfo:", userInfo);
        // 存储所有用户信息到UserInfoStore
        setUserInfo(userInfo);

        // 获取用户关键字数据
        try {
          const keywordsData = await KeywordService.getKeywords(parseInt(storedUserId));
          const keywords = KeywordService.mapKeywords(keywordsData);

          if (Array.isArray(keywords)) {
            const { setCurrentKeyword, addKeywordToList, clearKeywords } = useKeywordStore.getState();
            // 清空现有关键字列表
            clearKeywords();
            // 添加新的关键字列表
            keywords.forEach((keyword) => {
              addKeywordToList(keyword);
            });
          }
        } catch (keywordErr) {
          console.error("获取用户关键字数据失败:", keywordErr);
          // 获取关键字数据失败不影响整体页面加载
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error("预加载用户信息失败:", err);
      setError(err instanceof Error ? err.message : "获取用户信息失败");
      setIsLoading(false);
    }
  };

  // 预加载用户信息
  useEffect(() => {
    preloadUserInfo();
  }, []);

  // 处理重试
  const handleRetry = () => {
    preloadUserInfo();
  };

  return (
    <html lang="zh-CN" className={(theme === "dark" ? "dark" : "") + " overflow-hidden"}>
      <body>
        <LoadingWrapper
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
          loadingText="加载用户信息中..."
          errorTitle="获取用户信息失败"
        >
          {children}
        </LoadingWrapper>
        <Toaster />
      </body>
    </html>
  );
}
