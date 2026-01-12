import { NextResponse } from 'next/server'
import { apiRequest } from '../apiWrapper'
import { generateDialoguePrompt } from '@/app/lib/prompts/generatePrompt'
import { textAIServices } from '@/config/ai-services'
import { VocabularyDAL } from '../vocabulary/dal'

// 定义请求参数接口
interface DialogueRequest {
  scene: string
  mode?: 'normal' | 'prompt'
  prompt?: string
  language: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  aiService?: string // AI服务标识
  dialogueConfig?: { newWordRatio: number; familiarWordLevel: number }
  userId?: number
  currentLevel?: string
  vocabularyAbility?: string
  alreadyTrainedScope?: string[]
  alreadyTrainedScopeIndex?: number | undefined | null
}

// 定义响应数据接口
interface DialogueResponse {
  dialogue?: Array<{
    role: string
    text: string
    text_cn: string
  }>
  prompt?: string
  translation?: string
  vocabulary?: Array<{
    word: string
    phonetic?: string
    meanings: string
    partOfSpeech?: string
    phrase?: string
    phraseMeaning?: string
  }>
}

// 定义ZhipuAI API响应接口
interface ZhipuAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export const POST = async (request: Request) => {
  try {
    const body = await request.json()
    const { 
      scene, 
      mode = 'normal', 
      aiService = 'zhipu',
      dialogueConfig = { newWordRatio: 30, familiarWordLevel: 3 },
      userId,
      currentLevel = "A1",
      vocabularyAbility = "初级学习者",
      alreadyTrainedScope = [],
      alreadyTrainedScopeIndex = undefined
    } = body as DialogueRequest

    if (!scene) {
      return NextResponse.json(
        { error: '提示词和语言类型不能为空' },
        { status: 400 }
      )
    }
    
    // 获取用户单词表
    let vocabulary: Array<any> = []
    if (userId) {
      try {
        const wordsResult = await VocabularyDAL.getWords({ userId })
        vocabulary = wordsResult.words
      } catch (error) {
        console.error('获取用户单词表失败:', error)
        // 如果获取单词表失败，继续使用空数组
      }
    }
    
    // 根据模式返回不同的响应
    if (mode === 'prompt') {
      // 提示词模式：返回提示词，不调用AI
      const vocabularyJson = JSON.stringify(vocabulary)
      const fullPrompt = generateDialoguePrompt(
        scene,
        dialogueConfig.newWordRatio.toString(),
        dialogueConfig.familiarWordLevel,
        currentLevel,
        vocabularyAbility,
        vocabularyJson,
        '中文',
        { coreRequirements: '', difficultyLevel: '', supplements: '', vocabularyScope: '', keySentencePatterns: '' },
        JSON.stringify(alreadyTrainedScope),
        alreadyTrainedScopeIndex
      )
      
      return NextResponse.json<DialogueResponse>({
        prompt: fullPrompt
      })
    } else {
      // 正常模式：调用AI生成对话
      // 获取选定的AI服务配置
      const selectedService = textAIServices[aiService as keyof typeof textAIServices]
      
      if (!selectedService) {
        throw new Error(`不支持的AI服务: ${aiService}`)
      }
      
      // 准备发送给AI的消息内容
      const vocabularyJson = JSON.stringify(vocabulary)
      const messages = [
        {
          role: 'system',
          content: generateDialoguePrompt(
            scene,
            dialogueConfig.newWordRatio.toString(),
            dialogueConfig.familiarWordLevel,
            currentLevel,
            vocabularyAbility,
            vocabularyJson,
            '中文',
            { coreRequirements: '', difficultyLevel: '', supplements: '', vocabularyScope: '', keySentencePatterns: '' },
            JSON.stringify(alreadyTrainedScope),
            alreadyTrainedScopeIndex
          )
        },
        {
          role: 'user',
          content: scene
        }
      ]
      
      // 获取API密钥
      let apiKey: string | undefined
      let requestBody: any
      let requestHeaders: any = {
        'Content-Type': 'application/json'
      }
      
      // 根据不同的AI服务设置不同的请求参数
      switch (selectedService.provider) {
        case 'zhipu':
          apiKey = process.env.ZHIPUAI_API_KEY
          if (!apiKey) {
            throw new Error('未配置ZhipuAI API密钥')
          }
          requestHeaders.Authorization = `Bearer ${apiKey}`
          requestBody = {
            model: selectedService.model,
            messages: messages,
            temperature: 0.7,
            "thinking": {
              "type": "disabled"
            },
            "response_format": {
              "type": "json_object"
            },
            "stream": false,
          }
          break
          
        case 'openai':
          apiKey = process.env.OPENAI_API_KEY
          if (!apiKey) {
            throw new Error('未配置OpenAI API密钥')
          }
          requestHeaders.Authorization = `Bearer ${apiKey}`
          requestBody = {
            model: selectedService.model,
            messages: messages,
            temperature: 0.7,
            response_format: {
              type: "json_object"
            },
            stream: false,
          }
          break
          
        case 'anthropic':
          apiKey = process.env.ANTHROPIC_API_KEY
          if (!apiKey) {
            throw new Error('未配置Anthropic API密钥')
          }
          requestHeaders['x-api-key'] = apiKey
          requestHeaders['anthropic-version'] = '2023-06-01'
          requestBody = {
            model: selectedService.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 4000,
            response_format: {
              type: "json_object"
            }
          }
          break
          
        default:
          throw new Error(`不支持的AI服务提供商: ${selectedService.provider}`)
      }
      
      // 使用apiRequest替换fetch调用
      const data = await apiRequest<any>(
        selectedService.apiUrl,
        {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestBody)
        },
        `${selectedService.name}-Chat` // API名称标识
      )
      
      // 解析响应，不同AI服务的响应格式可能不同
      let generatedContent: string
      
      switch (selectedService.provider) {
        case 'zhipu':
        case 'openai':
          generatedContent = data.choices[0]?.message?.content
          break
          
        case 'anthropic':
          generatedContent = data.content?.[0]?.text
          break
          
        default:
          throw new Error(`不支持的AI服务提供商: ${selectedService.provider}`)
      }
      
      if (!generatedContent) {
        throw new Error('未从AI模型获取到有效的响应')
      }
      
      // 构建响应对象
      const aiResponse = JSON.parse(generatedContent)
      const responseData: DialogueResponse = {
        dialogue: aiResponse.dialogue || [],
        vocabulary: aiResponse.vocabulary || []
      }
      
      return NextResponse.json<DialogueResponse>(responseData)
    }
  } catch (error) {
    console.error('生成对话时出错:', error)
    return NextResponse.json(
      { error: '生成对话失败，请稍后重试' },
      { status: 500 }
    )
  }
}