'use client';
import React, { ReactNode } from 'react';
import { useAppConfigStore } from '@/app/store';

interface LoadingWrapperProps {
  children: ReactNode;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  loadingText?: string;
  errorTitle?: string;
}

/**
 * 可复用的加载状态包装组件
 * 用于处理加载、错误和正常状态的显示
 */
export default function LoadingWrapper({
  children,
  isLoading,
  error,
  onRetry,
  loadingText = '加载中...',
  errorTitle = '加载失败'
}: LoadingWrapperProps) {
  const { theme } = useAppConfigStore();

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{loadingText}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">请稍候，正在为您准备...</p>
        </div>
      </div>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{errorTitle}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{error}</p>
          <button 
            onClick={onRetry} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 显示正常状态
  return <>{children}</>;
}
