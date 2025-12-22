"use client";

// ============================================================
// 导入依赖
// ============================================================
import React, { useState, useEffect } from 'react';
import styles from '@/components/bank-campaign/campaign.module.css';
import { Card } from '@/components/bank-campaign/Card';
import { CollectionSlots } from '@/components/bank-campaign/CollectionSlots';
import { LoginModal } from '@/components/bank-campaign/LoginModal';
import { ResultModal } from '@/components/bank-campaign/ResultModal';
import { FinalRewardModal } from '@/components/bank-campaign/FinalRewardModal';
import { cn } from '@/lib/utils';

// ============================================================
// 常量定义
// ============================================================
// 五张福卡的文字：马上发财哇
const CARDS = ['马', '上', '发', '财', '哇'];

// ============================================================
// 主组件：集五福游戏页面
// ============================================================
export default function BankCampaignPage() {
  
  // ========================================
  // 状态管理（State）
  // ========================================
  
  // 入场页状态：true = 显示欢迎页，false = 进入游戏
  const [showWelcome, setShowWelcome] = useState(true);

  // 过渡动画状态：控制淡入淡出效果
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 游戏页淡入状态
  const [gamePageReady, setGamePageReady] = useState(false);

  // 当进入游戏页时，触发淡入动画
  useEffect(() => {
    if (!showWelcome) {
      // 延迟一帧后触发淡入，确保 DOM 已渲染
      requestAnimationFrame(() => {
        setGamePageReady(true);
      });
    }
  }, [showWelcome]);

  /**
   * 播放点击音效（使用 Web Audio API 生成）
   */
  const playClickSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      // 创建振荡器（音调）
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 设置音效参数：清脆的点击声
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      oscillator.type = 'sine';

      // 音量渐变：快速淡出
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      // 播放
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // 如果浏览器不支持，静默失败
    }
  };
  
  // 收集状态：记录 5 张卡片是否被收集
  
  // 例如：[true, false, true, false, false] 表示收集了第 1 和第 3 张
  const [collected, setCollected] = useState<boolean[]>([false, false, false, false, false]);
  
  // 用户手机号：登录时保存
  const [userPhone, setUserPhone] = useState('');
  
  // 卡片翻转状态：true = 正在翻转，false = 静止
  const [isFlipped, setIsFlipped] = useState(false);
  
  // 当前抽到的卡片文字：'马'、'上'、'发'、'财' 或 '哇'
  const [currentResult, setCurrentResult] = useState('');
  
  // ========================================
  // 弹窗显示状态
  // ========================================
  
  // 登录弹窗：点击抽卡时才显示
  const [showLogin, setShowLogin] = useState(false);
  
  // 结果弹窗：抽卡后显示结果
  const [showResult, setShowResult] = useState(false);
  
  // 最终奖励弹窗：集齐 5 张后显示
  const [showFinal, setShowFinal] = useState(false);

  // ========================================
  // 业务逻辑函数
  // ========================================
  
  /**
   * 处理用户登录
   * @param phone - 用户输入的手机号
   */
  const handleLogin = (phone: string) => {
    setUserPhone(phone);      // 保存手机号
    setShowLogin(false);      // 关闭登录弹窗
  };

  /**
   * 抽卡算法：随机选择一张还没收集的卡
   * @returns 卡片的索引（0-4）
   */
  const getLuckyIndex = () => {
    // 找出所有还没收集的卡片的索引
    const missing: number[] = [];
    collected.forEach((v, i) => { 
      if(!v) missing.push(i);  // v 为 false 表示还没收集
    });
    
    if (missing.length > 0) {
      // 从没收集的卡中随机选一张（100% 抽到新卡，方便演示）
      return missing[Math.floor(Math.random() * missing.length)];
    }
    
    // 如果都收集了，随机返回一个（这种情况不应该发生）
    return Math.floor(Math.random() * 5);
  };

  /**
   * 抽卡主函数：处理点击卡片的逻辑
   */
  const drawCard = () => {
    // -------- 第 1 步：检查是否登录 --------
    if (!userPhone) {
      setShowLogin(true);  // 没登录，显示登录弹窗
      return;              // 终止后续流程
    }
    
    // -------- 第 2 步：检查是否已经集齐 --------
    if (collected.every(Boolean)) {  // every(Boolean) 检查是否全部为 true
      setShowFinal(true);            // 已集齐，显示最终奖励
      return;
    }

    // -------- 第 3 步：防止重复点击 --------
    if (isFlipped) return;  // 如果正在翻转，不响应点击

    // -------- 第 4 步：执行抽卡 --------
    const newIndex = getLuckyIndex();    // 调用抽卡算法，获取索引
    const char = CARDS[newIndex];        // 根据索引获取卡片文字
    setCurrentResult(char);              // 保存抽卡结果
    
    // -------- 第 5 步：开始翻转动画 --------
    setIsFlipped(true);

    // -------- 第 6 步：等待 800ms 后更新收集状态 --------
    setTimeout(() => {
      // 复制数组（React 要求不能直接修改 state）
      const newCollected = [...collected];
      // 将抽到的卡标记为已收集
      newCollected[newIndex] = true;
      // 更新状态
      setCollected(newCollected);
      
      // -------- 第 7 步：再等待 500ms 显示结果弹窗 --------
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }, 800);
  };

  /**
   * 关闭结果弹窗
   */
  const closeResult = () => {
    // 关闭结果弹窗
    setShowResult(false);
    
    // 300ms 后让卡片翻回背面
    setTimeout(() => {
      setIsFlipped(false);
    }, 300);

    // 检查是否集齐了所有卡片
    if (collected.every(Boolean)) {
      // 如果集齐了，800ms 后显示最终奖励弹窗
      setTimeout(() => {
        setShowFinal(true);
      }, 800);
    }
  };

  /**
   * 重置游戏：点击"重置"按钮时调用
   */
  const resetDemo = () => {
    setCollected([false, false, false, false, false]);  // 清空收集记录
    setIsFlipped(false);                                // 卡片翻回背面
    setShowFinal(false);                                // 关闭最终奖励弹窗
    setShowResult(false);                               // 关闭结果弹窗
    setShowLogin(false);                                // 关闭登录弹窗
    setUserPhone('');                                   // 清空手机号
    setShowWelcome(true);                               // 回到欢迎页
    setIsTransitioning(false);                          // 重置过渡状态
    setGamePageReady(false);                            // 重置游戏页淡入状态
  };

  /**
   * 处理从欢迎页到游戏页的过渡
   */
  const handleStartGame = () => {
    playClickSound();          // 播放点击音效
    setIsTransitioning(true);  // 开始过渡动画
    setTimeout(() => {
      setShowWelcome(false);   // 切换到游戏页
    }, 600);  // 等待淡出动画完成
  };

  // ========================================
  // 渲染 UI
  // ========================================
  
  // 如果显示欢迎页，渲染入场页面
  if (showWelcome) {
    return (
      <div className="w-full h-screen bg-[#f5f5f7] overflow-hidden font-sans">
        <div
          className={cn(
            "relative w-full h-full max-w-[480px] mx-auto shadow-2xl overflow-hidden transition-all duration-[600ms] ease-out",
            isTransitioning && "opacity-0 scale-105"
          )}
        >
          {/* 欢迎页背景图 */}
          <img
            src="/images/welcome-cover.png"
            alt="欢迎"
            className="w-full h-full object-cover"
          />
          {/* 点击进入按钮 */}
          <button
            onClick={handleStartGame}
            disabled={isTransitioning}
            className={cn(
              "absolute bottom-[6%] left-1/2 -translate-x-1/2 bg-white/95 text-[#b81c22] px-14 py-3.5 rounded-full text-lg font-semibold tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.15)] active:scale-[0.97] transition-all backdrop-blur-sm",
              isTransitioning && "opacity-0 translate-y-4"
            )}
          >开始集福</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-screen bg-[#f5f5f7] overflow-hidden font-sans">
      {/* 主容器 */}
      <div className={cn(
        "relative w-full h-full max-w-[480px] mx-auto flex flex-col items-center shadow-2xl overflow-hidden transition-all duration-[600ms] ease-out",
        styles.campaignRoot,
        gamePageReady ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}>
        
        {/* ==================== 控制按钮区域 ==================== */}
        <div className="absolute top-4 right-4 z-[200] flex gap-2">
          {/* 重置按钮 */}
          <button 
            onClick={resetDemo}
            className="bg-black/10 backdrop-blur-md text-white/80 px-3 py-1 rounded-full text-xs hover:bg-black/20 transition-all flex items-center"
          >
            ↻ 重置
          </button>
        </div>

        {/* ==================== 标题区域 ==================== */}
        <div className="mt-[8vh] z-10 text-center">
          {/* 副标题 */}
          <div className="text-white/80 text-sm tracking-[2px] mb-1 font-light opacity-90">
            银行开门红活动
          </div>
          {/* 主标题 */}
          <div className={cn(styles.titleMain, "text-4xl font-black tracking-widest")}>
            集五福 · 赢大奖
          </div>
        </div>

        {/* ==================== 抽卡区域 ==================== */}
        <div className="flex-1 w-full flex justify-center items-center relative z-10 perspective-[1200px]">
          <Card 
            isFlipped={isFlipped}        // 传递翻转状态
            resultChar={currentResult}   // 传递抽到的文字
            onDraw={drawCard}            // 点击时调用 drawCard
            disabled={false}             // 是否禁用（目前未使用）
          />
        </div>

        {/* ==================== 收集槽区域 ==================== */}
        <CollectionSlots 
          collected={collected}  // 传递收集状态数组
          cards={CARDS}          // 传递卡片文字数组
        />

        {/* ==================== 弹窗区域 ==================== */}
        
        {/* 登录弹窗：用户首次进入时显示 */}
        <LoginModal 
          isOpen={showLogin}                      // 是否显示
          onLogin={handleLogin}                   // 登录成功回调
          onClose={() => setShowLogin(false)}     // 关闭回调
        />
        
        {/* 结果弹窗：抽卡后显示结果 */}
        <ResultModal 
          isOpen={showResult}     // 是否显示
          char={currentResult}    // 显示抽到的文字
          onClose={closeResult}   // 关闭回调
        />
        
        {/* 最终奖励弹窗：集齐 5 张后显示 */}
        <FinalRewardModal 
          isOpen={showFinal}                     // 是否显示
          userPhone={userPhone}                  // 显示用户手机号
          onClose={() => setShowFinal(false)}    // 关闭回调
        />
      </div>
    </div>
  );
}