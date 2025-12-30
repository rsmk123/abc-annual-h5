import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';

interface FinalRewardModalProps {
  isOpen: boolean;
  userPhone: string;
  onClose: () => void;
}

export const FinalRewardModal: React.FC<FinalRewardModalProps> = ({ isOpen, userPhone, onClose }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rideVideoKey, setRideVideoKey] = useState(0);

  // 当弹窗打开时，先播放动画，再显示弹窗
  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      setShowModal(false);
      setRideVideoKey((k) => k + 1);

      // 兜底：如果视频未触发 ended/error，3.5 秒后也进入弹窗（视频约2.5秒）
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setShowModal(true);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
      setShowModal(false);
    }
  }, [isOpen]);

  const finishAnimation = () => {
    setShowAnimation(false);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <>
      {/* 哇宝骑马动画 - 9:16 比例居中对齐 */}
      {showAnimation && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center -mt-[1.5vh]">
          <div 
            className="relative max-w-[480px] w-full h-full mx-auto"
            style={{
              aspectRatio: '9/16',
              maxHeight: '100vh',
            }}
          >
            <video
              key={rideVideoKey}
              autoPlay
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              onEnded={finishAnimation}
              onError={finishAnimation}
            >
              <source src="/video/horse-ride.webm" type="video/webm" />
            </video>
          </div>
        </div>
      )}

      {/* 恭喜弹窗 - 使用新切图 */}
      <div 
        className={cn(
          styles.modalMask,
          "fixed inset-0 z-50 flex flex-col justify-center items-center overflow-y-auto py-4",
          showModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          "transition-opacity duration-300"
        )}
        onClick={handleClose}
      >
        {/* 弹窗容器 */}
        <div 
          className={cn(
            "relative w-[95%] max-w-[400px]",
            showModal ? "scale-100" : "scale-95 opacity-0",
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
            
            {/* 活动说明滚动区域 - 定位在金色边框内 */}
            <div 
              className="absolute overflow-hidden"
              style={{
                top: '55%',
                left: '8%',
                right: '8%',
                height: '28%',
                borderRadius: '12px',
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
    </>
  );
};
