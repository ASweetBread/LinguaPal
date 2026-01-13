'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogOverlay } from '@/components/ui/dialog';
import RecordingTester from './RecordingTester';
import { useAppConfigStore, useUserInfoStore } from '@/app/store';

/**
 * 导航栏组件，包含录音测试弹窗功能
 */
export default function NavBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme, toggleTheme } = useAppConfigStore();
  const { username } = useUserInfoStore();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                LinguaPal
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                AI语言学习助手
              </span>
            </div>
            
            <nav className="flex items-center gap-6">
              
              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="切换主题"
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                )}
              </button>
              
              {/* 录音测试按钮 */}
              <button
                onClick={openModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                测试弹窗
              </button> 
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                首页
              </Link>
              <Link 
                href="/vocabulary" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                词汇表
              </Link>
              <Link 
                href="/settings" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                个人配置
              </Link>
              
              {/* 用户名显示 */}
              {username && (
                <span className="ml-auto text-gray-700 dark:text-gray-200 font-medium">
                  {username}
                </span>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      {/* 录音测试弹窗 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>录音功能测试</DialogTitle>
          </DialogHeader>
          <RecordingTester onClose={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}