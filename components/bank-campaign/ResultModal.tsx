import React from 'react';
// 移除 Next.js Image 组件，使用原生 img 标签以兼容农行 WebView
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { CardChar, getResultModalImage } from '@/lib/cardConfig';
// v19: 移除 ClientPortal，直接渲染，避免 Portal 在某些 WebView 中不工作
import { useBodyScrollLock } from './useBodyScrollLock';

interface ResultModalProps {
  isOpen: boolean;
  char: CardChar;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ isOpen, char, onClose }) => {
  // 锁定 body 滚动
  useBodyScrollLock(isOpen && !!char);

  const resultModalImage = char ? getResultModalImage(char) : '';

  return (
    <>
      {/* v19: 移除 ClientPortal，直接渲染，避免 Portal 在某些 WebView 中不工作 */}
      <div
        id="result-modal"
        className="transition-opacity duration-300"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          display: 'none', // 默认隐藏，由内联脚本控制
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* 弹窗容器 - 两张全尺寸图片重叠 */}
        <div 
          className="relative w-full h-full max-w-[480px] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
        {/* 背景图层 - 使用原生 img 标签兼容农行 WebView */}
        <div className="absolute inset-0">
          <img
            id="result-card-img"
            src={resultModalImage}
            alt={`恭喜抽中${char}福卡`}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* 按钮图层 - 同样全屏覆盖，利用图片自身的透明区域对位 */}
        <button
          id="result-close"
          className="absolute inset-0 w-full h-full cursor-pointer active:opacity-90 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        >
          {/* 使用原生 img 标签兼容农行 WebView */}
          <img
            src="/images/campaign/modals/收下福卡按钮.png"
            alt="收下福卡"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </button>
      </div>
    </div>
    </>
  );
};
