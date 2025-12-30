import React from 'react';
import Image from 'next/image';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { CardChar, getResultModalImage } from '@/lib/cardConfig';

interface ResultModalProps {
  isOpen: boolean;
  char: CardChar;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ isOpen, char, onClose }) => {
  const resultModalImage = char ? getResultModalImage(char) : '';

  return (
    <div 
      className={cn(
        styles.modalMask,
        "fixed inset-0 z-[200] flex flex-col justify-center items-center",
        "transition-opacity duration-300",
        isOpen && char ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      {/* 弹窗容器 - 两张全尺寸图片重叠 */}
      <div 
        className="relative w-full h-full max-w-[480px] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 背景图层 */}
        <div className="absolute inset-0">
          <Image
            src={resultModalImage}
            alt={`恭喜抽中${char}福卡`}
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* 按钮图层 - 同样全屏覆盖，利用图片自身的透明区域对位 */}
        <button
          className="absolute inset-0 w-full h-full cursor-pointer active:opacity-90 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        >
          <Image
            src="/images/campaign/modals/收下福卡按钮.png"
            alt="收下福卡"
            fill
            className="object-contain"
            priority
          />
        </button>
      </div>
    </div>
  );
};
