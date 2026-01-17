"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { copyToClipboard } from "@/lib/index";
import { useToast } from "@/hooks/use-toast";

interface PromptDisplayProps {
  prompt: string;
  onSubmit: (result: string) => void;
  onClose: () => void;
}

export default function PromptDisplay({ prompt, onSubmit, onClose }: PromptDisplayProps) {
  const [analysisResult, setAnalysisResult] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (analysisResult.trim()) {
      onSubmit(analysisResult.trim());
    }
  };

  const handleCopyPrompt = async () => {
    const success = await copyToClipboard(prompt);
    if (success) {
      toast({
        title: "复制成功",
        description: "提示词已复制到剪贴板",
        duration: 2000,
      });
    } else {
      toast({
        title: "复制失败",
        description: "请手动复制提示词",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="inset-0 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>提示词分析</CardTitle>
            <CardDescription>请使用下方提示词在AI平台获取分析结果，然后将结果粘贴到分析结果输入框中</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">提示词</label>
              <Textarea value={prompt} readOnly className="min-h-[300px] bg-gray-50" />
              <div className="mt-2 flex justify-end">
                <Button onClick={handleCopyPrompt} variant="secondary" size="sm">
                  复制提示词
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <label className="block text-sm font-medium mb-2">分析结果</label>
              <Textarea
                value={analysisResult}
                onChange={(e) => setAnalysisResult(e.target.value)}
                placeholder="请在此粘贴AI分析结果"
                className="min-h-[200px]"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button onClick={onClose} variant="secondary">
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={!analysisResult.trim()}>
                提交分析结果
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
