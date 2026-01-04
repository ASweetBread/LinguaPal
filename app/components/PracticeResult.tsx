"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { VocabularyItem as DialogueVocabularyItem } from '@/app/types/dialogue'

type DiffSegment = {
  word: string
  correct: boolean
}

type ReviewItem = {
  promptIndex: number
  targetIndex: number
  diff: DiffSegment[]
  passed: boolean
  userInput: string
}

type VocabularyItem = {
  word: string
  meaning: string
  errorCount: number
}

interface PracticeResultProps {
  dialogue: Array<{ role: string; text: string; text_cn: string }>
  reviewQueue: ReviewItem[]
  vocabulary: DialogueVocabularyItem[]
  onRestart: () => void
  onExit: () => void
}

export default function PracticeResult({
  dialogue,
  reviewQueue,
  vocabulary,
  onRestart,
  onExit
}: PracticeResultProps) {
  const totalTasks = reviewQueue.length
  const passedTasks = reviewQueue.filter(item => item.passed).length
  const failedTasks = totalTasks - passedTasks

  const incorrectWords = vocabulary.filter(v => (v.errorCount || 0) > 0)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">练习结果</CardTitle>
          <CardDescription>
            总共 {totalTasks} 个任务，通过 {passedTasks} 个，失败 {failedTasks} 个
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">总任务数</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{passedTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">通过</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{failedTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">失败</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onRestart} className="flex-1">
              重新练习
            </Button>
            <Button onClick={onExit} variant="secondary" className="flex-1">
              退出练习
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">复习队列详情</CardTitle>
          <CardDescription>查看每个任务的练习情况和差异对比</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviewQueue.map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  任务 {index + 1}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.passed 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {item.passed ? '通过' : '失败'}
                </span>
              </div>

              <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">提示：</span>
                {dialogue[item.promptIndex]?.text || 'N/A'}
              </div>

              <div className="mb-2">
                <div className="text-sm font-medium mb-1">参考句（已标注差异）：</div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">
                  {item.diff.map((seg, idx) => (
                    <span
                      key={idx}
                      className={seg.correct ? '' : 'underline decoration-2 decoration-red-400 text-red-700 dark:text-red-400 font-medium'}
                    >
                      {seg.word}
                      {idx < item.diff.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </div>
              </div>

              {!item.passed && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">你的输入：</span>
                  {item.userInput || '(空)'}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {incorrectWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">答错单词</CardTitle>
            <CardDescription>本轮练习中答错的单词列表</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {incorrectWords.map((vocab, index) => (
                <div
                  key={index}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="font-medium text-red-700 dark:text-red-400">{vocab.word}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{vocab.meanings}</div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    错误次数: {vocab.errorCount || 0}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {vocabulary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">本轮学习的单词</CardTitle>
            <CardDescription>本轮对话中涉及的单词</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {vocabulary.map((vocab, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${
                    (vocab.errorCount || 0) > 0
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className={`font-medium ${
                    (vocab.errorCount || 0) > 0
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {vocab.word}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vocab.meanings}</div>
                  {(vocab.errorCount || 0) > 0 && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      错误次数: {vocab.errorCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
