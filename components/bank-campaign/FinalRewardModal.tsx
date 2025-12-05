import React from 'react';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { Trophy, Camera, Info } from 'lucide-react';

interface FinalRewardModalProps {
  isOpen: boolean;
  userPhone: string;
  onClose: () => void;
}

export const FinalRewardModal: React.FC<FinalRewardModalProps> = ({ isOpen, userPhone, onClose }) => {
  const maskedPhone = userPhone ? userPhone.substr(0,3)+"****"+userPhone.substr(7) : '';

  return (
    <div className={cn(styles.modalMask, "fixed inset-0 z-50 flex justify-center items-center", isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
      <div className={cn(styles.modalBody, "w-[85%] max-w-[320px] rounded-[24px] p-8 text-center relative", isOpen ? "scale-100" : "scale-95 opacity-0")}>
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#f0c676] to-[#cfa002] rounded-full flex justify-center items-center shadow-lg">
          <Trophy className="text-white w-8 h-8" />
        </div>

        <h3 className="text-[#d92027] text-2xl font-bold mb-6 tracking-wide">五福集齐 · 恭喜</h3>
        
        <div className={cn(styles.posterMock, "w-full p-6 rounded-xl mb-6 flex flex-col justify-center items-center text-[#8a6e18] border border-[#d4af37]/30 shadow-inner bg-[#fffbf0]")}>
          <div className="text-lg font-bold mb-2 tracking-[0.2em]">马上发财哇</div>
          <div className="text-[40px] my-2">🧧</div>
          <div className="mt-2 text-sm font-medium">用户: <span className="font-mono">{maskedPhone}</span></div>
          <div className="text-[10px] opacity-60 mt-1 flex items-center gap-1">
            <Camera size={10} /> 请截图保存凭证
          </div>
        </div>

        <div className="text-left text-xs text-[#666] bg-[#f9f9f9] p-4 rounded-xl leading-relaxed border border-[#eee]">
          <div className="flex items-center gap-2 font-bold text-[#333] mb-2">
            <Info size={14} className="text-[#d92027]" />
            <span>兑奖流程</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>截图保存本页面</li>
            <li>前往小红书发布笔记</li>
            <li>添加话题 <span className="text-[#d92027] font-medium">#银行马上发财哇</span></li>
            <li>等待官方开奖通知</li>
          </ol>
        </div>

        <button 
          className={cn(styles.btnShine, styles.btnPrimary, "w-full py-4 rounded-xl font-bold text-base mt-6 active:scale-[0.98] transition-all")}
          onClick={onClose}
        >
          我知道了
        </button>
      </div>
    </div>
  );
};
