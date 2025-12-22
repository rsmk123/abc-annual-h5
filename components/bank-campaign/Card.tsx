import React from 'react';
import Image from 'next/image';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';

interface CardProps {
  isFlipped: boolean;
  resultChar: string;
  onDraw: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({ isFlipped, resultChar, onDraw, disabled }) => {
  return (
    <div className={styles.perspectiveContainer}>
      <div 
        className={cn(
          styles.cardContainer, 
          "w-[240px] h-[340px] relative cursor-pointer",
          isFlipped && styles.flipped
        )}
        onClick={() => !disabled && onDraw()}
      >
        {/* 正面 (结果) - 翻转后显示 */}
        <div className={cn(styles.cardFace, styles.cardFront, "absolute w-full h-full rounded-[20px] shadow-2xl flex flex-col justify-center items-center bg-white border-[6px] border-[#f0c676]")}>
          <div className={cn(styles.cardChar, "text-[160px] font-bold select-none leading-none mt-[-20px]")}>
            {resultChar}
          </div>
          <div className="text-xs text-gray-300 mt-4 font-mono tracking-widest">- 2025 -</div>
        </div>

        {/* 背面 (卡片背面图) - 默认显示 */}
        <div className={cn(styles.cardFace, styles.cardBack, "absolute w-full h-full rounded-[20px] shadow-2xl overflow-hidden")}>
          <Image
            src="/images/card-back.png"
            alt="点击抽取今日好运"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
};
