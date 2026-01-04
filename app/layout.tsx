'use client'
import type { Metadata } from 'next'
import './globals.css'
import { useEffect, useState } from 'react'
import { useAppConfigStore, useUserConfigStore, useUserInfoStore } from '@/app/store'
import { Toaster } from '@/components/ui/toaster'
import LoadingWrapper from '@/app/components/LoadingWrapper'
import { UserService } from '@/app/lib/userService'


const metadata: Metadata = {
  title: 'LinguaPal',
  description: 'AI语言学习助手',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { theme, isLoading, error, setIsLoading, setError, resetError } = useAppConfigStore();
  const { setUserInfo } = useUserConfigStore();
  const { userId, setUserId } = useUserInfoStore();
  
  // 根据主题状态更新html的dark类
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 预加载用户信息
  const preloadUserInfo = async () => {
    try {
      resetError();
      setIsLoading(true);
      
      // 从localStorage获取userId
      const storedConfig = localStorage.getItem('lingua-pal-user-info-storage');
      let storedUserId = userId;
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        storedUserId = parsedConfig.state.userId || '';
      }
      
      if (storedUserId) {
        // 获取用户信息
        const userData = await UserService.getUserInfo(parseInt(storedUserId));
        // 更新用户配置
        setUserInfo(UserService.mapUserToConfig(userData));
        // 更新用户信息
        const userInfo = UserService.mapUserInfo(userData);
        setUserId(userInfo.userId);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('预加载用户信息失败:', err);
      setError(err instanceof Error ? err.message : '获取用户信息失败');
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
    <html lang="zh-CN" className={theme === 'dark' ? 'dark' : ''}>
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
  )
}