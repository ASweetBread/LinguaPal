"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useDialogueStore } from '@/app/store/dialogueStore'
import {
  markDifferencesByWord,
  isInputCorrect,
  calculateSimilarity
} from '../lib/utils/stringCompare'
import PracticeResult from './PracticeResult'
import TypingInput from './TypingInput'

type Task = {
  promptIndex: number
  targetIndex: number
}

type diffType = Array<{ type: string; word?: string; correct?: boolean; userInput?: string; value?: string }>

type ReviewItem = {
  promptIndex: number
  targetIndex: number
  diff: diffType
  passed: boolean
  userInput: string
}

export default function PracticeFlow({ onFinish }: { onFinish?: () => void }) {
  const { dialogue, vocabulary, rolename, updateVocabularyErrorCount, setShowPractice } = useDialogueStore()

  const [tasks, setTasks] = useState<Task[]>([])
  const [current, setCurrent] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [lastResultCorrect, setLastResultCorrect] = useState<boolean | null>(null)
  const [lastDiff, setLastDiff] = useState<diffType>([])
  const [showPracticeResult, setShowPracticeResult] = useState(false)
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([])

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    console.log('Enter key pressed, showResult:', e.key)
    if(e.key !== 'Enter') return
    console.log('Enter key pressed, showResult:', showResult)
    e.preventDefault()
    showResult ? onNext() : onSubmit()
  }

  React.useEffect(() => {
    // 添加全局键盘事件监听器
    window.addEventListener('keydown', handleGlobalKeyDown)
    console.log('keydown event listener added')
    // 清理函数
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
      console.log('keydown event listener removed')
    }
  }, [showResult])

  const buildTasksForRole = (role: 'A' | 'B') => {
    const res: Task[] = []
    for (let i = 0; i < dialogue.length; i++) {
      if (dialogue[i].role === role) {
        let target = -1
        for (let j = i + 1; j < dialogue.length; j++) {
          if (dialogue[j].role !== role) {
            target = j
            break
          }
        }
        if (target !== -1) res.push({ promptIndex: i, targetIndex: target })
      }
    }
    return res
  }

  const buildAllTasks = () => {
    const tasksA = buildTasksForRole('A')
    const tasksB = buildTasksForRole('B')
    return [...tasksA, ...tasksB]
  }

  useEffect(() => {
    if (!dialogue || dialogue.length === 0) return
    const allTasks = buildAllTasks()
    setTasks(allTasks)
    setCurrent(0)
    setShowResult(false)
    setShowPracticeResult(false)
    setUserInput('')
    setLastResultCorrect(null)
    setReviewQueue([])
  }, [dialogue])

  const currentTask = tasks[current]
  
  // 从rolename中提取角色名称数组
  const rolenames = rolename.map(item => item.name).filter(name => name !== '')

  const onSubmit = () => {
    if (!currentTask) return
    const ref = dialogue[currentTask.targetIndex].text
    const input = userInput.replace(/,/g, ' ')

    const correct = isInputCorrect(ref, input)
    const similarity = calculateSimilarity(ref, input)
    const diff = markDifferencesByWord(ref, userInput, rolenames)

    setLastDiff(diff)
    setLastResultCorrect(correct)
    setShowResult(true)

    const reviewItem: ReviewItem = {
      promptIndex: currentTask.promptIndex,
      targetIndex: currentTask.targetIndex,
      diff,
      passed: correct,
      userInput: input
    }

    setReviewQueue(prev => [...prev, reviewItem])

    if (!correct) {
      setTasks(prev => {
        const isAlreadyInQueue = prev.some((t, idx) => idx > current && t.targetIndex === currentTask.targetIndex)
        if (isAlreadyInQueue) return prev
        
        const newTasks = [...prev]
        newTasks.push(currentTask)
        return newTasks
      })

      const incorrectWords = diff
        .filter(item => item.type === 'word' && !item.correct && item.word)
        .map(item => item.word!.trim())
        .filter(word => word.length > 0)
      
      incorrectWords.forEach(word => {
        const isInVocabulary = vocabulary.some(vocabItem => vocabItem.word === word)
        if (isInVocabulary) {
          updateVocabularyErrorCount(word)
        }
      })
    }

    console.log('提交结果', { correct, similarity })
  }

  const onNext = () => {
    setShowResult(false)
    setUserInput('')
    setLastResultCorrect(null)
    setLastDiff([])

    const nextIndex = current + 1
    if (nextIndex < tasks.length) {
      setCurrent(nextIndex)
      return
    }

    setShowPracticeResult(true)
  }

  const handleRestart = () => {
    setShowPracticeResult(false)
    setReviewQueue([])
    const allTasks = buildAllTasks()
    setTasks(allTasks)
    setCurrent(0)
    setShowResult(false)
    setUserInput('')
    setLastResultCorrect(null)
  }

  const handleExit = () => {
    setShowPractice(false)
  }

  if (showPracticeResult) {
    return (
      <PracticeResult
        dialogue={dialogue}
        reviewQueue={reviewQueue}
        vocabulary={vocabulary}
        onRestart={handleRestart}
        onExit={handleExit}
      />
    )
  }

  if (!dialogue || dialogue.length === 0) return null

  if (!currentTask) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
        <p className="text-sm text-gray-700 dark:text-gray-300">当前没有可练习的句子（可能对话结构不完整）。</p>
      </div>
    )
  }

  const promptText = dialogue[currentTask.promptIndex].text
  const targetText = dialogue[currentTask.targetIndex].text
  const targetChinese = dialogue[currentTask.targetIndex].text_cn
  const isLastTask = current === tasks.length - 1

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">练习：请填写另一方的回复</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">进度：{current + 1}/{tasks.length}</span>
          <button
            onClick={() => {
              setShowPractice(false)
            }}
            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300"
          >退出</button>
        </div>
      </div>

      <div className="p-4 mb-4 bg-white dark:bg-gray-800 rounded shadow-sm">
        <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">提示：</div>
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-100 dark:text-gray-800 rounded border">{promptText}</div>

        <label className="block text-sm font-medium mb-2">请填写另一方的原句（英文）</label>
        <TypingInput
          targetText={targetText}
          value={userInput}
          onChange={setUserInput}
          disabled={showResult}
          className="mb-3"
        />

        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">参考中文：</div>
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border mb-3">{targetChinese}</div>

        {!showResult && (
          <div className="flex gap-2">
            <button
              onClick={onSubmit}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >提交</button>
            <button
              onClick={() => {
                setShowResult(true)
                setLastResultCorrect(null)
                setLastDiff(markDifferencesByWord(targetText, userInput, rolenames))
              }}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
            >显示答案</button>
          </div>
        )}

        {showResult && (
          <div className="mt-4">
            <div className={`p-3 rounded ${lastResultCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className="text-sm font-medium mb-2">原句（已标注差异）：</div>
              <div className="text-gray-800 dark:text-gray-200">
                {lastDiff.map((seg, idx) => {
                  if (seg.type === 'word' && seg.word) {
                    return (
                      <span
                        key={idx}
                        className={seg.correct ? 'px-0' : 'underline decoration-2 decoration-red-400 text-red-700 dark:text-red-400'}
                      >
                        {seg.word}
                        {idx < lastDiff.length - 1 && lastDiff[idx + 1].type === 'word' ? ' ' : ''}
                      </span>
                    )
                  } else if (seg.type === 'punctuation' && seg.value) {
                    return (
                      <span key={idx} className="px-0">
                        {seg.value}
                      </span>
                    )
                  }
                  return null
                })}
              </div>
            </div>

            {/* {!lastResultCorrect && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">你的输入：</span>
                { lastDiff.map(seg => seg.userInput || seg.value).join(' ') || <em className="text-gray-400">（空）</em>}
              </div>
            )} */}

            <div className="mt-3 flex gap-2">
              <button 
                onClick={onNext} 
                className={`px-3 py-1 rounded ${
                  isLastTask && lastResultCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isLastTask && lastResultCorrect ? '完成' : '下一句'}
              </button>
              <button 
                onClick={() => {
                  if (currentTask) {
                    const reviewItem: ReviewItem = {
                      promptIndex: currentTask.promptIndex,
                      targetIndex: currentTask.targetIndex,
                      diff: markDifferencesByWord(targetText, userInput || targetText, rolenames),
                      passed: true,
                      userInput: userInput || targetText
                    }
                    setReviewQueue(prev => [...prev, reviewItem])
                    onNext()
                  }
                }} 
                className="px-3 py-1 bg-green-600 text-white rounded"
              >通过</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
