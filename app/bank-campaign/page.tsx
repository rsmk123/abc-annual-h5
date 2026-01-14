"use client";

// ============================================================
// 导入依赖
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import styles from '@/components/bank-campaign/campaign.module.css';
import { Card, DrawPhase } from '@/components/bank-campaign/Card';
import { CollectionSlots } from '@/components/bank-campaign/CollectionSlots';
import { LoginModal } from '@/components/bank-campaign/LoginModal';
import { ResultModal } from '@/components/bank-campaign/ResultModal';
import { FinalRewardModal } from '@/components/bank-campaign/FinalRewardModal';
import { RulesModal } from '@/components/bank-campaign/RulesModal';
import { DebugPanel } from '@/components/bank-campaign/DebugPanel';
import { DrawButton, RulesButton } from '@/components/bank-campaign/DrawButton';
import { ClientPortal } from '@/components/bank-campaign/ClientPortal';
import { FrameAnimation } from '@/components/bank-campaign/FrameAnimation';
import { cn } from '@/lib/utils';

// 卡片字符到序列帧文件夹的映射
const CARD_FRAME_FOLDERS: Record<string, string> = {
  '马': 'ma',
  '上': 'shang',
  '发': 'fa',
  '财': 'cai',
  '蛙': 'wa',
};
import { CARDS, CardChar } from '@/lib/cardConfig';
import { getUserStatus, drawCard as drawCardApi } from '@/lib/api';

