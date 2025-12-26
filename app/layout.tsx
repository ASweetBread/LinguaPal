'use client'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { useEffect } from 'react'
import { useAppConfigStore } from '@/app/store'
import { Toaster } from '@/components/ui/toaster'

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
  const { theme } = useAppConfigStore();
  
  // 根据主题状态更新html的dark类
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <html lang="zh-CN" className={theme === 'dark' ? 'dark' : ''}>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}