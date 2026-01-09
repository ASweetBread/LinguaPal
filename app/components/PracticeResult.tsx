"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useDialogueStore, useUserConfigStore } from '@/app/store'
import { RESULT_ANALYZ_PROMPT } from '../lib/prompts/resultAnalyzPrompt'
import PromptDisplay from './PromptDisplay'
import type { VocabularyItem as DialogueVocabularyItem } from '@/app/types/dialogue'

type DiffSegment = {
  type: string
  word?: string
  correct?: boolean
  userInput?: string
  value?: string
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
  const { currentScene } = useDialogueStore()
  const { mode } = useUserConfigStore()
  const [showPrompt, setShowPrompt] = useState(false)
  const [analysisPrompt, setAnalysisPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalTasks = reviewQueue.length
  const passedTasks = reviewQueue.filter(item => item.passed).length
  const failedTasks = totalTasks - passedTasks

  const incorrectWords = vocabulary.filter(v => (v.errorCount || 0) > 0)

  const handleComplete = async () => {
    const analysisData = reviewQueue.map(item => ({
      diff: item.diff.filter(seg => seg.type === 'word' && !seg.correct).map(seg => ({
        word: seg.word,
        correct: seg.correct,
        userInput: seg.userInput
      })),
      sentence: item.diff.map(seg => seg.word || seg.value).join(' '),
      userInput: item.diff.map(seg => seg.userInput || seg.value || '___').join(' ')
    }))
    if(!analysisData.find(item => item.diff.length > 0)){
      onExit()
      return
    }
    if (mode === 'prompt') {
      // 提示词模式：生成分析提示词并显示
      
      
      const prompt = RESULT_ANALYZ_PROMPT(JSON.stringify(analysisData), currentScene)
      setAnalysisPrompt(prompt)
      setShowPrompt(true)
    } else {
      setLoading(true)
      setError('')
      
      try {
        const response = await fetch('/api/practice-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            analysisData: JSON.stringify(analysisData),
            scene: currentScene
          })
        })
        
        if (!response.ok) {
          throw new Error('API调用失败')
        }
        
        const data = await response.json()
        console.log('Analysis result:', data)
        
        // 调用onExit并传递分析结果
        onExit()
        // 这里可以根据需求处理分析结果，比如保存到localStorage或者展示给用户
        // 由于需求中没有明确要求在正常模式下展示分析结果，所以直接退出
      } catch (err) {
        console.error('API调用错误:', err)
        setError('分析结果获取失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePromptSubmit = (result: string) => {
    // 处理分析结果的提交
    console.log('Analysis result submitted:', result)
    // 这里可以添加保存分析结果的逻辑
    // 提交后关闭提示词展示组件并退出
    setShowPrompt(false)
    onExit()
  }

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
            <Button onClick={handleComplete} variant="secondary" className="flex-1">
              完成
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
              {
                /**
                 * <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">提示：</span>
                {dialogue[item.promptIndex]?.text || 'N/A'}
              </div>
                 */
              }

              <div className="mb-2">
                <div className="text-sm font-medium mb-1">参考句（已标注差异）：</div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">
                  {item.diff.map((seg, idx) => {
                    if (seg.type === 'word' && seg.word) {
                      return (
                        <span
                          key={idx}
                          className={seg.correct ? '' : 'underline decoration-2 decoration-red-400 text-red-700 dark:text-red-400 font-medium'}
                        >
                          {seg.word}
                          {idx < item.diff.length - 1 && item.diff[idx + 1].type === 'word' ? ' ' : ''}
                        </span>
                      )
                    } else if (seg.type === 'punctuation' && seg.value) {
                      return (
                        <span key={idx} className="">
                          {seg.value}
                        </span>
                      )
                    }
                    return null
                  })}
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
        {showPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl mx-auto">
            <PromptDisplay
              prompt={analysisPrompt}
              onSubmit={handlePromptSubmit}
              onClose={() => setShowPrompt(false)}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-red-500 mb-4">{error}</div>
                <Button onClick={() => setError('')} className="w-full">
                  关闭
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">正在分析练习结果...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
