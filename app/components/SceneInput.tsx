'use client'
import React, { useState } from 'react'
import { useDialogueStore, useUserConfigStore, useVocabularyStore } from '@/app/store'
import { generateDialogue } from '../lib/apiCalls';
import { generateDialoguePrompt } from '../lib/prompts/generatePrompt';

export default function SceneInput() {
  const [scene, setScene] = useState('')
  const [prompt, setPrompt] = useState('')
  const [userDialogueInput, setUserDialogueInput] = useState('')
  const { setDialogue, setIsLoading, isLoading } = useDialogueStore()
  const { mode, aiServices, dialogueConfig, userId } = useUserConfigStore()
  const { vocabulary } = useVocabularyStore()

  const handleGenerateDialogue = async () => {
    if (!scene.trim()) {
      alert('请输入场景描述')
      return
    }

    try {
      setIsLoading(true)
      // 生成新对话前清空现有对话
      setDialogue([])
      setUserDialogueInput('')
      
      if (mode === 'prompt') {
        // 提示词模式：直接在客户端生成提示词，不调用后端API
        const vocabularyJson = JSON.stringify(vocabulary)
        const generatedPrompt = generateDialoguePrompt(
          scene.trim(),
          dialogueConfig.newWordRatio.toString(),
          dialogueConfig.familiarWordLevel,
          vocabularyJson
        )
        setPrompt(generatedPrompt)
      } else {
        // 正常模式：调用后端API生成对话
        const data = await generateDialogue(
          scene.trim(), 
          mode, 
          aiServices.textAI,
          dialogueConfig,
          userId
        )

        console.log('生成的结果:', data)
        
        // 正常模式：直接设置对话
        if (data.dialogue) {
          setDialogue(data.dialogue)
        }
      }
    } catch (error) {
      console.error('生成对话时出错:', error)
      alert('生成对话失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualDialogueSubmit = () => {
    if (!userDialogueInput.trim()) {
      alert('请输入对话内容')
      return
    }
    
    try {
      // 尝试解析用户输入的对话
      const parsedDialogue = JSON.parse(userDialogueInput.trim())
      setDialogue(parsedDialogue)
      // 清空输入
      setUserDialogueInput('')
      setPrompt('')
    } catch (error) {
      alert('对话格式不正确，请确保输入的是有效的JSON格式')
      console.error('解析对话失败:', error)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <label htmlFor="scene-input" className="block text-sm font-medium text-gray-700 mb-2">
        输入对话场景
      </label>
      <div className="flex gap-2 mb-4">
        <input
          id="scene-input"
          type="text"
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          placeholder="例如：咖啡店点餐"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerateDialogue}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '生成中...' : '生成对话'}
        </button>
      </div>

      {/* 提示词模式下的提示词显示和对话输入 */}
      {mode === 'prompt' && prompt && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">提示词</h3>
          <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 mb-4 overflow-x-auto">
            <pre className="text-sm text-gray-800 dark:text-white whitespace-pre-wrap">{prompt}</pre>
          </div>
          
          <div className="mb-2">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(prompt);
                // 显示复制成功提示
                alert('复制成功');
              }}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              复制提示词
            </button>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              请在其他AI平台获取对话后粘贴到此处
            </label>
            <textarea
              value={userDialogueInput}
              onChange={(e) => setUserDialogueInput(e.target.value)}
              placeholder='例如：[{"role": "A", "text": "Hello!\n你好！"}, {"role": "B", "text": "Hi there!\n你好！"}]'
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 min-h-[150px] bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
            />
            <button
              onClick={handleManualDialogueSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              提交对话
            </button>
          </div>
        </div>
      )}
    </div>
  )
}