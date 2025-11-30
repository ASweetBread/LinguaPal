'use client'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { useEffect } from 'react'
import { useAppStore } from './store'

const inter = Inter({ subsets: ['latin'] })

const metadata: Metadata = {
  title: 'LinguaPal',
  description: 'AI语言学习助手',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { config } = useAppStore();
  
  // 根据主题状态更新html的dark类
  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  return (
    <html lang="zh-CN" className={config.theme === 'dark' ? 'dark' : ''}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}