import React, { useState, useEffect } from 'react';
// 移除 Next.js Image 组件，使用原生 img 标签以兼容农行 WebView
import { FrameAnimation } from './FrameAnimation';
// v19: 移除 ClientPortal，直接渲染，避免 Portal 在某些 WebView 中不工作
import { useBodyScrollLock } from './useBodyScrollLock';

interface FinalRewardModalProps {
  isOpen: boolean;
  userPhone: string;
  onClose: () => void;
}

// 手机号脱敏
const maskPhone = (phone: string) => {
  if (!phone || phone.length !== 11) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
};

export const FinalRewardModal: React.FC<FinalRewardModalProps> = ({ isOpen, userPhone, onClose }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showScrollArea, setShowScrollArea] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  // 锁定 body 滚动
  useBodyScrollLock(showAnimation);

  // 当弹窗打开时，播放动画
  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      setAnimationFinished(false);
      setShowScrollArea(false);
      setFadeIn(false);
      setAnimationKey((k) => k + 1);

      // 0.1秒后开始渐入
      const fadeTimer = setTimeout(() => setFadeIn(true), 10);

      // 提前2秒显示滚动区域（127帧/15fps≈8.5秒，提前到6.5秒）
      const scrollTimer = setTimeout(() => {
        setShowScrollArea(true);
      }, 6500);

      // 兜底：9秒后标记动画结束
      const finishTimer = setTimeout(() => {
        setAnimationFinished(true);
      }, 9000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(scrollTimer);
        clearTimeout(finishTimer);
      };
    } else {
      setShowAnimation(false);
      setAnimationFinished(false);
      setShowScrollArea(false);
      setFadeIn(false);
    }
  }, [isOpen]);

  const finishAnimation = () => {
    setAnimationFinished(true);
  };

  const handleClose = () => {
    setShowAnimation(false);
    setAnimationFinished(false);
    setShowScrollArea(false);
    setFadeIn(false);
    onClose();
  };

  // 移除条件渲染，改用 display:none 控制显示
  // if (!showAnimation) return null;

  return (
    <>
      {/* v19: 移除 ClientPortal，直接渲染，避免 Portal 在某些 WebView 中不工作 */}
      <div
        id="final-modal"
        className="transition-opacity duration-1000"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          display: 'none', // 默认隐藏，由内联脚本控制
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          opacity: fadeIn ? 1 : 0,
        }}
        onClick={handleClose}
      >
        {/* 9:16 核心内容区 - 简化实现，避免复杂 calc 计算导致农行 WebView 兼容性问题 */}
        <div 
          className="relative"
          style={{
            // 使用简单的百分比尺寸，更好的 WebView 兼容性
            width: '100%',
            height: '100%',
            maxWidth: '480px',
            margin: '0 auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 序列帧动画 - 播完停在最后一帧 */}
          <FrameAnimation
            key={animationKey}
            framePrefix="/images/frames/horse-ride/骑马青蛙_"
            totalFrames={127}
            fps={15}
            loop={false}
            onComplete={finishAnimation}
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: 'contain',
            }}
          />

          {/* 手机号显示 - 在红色区域上方，使用百分比定位 */}
          {showScrollArea && userPhone && (
            <div 
              className="absolute text-center transition-opacity duration-500"
              style={{
                top: '66%',
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: showScrollArea ? 1 : 0,
              }}
            >
              {/* 移除 drop-shadow-lg，filter 在某些 WebView 上会导致黑屏 */}
              <span 
                className="text-white text-base font-bold"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                用户: {maskPhone(userPhone)}
              </span>
            </div>
          )}

          {/* 活动规则滚动区域 - 百分比定位，随9:16区域自适应缩放 */}
          <div 
            className="absolute overflow-hidden transition-opacity duration-500"
            style={{
              top: '71%',
              left: '50%',
              // Transform 兼容性 - 支持荣耀/华为浏览器
              WebkitTransform: 'translateX(-50%)',
              msTransform: 'translateX(-50%)',
              transform: 'translateX(-50%)',
              width: '75%',
              height: '16%',
              borderRadius: '12px',
              opacity: showScrollArea ? 1 : 0,
            }}
          >
            {/* 隐藏滚动条的滚动容器 */}
            <div 
              className="w-full h-full overflow-y-auto"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {/* 使用原生 img 标签兼容农行 WebView */}
              <img
                src="/images/campaign/modals/rules.png"
                alt="活动规则"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          </div>

          {/* 我知道了按钮点击区域 - 在滚动区域显示后就可点击，扩大热区 */}
          {showScrollArea && (
            <div
              id="final-close"
              className="absolute bottom-0 left-0 right-0 h-[15%] z-[200] flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[FinalRewardModal] 我知道了按钮点击');
                handleClose();
              }}
            >
              <div className="w-[80%] h-[50%] cursor-pointer active:opacity-70" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
