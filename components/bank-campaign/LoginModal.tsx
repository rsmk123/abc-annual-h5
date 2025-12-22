import React, { useState } from 'react';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { sendCode, verifyCode } from '@/lib/api';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (phone: string) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin, onClose }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);

  // 生成设备ID（简单实现）
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const handleSendCode = async () => {
    if (phone.length !== 11) {
      alert('请输入正确的11位手机号');
      return;
    }

    if (countdown > 0) {
      return;
    }

    setSending(true);
    try {
      const result = await sendCode(phone, getDeviceId());
      if (result.success) {
        alert('验证码已发送');
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert(result.error || '发送失败，请稍后重试');
      }
    } catch (error) {
      alert('发送失败，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  const handleLogin = async () => {
    if (phone.length !== 11) {
      alert('请输入正确的11位手机号');
      return;
    }

    if (code.length !== 6) {
      alert('请输入6位验证码');
      return;
    }

    try {
      const result = await verifyCode(phone, code, getDeviceId());
      if (result.success) {
        // 保存 token
        localStorage.setItem('token', result.token);
        onLogin(phone);
      } else {
        alert(result.error || '验证失败，请重试');
      }
    } catch (error) {
      alert('验证失败，请重试');
    }
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
        
        <h3 className="text-[#333] text-xl font-bold mb-8 tracking-wide">绑定手机号</h3>
        
        <div className="space-y-4">
          {/* 手机号输入框 */}
          <div className="bg-[#f5f5f5] rounded-lg">
            <input 
              type="tel" 
              className="w-full bg-transparent border-none outline-none text-[16px] text-[#333] placeholder:text-[#999] px-4 py-4"
              placeholder="请输入手机号" 
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          {/* 验证码输入框 */}
          <div className="bg-[#f5f5f5] rounded-lg flex items-center overflow-hidden">
            <input
              type="number"
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-[16px] text-[#333] placeholder:text-[#999] px-4 py-4"
              placeholder="验证码"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              className="flex-shrink-0 px-3 py-4 text-[#b81c22] text-[14px] font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSendCode}
              disabled={countdown > 0 || sending}
            >
              {countdown > 0 ? `${countdown}s` : sending ? '...' : '获取验证码'}
            </button>
          </div>
        </div>

        <button 
          className="w-full py-4 rounded-lg font-bold text-base mt-8 active:scale-[0.98] transition-all bg-[#b81c22] text-white"
          onClick={handleLogin}
        >
          登录
        </button>
      </div>
    </div>
  );
};
