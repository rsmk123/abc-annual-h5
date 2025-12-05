import React from 'react';
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

        {/* 背面 (问号) - 默认显示 */}
        <div className={cn(styles.cardFace, styles.cardBack, "absolute w-full h-full rounded-[20px] shadow-2xl flex flex-col justify-center items-center border-4 border-[#fff5d1]")}>
          <div className={cn(styles.cardBackInner, "w-[90%] h-[92%] border-2 border-dashed border-white/40 rounded-[16px] flex flex-col justify-center items-center")}>
            <div className="text-[80px] text-white/90 font-bold drop-shadow-sm">?</div>
            <div className="mt-2 text-base text-white bg-black/10 px-4 py-1 rounded-full">点击抽取今日好运</div>
          </div>
        </div>
      </div>
    </div>
  );
};
