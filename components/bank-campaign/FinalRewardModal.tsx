import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { FrameAnimation } from './FrameAnimation';
import { ClientPortal } from './ClientPortal';

interface FinalRewardModalProps {
  isOpen: boolean;
  userPhone: string;
  onClose: () => void;
}

export const FinalRewardModal: React.FC<FinalRewardModalProps> = ({ isOpen, userPhone, onClose }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showScrollArea, setShowScrollArea] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [fadeIn, setFadeIn] = useState(false); // 渐入效果

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

      // 提前1秒显示滚动区域（127帧/15fps≈8.5秒，提前到7.5秒）
      const scrollTimer = setTimeout(() => {
        setShowScrollArea(true);
      }, 7500);

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

  if (!showAnimation) return null;

  return (
    <ClientPortal>
      {/* 全屏半透明黑底 - 深一点遮住底部元素，1秒渐入效果 */}
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-1000"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          opacity: fadeIn ? 1 : 0,
        }}
        onClick={handleClose}
      >
        {/* 序列帧容器 - 居中显示 */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{
            maxWidth: '100vw',
            maxHeight: '100vh',
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
            className="w-full h-full"
            style={{
              objectFit: 'contain',
            }}
          />

          {/* 活动规则滚动区域 - 提前1秒渐现 */}
          <div 
            className="absolute overflow-hidden transition-opacity duration-500"
            style={{
              // 定位到序列帧最后一帧的滚动区域位置
              top: '64%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '84%',
              maxWidth: '320px',
              height: '16%',
              maxHeight: '220px',
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
              <Image
                src="/images/campaign/modals/activity-rules.png"
                alt="活动规则"
                width={750}
                height={2000}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* 我知道了按钮点击区域 - 在最后一帧上 */}
          {animationFinished && (
            <button
              className="absolute bottom-[8%] left-[10%] right-[10%] h-[8%] cursor-pointer active:opacity-70 z-20"
              style={{ backgroundColor: 'rgba(255,0,0,0.0)' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
            />
          )}
        </div>
      </div>
    </ClientPortal>
  );
};
