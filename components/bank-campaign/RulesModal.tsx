import React from 'react';
import Image from 'next/image';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <div 
      className={cn(
        styles.modalMask,
        "fixed inset-0 z-[300] flex flex-col justify-center items-center p-4",
        "transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      {/* 弹窗容器 - 缩小宽度 */}
      <div 
        className="relative w-[90%] max-w-[400px] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 外层卡片背景：米色底 + 深色边框 */}
        <div className="relative w-full aspect-[3/4] rounded-[24px] overflow-hidden shadow-2xl bg-[#FFFBF0] border-[4px] border-[#FAEBD7]">
          
          {/* 白色圆角矩形内容区 - 极小边距 */}
          <div className="absolute top-[8px] left-[8px] right-[8px] bottom-[12px] bg-white rounded-[18px] overflow-hidden shadow-sm">
            <div className="w-full h-full overflow-y-auto px-1 py-2">
              <Image
                src="/images/campaign/modals/rules.png"
                alt="抽奖流程"
                width={750}
                height={2000}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>

        {/* 关闭按钮 - 悬浮在底部 */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute -bottom-16 w-10 h-10 rounded-full border-2 border-white/60 flex items-center justify-center text-white/80 hover:bg-white/10 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
