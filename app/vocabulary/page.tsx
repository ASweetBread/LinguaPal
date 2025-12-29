'use client';
import Link from 'next/link'
import NavBar from '../components/NavBar';
import VocabularyTest from '../components/VocabularyTest';
import WordList from '../components/VocabularyList';
import { useState } from 'react';

// 定义底部状态栏组件
function BottomStatusBar() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
      <p>© 2024 LinguaPal AI语言学习助手 | 专注于提升您的口语能力</p>
    </footer>
  );
}

// 定义单词列表容器组件
function VocabularyList() {
  const [isTestOpen, setIsTestOpen] = useState(false);

  return (
    <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-120px)]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">我的单词本</h1>
          <button
            onClick={() => setIsTestOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            词汇测试
          </button>
        </div>
        <VocabularyTest isOpen={isTestOpen} onOpenChange={setIsTestOpen} />
        
        {/* 单词列表容器 */}
        <WordList />
      </div>
    </main>
  )
}

export default function VocabularyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <VocabularyList />
      <BottomStatusBar />
    </div>
  )
}