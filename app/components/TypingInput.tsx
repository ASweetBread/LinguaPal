"use client"
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react'

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
      } else if (/[.,!?;:'"()\-]/.test(char)) {
        segments.push({ type: 'punctuation', content: char, index: -1 })
      } else {
        let word = ''
        while (i < text.length && !/[\s.,!?;:'"()\-]/.test(text[i])) {
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
    const words = input.split(/\s+/).filter(w => w.length > 0)
    return words
  }

  const userWords = parseUserInput(value)

  const handleWordChange = (wordIndex: number, newWord: string) => {
    const newWords = [...userWords]
    newWords[wordIndex] = newWord
    const newValue = newWords.join(' ')
    onChange(newValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, wordIndex: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && wordIndex > 0) {
      e.preventDefault()
      const prevIndex = wordIndex - 1
      const prevInput = inputRefs.current[prevIndex]
      if (prevInput) {
        prevInput.focus()
        const length = prevInput.value.length
        prevInput.setSelectionRange(length, length)
      }
    } else if (e.key === 'ArrowRight' && wordIndex < segments.filter(s => s.type === 'word').length - 1) {
      e.preventDefault()
      const nextIndex = wordIndex + 1
      const nextInput = inputRefs.current[nextIndex]
      if (nextInput) {
        nextInput.focus()
      }
    } else if (e.key === 'ArrowLeft' && wordIndex > 0) {
      e.preventDefault()
      const prevIndex = wordIndex - 1
      const prevInput = inputRefs.current[prevIndex]
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  const handleFocus = (index: number) => {
    setFocusedIndex(index)
  }

  const getLineWidth = (word: string): string => {
    const baseWidth = Math.max(word.length * 0.6, 2)
    return `${baseWidth}em`
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
    const minWidth = measureTextWidth(targetWord)
    const finalWidth = Math.max(width, minWidth)
    return `${finalWidth}px`
  }

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
          const dynamicWidth = getInputWidth(segment.content, userWord)
          
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
                onFocus={() => handleFocus(segment.index)}
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
                style={{ 
                  minWidth: getLineWidth(segment.content),
                  width: dynamicWidth
                }}
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
