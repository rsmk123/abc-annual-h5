import React, { useState } from 'react';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { Smartphone, Lock, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (phone: string) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin, onClose }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const handleLogin = () => {
    if (phone.length !== 11) {
      alert("请输入11位手机号演示");
      return;
    }
    onLogin(phone);
  };

  return (
    <div className={cn(styles.modalMask, "fixed inset-0 z-50 flex justify-center items-center", isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
      <div className={cn(styles.modalBody, "w-[85%] max-w-[320px] rounded-[24px] p-8 text-center relative", isOpen ? "scale-100" : "scale-95 opacity-0")}>
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-black/20 hover:text-black/50 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 顶部装饰 */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#f0c676] to-[#cfa002] rounded-2xl flex justify-center items-center shadow-lg transform rotate-3">
          <Smartphone className="text-white w-8 h-8" />
        </div>
        
        <h3 className="text-[#333] text-xl font-bold mb-2 tracking-wide">手机号登录</h3>
        <p className="text-[#999] text-xs mb-8 font-light">登录后数据将自动同步至云端</p>
        
        <div className="space-y-4">
          <div className={cn(styles.inputBox, "group border border-transparent focus-within:border-[#f0c676] transition-all duration-300 rounded-xl px-4 py-3 flex items-center")}>
            <Smartphone className="text-[#ccc] group-focus-within:text-[#d4af37] w-5 h-5 transition-colors" />
            <div className="w-[1px] h-4 bg-[#eee] mx-3"></div>
            <input 
              type="tel" 
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#333] placeholder:text-[#ccc]"
              placeholder="请输入手机号" 
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <div className={cn(styles.inputBox, "group border border-transparent focus-within:border-[#f0c676] transition-all duration-300 rounded-xl px-4 py-3 flex-1 flex items-center")}>
              <Lock className="text-[#ccc] group-focus-within:text-[#d4af37] w-5 h-5 transition-colors" />
              <div className="w-[1px] h-4 bg-[#eee] mx-3"></div>
              <input 
                type="number" 
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#333] placeholder:text-[#ccc] w-full"
                placeholder="验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button 
              className="px-4 rounded-xl text-[#d4af37] text-sm font-medium border border-[#f0c676]/30 hover:bg-[#f0c676]/10 active:scale-95 transition-all whitespace-nowrap"
              onClick={() => alert('模拟验证码: 8888')}
            >
              获取
            </button>
          </div>
        </div>

        <button 
          className={cn(styles.btnShine, styles.btnPrimary, "w-full py-4 rounded-xl font-bold text-base mt-8 active:scale-[0.98] transition-all")}
          onClick={handleLogin}
        >
          立即参与
        </button>
      </div>
    </div>
  );
};