// ============================================================
// 主组件：集五福游戏页面
// ============================================================
export default function BankCampaignPage() {

  // ========================================
  // 状态管理（State）
  // ========================================

  // 入场页状态
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gamePageReady, setGamePageReady] = useState(false);

  // 背景音乐状态
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 今日是否已抽卡
  const [hasDrawnToday, setHasDrawnToday] = useState(false);

  // 收集状态：记录 5 张卡片是否被收集
  const [collected, setCollected] = useState<boolean[]>([false, false, false, false, false]);

  // 每张卡的数量
  const [cardCounts, setCardCounts] = useState<number[]>([0, 0, 0, 0, 0]);

  // 用户手机号
  const [userPhone, setUserPhone] = useState('');

  // 抽卡阶段状态
  const [drawPhase, setDrawPhase] = useState<DrawPhase>('idle');

  // 当前抽到的卡片
  const [currentResult, setCurrentResult] = useState<CardChar | null>(null);

  // 抽卡动画结束回调（由抽卡动画 video 触发）
  const drawAnimationDoneRef = useRef<(() => void) | null>(null);
  const [showDrawAnimationVideo, setShowDrawAnimationVideo] = useState(false);
  const [drawAnimationVideoKey, setDrawAnimationVideoKey] = useState(0);

  // ========================================
  // 弹窗显示状态
  // ========================================
  const [showLogin, setShowLogin] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // 最终弹窗显示状态（动画播完后显示）
  const [showFinalModal, setShowFinalModal] = useState(false);

  // Toast 提示状态
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 测试模式状态（默认开启，方便UI测试）
  const [testMode, setTestMode] = useState(true);

  // ========================================
  // 初始化：从 localStorage 恢复状态
  // ========================================
  useEffect(() => {
    const lastDrawDate = localStorage.getItem('lastDrawDate');
    const today = new Date().toDateString();
    if (lastDrawDate === today) {
      setHasDrawnToday(true);
    }

    // 恢复收集状态
    const savedCollected = localStorage.getItem('abc_collected');
    if (savedCollected) {
      try {
        setCollected(JSON.parse(savedCollected));
      } catch {}
    }

    // 恢复卡片数量
    const savedCounts = localStorage.getItem('abc_card_counts');
    if (savedCounts) {
      try {
        setCardCounts(JSON.parse(savedCounts));
      } catch {}
    }

    // 恢复用户手机号
    const savedPhone = localStorage.getItem('abc_user_phone');
    if (savedPhone) {
      setUserPhone(savedPhone);
    }

    // 恢复测试模式状态
    const savedTestMode = localStorage.getItem('abc_test_mode');
    if (savedTestMode === 'true') {
      setTestMode(true);
    }

    // 延迟预加载骑马序列帧（127帧）
    const preloadHorseFrames = () => {
      for (let i = 0; i < 127; i++) {
        const img = new Image();
        img.src = `/images/frames/horse-ride/骑马青蛙_${String(i).padStart(5, '0')}.png`;
      }
    };

    // 等其他资源加载完成后再预加载
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
        .requestIdleCallback(preloadHorseFrames, { timeout: 3000 });
    } else {
      setTimeout(preloadHorseFrames, 2000);
    }
  }, []);

  // ========================================
  // 状态持久化
  // ========================================
  useEffect(() => {
    localStorage.setItem('abc_collected', JSON.stringify(collected));
  }, [collected]);

  useEffect(() => {
    localStorage.setItem('abc_card_counts', JSON.stringify(cardCounts));
  }, [cardCounts]);

  // ========================================
  // 业务逻辑函数
  // ========================================

  /**
   * 播放点击音效
   */
  const playClickSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {}
  };

  /**
   * 显示 Toast 提示
   */
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  /**
   * 处理用户登录
   */
  const handleLogin = async (phone: string) => {
    setUserPhone(phone);
    localStorage.setItem('abc_user_phone', phone);
    setShowLogin(false);

    // 非测试模式：从数据库加载卡片状态
    if (!testMode) {
      try {
        const status = await getUserStatus() as {
          success: boolean;
          data?: {
            cards: boolean[];
            collectedCount: number;
            isCompleted: boolean;
            lastDrawAt: string | null;
          };
        };
        if (status.data) {
          setCollected(status.data.cards);
          // 检查今日是否已抽卡
          if (status.data.lastDrawAt) {
            const lastDraw = new Date(status.data.lastDrawAt);
            const today = new Date();
            // 比较北京时间的日期
            if (lastDraw.toDateString() === today.toDateString()) {
              setHasDrawnToday(true);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load user status:', e);
      }
    }
  };

  /**
   * 抽卡算法：5-10天内集齐的概率控制
   */
  const getLuckyIndex = (): number => {
    // 找出未收集的卡片索引
    const missingIndices: number[] = [];
    const collectedIndices: number[] = [];

    collected.forEach((isCollected, index) => {
      if (isCollected) {
        collectedIndices.push(index);
      } else {
        missingIndices.push(index);
      }
    });

    // 如果全部收集完，随机返回
    if (missingIndices.length === 0) {
      return Math.floor(Math.random() * 5);
    }

    // 如果还没收集任何卡，100% 抽新卡
    if (collectedIndices.length === 0) {
      return missingIndices[Math.floor(Math.random() * missingIndices.length)];
    }

    // 获取累计抽卡次数
    const totalDrawCount = cardCounts.reduce((a, b) => a + b, 0);

    // 根据抽卡次数确定抽到新卡的概率
    let newCardProbability: number;
    if (totalDrawCount < 3) {
      newCardProbability = 0.7;
    } else if (totalDrawCount < 6) {
      newCardProbability = 0.5;
    } else if (totalDrawCount < 9) {
      newCardProbability = 0.8;
    } else {
      newCardProbability = 1.0;
    }

    // 只剩1张卡没收集时，提高概率
    if (missingIndices.length === 1 && totalDrawCount >= 5) {
      newCardProbability = Math.max(newCardProbability, 0.9);
    }

    // 抽取
    const random = Math.random();
    if (random < newCardProbability) {
      return missingIndices[Math.floor(Math.random() * missingIndices.length)];
    } else {
      return collectedIndices[Math.floor(Math.random() * collectedIndices.length)];
    }
  };

  /**
   * 抽卡主函数
   */
  const drawCard = async () => {
    // 测试模式：跳过登录检查
    if (!testMode && !userPhone) {
      setShowLogin(true);
      return;
    }

    // 测试模式：跳过每日抽卡限制
    if (!testMode && hasDrawnToday) {
      return;
    }

    // 检查是否已集齐
    if (collected.every(Boolean)) {
      setShowFinal(true);
      return;
    }

    // 防止重复点击
    if (drawPhase !== 'idle') return;

    // 播放音效
    playClickSound();

    // 1. 开始旋转动画
    setDrawPhase('spinning');

    // 等待抽卡序列帧动画播放结束（兜底 4 秒，75帧/25fps = 3秒）
    const waitForDrawAnimationEnd = () =>
      new Promise<void>((resolve) => {
        let finished = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const finish = () => {
          if (finished) return;
          finished = true;
          if (timeoutId) clearTimeout(timeoutId);
          drawAnimationDoneRef.current = null;
          resolve();
        };

        drawAnimationDoneRef.current = finish;
        timeoutId = setTimeout(finish, 4000);
      });

    // 2. 执行抽卡：测试模式用本地算法，非测试模式调用后端 API
    let newIndex: number;
    let apiCards: boolean[] | null = null;

    if (testMode) {
      // 测试模式：使用本地算法
      newIndex = getLuckyIndex();
    } else {
      // 非测试模式：调用后端 API
      try {
        const deviceId = localStorage.getItem('deviceId') || 'unknown';
        const result = await drawCardApi(deviceId) as {
          success: boolean;
          data?: {
            cardIndex: number;
            cardText: string;
            isNew: boolean;
            cards: boolean[];
            isCompleted: boolean;
          };
          error?: string;
        };

        if (!result.success || !result.data) {
          // API 失败（如今日已抽卡）
          setDrawPhase('idle');
          if (result.error?.includes('今天已经抽过') || result.error?.includes('明天再来')) {
            setHasDrawnToday(true);
            showToastMessage('每天可抽卡一次，请明天再来哦');
          } else {
            showToastMessage(result.error || '抽卡失败，请稍后重试');
          }
          return;
        }

        newIndex = result.data.cardIndex;
        apiCards = result.data.cards;
        setHasDrawnToday(true); // 后端已记录
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : '未知错误';
        console.error('Draw card API failed:', errorMessage);
        setDrawPhase('idle');
        
        // 检查是否是"今日已抽卡"错误
        if (errorMessage.includes('今天已经抽过') || errorMessage.includes('明天再来')) {
          setHasDrawnToday(true);
          showToastMessage('每天可抽卡一次，请明天再来哦');
        } else {
          showToastMessage('网络错误，请稍后重试');
        }
        return;
      }
    }

    const char = CARDS[newIndex] as CardChar;
    
    // 3. 开始播放动画
    setShowDrawAnimationVideo(true);
    setDrawAnimationVideoKey((k) => k + 1);
    // 提前设置结果，让动画组件知道播放哪个卡片的序列帧（如果有两段式）
    setCurrentResult(char);

    // 4. 等待动画完成（视频结束）
    await waitForDrawAnimationEnd();

    // 5. 显示结果
    setDrawPhase('revealing');

    // 6. 更新收集状态
    if (apiCards) {
      // 非测试模式：使用后端返回的数据
      setCollected(apiCards);
    } else {
      // 测试模式：本地更新
      const newCollected = [...collected];
      newCollected[newIndex] = true;
      setCollected(newCollected);

      // 更新卡片数量（仅测试模式）
      const newCounts = [...cardCounts];
      newCounts[newIndex] += 1;
      setCardCounts(newCounts);
    }

    // 7. 显示结果弹窗
    setTimeout(() => {
      setShowResult(true);
      setDrawPhase('done');
    }, 500);
  };

  /**
   * 关闭结果弹窗
   */
  const closeResult = () => {
    setShowResult(false);
    setShowDrawAnimationVideo(false); // 关闭弹窗时隐藏序列帧动画

    // 重置抽卡状态
    setTimeout(() => {
      setDrawPhase('idle');
    }, 300);

    // 检查是否集齐
    if (collected.every(Boolean)) {
      setTimeout(() => {
        setShowFinal(true);
      }, 800);
    }
  };

  /**
   * 小重置 - 只重置福卡收集进度和今日抽卡状态
   */
  const resetCards = () => {
    setCollected([false, false, false, false, false]);
    setCardCounts([0, 0, 0, 0, 0]);
    setDrawPhase('idle');
    setCurrentResult(null);
    setShowFinal(false);
    setShowResult(false);
    setHasDrawnToday(false);
    localStorage.removeItem('lastDrawDate');
    localStorage.removeItem('abc_collected');
    localStorage.removeItem('abc_card_counts');
  };

  /**
   * 大重置 - 完全重置所有状态（包括登录信息）
   */
  const resetAll = () => {
    // 先执行小重置
    setCollected([false, false, false, false, false]);
    setCardCounts([0, 0, 0, 0, 0]);
    setDrawPhase('idle');
    setCurrentResult(null);
    setShowFinal(false);
    setShowResult(false);
    setHasDrawnToday(false);
    // 再重置登录状态
    setShowLogin(false);
    setUserPhone('');
    setShowWelcome(true);
    setIsTransitioning(false);
    setGamePageReady(false);
    // 清除所有本地存储
    localStorage.removeItem('lastDrawDate');
    localStorage.removeItem('abc_collected');
    localStorage.removeItem('abc_card_counts');
    localStorage.removeItem('abc_user_phone');
    localStorage.removeItem('deviceId');
    // 停止音乐
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsMusicPlaying(false);
  };

  /**
   * 老板键 - 直接集齐5张卡并显示最终弹窗
   */
  const bossKey = () => {
    // 设置所有卡片为已收集
    setCollected([true, true, true, true, true]);
    setCardCounts([1, 1, 1, 1, 1]);
    // 保存到 localStorage
    localStorage.setItem('abc_collected', JSON.stringify([true, true, true, true, true]));
    localStorage.setItem('abc_card_counts', JSON.stringify([1, 1, 1, 1, 1]));
    // 触发最终弹窗（会先播放骑马动画）
    setShowFinal(true);
  };

  /**
   * 快速登录 - 测试模式下直接设置手机号
   */
  const quickLogin = () => {
    const testPhone = '13800138000';
    setUserPhone(testPhone);
    localStorage.setItem('abc_user_phone', testPhone);
    setShowLogin(false);
  };

  /**
   * 设置卡片数量 - 用于调试
   */
  const setCards = (count: number) => {
    const newCollected = CARDS.map((_, idx) => idx < count);
    const newCounts = CARDS.map((_, idx) => idx < count ? 1 : 0);
    setCollected(newCollected);
    setCardCounts(newCounts);
    localStorage.setItem('abc_collected', JSON.stringify(newCollected));
    localStorage.setItem('abc_card_counts', JSON.stringify(newCounts));
    // 如果集齐5张，触发最终弹窗
    if (count === 5) {
      setShowFinal(true);
    }
  };

  /**
   * 切换测试模式
   */
  const handleTestModeChange = (mode: boolean) => {
    setTestMode(mode);
    localStorage.setItem('abc_test_mode', mode ? 'true' : 'false');
  };

  /**
   * 切换背景音乐
   */
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  /**
   * 开始游戏
   */
  const handleStartGame = () => {
    playClickSound();
    setIsTransitioning(true);
    setGamePageReady(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {});
    }
    setTimeout(() => {
      setShowWelcome(false);
    }, 600);
  };

  // ========================================
  // 渲染 UI
  // ========================================
  return (
    <div className="w-full h-screen bg-[#1a0808] overflow-hidden font-sans">
      {/* 外层容器 - 撑满屏幕 */}
      <div className="relative w-full h-full max-w-[480px] mx-auto">

        {/* ==================== 背景图层（自适应撑满） ==================== */}
        <div className={cn(
          "absolute inset-0 transition-all duration-[600ms] ease-out",
          styles.campaignRoot,
          gamePageReady ? "opacity-100" : "opacity-0"
        )}>
          {/* 背景图会通过 CSS 设置，这里作为背景容器 */}
        </div>

        {/* ==================== 主内容区（9:16 比例居中） ==================== */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          style={{
            aspectRatio: '9/16',
            width: 'min(100%, calc(100vh * 9 / 16))',
            height: 'min(100%, calc(100vw * 16 / 9))',
            maxHeight: '100%',
          }}
        >

        {/* ==================== 游戏页内容 ==================== */}
        <div className={cn(
          "absolute inset-0 flex flex-col transition-all duration-[600ms] ease-out",
          gamePageReady ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>

          {/* ==================== 调试面板 ==================== */}
          <DebugPanel
            testMode={testMode}
            onTestModeChange={handleTestModeChange}
            userPhone={userPhone}
            collected={collected}
            cardCounts={cardCounts}
            onQuickLogin={quickLogin}
            onSetCards={setCards}
            onResetSmall={resetCards}
            onResetLarge={resetAll}
            onBossKey={bossKey}
          />

          {/* ==================== 音乐按钮 ==================== */}
          <button
            onClick={toggleMusic}
            className="absolute top-4 right-4 z-[200] bg-black/10 backdrop-blur-md text-white/80 w-10 h-10 rounded-full hover:bg-black/20 transition-all flex items-center justify-center"
            aria-label={isMusicPlaying ? '关闭音乐' : '开启音乐'}
          >
            {isMusicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* ==================== 顶部Logo区域 ==================== */}
          <div className="flex justify-end items-center px-2 pt-2 z-10">
            {/* 银联logo - 锦绣中华 */}
            <img
              src="/images/campaign/design/unionpay-logo.png"
              alt="银联"
              className="h-7 object-contain"
            />
          </div>

          {/* ==================== 标题区域 ==================== */}
          <div className="mt-2 z-10 text-center px-2">
            {/* 主标题 - 使用设计稿图片 */}
            <img
              src="/images/campaign/design/title.png"
              alt="集福卡抽大奖"
              className="w-full"
            />
            {/* 副标题 - 使用设计稿图片 */}
            <img
              src="/images/campaign/design/subtitle.png"
              alt="农行哇宝请吃年夜饭啦"
              className="w-full max-w-[240px] mx-auto -mt-8"
            />
          </div>

          {/* ==================== 主抽卡区域 ==================== */}
          <div className="flex-1 w-full relative z-10">
            {/* 
              卡片位置计算（基于 1080×1920 设计稿）:
              - 卡片在设计稿中: x=191, y=477, 宽=688, 高=912
              - 卡片中心: x=535 (49.5%), y=933 (48.6%)
              - 卡片尺寸占比: 宽=63.7%, 高=47.5%
            */}
            <div 
              className="absolute z-10"
              style={{
                left: '49.5%',
                top: '38%',
                transform: 'translate(-50%, -50%)',
                width: '65%',
                aspectRatio: '688/912',
              }}
            >
              {/* 卡片组件 */}
              <Card
                drawPhase={drawPhase}
                resultChar={currentResult}
                onDraw={drawCard}
                disabled={false}
                hasDrawnToday={hasDrawnToday}
              />


              {/* 抽卡按钮 - 重叠在卡片底部 */}
              <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[90%] z-20">
                <DrawButton
                  onClick={drawCard}
                  disabled={collected.every(Boolean)}
                  hasDrawnToday={hasDrawnToday}
                  isDrawing={drawPhase === 'spinning'}
                />
              </div>
            </div>
          </div>

          {/* ==================== 收集槽区域（固定在底部） ==================== */}
          <div className="absolute bottom-[5%] left-0 right-0 z-10">
            <CollectionSlots
              collected={collected}
              cardCounts={cardCounts}
              onCardClick={(char) => {
                setCurrentResult(char);
                setShowResult(true);
              }}
            />
          </div>

          {/* ==================== 规则按钮 ==================== */}
          <div className="w-full flex justify-center py-4 z-10">
            <RulesButton onClick={() => setShowRules(true)} />
          </div>
        </div>

        {/* ==================== 弹窗区域（移到外层，确保层级正确） ==================== */}
        <LoginModal
          isOpen={showLogin}
          testMode={testMode}
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
        />

        {currentResult && (
          <ResultModal
            isOpen={showResult}
            char={currentResult}
            onClose={closeResult}
          />
        )}

        <FinalRewardModal
          isOpen={showFinal}
          userPhone={userPhone}
          onClose={() => setShowFinal(false)}
        />

        <RulesModal
          isOpen={showRules}
          onClose={() => setShowRules(false)}
        />

        {/* ==================== 欢迎页（顶层）- Portal 到 body，异形屏也真正全屏 ==================== */}
        {showWelcome && (
          <ClientPortal>
            <div
              className={cn(
                "fixed inset-0 z-[1000] transition-all duration-[600ms] ease-out",
                isTransitioning ? "opacity-0 scale-105" : "opacity-100 scale-100"
              )}
            >
              {/* 欢迎页烟花视频背景 - 放大充满屏幕 */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ 
                  minWidth: '100%', 
                  minHeight: '100%',
                  objectFit: 'cover',
                }}
              >
                <source src="/video/fireworks-v3.m4v" type="video/mp4" />
              </video>
              
              {/* 点击进入按钮 - 带呼吸动画，固定在底部 */}
              <div className="absolute bottom-[8%] left-0 right-0 flex justify-center">
                <img
                  src="/images/start-btn.png"
                  alt="立即参与"
                  onClick={handleStartGame}
                  className={cn(
                    "w-[38%] max-w-[160px] cursor-pointer",
                    styles.breathingBtn,
                    isTransitioning && "opacity-0 translate-y-4"
                  )}
                />
              </div>
            </div>
          </ClientPortal>
        )}

        {/* ==================== 背景音乐 ==================== */}
        <audio
          ref={audioRef}
          src="/audio/bgm.mp3"
          loop
          preload="auto"
        />

        {/* ==================== 抽卡旋转动画（全屏覆盖）- 序列帧版本 ==================== */}
        {showDrawAnimationVideo && currentResult && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <FrameAnimation
              key={drawAnimationVideoKey}
              framePrefix="/images/frames/card-spin/common/集福卡_"
              totalFrames={46}
              fps={25}
              loop={false}
              secondPrefix={`/images/frames/card-spin/${CARD_FRAME_FOLDERS[currentResult]}/集福卡_`}
              secondStartIndex={46}
              secondFrames={29}
              onComplete={() => drawAnimationDoneRef.current?.()}
              className="w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
