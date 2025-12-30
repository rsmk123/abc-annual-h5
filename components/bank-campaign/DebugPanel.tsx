"use client";

import React, { useState, useEffect } from 'react';
import { Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, CardChar } from '@/lib/cardConfig';

interface DebugPanelProps {
  // 测试模式
  testMode: boolean;
  onTestModeChange: (mode: boolean) => void;
  // 当前状态
  userPhone: string;
  collected: boolean[];
  cardCounts: number[];
  // 操作回调
  onQuickLogin: () => void;
  onSetCards: (count: number) => void;
  onResetSmall: () => void;
  onResetLarge: () => void;
  onBossKey: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  testMode,
  onTestModeChange,
  userPhone,
  collected,
  cardCounts,
  onQuickLogin,
  onSetCards,
  onResetSmall,
  onResetLarge,
  onBossKey,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 计算已收集卡片数
  const collectedCount = collected.filter(Boolean).length;
  
  // 格式化手机号（隐藏中间4位）
  const formatPhone = (phone: string) => {
    if (!phone || phone.length !== 11) return phone || '未登录';
    return `${phone.slice(0, 3)}****${phone.slice(7)}`;
  };

  // 收起状态：只显示一个小图标
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed top-4 left-4 z-[300] w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-black/30 transition-all shadow-lg"
        title="打开调试面板"
      >
        <Settings size={18} />
      </button>
    );
  }

  // 展开状态：完整面板
  return (
    <div className="fixed top-4 left-4 z-[300] w-[280px] bg-black/80 backdrop-blur-md rounded-xl text-white text-sm shadow-2xl overflow-hidden">
      {/* 标题栏 */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-white/10 cursor-pointer"
        onClick={() => setIsExpanded(false)}
      >
        <div className="flex items-center gap-2">
          <Settings size={16} />
          <span className="font-medium">调试面板</span>
        </div>
        <ChevronUp size={16} />
      </div>

      {/* 模式切换 */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white/60">模式:</span>
          <button
            onClick={() => onTestModeChange(true)}
            className={cn(
              "px-2 py-0.5 rounded text-xs transition-all",
              testMode 
                ? "bg-green-500 text-white" 
                : "bg-white/10 text-white/60 hover:bg-white/20"
            )}
          >
            测试
          </button>
          <button
            onClick={() => onTestModeChange(false)}
            className={cn(
              "px-2 py-0.5 rounded text-xs transition-all",
              !testMode 
                ? "bg-blue-500 text-white" 
                : "bg-white/10 text-white/60 hover:bg-white/20"
            )}
          >
            真实
          </button>
        </div>
        <div className="text-white/50 text-xs">
          {testMode ? '⚡ 跳过API验证，纯前端测试' : '🔗 调用真实API，数据库同步'}
        </div>
      </div>

      {/* 当前状态 */}
      <div className="px-3 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/60">登录:</span>
          <span className={userPhone ? 'text-green-400' : 'text-white/40'}>
            {formatPhone(userPhone)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60">收集:</span>
          <div className="flex items-center gap-1">
            {CARDS.map((char, idx) => (
              <span 
                key={char} 
                className={cn(
                  "w-5 h-5 rounded text-xs flex items-center justify-center",
                  collected[idx] 
                    ? "bg-yellow-500/80 text-white" 
                    : "bg-white/10 text-white/30"
                )}
              >
                {char}
              </span>
            ))}
            <span className="ml-1 text-white/40">({collectedCount}/5)</span>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="text-white/60 text-xs mb-2">快捷操作:</div>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <button
            onClick={onQuickLogin}
            disabled={!!userPhone}
            className="px-2 py-1.5 bg-purple-500/80 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/30 rounded text-xs transition-all"
          >
            快速登录
          </button>
          {[1, 2, 3, 4, 5].map(count => (
            <button
              key={count}
              onClick={() => onSetCards(count)}
              className={cn(
                "px-2 py-1.5 rounded text-xs transition-all",
                count === 5 
                  ? "bg-yellow-500/80 hover:bg-yellow-500" 
                  : "bg-white/20 hover:bg-white/30"
              )}
            >
              {count === 5 ? '⭐ 集齐' : `集${count}张`}
            </button>
          ))}
        </div>
      </div>

      {/* 重置操作 */}
      <div className="px-3 py-2">
        <div className="text-white/60 text-xs mb-2">重置:</div>
        <div className="flex gap-2">
          <button
            onClick={onResetSmall}
            className="flex-1 px-2 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs transition-all"
          >
            ↻ 小重置
          </button>
          <button
            onClick={onResetLarge}
            className="flex-1 px-2 py-1.5 bg-red-500/80 hover:bg-red-500 rounded text-xs transition-all"
          >
            ↻ 大重置
          </button>
        </div>
        <div className="text-white/40 text-[10px] mt-1.5">
          小=保留登录 | 大=清除全部
        </div>
      </div>
    </div>
  );
};

