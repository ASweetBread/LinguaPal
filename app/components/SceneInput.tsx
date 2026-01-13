'use client'
import React, { useState } from 'react'
import { useDialogueStore, useUserConfigStore, useUserInfoStore, useVocabularyStore, useKeywordStore } from '@/app/store'
import { generateDialogue, analyzeKeyword as analyzeKeywordApi, storeKeywordAnalysisResult } from '@/app/lib/dialogueApi';
import { updateKeywordScope } from '@/app/lib/keywordScopeApi';
import { generateDialoguePrompt, generateAnalysisKeywordPrompt } from '../lib/prompts/generatePrompt';
import PromptDisplay from './PromptDisplay';
import { LEARNING_MODES } from '@/config/app';

export default function SceneInput() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showKeywordPrompt, setShowKeywordPrompt] = useState(false)
  const [keywordAnalysisPrompt, setKeywordAnalysisPrompt] = useState('')
  const { setDialogue, setIsLoading, isLoading, setDialogueAndVocabulary, setRolename, currentScene, setCurrentScene } = useDialogueStore()
  const { mode, aiServices, dialogueConfig } = useUserConfigStore()
  const { userId, currentLevel, vocabularyAbility, } = useUserInfoStore()
  const { vocabulary } = useVocabularyStore()
  const { setCurrentKeyword, addKeywordToList, setIsAnalyzing: setKeywordStoreAnalyzing } = useKeywordStore()

  // 分析关键字
  const analyzeKeyword = async () => {
    if (!currentScene.trim()) {
      alert('请输入场景描述')
      return
    }

    try {
      setIsAnalyzing(true)
      setKeywordStoreAnalyzing(true)
      
      if (mode === LEARNING_MODES.PROMPT) {
        // 提示词模式：直接生成分析提示词
        const prompt = generateAnalysisKeywordPrompt(currentScene.trim())
        setKeywordAnalysisPrompt(prompt)
        setShowKeywordPrompt(true)
      } else {
        // 正常模式：调用API分析关键字
        const result = await analyzeKeywordApi({
          keyword: currentScene.trim(),
          mode: LEARNING_MODES.NORMAL,
          userId: userId || '',
          aiService: aiServices.textAI
        })

        if (result.success) {
          // 存储到keywordStore
          const keywordData = {
            keyword: result.data.keyword,
            analysis: result.data.analysis
          }
          setCurrentKeyword(keywordData)
          addKeywordToList(keywordData)
          
          // 继续生成对话
          generateDialogueAfterAnalysis()
        } else {
          throw new Error(result.error || '分析关键字失败')
        }
      }
    } catch (error) {
      console.error('分析关键字时出错:', error)
      alert('分析关键字失败，请稍后重试')
    } finally {
      setIsAnalyzing(false)
      setKeywordStoreAnalyzing(false)
    }
  }

  // 生成对话（在关键字分析完成后调用）
  const generateDialogueAfterAnalysis = async () => {
    try {
      setIsLoading(true)
      // 生成新对话前清空现有对话
      setDialogue([])
      
      if (mode === LEARNING_MODES.PROMPT) {
        // 提示词模式：直接在客户端生成提示词
        const vocabularyJson = JSON.stringify(vocabulary)
        
        // 从keywordStore获取当前关键字分析结果和已训练范围信息
        const { currentKeyword, alreadyTrainedScope, alreadyTrainedScopeIndex } = useKeywordStore.getState();
        console.log('currentKeyword:', currentKeyword)
        const keywordAnalysis = currentKeyword.analysis;
        
        const prompt = generateDialoguePrompt(
          currentScene.trim(),
          dialogueConfig.newWordRatio.toString(),
          dialogueConfig.familiarWordLevel,
          currentLevel || '',
          vocabularyAbility || '',
          vocabularyJson,
          // 新增参数
          '中文', // userLanguage
          keywordAnalysis, // 传递关键字分析结果
          JSON.stringify(alreadyTrainedScope), // 传递已训练范围
          alreadyTrainedScopeIndex // 传递已训练范围索引
        )
        setGeneratedPrompt(prompt)
        setShowPrompt(true)
      } else {
        // 正常模式：调用后端API生成对话
        // 从keywordStore获取已训练范围信息
        const keywordStoreState = useKeywordStore.getState();
        const alreadyTrainedScope = keywordStoreState.alreadyTrainedScope;
        const alreadyTrainedScopeIndex = keywordStoreState.alreadyTrainedScopeIndex;
        
        const result = await generateDialogue({
          scene: currentScene.trim(),
          mode,
          aiService: aiServices.textAI,
          dialogueConfig,
          userId,
          currentLevel,
          vocabularyAbility,
          alreadyTrainedScope,
          alreadyTrainedScopeIndex
        });
        const data = result;

        console.log('生成的结果:', data)
        
        // 正常模式：设置对话和词汇表
        if (data.dialogue) {
          setDialogueAndVocabulary({
            dialogue: data.dialogue,
            vocabulary: data.vocabulary || []
          })
          setRolename(data.rolename)
          
          // 处理API返回的已训练范围和全训练状态
          const alreadyTrainedScope = data.alreadyTrainedScope;
          const isFullTrained = data.isFullTrained;
          
          // 如果有用户ID和已训练范围信息，存储到数据库
          if (userId && alreadyTrainedScope !== undefined) {
            try {
              await updateKeywordScope({
                userId: parseInt(userId),
                keywordName: currentScene.trim(),
                alreadyTrainedScope,
                isFullTrained: isFullTrained || false
              })
              
              // 根据isFullTrained状态更新keyWordStore
              if (isFullTrained) {
                useKeywordStore.getState().setAlreadyTrainedScopeIndex(0);
              } else {
                // 如果不是全训练状态，保留当前索引或递增
                const currentIndex = useKeywordStore.getState().alreadyTrainedScopeIndex;
                useKeywordStore.getState().setAlreadyTrainedScopeIndex(
                  currentIndex !== undefined && currentIndex !== null ? currentIndex + 1 : 0
                );
              }
              
              // 更新已训练范围数组
              if (alreadyTrainedScope) {
                const currentScope = useKeywordStore.getState().alreadyTrainedScope;
                useKeywordStore.getState().setAlreadyTrainedScope([
                  ...currentScope,
                  alreadyTrainedScope
                ]);
              }
            } catch (error) {
              console.error('存储关键字范围时出错:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('生成对话时出错:', error)
      alert('生成对话失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理关键字分析结果提交
  const handleKeywordAnalysisSubmit = async (result: string) => {
    try {
      // 解析用户输入的分析结果
      const analysis = JSON.parse(result.trim())
      
      // 构建关键字数据
      const keywordData = {
        keyword: currentScene.trim(),
        analysis: {
          coreRequirements: analysis.coreRequirements || '',
          difficultyLevel: analysis.difficultyLevel || '',
          supplements: analysis.supplements || analysis.supplementFocus || '',
          vocabularyScope: analysis.vocabularyScope || analysis.vocabularyRange || '',
          keySentencePatterns: analysis.keySentencePatterns || analysis.sentenceStructureFocus || ''
        }
      }
      
      // 存储到keywordStore
      setCurrentKeyword(keywordData)
      addKeywordToList(keywordData)
      
      // 如果有用户ID，存储到数据库
      if (userId) {
        storeKeywordAnalysisResult({
          ...keywordData,
          userId: userId
        })
      }
      // 关闭提示词展示组件
      setShowKeywordPrompt(false)
      
      // 继续生成对话
      generateDialogueAfterAnalysis()
    } catch (error) {
      alert('分析结果格式不正确，请确保输入的是有效的JSON格式')
      console.error('解析分析结果失败:', error)
    }
  }

  // 处理生成对话
  const handleGenerateDialogue = async () => {
    // 先分析关键字
    await analyzeKeyword()
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
          disabled={isLoading || isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? '分析中...' : isLoading ? '生成中...' : '生成对话'}
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

      {/* 关键字分析提示词展示组件 */}
      {showKeywordPrompt && (
        <PromptDisplay
          prompt={keywordAnalysisPrompt}
          onSubmit={handleKeywordAnalysisSubmit}
          onClose={() => setShowKeywordPrompt(false)}
        />
      )}
    </div>
  )
}