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

  // 当弹窗打开时，播放动画
  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      setAnimationFinished(false);
      setShowScrollArea(false);
      setAnimationKey((k) => k + 1);

      // 兜底：如果序列帧未触发 onComplete，9秒后也显示滚动区域（127帧/15fps≈8.5秒）
      const timer = setTimeout(() => {
        setAnimationFinished(true);
        setTimeout(() => setShowScrollArea(true), 100);
      }, 9000);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
      setAnimationFinished(false);
      setShowScrollArea(false);
    }
  }, [isOpen]);

  const finishAnimation = () => {
    setAnimationFinished(true);
    // 延迟显示滚动区域，实现渐现效果
    setTimeout(() => setShowScrollArea(true), 100);
  };

  const handleClose = () => {
    setShowAnimation(false);
    setAnimationFinished(false);
    setShowScrollArea(false);
    onClose();
  };

  if (!showAnimation) return null;

  return (
    <ClientPortal>
      {/* 全屏半透明黑底 - 浅一点 */}
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
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

          {/* 活动规则滚动区域 - 在最后一帧上渐现 */}
          {animationFinished && (
            <div 
              className="absolute overflow-hidden transition-opacity duration-500"
              style={{
                // 定位到序列帧最后一帧的滚动区域位置
                // 根据640x1138的帧尺寸，调整滚动区位置
                top: '55%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '84%',
                maxWidth: '320px',
                height: '28%',
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
          )}

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
