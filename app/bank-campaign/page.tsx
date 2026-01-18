"use client";

// ============================================================
// 导入依赖
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
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

// 卡片字符到序列帧文件夹的映射（注意：哇 不是 蛙）
const CARD_FRAME_FOLDERS: Record<string, string> = {
  '马': 'ma',
  '上': 'shang',
  '发': 'fa',
  '财': 'cai',
  '哇': 'wa',
};
import { CARDS, CardChar } from '@/lib/cardConfig';
import { getUserStatus, drawCard as drawCardApi } from '@/lib/api';
import { preloadImage } from '@/lib/imageCache';

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

  // 防止触摸和点击双重触发
  const touchHandledRef = useRef(false);

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
  // 抽卡动画快完成时的回调（提前显示弹窗）
  const drawAnimationNearCompleteRef = useRef<(() => void) | null>(null);
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

  // 卡片区域显示状态（关闭最终弹窗后延迟显示）
  const [cardAreaVisible, setCardAreaVisible] = useState(true);

  // Toast 提示状态
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 测试模式状态（默认：真实模式）
  const [testMode, setTestMode] = useState(false);

  // 线上默认隐藏调试面板
  const SHOW_DEBUG_PANEL = true;

  // ========================================
  // 设置页面标题（确保不被覆盖）
  // ========================================
  useEffect(() => {
    // 立即设置
    document.title = '哇宝年货节 天天集福卡';
    // 定期检查并恢复（防止被其他代码覆盖）
    const interval = setInterval(() => {
      if (document.title !== '哇宝年货节 天天集福卡') {
        document.title = '哇宝年货节 天天集福卡';
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

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

    // 固定默认真实模式：不从 localStorage 恢复测试模式（并清理旧值）
    localStorage.setItem('abc_test_mode', 'false');

    // 主页面关键图片（卡片、按钮等）
    const mainPageImages = [
      '/images/campaign/design/wabao-card.png',
      '/images/campaign/design/draw-btn.png',
      '/images/campaign/design/rules-btn.png',
      '/images/campaign/design/title.png',
      '/images/campaign/design/subtitle.png',
      '/images/campaign/design/merge-btn.png',
    ];

    // 预加载主页面图片
    const preloadMainImages = async () => {
      console.log('[预加载] 开始预加载主页面图片...');
      const promises = mainPageImages.map(src => preloadImage(src));
      await Promise.all(promises);
      console.log('[预加载] 主页面图片预加载完成');
    };

    // 预加载抽卡序列帧（马上发财哇）- 使用全局缓存
    const preloadCardSpinFrames = async () => {
      console.log('[预加载] 开始预加载抽卡序列帧到全局缓存...');
      const promises: Promise<HTMLImageElement>[] = [];
      
      // 共用前46帧
      for (let i = 0; i < 46; i++) {
        const src = `/images/frames/card-spin/common/集福卡_${String(i).padStart(5, '0')}.png`;
        promises.push(preloadImage(src));
      }
      // 各卡片后29帧
      const cardFolders = ['ma', 'shang', 'fa', 'cai', 'wa'];
      cardFolders.forEach(folder => {
        for (let i = 46; i < 75; i++) {
          const src = `/images/frames/card-spin/${folder}/集福卡_${String(i).padStart(5, '0')}.png`;
          promises.push(preloadImage(src));
        }
      });
      
      await Promise.all(promises);
      console.log('[预加载] 抽卡序列帧预加载完成（46共用 + 5x29卡片 = 191帧）');
    };

    // 预加载骑马序列帧（127帧）- 使用全局缓存
    const preloadHorseFrames = async () => {
      console.log('[预加载] 开始预加载骑马序列帧到全局缓存...');
      const promises: Promise<HTMLImageElement>[] = [];
      
      for (let i = 0; i < 127; i++) {
        const src = `/images/frames/horse-ride/骑马青蛙_${String(i).padStart(5, '0')}.png`;
        promises.push(preloadImage(src));
      }
      
      await Promise.all(promises);
      console.log('[预加载] 骑马序列帧预加载完成（127帧）');
    };

    // 按顺序加载：主页面图片 → 抽卡序列帧 → 骑马序列帧
    const loadInOrder = async () => {
      // 1. 先加载主页面图片
      await preloadMainImages();
      
      // 2. 主页面图片完成后，加载抽卡序列帧
      await preloadCardSpinFrames();
      
      // 3. 抽卡序列帧完成后，空闲时加载骑马序列帧
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
          .requestIdleCallback(() => preloadHorseFrames(), { timeout: 5000 });
      } else {
        setTimeout(preloadHorseFrames, 1000);
      }
    };

    // 页面加载后开始按顺序预加载
    loadInOrder();
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

  // 监听最终弹窗关闭，延迟显示卡片区域
  useEffect(() => {
    if (showFinal) {
      // 打开最终弹窗时立即隐藏卡片区域
      setCardAreaVisible(false);
    } else {
      // 关闭最终弹窗后延迟0.5秒显示卡片区域
      const timer = setTimeout(() => {
        setCardAreaVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showFinal]);

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
      showToastMessage('每天可抽卡一次，请明天再来哦');
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

    // 设置动画快完成时的回调（提前显示弹窗，由 FrameAnimation 的 onNearComplete 触发）
    drawAnimationNearCompleteRef.current = () => {
      setShowResult(true);
      setDrawPhase('done');
    };

    // 4. 等待动画完成（视频结束）
    await waitForDrawAnimationEnd();

    // 清除回调
    drawAnimationNearCompleteRef.current = null;

    // 5. 显示结果（如果还没显示的话）
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

    // 确保弹窗显示（兜底）
    if (!showResult) {
      setShowResult(true);
      setDrawPhase('done');
    }
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

    // 注意：集齐后不再自动触发最终动画，改为手动点击合成按钮
  };

  /**
   * 测试用：抽取指定卡片
   */
  const drawSpecificCard = async (cardIndex: number) => {
    // 只在测试模式下有效
    if (!testMode) {
      showToastMessage('请先切换到测试模式');
      return;
    }

    // 防止重复点击
    if (drawPhase !== 'idle') return;

    // 播放音效
    playClickSound();

    // 设置抽卡结果为指定卡片
    const targetChar = CARDS[cardIndex];
    setCurrentResult(targetChar);

    // 1. 开始旋转动画
    setDrawPhase('spinning');

    // 等待抽卡序列帧动画播放结束
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

    // 触发抽卡动画
    setShowDrawAnimationVideo(true);
    setDrawAnimationVideoKey((k) => k + 1);

    // 设置动画快完成时的回调
    drawAnimationNearCompleteRef.current = () => {
      setShowResult(true);
      setDrawPhase('done');
    };

    await waitForDrawAnimationEnd();
    drawAnimationNearCompleteRef.current = null;

    // 隐藏动画
    setShowDrawAnimationVideo(false);

    // 更新收集状态
    const newCollected = [...collected];
    newCollected[cardIndex] = true;
    setCollected(newCollected);

    const newCounts = [...cardCounts];
    newCounts[cardIndex]++;
    setCardCounts(newCounts);

    // 确保弹窗显示
    setShowResult(true);
    setDrawPhase('done');
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
   * 开始游戏 - v12 方案：纯 DOM 操作，不依赖任何 React 状态
   *
   * v11 问题：即使删除欢迎页，游戏页也不显示
   * 原因：游戏页的显示依赖 React 状态 (gamePageReady, showWelcome)
   *       如果 React 不重渲染，条件渲染就不会更新
   *
   * v12 解决方案：
   * - 游戏页始终渲染（不用条件渲染）
   * - 用 CSS z-index 控制层级
   * - 点击后直接操作 DOM：隐藏欢迎页 + 显示游戏页
   */
  const handleStartGame = () => {
    // 调试日志函数 - 直接写入页面
    const debugLog = (msg: string) => {
      const debugEl = document.getElementById('debug-log');
      if (debugEl) {
        const time = new Date().toLocaleTimeString();
        debugEl.innerHTML += `<div>[${time}] ${msg}</div>`;
      }
    };

    debugLog('handleStartGame 被调用');

    // 防止重复触发
    if (isTransitioning) {
      debugLog('已在过渡中，跳过');
      return;
    }
    setIsTransitioning(true);
    debugLog('设置 isTransitioning = true');

    // ========== 1. 隐藏欢迎页（直接 DOM 操作）==========
    const welcomeEl = document.getElementById('welcome-page');
    debugLog(`welcomeEl 存在: ${!!welcomeEl}`);
    if (welcomeEl) {
      welcomeEl.style.display = 'none';
      welcomeEl.style.visibility = 'hidden';
      welcomeEl.style.opacity = '0';
      welcomeEl.style.pointerEvents = 'none';
      welcomeEl.style.zIndex = '-1';
      debugLog('欢迎页已隐藏 (DOM)');
    }

    // ========== 2. 显示游戏页背景（直接 DOM 操作）==========
    const gameBgEl = document.getElementById('game-background');
    debugLog(`gameBgEl 存在: ${!!gameBgEl}`);
    if (gameBgEl) {
      gameBgEl.style.display = 'block';
      gameBgEl.style.visibility = 'visible';
      gameBgEl.style.opacity = '1';
      debugLog('游戏背景已显示 (DOM)');
    }

    // ========== 3. 显示游戏内容（直接 DOM 操作）==========
    const gameContentEl = document.getElementById('game-content');
    debugLog(`gameContentEl 存在: ${!!gameContentEl}`);
    if (gameContentEl) {
      gameContentEl.style.opacity = '1';
      gameContentEl.style.transform = 'scale(1)';
      gameContentEl.style.visibility = 'visible';
      debugLog('游戏内容已显示 (DOM)');
    }

    // ========== 4. React 状态更新（备用）==========
    setGamePageReady(true);
    setShowWelcome(false);
    debugLog('React 状态已更新');

    // ========== 5. 可选：音效和音乐 ==========
    try {
      playClickSound();
      debugLog('音效播放成功');
    } catch (e) {
      debugLog(`音效错误: ${e}`);
    }

    try {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsMusicPlaying(true);
            debugLog('音乐播放成功');
          })
          .catch((e) => {
            debugLog(`音乐错误: ${e}`);
          });
      }
    } catch (e) {
      debugLog(`音乐异常: ${e}`);
    }

    debugLog('handleStartGame 执行完毕');
  };

  // 使用 ref 引用欢迎页
  const welcomeRef = useRef<HTMLDivElement>(null);

  // ========================================
  // v8 方案：将 handleStartGame 挂载到 window 上
  // 这样可以使用内联 onclick 属性，绕过所有 React 事件系统
  // ========================================
  useEffect(() => {
    // 将函数挂载到 window 上，供内联 onclick 调用
    (window as Window & { __startGame?: () => void }).__startGame = () => {
      if (isTransitioning) return;
      handleStartGame();
    };

    return () => {
      // 清理
      delete (window as Window & { __startGame?: () => void }).__startGame;
    };
  }, [isTransitioning]);

  // ========================================
  // v13：使用完全原生的事件绑定，记录每个事件
  // ========================================
  useEffect(() => {
    // 调试日志函数
    const debugLog = (msg: string) => {
      const debugEl = document.getElementById('debug-log');
      if (debugEl) {
        const time = new Date().toLocaleTimeString();
        const div = document.createElement('div');
        div.textContent = `[${time}] ${msg}`;
        debugEl.appendChild(div);
        // 滚动到底部
        debugEl.scrollTop = debugEl.scrollHeight;
      }
    };

    debugLog('useEffect 开始绑定事件');

    const welcomeEl = document.getElementById('welcome-page');
    debugLog(`welcome-page 元素: ${welcomeEl ? '找到' : '未找到'}`);

    if (!welcomeEl) {
      debugLog('欢迎页元素不存在，跳过绑定');
      return;
    }

    // 核心点击处理函数
    const handleClick = (e: Event) => {
      debugLog(`事件触发: ${e.type}`);
      e.preventDefault();
      e.stopPropagation();

      // 直接操作 DOM 隐藏欢迎页
      debugLog('开始隐藏欢迎页...');
      welcomeEl.style.display = 'none';
      welcomeEl.style.visibility = 'hidden';
      debugLog('欢迎页 display=none 设置完成');

      // 显示游戏背景
      const gameBgEl = document.getElementById('game-background');
      if (gameBgEl) {
        gameBgEl.style.display = 'block';
        gameBgEl.style.visibility = 'visible';
        gameBgEl.style.opacity = '1';
        debugLog('游戏背景已显示');
      } else {
        debugLog('游戏背景元素未找到!');
      }

      // 显示游戏内容
      const gameContentEl = document.getElementById('game-content');
      if (gameContentEl) {
        gameContentEl.style.opacity = '1';
        gameContentEl.style.transform = 'scale(1)';
        gameContentEl.style.visibility = 'visible';
        debugLog('游戏内容已显示');
      } else {
        debugLog('游戏内容元素未找到!');
      }

      debugLog('DOM 操作完成');
    };

    // 绑定多种事件
    welcomeEl.addEventListener('click', handleClick, { capture: true, passive: false });
    welcomeEl.addEventListener('touchstart', handleClick, { capture: true, passive: false });
    welcomeEl.addEventListener('touchend', handleClick, { capture: true, passive: false });
    welcomeEl.addEventListener('mousedown', handleClick, { capture: true, passive: false });
    welcomeEl.addEventListener('mouseup', handleClick, { capture: true, passive: false });
    welcomeEl.addEventListener('pointerdown', handleClick, { capture: true, passive: false });
    welcomeEl.addEventListener('pointerup', handleClick, { capture: true, passive: false });

    debugLog('已绑定 7 种事件: click, touchstart, touchend, mousedown, mouseup, pointerdown, pointerup');

    // 同时在 document 上监听（冒泡）
    const handleDocClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (welcomeEl.contains(target) || target === welcomeEl) {
        debugLog(`document ${e.type} 捕获到欢迎页点击`);
        handleClick(e);
      }
    };

    document.addEventListener('click', handleDocClick, true);
    document.addEventListener('touchstart', handleDocClick, true);
    debugLog('已在 document 上绑定 click 和 touchstart');

    return () => {
      welcomeEl.removeEventListener('click', handleClick);
      welcomeEl.removeEventListener('touchstart', handleClick);
      welcomeEl.removeEventListener('touchend', handleClick);
      welcomeEl.removeEventListener('mousedown', handleClick);
      welcomeEl.removeEventListener('mouseup', handleClick);
      welcomeEl.removeEventListener('pointerdown', handleClick);
      welcomeEl.removeEventListener('pointerup', handleClick);
      document.removeEventListener('click', handleDocClick, true);
      document.removeEventListener('touchstart', handleDocClick, true);
    };
  }, []);

  // ========================================
  // 渲染 UI
  // ========================================
  return (
    <div
      className="w-full h-screen overflow-hidden font-sans"
      style={{
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        // 兼容农行 WebView - 使用内联样式确保背景色正确显示
        backgroundColor: showWelcome ? '#b81c22' : '#1a0808', // 欢迎页时使用红色，游戏页使用深色
        position: 'relative',
        // 确保在农行 WebView 中也能正确显示
        display: 'block',
        visibility: 'visible',
        opacity: 1,
        overflow: 'hidden',
      }}
    >
      {/* ==================== v21: 可关闭的调试面板 - 标题栏固定 ==================== */}
      <div
        id="debug-log"
        style={{
          display: 'block',
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          height: '120px',
          backgroundColor: 'rgba(0,0,0,0.9)',
          color: '#0f0',
          fontSize: '11px',
          fontFamily: 'monospace',
          zIndex: 99999,
          borderTop: '2px solid #f00',
        }}
      >
        {/* 固定标题栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 8px',
          backgroundColor: 'rgba(0,0,0,1)',
          borderBottom: '1px solid #333',
        }}>
          <span style={{ color: '#ff0' }}>v22 调试 | UA: <span id="debug-ua"></span></span>
          {/* v21: 使用 dangerouslySetInnerHTML 添加原生 onclick */}
          <span
            dangerouslySetInnerHTML={{
              __html: `<button id="debug-close" onclick="document.getElementById('debug-log').style.display='none'" style="color:#fff;background:#f00;border:none;padding:4px 12px;border-radius:4px;font-size:12px;cursor:pointer;font-weight:bold;">关闭</button>`
            }}
          />
        </div>
        {/* 可滚动日志区域 */}
        <div
          id="debug-log-content"
          style={{
            height: 'calc(100% - 30px)',
            overflow: 'auto',
            padding: '4px 8px',
          }}
        />
      </div>

      {/* ==================== v20: 完整内联脚本，支持所有交互逻辑 ==================== */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  // ========== v20: 防止重复初始化 ==========
  var initialized = false;

  // ========== v22: 日志写入到 debug-log-content，新日志在顶部 ==========
  var log = function(msg, color) {
    var el = document.getElementById('debug-log-content');
    var container = document.getElementById('debug-log');
    if (el && container && container.style.display !== 'none') {
      var div = document.createElement('div');
      div.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
      if (color) div.style.color = color;
      // v22: 插入到最前面而不是最后面
      el.insertBefore(div, el.firstChild);
      // 限制日志数量，防止内存溢出（删除最旧的，即最后面的）
      while (el.children.length > 50) {
        el.removeChild(el.lastChild);
      }
    }
    console.log('[v22] ' + msg);
  };

  // 捕获全局错误
  window.onerror = function(msg, url, line, col, error) {
    log('JS错误: ' + msg + ' @' + line + ':' + col, '#f00');
    return false;
  };

  // 显示 UA
  try {
    var uaEl = document.getElementById('debug-ua');
    if (uaEl) {
      var ua = navigator.userAgent;
      // 简化UA显示
      if (ua.indexOf('Honor') > -1) uaEl.textContent = 'Honor';
      else if (ua.indexOf('HUAWEI') > -1) uaEl.textContent = 'HUAWEI';
      else if (ua.indexOf('iPhone') > -1) uaEl.textContent = 'iPhone';
      else if (ua.indexOf('Android') > -1) uaEl.textContent = 'Android';
      else uaEl.textContent = ua.substring(0, 30);
    }
  } catch(e) {}

  // v20: 检查并列出所有弹窗元素
  var checkModals = function() {
    var modals = ['login-modal', 'rules-modal', 'result-modal', 'final-modal'];
    modals.forEach(function(id) {
      var el = document.getElementById(id);
      log('弹窗检查 ' + id + ': ' + (el ? '存在' : '不存在'), el ? '#0f0' : '#f00');
    });
  };

  var show = function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.style.display = 'flex';
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      el.style.visibility = 'visible';
      log('显示: ' + id + ' (display=' + el.style.display + ')', '#0f0');
    } else {
      log('找不到元素: ' + id, '#f00');
      // v20: 如果找不到，重新检查所有弹窗
      checkModals();
    }
  };

  var hide = function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      log('隐藏: ' + id, '#ff0');
    } else {
      log('找不到元素: ' + id, '#f00');
    }
  };

  log('v19 脚本启动', '#0ff');

  // ========== 状态管理 ==========
  var State = {
    userPhone: '',
    collected: [false, false, false, false, false],
    hasDrawnToday: false,
    currentResult: null,
    isDrawing: false,
    countdown: 0,
    countdownTimer: null,
  };

  // 卡片配置
  var CARDS = ['马', '上', '发', '财', '哇'];
  var CARD_FOLDERS = { '马': 'ma', '上': 'shang', '发': 'fa', '财': 'cai', '哇': 'wa' };
  var CARD_IMAGES = {
    'ma': '/images/campaign/modals/result-ma-new.png',
    'shang': '/images/campaign/modals/result-shang-new.png',
    'fa': '/images/campaign/modals/result-fa-new.png',
    'cai': '/images/campaign/modals/result-cai-new.png',
    'wa': '/images/campaign/modals/result-wa-new.png',
  };
  var SLOT_COLLECTED = [
    '/images/campaign/slots-new/ma.png',
    '/images/campaign/slots-new/shang.png',
    '/images/campaign/slots-new/fa.png',
    '/images/campaign/slots-new/cai.png',
    '/images/campaign/slots-new/wa.png',
  ];
  var SLOT_SHADOW = '/images/campaign/slots-new/shadow.png';

  // ========== Toast 提示 ==========
  var Toast = {
    show: function(msg) {
      var container = document.getElementById('toast-container');
      var msgEl = document.getElementById('toast-msg');
      if (container && msgEl) {
        msgEl.textContent = msg;
        container.style.display = 'flex';
        setTimeout(function() {
          container.style.display = 'none';
        }, 2500);
      }
      log('Toast: ' + msg);
    }
  };

  // ========== 弹窗控制 ==========
  var Modal = {
    showLogin: function() { show('login-modal'); },
    hideLogin: function() { hide('login-modal'); },

    showResult: function(cardIndex) {
      State.currentResult = cardIndex;
      var folder = Object.values(CARD_FOLDERS)[cardIndex];
      var img = document.getElementById('result-card-img');
      if (img) {
        img.src = CARD_IMAGES[folder];
      }
      show('result-modal');
    },
    hideResult: function() {
      hide('result-modal');
      // 检查是否集齐
      if (State.collected.every(function(c) { return c; })) {
        // 延迟显示合成按钮
        Game.updateButtons();
      }
    },

    showRules: function() { show('rules-modal'); },
    hideRules: function() { hide('rules-modal'); },

    showFinal: function() { show('final-modal'); },
    hideFinal: function() { hide('final-modal'); },
  };

  // ========== API 调用 ==========
  var API = {
    baseUrl: 'https://1331245644-lnsmyztba1.ap-guangzhou.tencentscf.com',

    request: function(endpoint, method, data, callback) {
      log('API 请求: ' + method + ' ' + endpoint);
      var xhr = new XMLHttpRequest();
      xhr.open(method, API.baseUrl + endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      var token = localStorage.getItem('abc_token');
      if (token) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      }
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          log('API 响应: ' + xhr.status);
          try {
            var resp = JSON.parse(xhr.responseText);
            callback(resp);
          } catch(e) {
            log('API 解析错误: ' + e.message);
            callback({ success: false, error: '网络错误' });
          }
        }
      };
      xhr.onerror = function() {
        log('API 网络错误');
        callback({ success: false, error: '网络错误' });
      };
      xhr.send(data ? JSON.stringify(data) : null);
    },

    sendCode: function(phone, callback) {
      var deviceId = localStorage.getItem('deviceId') || 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
      API.request('/api/auth/send-code', 'POST', { phone: phone, deviceId: deviceId }, callback);
    },

    verifyCode: function(phone, code, callback) {
      var deviceId = localStorage.getItem('deviceId') || 'unknown';
      API.request('/api/auth/verify-code', 'POST', { phone: phone, code: code, deviceId: deviceId }, function(resp) {
        if (resp.success && resp.token) {
          localStorage.setItem('abc_token', resp.token);
          localStorage.setItem('abc_user_phone', phone);
          State.userPhone = phone;
        }
        callback(resp);
      });
    },

    drawCard: function(callback) {
      var deviceId = localStorage.getItem('deviceId') || 'unknown';
      API.request('/api/card/draw', 'POST', { deviceId: deviceId }, callback);
    },

    getUserStatus: function(callback) {
      API.request('/api/user/status', 'GET', null, callback);
    }
  };

  // ========== 游戏逻辑 ==========
  var Game = {
    drawCard: function() {
      log('drawCard 被调用');

      // 防止重复点击
      if (State.isDrawing) {
        log('正在抽卡中，忽略');
        return;
      }

      // 检查登录
      if (!State.userPhone) {
        log('未登录，显示登录弹窗');
        Modal.showLogin();
        return;
      }

      // 检查今日是否已抽
      if (State.hasDrawnToday) {
        Toast.show('每天可抽卡一次，请明天再来哦');
        return;
      }

      // 检查是否已集齐
      if (State.collected.every(function(c) { return c; })) {
        Modal.showFinal();
        return;
      }

      State.isDrawing = true;
      log('开始抽卡...');

      // 调用 API
      API.drawCard(function(result) {
        log('抽卡结果: ' + JSON.stringify(result));
        State.isDrawing = false;

        if (result.success && result.data) {
          State.hasDrawnToday = true;
          localStorage.setItem('lastDrawDate', new Date().toDateString());

          // 更新卡片收集状态
          if (result.data.cards) {
            State.collected = result.data.cards;
            localStorage.setItem('abc_collected', JSON.stringify(result.data.cards));
            Game.updateSlots();
          }

          // 显示结果
          Modal.showResult(result.data.cardIndex);
        } else {
          var errorMsg = result.error || '抽卡失败';
          if (errorMsg.indexOf('今天已经抽过') >= 0 || errorMsg.indexOf('明天再来') >= 0) {
            State.hasDrawnToday = true;
            localStorage.setItem('lastDrawDate', new Date().toDateString());
            Toast.show('每天可抽卡一次，请明天再来哦');
          } else {
            Toast.show(errorMsg);
          }
        }
      });
    },

    updateSlots: function() {
      log('更新卡槽显示');
      for (var i = 0; i < 5; i++) {
        var slotImg = document.getElementById('slot-img-' + i);
        if (slotImg) {
          if (State.collected[i]) {
            slotImg.src = SLOT_COLLECTED[i];
            slotImg.style.opacity = '1';
          } else {
            slotImg.src = SLOT_SHADOW;
            slotImg.style.opacity = '0.5';
          }
        }
      }
      Game.updateButtons();
    },

    updateButtons: function() {
      var allCollected = State.collected.every(function(c) { return c; });
      var drawBtn = document.getElementById('draw-btn');
      var mergeBtn = document.getElementById('merge-btn');

      // 这里的按钮显示隐藏逻辑需要配合 React 的条件渲染
      // 由于按钮是 React 控制的，这里只更新状态标记
      log('所有卡片已集齐: ' + allCollected);
    },

    // 登录相关
    sendCode: function() {
      var phoneInput = document.getElementById('phone-input');
      if (!phoneInput) return;

      var phone = phoneInput.value;
      if (phone.length !== 11) {
        Toast.show('请输入正确的11位手机号');
        return;
      }

      if (State.countdown > 0) return;

      log('发送验证码到: ' + phone);
      State.countdown = 60;
      Game.updateCountdown();

      API.sendCode(phone, function(result) {
        if (!result.success) {
          Toast.show(result.error || '发送失败');
        } else {
          log('验证码发送成功');
        }
      });
    },

    updateCountdown: function() {
      var sendBtn = document.getElementById('send-code-btn');
      if (sendBtn) {
        if (State.countdown > 0) {
          sendBtn.textContent = State.countdown + 's';
          sendBtn.disabled = true;
        } else {
          sendBtn.textContent = '获取验证码';
          sendBtn.disabled = false;
        }
      }

      if (State.countdown > 0) {
        State.countdown--;
        State.countdownTimer = setTimeout(Game.updateCountdown, 1000);
      }
    },

    login: function() {
      var phoneInput = document.getElementById('phone-input');
      var codeInput = document.getElementById('code-input');
      if (!phoneInput || !codeInput) return;

      var phone = phoneInput.value;
      var code = codeInput.value;

      if (phone.length !== 11) {
        Toast.show('请输入正确的11位手机号');
        return;
      }

      if (code.length !== 6) {
        Toast.show('请输入6位验证码');
        return;
      }

      log('开始登录验证...');
      API.verifyCode(phone, code, function(result) {
        if (result.success) {
          log('登录成功');
          State.userPhone = phone;
          Modal.hideLogin();

          // 加载用户状态
          API.getUserStatus(function(status) {
            if (status.success && status.data) {
              State.collected = status.data.cards || [false,false,false,false,false];
              localStorage.setItem('abc_collected', JSON.stringify(State.collected));

              if (status.data.lastDrawAt) {
                var lastDraw = new Date(status.data.lastDrawAt);
                var today = new Date();
                if (lastDraw.toDateString() === today.toDateString()) {
                  State.hasDrawnToday = true;
                }
              }
              Game.updateSlots();
            }
          });
        } else {
          Toast.show(result.error || '验证失败，请重试');
        }
      });
    },

    toggleMusic: function() {
      var audio = document.getElementById('bgm-audio');
      var btnImg = document.getElementById('music-btn-img');
      if (audio && btnImg) {
        if (audio.paused) {
          audio.play().catch(function() {});
          btnImg.src = '/images/campaign/design/播放按钮.png';
        } else {
          audio.pause();
          btnImg.src = '/images/campaign/design/暂停按钮.png';
        }
      }
    }
  };

  // ========== 事件绑定 ==========
  var bindEvents = function() {
    log('开始绑定事件...');

    // 欢迎页点击
    var welcomeEl = document.getElementById('welcome-page');
    if (welcomeEl) {
      var handleWelcomeClick = function(e) {
        log('欢迎页点击');
        welcomeEl.style.display = 'none';

        var bg = document.getElementById('game-background');
        if (bg) {
          bg.style.display = 'block';
          bg.style.visibility = 'visible';
          bg.style.opacity = '1';
        }

        var content = document.getElementById('game-content');
        if (content) {
          content.style.opacity = '1';
          content.style.visibility = 'visible';
          content.style.transform = 'scale(1)';
        }

        // 播放音乐
        var audio = document.getElementById('bgm-audio');
        if (audio) {
          audio.play().catch(function() {});
          var btnImg = document.getElementById('music-btn-img');
          if (btnImg) btnImg.src = '/images/campaign/design/播放按钮.png';
        }
      };
      welcomeEl.onclick = handleWelcomeClick;
      welcomeEl.ontouchstart = handleWelcomeClick;
      log('欢迎页事件已绑定');
    }

    // 抽卡按钮
    var drawBtn = document.getElementById('draw-btn');
    if (drawBtn) {
      drawBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Game.drawCard();
      };
      log('抽卡按钮已绑定');
    }

    // 合成按钮
    var mergeBtn = document.getElementById('merge-btn');
    if (mergeBtn) {
      mergeBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Modal.showFinal();
      };
      log('合成按钮已绑定');
    }

    // 规则按钮
    var rulesBtn = document.getElementById('rules-btn');
    if (rulesBtn) {
      rulesBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Modal.showRules();
      };
      log('规则按钮已绑定');
    }

    // 规则弹窗关闭
    var rulesClose = document.getElementById('rules-close');
    if (rulesClose) {
      rulesClose.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Modal.hideRules();
      };
    }
    var rulesModal = document.getElementById('rules-modal');
    if (rulesModal) {
      rulesModal.onclick = function(e) {
        if (e.target === rulesModal) {
          Modal.hideRules();
        }
      };
    }

    // 结果弹窗关闭
    var resultClose = document.getElementById('result-close');
    if (resultClose) {
      resultClose.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Modal.hideResult();
      };
    }

    // 登录弹窗
    var loginClose = document.getElementById('login-close');
    if (loginClose) {
      loginClose.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Modal.hideLogin();
      };
    }

    // 发送验证码按钮
    var sendCodeBtn = document.getElementById('send-code-btn');
    if (sendCodeBtn) {
      sendCodeBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Game.sendCode();
      };
    }

    // 登录按钮
    var loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Game.login();
      };
    }

    // 音乐按钮
    var musicBtn = document.getElementById('music-btn');
    if (musicBtn) {
      musicBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Game.toggleMusic();
      };
    }

    // 最终弹窗关闭
    var finalClose = document.getElementById('final-close');
    if (finalClose) {
      finalClose.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        Modal.hideFinal();
      };
    }

    // 卡槽点击
    for (var i = 0; i < 5; i++) {
      (function(idx) {
        var slot = document.getElementById('slot-' + idx);
        if (slot) {
          slot.onclick = function(e) {
            if (State.collected[idx]) {
              Modal.showResult(idx);
            }
          };
        }
      })(i);
    }

    log('所有事件绑定完成');
  };

  // ========== 初始化 ==========
  var init = function() {
    // v17: 防止重复执行
    if (initialized) {
      log('init 已执行过，跳过');
      return;
    }
    initialized = true;

    log('init 开始');

    // 从 localStorage 恢复状态
    State.userPhone = localStorage.getItem('abc_user_phone') || '';
    try {
      State.collected = JSON.parse(localStorage.getItem('abc_collected') || '[false,false,false,false,false]');
    } catch(e) {
      State.collected = [false, false, false, false, false];
    }

    // 检查今日是否已抽卡
    var lastDraw = localStorage.getItem('lastDrawDate');
    if (lastDraw === new Date().toDateString()) {
      State.hasDrawnToday = true;
    }

    log('状态恢复: phone=' + (State.userPhone ? '已登录' : '未登录') + ', hasDrawnToday=' + State.hasDrawnToday);

    // v20: 初始化时检查所有弹窗元素
    checkModals();

    // 更新卡槽显示
    Game.updateSlots();

    // 绑定事件
    bindEvents();

    log('init 完成', '#0f0');
  };

  // v20: 使用事件委托，解决 React Hydration 后事件丢失问题
  // 记录所有点击，便于调试
  var clickCount = 0;

  // 同时监听 click 和 touchend（某些 WebView 只支持 touch 事件）
  var handleInteraction = function(e) {
    clickCount++;
    var x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0) || (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0);
    var y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0) || (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0);

    var target = e.target;
    var targetInfo = target.tagName + (target.id ? '#' + target.id : '') + (target.className ? '.' + String(target.className).substring(0,20) : '');
    log('#' + clickCount + ' ' + e.type + ' (' + Math.round(x) + ',' + Math.round(y) + ') ' + targetInfo, '#0ff');

    // 向上查找最近的带 ID 的元素
    while (target && target !== document) {
      var id = target.id;
      if (id) {
        log('  -> 找到ID: ' + id, '#aaa');

        // v20: 调试面板关闭按钮
        if (id === 'debug-close') {
          e.preventDefault();
          e.stopPropagation();
          var debugLog = document.getElementById('debug-log');
          if (debugLog) debugLog.style.display = 'none';
          return;
        }
        // 规则按钮
        if (id === 'rules-btn') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 显示规则', '#0f0');
          Modal.showRules();
          return;
        }
        // 规则弹窗关闭
        if (id === 'rules-close') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 关闭规则', '#0f0');
          Modal.hideRules();
          return;
        }
        // 规则弹窗背景点击关闭
        if (id === 'rules-modal' && target === e.target) {
          log('  >> 触发: 背景关闭规则', '#0f0');
          Modal.hideRules();
          return;
        }
        // 抽卡按钮
        if (id === 'draw-btn') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 抽卡', '#0f0');
          Game.drawCard();
          return;
        }
        // 合成按钮
        if (id === 'merge-btn') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 合成', '#0f0');
          Modal.showFinal();
          return;
        }
        // 登录弹窗关闭
        if (id === 'login-close') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 关闭登录', '#0f0');
          Modal.hideLogin();
          return;
        }
        // 发送验证码
        if (id === 'send-code-btn') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 发送验证码', '#0f0');
          Game.sendCode();
          return;
        }
        // 登录按钮
        if (id === 'login-btn') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 登录', '#0f0');
          Game.login();
          return;
        }
        // 结果弹窗关闭
        if (id === 'result-close') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 关闭结果', '#0f0');
          Modal.hideResult();
          return;
        }
        // 最终弹窗关闭
        if (id === 'final-close') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 关闭最终', '#0f0');
          Modal.hideFinal();
          return;
        }
        // 音乐按钮
        if (id === 'music-btn') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 音乐', '#0f0');
          Game.toggleMusic();
          return;
        }
        // 欢迎页点击
        if (id === 'welcome-page') {
          e.preventDefault();
          e.stopPropagation();
          log('  >> 触发: 进入游戏', '#0f0');
          // 隐藏欢迎页
          var welcomeEl = document.getElementById('welcome-page');
          if (welcomeEl) {
            welcomeEl.style.display = 'none';
          }
          // 显示游戏背景
          var bg = document.getElementById('game-background');
          if (bg) {
            bg.style.display = 'block';
            bg.style.visibility = 'visible';
            bg.style.opacity = '1';
          }
          // 显示游戏内容
          var content = document.getElementById('game-content');
          if (content) {
            content.style.opacity = '1';
            content.style.visibility = 'visible';
            content.style.transform = 'scale(1)';
          }
          // 播放音乐
          var audio = document.getElementById('bgm-audio');
          if (audio) {
            audio.play().catch(function() {});
          }
          return;
        }
      }
      target = target.parentElement;
    }
    log('  -> 无匹配ID', '#888');
  };

  // 同时绑定 click 和 touchend
  document.addEventListener('click', handleInteraction, true);
  document.addEventListener('touchend', handleInteraction, true);

  log('v19 事件委托已绑定 (click+touchend)', '#0f0');

  // 页面加载完成后执行
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    log('DOM 已就绪，立即执行 init');
    init();
  } else {
    log('等待 DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', init);
  }

  // 备用：延迟执行
  setTimeout(function() {
    log('500ms 延迟触发');
    init();
  }, 500);
})();
          `
        }}
      />

      {/* ==================== 调试面板（移到顶层，不受 game-content 影响） ==================== */}
      {SHOW_DEBUG_PANEL && (
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
          onDrawSpecificCard={drawSpecificCard}
        />
      )}

      {/* 外层容器 - 撑满屏幕 */}
      <div className="relative w-full h-full max-w-[480px] mx-auto">

        {/* ==================== 背景图层（自适应撑满） ==================== */}
        {/* v17: 恢复初始隐藏状态，由内联脚本控制显示 */}
        <div
          id="game-background"
          className={cn(
            "absolute inset-0",
            styles.campaignRoot
          )}
          style={{
            display: 'none',
            visibility: 'hidden',
            opacity: 0,
          }}
        >
          {/* 背景图会通过 CSS 设置，这里作为背景容器 */}
        </div>

        {/* ==================== 主内容区（9:16 比例居中） ==================== */}
        <div 
          className="absolute overflow-hidden"
          style={{
            left: '50%',
            top: '50%',
            // 9:16 比例计算 - 兼容荣耀/华为 WebView（不支持 aspectRatio 和 calc）
            width: '100%',
            maxWidth: '480px',
            // 使用百分比高度和 padding-top 技巧实现 9:16 比例（兼容性更好）
            height: '100vh',
            maxHeight: '100%',
            // Transform 兼容性 - 支持荣耀/华为浏览器和 iOS
            WebkitTransform: 'translate(-50%, -50%)',
            msTransform: 'translate(-50%, -50%)',
            transform: 'translate(-50%, -50%)',
            // Safari 防滚动
            touchAction: 'none',
            overscrollBehavior: 'none',
            WebkitOverflowScrolling: 'auto',
          }}
        >

        {/* ==================== 游戏页内容 ==================== */}
        {/* v17: 恢复初始隐藏状态，由内联脚本控制显示 */}
        <div
          id="game-content"
          className="absolute inset-0 flex flex-col"
          style={{
            opacity: 0,
            transform: 'scale(0.95)',
            visibility: 'hidden',
          }}
        >

          {/* ==================== 顶部Logo区域 ==================== */}
          <div className="flex justify-end items-center px-2 pt-2 z-10">
            {/* 银联logo - 锦绣中华 */}
            <img
              src="/images/campaign/design/unionpay-logo.png"
              alt="银联"
              className="h-7 object-contain"
            />
          </div>

          {/* ==================== 音乐按钮 - 悬浮在右上角 ==================== */}
          <button
            id="music-btn"
            onClick={toggleMusic}
            className="fixed top-9 right-2 z-[200] w-7 h-7 flex items-center justify-center transition-opacity active:opacity-70"
            aria-label={isMusicPlaying ? '关闭音乐' : '开启音乐'}
          >
            <img
              id="music-btn-img"
              src={isMusicPlaying ? "/images/campaign/design/播放按钮.png" : "/images/campaign/design/暂停按钮.png"}
              alt={isMusicPlaying ? "暂停" : "播放"}
              className="w-full h-full object-contain"
            />
          </button>

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
          {/* 播放最终动画时渐变隐藏，关闭后延迟0.5秒渐现 */}
          <div 
            className="flex-1 w-full relative z-10 transition-opacity duration-500"
            style={{ opacity: cardAreaVisible && !showFinal ? 1 : 0 }}
          >
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
                top: '45%',
                // Transform 兼容性 - 支持荣耀/华为浏览器
                WebkitTransform: 'translate(-50%, -50%)',
                msTransform: 'translate(-50%, -50%)',
                transform: 'translate(-50%, -50%)',
                width: '65%',
                // aspectRatio 兼容性 - 使用 padding-top 技巧替代（支持旧版 WebView）
                // 688/912 ≈ 0.754
                paddingTop: '132.56%', // 912/688 * 100% ≈ 132.56%
                position: 'relative',
              }}
            >
              {/* v18: 卡片组件 - 使用绝对定位填满 padding-top 撑开的容器 */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <Card
                  drawPhase={drawPhase}
                  resultChar={currentResult}
                  onDraw={drawCard}
                  disabled={false}
                  hasDrawnToday={hasDrawnToday}
                  onAlreadyDrawnClick={() => showToastMessage('每天可抽卡一次，请明天再来哦')}
                />
              </div>


              {/* 抽卡按钮 - 重叠在卡片底部 */}
              <div 
                className="absolute bottom-[5%] w-[90%] z-20"
                style={{
                  left: '50%',
                  // Transform 兼容性 - 支持荣耀/华为浏览器和 iOS
                  WebkitTransform: 'translateX(-50%)',
                  msTransform: 'translateX(-50%)',
                  transform: 'translateX(-50%)',
                }}
              >
                <DrawButton
                  onClick={drawCard}
                  disabled={collected.every(Boolean)}
                  hasDrawnToday={hasDrawnToday}
                  isDrawing={drawPhase === 'spinning'}
                  allCollected={collected.every(Boolean)}
                  onAlreadyDrawnClick={() => showToastMessage('每天可抽卡一次，请明天再来哦')}
                  onMergeClick={() => setShowFinal(true)}
                />
              </div>
            </div>
          </div>

          {/* ==================== 收集槽区域（固定在底部） ==================== */}
          {/* 播放最终动画时渐变隐藏，1秒过渡 */}
          <div
            className="absolute bottom-[10%] left-0 right-0 z-10 transition-opacity duration-1000"
            style={{ opacity: showFinal ? 0 : 1 }}
          >
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
          {/* v16: 移除 React onClick，由内联脚本控制 */}
          <div className="w-full flex justify-center py-4 z-10">
            <RulesButton />
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

        {/* ==================== Toast 提示浮层 - 始终渲染，用 display 控制 ==================== */}
        <ClientPortal>
          <div
            id="toast-container"
            className="fixed inset-0 z-[600] flex items-center justify-center pointer-events-none"
            style={{ display: showToast ? 'flex' : 'none' }}
          >
            <div id="toast" className="bg-black/80 text-white px-6 py-4 rounded-lg shadow-xl max-w-[280px] text-center">
              <span id="toast-msg" className="text-sm">{toastMessage}</span>
            </div>
          </div>
        </ClientPortal>

        {/* ==================== 欢迎页（顶层）v13 - 完全原生事件 ==================== */}
        {showWelcome && (
          <div
            id="welcome-page"
            style={{
              display: 'block',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              zIndex: 1000,
              backgroundColor: '#b81c22',
              backgroundImage: 'linear-gradient(to bottom, #b81c22, #ff8c42, #fff5e6)',
              cursor: 'pointer',
            }}
          >
              {/* 欢迎页背景图片 - 设置为不可交互 */}
              <img
                src="/images/welcome-cover.png"
                alt=""
                aria-hidden="true"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              />

              {/* 点击进入按钮 - 仅作为视觉提示 */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: '8%',
                  left: 0,
                  right: 0,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <img
                  src="/images/start-btn.png"
                  alt=""
                  draggable={false}
                  style={{
                    width: '38%',
                    maxWidth: '160px',
                    display: 'block',
                    pointerEvents: 'none',
                  }}
                />
              </span>
            </div>
        )}

        {/* ==================== 背景音乐 ==================== */}
        <audio
          id="bgm-audio"
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
              onNearComplete={() => drawAnimationNearCompleteRef.current?.()}
              nearCompleteFrames={12}
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
