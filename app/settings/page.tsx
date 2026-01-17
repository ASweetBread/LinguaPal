"use client";
import React from "react";
import { useUserConfigStore } from "../store";
import NavBar from "../components/NavBar";
import { LEARNING_MODES, LearningMode } from "@/config/app";

// 定义底部状态栏组件
function BottomStatusBar() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
      <p>© 2024 LinguaPal AI语言学习助手 | 专注于提升您的口语能力</p>
    </footer>
  );
}

const SettingsPage = () => {
  const { mode, updateMode, aiServices, updateAIServices } = useUserConfigStore();

  // 更新模式
  const handleModeChange = (newMode: LearningMode) => {
    updateMode(newMode);
  };

  // 更新AI服务
  const handleAIServiceChange = (serviceType: "textAI" | "asrService" | "ttsService", serviceValue: string) => {
    updateAIServices({ [serviceType]: serviceValue as any });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">个人配置</h1>

          {/* 模式选择 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">学习模式</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value={LEARNING_MODES.NORMAL}
                  checked={mode === LEARNING_MODES.NORMAL}
                  onChange={() => handleModeChange(LEARNING_MODES.NORMAL)}
                  className="text-blue-600 dark:text-blue-400"
                />
                <span className="text-gray-700 dark:text-gray-300">正常模式</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value={LEARNING_MODES.PROMPT}
                  checked={mode === LEARNING_MODES.PROMPT}
                  onChange={() => handleModeChange(LEARNING_MODES.PROMPT)}
                  className="text-blue-600 dark:text-blue-400"
                />
                <span className="text-gray-700 dark:text-gray-300">提示词模式</span>
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              正常模式：直接调用AI生成对话；提示词模式：生成提示词供您在其他AI平台使用
            </p>
          </div>

          {/* AI服务配置 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">AI服务配置</h2>

            {/* 文本对话AI */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文本对话AI服务</label>
              <select
                value={aiServices.textAI}
                onChange={(e) => handleAIServiceChange("textAI", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="zhipu">智谱AI</option>
                <option value="openai">OpenAI</option>
                <option value="other">其他服务</option>
              </select>
            </div>

            {/* ASR服务 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                语音识别(ASR)服务
              </label>
              <select
                value={aiServices.asrService}
                onChange={(e) => handleAIServiceChange("asrService", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="whisper">OpenAI Whisper</option>
                <option value="aliyun">阿里云ASR</option>
                <option value="tencent">腾讯云ASR</option>
              </select>
            </div>

            {/* TTS服务 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                语音合成(TTS)服务
              </label>
              <select
                value={aiServices.ttsService}
                onChange={(e) => handleAIServiceChange("ttsService", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="browser">浏览器内置</option>
                <option value="openai">OpenAI TTS</option>
                <option value="aliyun">阿里云TTS</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <BottomStatusBar />
    </div>
  );
};

export default SettingsPage;
