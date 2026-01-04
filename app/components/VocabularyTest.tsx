'use client';
import React, { useState, useEffect } from 'react';
import { useUserConfigStore } from '../store/userConfigStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { LEARNING_MODES } from '@/config/app';
import { generateVocabularyPrompt } from '../lib/prompts/generatePrompt';

interface VocabularyTestProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 词汇测试核心功能组件
const VocabularyTestContent = () => {
  const { mode } = useUserConfigStore();
  const [prompt, setPrompt] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [userInput, setUserInput] = useState<string>('');
  const { toast } = useToast();

  // 初始化测试
  const initializeTest = () => {
    setLoading(true);
    if (mode === LEARNING_MODES.PROMPT) {
      // 提示词模式：直接生成提示词
      const generatedPrompt = generateVocabularyPrompt('');
      setPrompt(generatedPrompt);
      setLoading(false);
    } else {
      // 正常模式：调用API生成测试
      fetch('/api/vocabulary-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: LEARNING_MODES.NORMAL,
          aiService: 'zhipu',
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.prompt) {
            setPrompt(data.prompt);
          } else if (data.test) {
            setTestResult(data.test);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('生成词汇测试失败:', error);
          setLoading(false);
        });
    }
  };

  // 提交测试结果
  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    setLoading(true);
    fetch('/api/vocabulary-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: LEARNING_MODES.NORMAL,
        aiService: 'zhipu',
        userInput: userInput.trim(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.feedback) {
          setTestResult(data.feedback);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('提交测试结果失败:', error);
        setLoading(false);
      });
  };

  // 初始化测试
  useEffect(() => {
    initializeTest();
  }, [mode]);

  return (
    <Card className="h-full border-0 rounded-none shadow-none">
      <CardHeader>
        <h2 className="text-xl font-bold text-primary">词汇测试</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">生成测试中...</p>
          </div>
        ) : (
          <>
            {/* 提示词显示 */}
            {prompt && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-primary">提示词</h3>
                  <button
                    onClick={() => {
                      copyToClipboard(prompt);
                      toast({
                        title: "复制成功",
                        description: "提示词已复制到剪贴板",
                        duration: 2000,
                      });
                    }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    aria-label="复制提示词"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    复制
                  </button>
                </div>
                <Card className="border">
                  <CardContent className="h-48 overflow-y-auto">
                    <p className="text-card-foreground whitespace-pre-wrap">{prompt}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 测试结果显示 */}
            {testResult && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">测试结果</h3>
                <Card className="border">
                  <CardContent>
                    <p className="text-card-foreground whitespace-pre-wrap">{testResult}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 用户输入区 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">测试输入</h3>
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="请输入测试结果..."
                className="min-h-[120px]"
              />
            </div>

            {/* 提交按钮 */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !userInput.trim()}
              className="w-full"
            >
              提交测试结果
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// 词汇测试主组件，使用Modal包裹
const VocabularyTest: React.FC<VocabularyTestProps> = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay />
      <DialogContent 
        className="w-screen h-screen max-w-none sm:max-w-none p-0 overflow-hidden rounded-none fixed top-0 left-0 translate-x-0 translate-y-0"
        showCloseButton={false}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-1 left-1 bg-secondary hover:bg-accent p-2 rounded-full z-50"
          aria-label="返回"
        >
          <ArrowLeft size={24} className="text-primary-foreground" />
        </button>
        
        <Card className="h-full border-0 rounded-none shadow-none pt-12">
          <VocabularyTestContent />
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default VocabularyTest;