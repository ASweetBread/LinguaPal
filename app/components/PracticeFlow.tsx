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
  index: number
}

type diffType = Array<{ type: string; word?: string; correct?: boolean; userInput?: string; value?: string }>

type ReviewItem = {
  promptIndex: number
  targetIndex: number
  diff: diffType
  passed: boolean
  userInput: string
}

type UserInputState = {
  value: string
  correct: boolean | null
  diff: diffType
}

export default function PracticeFlow({ onFinish }: { onFinish?: () => void }) {
  const { dialogue, vocabulary, rolename, updateVocabularyErrorCount, setShowPractice } = useDialogueStore()

  const [tasks, setTasks] = useState<Task[]>([])
  const [current, setCurrent] = useState(0)
  const [userInputs, setUserInputs] = useState<UserInputState[]>([])
  const [showResult, setShowResult] = useState(false)
  const [lastResultCorrect, setLastResultCorrect] = useState<boolean | null>(null)
  const [lastDiff, setLastDiff] = useState<diffType>([])
  const [showPracticeResult, setShowPracticeResult] = useState(false)
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([])
  const [isReviewMode, setIsReviewMode] = useState(false)
  const currentHandler: React.MutableRefObject<((e: KeyboardEvent) => void) | null> = React.useRef(null)

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if(e.key !== 'Enter') return
    e.preventDefault()
    showResult ? onNext() : onSubmit()
  }
  
  useEffect(() => {
    currentHandler.current = handleGlobalKeyDown
  })

  React.useEffect(() => {
    function handler (e: KeyboardEvent) {
      if (!currentHandler.current) return
      currentHandler.current(e)
    }
    // 添加全局键盘事件监听器
    window.addEventListener('keydown', handler)
    // 清理函数
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [])

  // 构建任务：每个对话句子都是一个任务
  const buildAllTasks = () => {
    return dialogue.map((_, index) => ({ index }))
  }

  // 初始化任务和用户输入状态
  useEffect(() => {
    if (!dialogue || dialogue.length === 0) return
    const allTasks = buildAllTasks()
    setTasks(allTasks)
    setCurrent(0)
    setShowResult(false)
    setShowPracticeResult(false)
    // 初始化用户输入状态数组
    setUserInputs(dialogue.map(() => ({ value: '', correct: null, diff: [] })))
    setLastResultCorrect(null)
    setReviewQueue([])
    setIsReviewMode(false)
  }, [dialogue])

  const currentTask = tasks[current]
  // 从rolename中提取角色名称数组
  const rolenames = rolename.map(item => item.name).filter(name => name !== '')

  // 模拟语音播放功能
  const handlePlayAudio = (text: string) => {
    console.log('播放语音:', text)
  }

  const onSubmit = () => {
    if (!currentTask) return
    const ref = dialogue[currentTask.index].text
    const input = userInputs[currentTask.index]?.value?.replace(/,/g, ' ') || ''

    const correct = isInputCorrect(ref, input)
    const similarity = calculateSimilarity(ref, input)
    const diff = markDifferencesByWord(ref, input, rolenames)
    setLastDiff(diff)
    setLastResultCorrect(correct)
    setShowResult(true)

    // 更新用户输入状态
    setUserInputs(prev => {
      const newInputs = [...prev]
      newInputs[currentTask.index] = { ...newInputs[currentTask.index], correct, diff }
      return newInputs
    })

    // 如果当前输入错误，且是第一次提交失败，添加到复习队列
    const existingInputState = userInputs[currentTask.index]
    if (!correct && (!existingInputState || existingInputState.correct !== false)) {
      const reviewItem: ReviewItem = {
        promptIndex: currentTask.index - 1, // 使用前一句作为提示
        targetIndex: currentTask.index,
        diff,
        passed: false,
        userInput: input
      }
      setReviewQueue(prev => [...prev, reviewItem])

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
    setLastResultCorrect(null)
    setLastDiff([])

    const nextIndex = current + 1
    if (nextIndex < tasks.length) {
      setCurrent(nextIndex)
      return
    }

    // 检查是否有错误的句子需要复习
    const incorrectTasks = userInputs
      .map((input, index) => ({ index, ...input }))
      .filter(item => item.correct === false)
      .map(item => ({ index: item.index }))

    if (incorrectTasks.length > 0) {
      // 进入复习模式，重新练习错误的句子
      setTasks(incorrectTasks)
      setCurrent(0)
      setIsReviewMode(true)
    } else {
      // 所有句子都正确，显示练习结果
      setShowPracticeResult(true)
    }
  }

  // 更新用户输入
  const handleInputChange = (value: string) => {
    if (!currentTask) return
    setUserInputs(prev => {
      const newInputs = [...prev]
      newInputs[currentTask.index] = { ...newInputs[currentTask.index], value }
      return newInputs
    })
  }

  // 获取当前输入值
  const getCurrentInputValue = () => {
    if (!currentTask) return ''
    return userInputs[currentTask.index]?.value || ''
  }

  const handleRestart = () => {
    setShowPracticeResult(false)
    setReviewQueue([])
    const allTasks = buildAllTasks()
    setTasks(allTasks)
    setCurrent(0)
    setShowResult(false)
    setUserInputs(dialogue.map(() => ({ value: '', correct: null, diff: [] })))
    setLastResultCorrect(null)
    setIsReviewMode(false)
  }

  const handleExit = () => {
    setShowPractice(false)
  }

  // 获取角色头像样式
  // const getRoleAvatarStyle = (role: string) => {
  //   const roleStyles = {
  //     A: {
  //       bg: 'bg-pink-500 dark:bg-pink-600',
  //       initial: '👧'
  //     },
  //     B: {
  //       bg: 'bg-blue-500 dark:bg-blue-600',
  //       initial: '👵'
  //     }
  //   }
  //   return roleStyles[role]
  // }

  // 获取当前任务的中文翻译
  const getCurrentTaskChinese = () => {
    if (!currentTask) return ''
    return dialogue[currentTask.index]?.text_cn || ''
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

  const isLastTask = current === tasks.length - 1

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{isReviewMode ? '复习练习' : '对话练习'}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">进度：{current + 1}/{tasks.length}</span>
          <button
            onClick={handleExit}
            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >退出</button>
        </div>
      </div>

      {/* 分步显示输入框区域 */}
      <div className="space-y-6 mb-6">
        {/* 显示当前任务之前的所有已完成对话 */}
        {tasks.slice(0, current).map((task, idx) => {
          const msg = dialogue[task.index]
          const inputState = userInputs[task.index]
          // const roleStyle = getRoleAvatarStyle(msg.role)
          return (
            <div key={idx} className="flex items-start gap-3">
              {/* <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${roleStyle.bg}`}>
                {roleStyle.initial}
              </div> */}
              <div className="flex-1 space-y-1">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 relative">
                  <button
                    onClick={() => handlePlayAudio(msg.text)}
                    className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>
                  <p className="text-gray-800 dark:text-gray-200">{msg.text}</p>
                  {msg.text_cn && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{msg.text_cn}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* 当前任务的输入框 */}
        {tasks.slice(current, current + 1).map((task, idx) => {
          const msg = dialogue[task.index]
          const inputState = userInputs[task.index]
          // const roleStyle = getRoleAvatarStyle(msg.role)
          return (
            <div key={idx} className="flex items-start gap-3">
              {/* <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${roleStyle.bg}`}>
                {roleStyle.initial}
              </div> */}
              <div className="flex-1 space-y-1">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 relative">
                  <button
                    onClick={() => handlePlayAudio(msg.text)}
                    className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>
                  
                  {/* 显示输入框和结果 */}
                  <div className="space-y-2">
                    {/* 输入框：即使显示结果也允许修改 */}
                    <TypingInput
                      targetText={msg.text}
                      value={getCurrentInputValue()}
                      onChange={handleInputChange}
                      disabled={false} /* 始终允许编辑 */
                    />
                    
                    {/* 中文参考 */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">中文参考：</span>{getCurrentTaskChinese()}
                    </div>
                    
                    {/* 提交结果显示 */}
                    {showResult && inputState && (
                      <div className="space-y-2">
                        {/* 正确答案显示在用户输入的位置 */}
                        {!inputState.correct && (
                          <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span className="font-medium">正确答案：</span>
                            </div>
                            <div className="text-gray-800 dark:text-gray-200">
                              {inputState.diff.map((seg, idx) => {
                                if (seg.type === 'word' && seg.word) {
                                  return (
                                    <span
                                      key={idx}
                                      className={seg.correct ? 'px-0' : 'underline decoration-2 decoration-red-400 text-red-700 dark:text-red-400'}
                                    >
                                      {seg.word}
                                      {idx < inputState.diff.length - 1 && inputState.diff[idx + 1].type === 'word' ? ' ' : ''}
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
                        )}
                        
                        {/* 成功提示 */}
                        {inputState.correct && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                            <div className="text-sm text-green-700 dark:text-green-400">
                              ✅ 回答正确！可以继续下一句。
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 操作按钮区域 */}
      <div className="flex gap-2">
        {/* 提交按钮始终显示 */}
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-1 max-w-xs"
        >提交</button>
        
        {/* 显示答案按钮 */}
        <button
          onClick={() => {
            setShowResult(true)
            setLastResultCorrect(null)
            setLastDiff(markDifferencesByWord(
              dialogue[currentTask.index].text,
              getCurrentInputValue(),
              rolenames
            ))
          }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-1 max-w-xs"
        >显示答案</button>
        
        {/* 下一句按钮：只有当答案正确时才显示 */}
        {showResult && lastResultCorrect && (
          <button 
            onClick={onNext} 
            className={`px-4 py-2 rounded transition-colors flex-1 max-w-xs ${isLastTask ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isLastTask ? '完成' : '下一句'}
          </button>
        )}
      </div>
    </div>
  )
}
