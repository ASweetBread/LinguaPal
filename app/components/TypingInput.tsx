"use client"
import React, { useState, useRef, KeyboardEvent, useEffect, useLayoutEffect } from 'react'

interface TypingInputProps {
  targetText: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

interface WordSegment {
  type: 'word' | 'punctuation' | 'space'
  content: string
  index: number
}

export default function TypingInput({ targetText, value, onChange, disabled = false, className = '' }: TypingInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const measureRef = useRef<HTMLSpanElement>(null)

  const parseText = (text: string): WordSegment[] => {
    const segments: WordSegment[] = []
    let wordIndex = 0
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      
      if (/\s/.test(char)) {
        segments.push({ type: 'space', content: ' ', index: -1 })
      } else if (/[.,!?;:"()]/.test(char)) {
        segments.push({ type: 'punctuation', content: char, index: -1 })
      } else {
        let word = ''
        while (i < text.length && !/[\s.,!?;:"()]/.test(text[i])) {
          word += text[i]
          i++
        }
        i--
        segments.push({ type: 'word', content: word, index: wordIndex })
        wordIndex++
      }
    }
    
    return segments
  }

  const segments = parseText(targetText)

  const parseUserInput = (input: string): string[] => {
    const words = input.split(',')
    return words
  }

  const userWords = parseUserInput(value)

  const handleWordChange = (wordIndex: number, newWord: string) => {
    const totalWords = segments.filter(s => s.type === 'word')
    updateWordWidth(totalWords[wordIndex], newWord)
    const newWords = [...userWords]
    newWords[wordIndex] = newWord
    const newValue = newWords.join(',')
    onChange(newValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, wordIndex: number) => {
    // 处理空格键切换到下一个单词
    if (e.key === ' ') {
      e.preventDefault()
      const totalWords = segments.filter(s => s.type === 'word').length
      if (wordIndex < totalWords - 1) {
        const nextIndex = wordIndex + 1
        const nextInput = inputRefs.current[nextIndex]
        if (nextInput) {
          nextInput.focus()
        }
      }
      return
    }
    
    // 处理退格键
    if (e.key === 'Backspace' && !e.currentTarget.value && wordIndex > 0) {
      e.preventDefault()
      const prevIndex = wordIndex - 1
      const prevInput = inputRefs.current[prevIndex]
      if (prevInput) {
        prevInput.focus()
        const length = prevInput.value.length
        prevInput.setSelectionRange(length, length)
      }
      return
    }
    
    // 处理右箭头键
    if (e.key === 'ArrowRight') {
      const totalWords = segments.filter(s => s.type === 'word').length
      const cursorPos = e.currentTarget.selectionStart
      const inputValue = e.currentTarget.value
      
      // 只有当光标位于文本结尾且不是最后一个单词时，才切换到下一个输入框
      if (cursorPos === inputValue.length && wordIndex < totalWords - 1) {
        e.preventDefault()
        const nextIndex = wordIndex + 1
        const nextInput = inputRefs.current[nextIndex]
        if (nextInput) {
          nextInput.focus()
        }
      }
      return
    }
    
    // 处理左箭头键
    if (e.key === 'ArrowLeft') {
      const cursorPos = e.currentTarget.selectionStart
      
      // 只有当光标位于文本开头且不是第一个单词时，才切换到上一个输入框
      if (cursorPos === 0 && wordIndex > 0) {
        e.preventDefault()
        const prevIndex = wordIndex - 1
        const prevInput = inputRefs.current[prevIndex]
        if (prevInput) {
          prevInput.focus()
          const length = prevInput.value.length
          prevInput.setSelectionRange(length, length)
        }
      }
      return
    }
  }

  const measureTextWidth = (text: string): number => {
    if (!measureRef.current) return 0
    
    measureRef.current.textContent = text
    const width = measureRef.current.offsetWidth
    measureRef.current.textContent = ''
    
    return width
  }

  const getInputWidth = (targetWord: string, userWord: string): string => {
    const textToMeasure = userWord || targetWord
    const width = measureTextWidth(textToMeasure)
    console.log('测量宽度', textToMeasure, width)
    const minWidth = measureTextWidth(targetWord)
    const finalWidth = Math.max(width, minWidth)
    return `${finalWidth}px`
  }

  function updateWordWidth(segment: WordSegment, word: string) {
    const dynamicWidth = getInputWidth(segment.content, word)
    const input = inputRefs.current[segment.index]
    if (input) {
      input.style.width = dynamicWidth
    }
  }

  function updateAllWordWidth() {
    segments.forEach((segment, idx) => {
      if (segment.type === 'word') {
        const userWord = userWords[segment.index] || ''
        updateWordWidth(segment, userWord)
      }
    })
  }

  useEffect(() => {
    !disabled && inputRefs.current[0]?.focus()
  }, [disabled])

  useLayoutEffect(() => {
    updateAllWordWidth()
  }, [targetText])

  return (
    <div className={`flex flex-wrap items-center ${className}`}>
      {segments.map((segment, idx) => {
        if (segment.type === 'space') {
          return <span key={`space-${idx}`} className="w-1" />
        }
        
        if (segment.type === 'punctuation') {
          return (
            <span 
              key={`punct-${idx}`} 
              className="text-lg text-gray-800 dark:text-gray-200"
            >
              {segment.content}
            </span>
          )
        }
        
        if (segment.type === 'word') {
          const userWord = userWords[segment.index] || ''
          const isFocused = focusedIndex === segment.index
          
          return (
            <div key={`word-${segment.index}`} className="relative inline-flex flex-col items-center">
              <input
                ref={el => {
                  if (inputRefs.current) {
                    inputRefs.current[segment.index] = el
                  }
                }}
                type="text"
                value={userWord}
                onChange={(e) => handleWordChange(segment.index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, segment.index)}
                onFocus={() => setFocusedIndex(segment.index)}
                onBlur={() => setFocusedIndex(-1)}
                disabled={disabled}
                className={`
                  bg-transparent outline-none text-left
                  text-lg text-gray-800 dark:text-gray-200
                  ${disabled ? 'cursor-not-allowed opacity-50' : ''}
                  border-b-2 transition-colors
                  ${isFocused 
                    ? 'border-blue-500' 
                    : 'border-gray-400 dark:border-gray-600'
                  }
                `}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
          )
        }
        
        return null
      })}
      <span 
        ref={measureRef}
        className="invisible absolute whitespace-pre text-lg"
        style={{ visibility: 'hidden', position: 'absolute' }}
      />
    </div>
  )
}
