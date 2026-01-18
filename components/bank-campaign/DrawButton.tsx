import React from 'react';
// 移除 Next.js Image 组件，使用原生 img 标签以兼容农行 WebView
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { IMAGES } from '@/lib/cardConfig';

interface DrawButtonProps {
  onClick: () => void;
  disabled: boolean;
  hasDrawnToday: boolean;
  isDrawing: boolean;
  allCollected?: boolean; // 是否集齐所有卡片
  onAlreadyDrawnClick?: () => void; // 已抽卡时点击的回调
  onMergeClick?: () => void; // 合成按钮点击回调
}

export const DrawButton: React.FC<DrawButtonProps> = ({
  onClick,
  disabled,
  hasDrawnToday,
  isDrawing,
  allCollected,
  onAlreadyDrawnClick,
  onMergeClick
}) => {
  // 旋转时隐藏按钮
  if (isDrawing) {
    return null;
  }

  // 集齐所有卡片时显示合成按钮
  if (allCollected) {
    return (
      <div className="w-full flex flex-col items-center">
        <button
          id="merge-btn"
          onClick={onMergeClick}
          className={cn(
            "transition-all duration-200",
            "active:scale-[0.98]",
            "hover:brightness-105"
          )}
        >
          <img
            src="/images/campaign/design/merge-btn.png"
            alt="点击合成大奖"
            className="h-[50px]"
          />
        </button>
      </div>
    );
  }

  // 已抽卡时，按钮可点击但触发不同回调
  const handleClick = () => {
    if (hasDrawnToday) {
      onAlreadyDrawnClick?.();
    } else if (!disabled) {
      onClick();
    }
  };

  const isDisabled = disabled && !hasDrawnToday;

  return (
    <div className="w-full flex flex-col items-center">
      {/* 主抽卡按钮 - 使用设计稿图片 */}
      <button
        id="draw-btn"
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "transition-all duration-200",
          "active:scale-[0.98]",
          isDisabled ? styles.btnDisabled : "hover:brightness-105"
        )}
      >
        {hasDrawnToday ? (
          // 已抽卡状态 - 使用切图（可点击弹出提示，加灰色效果）
          <img
            src={IMAGES.modals.thanksComeTomorrow}
            alt="感谢参与，明天再来"
            className="h-[50px] grayscale opacity-70"
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
      id="rules-btn"
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
