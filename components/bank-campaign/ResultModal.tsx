import React from 'react';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  char: string;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ isOpen, char, onClose }) => {
  return (
    <div className={cn(styles.modalMask, "fixed inset-0 z-50 flex justify-center items-center", isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
      <div className={cn(styles.modalBody, "w-[85%] max-w-[320px] rounded-[32px] p-8 text-center relative", isOpen ? "scale-100" : "scale-95 opacity-0")}>
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-black/20 hover:text-black/50 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 顶部装饰 - 高级红包图标 SVG */}
        <div className="w-20 h-20 mx-auto mb-4 flex justify-center items-center drop-shadow-xl animate-bounce">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="25" width="60" height="70" rx="4" fill="#D92027"/>
            <path d="M20 35C20 35 50 60 80 35" stroke="#F0C676" strokeWidth="2"/>
            <circle cx="50" cy="45" r="12" fill="#F0C676"/>
            <rect x="42" y="37" width="16" height="16" rx="2" fill="#D92027"/>
            <path d="M45 45H55M50 40V50" stroke="#F0C676" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 className="text-[#333] text-2xl font-bold my-2 tracking-wider font-serif">欧气爆发</h2>
        <div className="text-sm text-[#999] font-light">恭喜你抽中一张</div>
        
        <div className={cn(styles.cardChar, "text-[100px] font-bold my-4 leading-none font-serif")}>
          {char}
        </div>
        
        <button 
          className={cn(styles.btnShine, styles.btnPrimary, "w-full py-4 rounded-2xl font-bold text-base mt-6 active:scale-[0.98] transition-all")}
          onClick={onClose}
        >
          收下卡片
        </button>
      </div>
    </div>
  );
};
