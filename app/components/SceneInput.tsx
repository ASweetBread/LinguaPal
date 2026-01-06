'use client'
import React, { useState } from 'react'
import { useDialogueStore, useUserConfigStore, useUserInfoStore, useVocabularyStore } from '@/app/store'
import { generateDialogue } from '../lib/apiCalls';
import { generateDialoguePrompt } from '../lib/prompts/generatePrompt';
import PromptDisplay from './PromptDisplay';

export default function SceneInput() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const { setDialogue, setIsLoading, isLoading, setDialogueAndVocabulary, setRolename, currentScene, setCurrentScene } = useDialogueStore()
  const { mode, aiServices, dialogueConfig, currentLevel, vocabularyAbility } = useUserConfigStore()
  const { userId } = useUserInfoStore()
  const { vocabulary } = useVocabularyStore()

  const handleGenerateDialogue = async () => {
    if (!currentScene.trim()) {
      alert('请输入场景描述')
      return
    }

    try {
      setIsLoading(true)
      // 生成新对话前清空现有对话
      setDialogue([])
      
      if (mode === 'prompt') {
        // 提示词模式：直接在客户端生成提示词，不调用后端API
        const vocabularyJson = JSON.stringify(vocabulary)
        const prompt = generateDialoguePrompt(
          currentScene.trim(),
          dialogueConfig.newWordRatio.toString(),
          dialogueConfig.familiarWordLevel,
          currentLevel,
          vocabularyAbility,
          vocabularyJson
        )
        setGeneratedPrompt(prompt)
        setShowPrompt(true)
      } else {
        // 正常模式：调用后端API生成对话
        const data = await generateDialogue(
          currentScene.trim(), 
          mode, 
          aiServices.textAI,
          dialogueConfig,
          userId,
          currentLevel,
          vocabularyAbility
        )

        console.log('生成的结果:', data)
        
        // 正常模式：设置对话和词汇表
        if (data.dialogue) {
          setDialogueAndVocabulary({
            dialogue: data.dialogue,
            vocabulary: data.vocabulary || []
          })
          setRolename(data.rolename)
        }
      }
    } catch (error) {
      console.error('生成对话时出错:', error)
      alert('生成对话失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptSubmit = (result: string) => {
    // 处理分析结果的提交
    try {
      // 尝试解析用户输入的对话
      const parsedDialogue = JSON.parse(result.trim())
      setDialogueAndVocabulary({
        dialogue: parsedDialogue.dialogue,
        vocabulary: parsedDialogue.vocabulary || []
      })
      setRolename(parsedDialogue.rolename)
      
      // 关闭提示词展示组件
      setShowPrompt(false)
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
          value={currentScene}
          onChange={(e) => setCurrentScene(e.target.value)}
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

      {/* 提示词展示组件 */}
      {showPrompt && (
        <PromptDisplay
          prompt={generatedPrompt}
          onSubmit={handlePromptSubmit}
          onClose={() => setShowPrompt(false)}
        />
      )}
    </div>
  )
}