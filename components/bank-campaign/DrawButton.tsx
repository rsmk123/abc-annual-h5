import React from 'react';
import Image from 'next/image';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { IMAGES } from '@/lib/cardConfig';

interface DrawButtonProps {
  onClick: () => void;
  disabled: boolean;
  hasDrawnToday: boolean;
  isDrawing: boolean;
}

export const DrawButton: React.FC<DrawButtonProps> = ({
  onClick,
  disabled,
  hasDrawnToday,
  isDrawing
}) => {
  const isDisabled = disabled || hasDrawnToday || isDrawing;

  // 旋转时隐藏按钮
  if (isDrawing) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* 主抽卡按钮 - 使用设计稿图片 */}
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          "transition-all duration-200",
          "active:scale-[0.98]",
          isDisabled ? styles.btnDisabled : "hover:brightness-105"
        )}
      >
        {hasDrawnToday ? (
          // 已抽卡状态 - 使用切图
          <img
            src={IMAGES.modals.thanksComeTomorrow}
            alt="感谢参与，明天再来"
            className="h-[50px]"
          />
        ) : (
          // 正常状态：使用设计稿按钮图片
          <img
            src="/images/campaign/design/draw-btn.png"
            alt="点击抽取今日福卡"
            className="h-[60px]"
          />
        )}
      </button>
    </div>
  );
};

// 单独导出规则按钮组件
interface RulesButtonProps {
  onClick?: () => void;
}

export const RulesButton: React.FC<RulesButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="transition-all active:scale-[0.98] hover:brightness-105"
    >
      <img
        src="/images/campaign/design/rules-btn.png"
        alt="点击查看抽奖规则"
        className="h-[32px]"
      />
    </button>
  );
};
