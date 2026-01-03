'use client'
import React, { useRef, useEffect, useState } from 'react'
import { useDialogueStore, useUserConfigStore } from '@/app/store'
import { recognizeSpeech as recognizeSpeechApi } from '../lib/apiCalls';
import useRecord from '../lib/hooks/useRecord';
import { calculateSimilarity } from '../lib/utils/stringCompare'

export default function DialogueDisplay() {
  const {
    dialogue, 
    vocabulary,
    currentSentenceIndex, 
    setCurrentSentenceIndex,
    setShowPractice
  } = useDialogueStore()
  
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // 使用录音Hook
  const {
    isRecording,
    audioUrl,
    startRecording: startRecord,
    stopRecording: stopRecord
  } = useRecord({
    onRecordingComplete: (audioData) => {
      if (currentSentenceIndex !== -1) {
        recognizeSpeech(audioData, currentSentenceIndex);
      }
    }
  });
  // 本组件本地维护句子练习状态，避免与其他组件耦合
  const [localPracticeStates, setLocalPracticeStates] = useState<Record<number, { passed: boolean | null; recognizedText: string }>>({})

  // 初始化本地练习状态
  useEffect(() => {
    if (!dialogue) return
    const map: Record<number, { passed: boolean | null; recognizedText: string }> = {}
    dialogue.forEach((_, idx) => {
      map[idx] = { passed: null, recognizedText: '' }
    })
    setLocalPracticeStates(map)
  }, [dialogue])
  
  if (!dialogue || dialogue.length === 0) {
    // 当没有对话时，不渲染该组件（返回 null）
    return null
  }


  

  // 开始录音
  const startRecording = async (sentenceIndex: number) => {
    try {
      setCurrentSentenceIndex(sentenceIndex);
      await startRecord();
    } catch (error) {
      console.error('录音失败:', error);
      alert('无法访问麦克风，请确保已授予权限');
    }
  }
  
  // 停止录音
  const stopRecording = () => {
    stopRecord();
  }
  
  // 调用语音识别API
  const recognizeSpeech = async (audioData: string, sentenceIndex: number) => {
    try {
      const data = await recognizeSpeechApi(audioData)
      const { recognizedText } = data
      
      // 调用相似度检查
      checkSimilarity(recognizedText, sentenceIndex)
      
    } catch (error) {
      console.error('语音识别失败:', error)
      alert('语音识别失败，请稍后重试')
    }
  }
  
  // 检查相似度（在客户端执行）
  const checkSimilarity = (recognizedText: string, sentenceIndex: number) => {
    try {
      const sentence = dialogue[sentenceIndex]
      const english = sentence.text
      
      // 在客户端计算相似度并更新本地状态
      const similarity = calculateSimilarity(recognizedText, english)
      const passed = similarity >= 70 // 70% 相似度视为通过

      setLocalPracticeStates(prev => ({
        ...prev,
        [sentenceIndex]: { passed, recognizedText }
      }))
      
    } catch (error) {
      console.error('相似度检查失败:', error)
    }
  }
  
  // 播放原句
  const playOriginalSentence = (english: string) => {
    if (typeof window === 'undefined') return

    const { aiServices } = useUserConfigStore()
    const { ttsService } = aiServices

    // 根据配置的TTS服务选择不同的实现
    if (ttsService === 'browser' || !ttsService) {
      // 默认使用浏览器内置的SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(english)
      utterance.lang = 'en-US' // 使用英语发音
      utterance.rate = 0.9 // 调整语速
      window.speechSynthesis.speak(utterance)
    } else {
      // 这里可以扩展其他TTS服务的实现
      console.log(`使用${ttsService} TTS服务播放: ${english}`)
      // 示例：调用其他TTS API的逻辑可以在这里添加
      const utterance = new SpeechSynthesisUtterance(english)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }
  
  // 获取句子的练习状态（本地）
  const getSentenceState = (index: number) => {
    return localPracticeStates[index] || { passed: null, recognizedText: '' }
  }

  // 重置所有练习状态（本地）
  const handleResetPractice = () => {
    const map: Record<number, { passed: boolean | null; recognizedText: string }> = {}
    dialogue.forEach((_, idx) => {
      map[idx] = { passed: null, recognizedText: '' }
    })
    setLocalPracticeStates(map)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">生成的对话</h2>
        <div>
          <button
            onClick={() => setShowPractice(true)}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >开始对话练习</button>
        </div>
      </div>
      <div className="space-y-6">
        {dialogue.map((item, index) => {
          const { role, text, text_cn } = item
          const sentenceState = getSentenceState(index)
          const isCurrentRecording = isRecording && currentSentenceIndex === index
          
          // 根据练习状态确定背景色
          let bgColorClass = role === 'A' ? 'bg-blue-50' : 'bg-green-50'
          if (sentenceState.passed === true) {
            bgColorClass = 'bg-green-100'
          } else if (sentenceState.passed === false) {
            bgColorClass = 'bg-red-50'
          } else if (isCurrentRecording) {
            bgColorClass = 'bg-yellow-50'
          }
          
          return (
            <div
              key={index}
              className={`rounded-lg shadow-sm overflow-hidden ${bgColorClass} transition-colors`}
            >
              <div className={`px-4 py-2 ${role === 'A' ? 'bg-blue-100' : 'bg-green-100'}`}>
                <span className={`font-medium ${role === 'A' ? 'text-blue-700' : 'text-green-700'}`}>
                  角色 {role}
                </span>
                <span className="ml-2 text-sm text-gray-500">第 {index + 1} 句</span>
              </div>
              <div className="p-4">
                <p className="text-gray-800 font-medium mb-2 dark:text-black">{text}</p>
                <p className="text-gray-600 mb-4">{text_cn}</p>
                
                {/* 语音识别结果显示 */}
                {sentenceState.recognizedText && (
                  <div className="mb-3 p-3 bg-gray-100 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-1 dark:text-black">识别结果：</p>
                    <p className="text-gray-800 dark:text-black">{sentenceState.recognizedText}</p>
                  </div>
                )}
                
                {/* 练习状态提示 */}
                {sentenceState.passed !== null && (
                  <div className={`mb-3 p-2 rounded-md text-sm font-medium ${sentenceState.passed ? 'bg-green-100 text-green-800 dark:text-black' : 'bg-red-100 text-red-800 dark:text-black'}`}>
                    {sentenceState.passed ? '✓ 朗读通过' : '✗ 请再试一次'}
                  </div>
                )}
                
                {/* 控制按钮 */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => playOriginalSentence(text)}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <span>🔊 播放原句</span>
                  </button>
                  <button
                    onClick={() => {
                      if (isCurrentRecording) {
                        stopRecording()
                      } else {
                        startRecording(index)
                      }
                    }}
                    disabled={isRecording && currentSentenceIndex !== index}
                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${isCurrentRecording ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  >
                    <span>{isCurrentRecording ? '⏹️ 停止录音' : '🎤 开始朗读'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        
  {/* 重置练习按钮 */}
  {dialogue.length > 0 && Object.values(localPracticeStates).some(state => state.passed !== null) && (
          <div className="mt-6 text-center">
            <button
              onClick={handleResetPractice}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              重置所有练习
            </button>
          </div>
        )}
        
        {/* 显示生成的词汇表 */}
        {vocabulary && vocabulary.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">对话生词表</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vocabulary.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{item.word}</h3>
                    {item.phonetic && (
                      <span className="text-sm text-gray-500">{item.phonetic}</span>
                    )}
                  </div>
                  {item.partOfSpeech && (
                    <div className="text-sm text-blue-600 mb-2">{item.partOfSpeech}</div>
                  )}
                  <div className="text-gray-700 mb-3">{item.meanings}</div>
                  {item.phrase && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-800">短语：{item.phrase}</div>
                      {item.phraseMeaning && (
                        <div className="text-sm text-gray-600">{item.phraseMeaning}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}