import React from 'react';
import Image from 'next/image';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { CardChar, getWabaoImage } from '@/lib/cardConfig';

// 抽卡阶段
export type DrawPhase = 'idle' | 'spinning' | 'revealing' | 'done';

interface CardProps {
  drawPhase: DrawPhase;
  resultChar: CardChar | null;
  onDraw: () => void;
  disabled?: boolean;
  hasDrawnToday?: boolean;
}

export const Card: React.FC<CardProps> = ({
  drawPhase,
  resultChar,
  onDraw,
  disabled,
  hasDrawnToday
}) => {
  const isSpinning = drawPhase === 'spinning';
  const showResult = drawPhase === 'revealing' || drawPhase === 'done';

  return (
    <div className={cn(styles.perspectiveContainer, "w-full h-full")}>
      <div
        className={cn(
          styles.cardContainer,
          "w-full h-full relative cursor-pointer",
          // 旋转时隐藏卡片，只显示视频动画
          isSpinning && "opacity-0",
          (disabled || hasDrawnToday) && "cursor-not-allowed"
        )}
        onClick={() => {
          if (!disabled && !hasDrawnToday && drawPhase === 'idle') {
            onDraw();
          }
        }}
      >
        {/* 正面 - 抽到的福卡（翻转后显示） */}
        <div className={cn(
          styles.cardFace,
          styles.cardFront,
          "absolute w-full h-full rounded-[20px] overflow-hidden",
          "flex flex-col justify-center items-center",
          "bg-gradient-to-b from-[#fff5e6] to-[#ffe4c4]",
          "border-4 border-[#f0c676]",
          "shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
        )}>
          {showResult && resultChar && (
            <div className="relative w-[90%] h-[90%]">
              <Image
                src={getWabaoImage(resultChar)}
                alt={resultChar}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>

        {/* 背面 - 蛙宝手持福字（使用设计稿素材） */}
        <div className={cn(
          styles.cardFace,
          styles.cardBack,
          "absolute w-full h-full overflow-hidden",
          "flex flex-col justify-center items-center"
        )}>
          {/* 使用设计稿的蛙宝卡片图片 */}
          <Image
            src="/images/campaign/design/wabao-card.png"
            alt="点击抽取福卡"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};
