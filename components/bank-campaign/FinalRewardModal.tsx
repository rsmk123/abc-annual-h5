import React, { useState, useEffect } from 'react';
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
  const [showModal, setShowModal] = useState(false);
  const [showScrollArea, setShowScrollArea] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // 当弹窗打开时，先播放动画，再显示弹窗
  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      setShowModal(false);
      setShowScrollArea(false);
      setAnimationKey((k) => k + 1);

      // 兜底：如果序列帧未触发 onComplete，9秒后也进入弹窗（127帧/15fps≈8.5秒）
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setShowModal(true);
        // 延迟显示滚动区域，实现渐现效果
        setTimeout(() => setShowScrollArea(true), 100);
      }, 9000);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
      setShowModal(false);
      setShowScrollArea(false);
    }
  }, [isOpen]);

  const finishAnimation = () => {
    setShowAnimation(false);
    setShowModal(true);
    // 延迟显示滚动区域，实现渐现效果
    setTimeout(() => setShowScrollArea(true), 100);
  };

  const handleClose = () => {
    setShowModal(false);
    setShowScrollArea(false);
    onClose();
  };

  return (
    <>
      {/* 哇宝骑马动画 - 全屏黑底 + 序列帧 */}
      {showAnimation && (
        <ClientPortal>
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{
                maxWidth: '100vw',
                maxHeight: '100vh',
              }}
            >
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
            </div>
          </div>
        </ClientPortal>
      )}

      {/* 恭喜弹窗 - 使用新切图 */}
      {showModal && (
        <ClientPortal>
          <div 
            className={cn(
              "fixed inset-0 z-[100] bg-black/75 flex flex-col justify-center items-center overflow-y-auto py-4",
              "transition-opacity duration-300"
            )}
            onClick={handleClose}
          >
            {/* 弹窗容器 */}
            <div 
              className={cn(
                "relative w-[95%] max-w-[400px]",
                "transition-all duration-300"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 新切图作为背景 - 带活动说明滚动区域占位 */}
              <div className="relative w-full aspect-[750/1624]">
                <Image
                  src="/images/campaign/modals/final-reward-new.png"
                  alt="恭喜集齐全部福卡"
                  fill
                  className="object-contain"
                  priority
                />
                
                {/* 活动说明滚动区域 - 定位在金色边框内，带渐现效果 */}
                <div 
                  className="absolute overflow-hidden transition-opacity duration-500"
                  style={{
                    top: '55%',
                    left: '8%',
                    right: '8%',
                    height: '28%',
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
                      alt="抽奖流程"
                      width={750}
                      height={2000}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                
                {/* 我知道了按钮点击区域 */}
                <button
                  className="absolute bottom-[1%] left-[5%] right-[5%] h-[8%] cursor-pointer active:opacity-70 z-20"
                  style={{ backgroundColor: 'rgba(255,0,0,0.0)' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClose();
                  }}
                />
              </div>
            </div>
          </div>
        </ClientPortal>
      )}
    </>
  );
};
