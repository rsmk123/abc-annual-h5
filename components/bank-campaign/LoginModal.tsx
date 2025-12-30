import React, { useState } from 'react';
import Image from 'next/image';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { sendCode, verifyCode } from '@/lib/api';

interface LoginModalProps {
  isOpen: boolean;
  testMode?: boolean; // 测试模式：跳过API验证
  onLogin: (phone: string) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, testMode = false, onLogin, onClose }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [agreed, setAgreed] = useState(true);

  // 生成设备ID
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

    if (countdown > 0) return;

    setSending(true);
    
    // 测试模式：直接模拟成功，不调用API
    if (testMode) {
      alert('【测试模式】验证码已发送（任意6位数字即可登录）');
      setCountdown(10); // 测试模式缩短倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setSending(false);
      return;
    }
    
    // 真实模式：调用API
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
      alert(error instanceof Error ? error.message : '发送失败，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  const handleLogin = async () => {
    if (!agreed) {
      alert('请先阅读并同意活动详情');
      return;
    }

    if (phone.length !== 11) {
      alert('请输入正确的11位手机号');
      return;
    }

    // 测试模式：任意验证码都通过
    if (testMode) {
      if (code.length < 1) {
        alert('【测试模式】请输入任意验证码');
        return;
      }
      console.log('【测试模式】登录成功:', phone);
      onLogin(phone);
      return;
    }

    // 真实模式：验证6位验证码
    if (code.length !== 6) {
      alert('请输入6位验证码');
      return;
    }

    try {
      const result = await verifyCode(phone, code, getDeviceId());
      if (result.success) {
        onLogin(phone);
      } else {
        alert(result.error || '验证失败，请重试');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '验证失败，请重试');
    }
  };

  return (
    <div 
      className={cn(
        styles.modalMask,
        "fixed inset-0 z-[200] flex justify-center items-center",
        "transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      {/* 弹窗容器 */}
      <div 
        className="relative w-[85%] max-w-[320px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 切图背景 - 贴边版本 */}
        <div className="relative w-full aspect-[690/966]">
          <Image
            src="/images/campaign/modals/login-modal.png"
            alt="绑定手机号"
            fill
            className="object-contain"
            priority
          />
          
          {/* 输入框区域 - 用CSS创建圆角矩形 */}
          <div className="absolute top-[18%] left-[8%] right-[8%] bottom-[28%] flex flex-col justify-center gap-4 px-2">
            {/* 手机号输入框 */}
            <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe4c4] rounded-full px-5 py-4 shadow-inner">
              <input 
                type="tel" 
                className="w-full bg-transparent border-none outline-none text-[15px] text-[#333] placeholder:text-[#999]"
                placeholder="请输入手机号" 
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* 验证码输入框 */}
            <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe4c4] rounded-full px-5 py-4 shadow-inner flex items-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] text-[#333] placeholder:text-[#999]"
                placeholder="请输入验证码"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <button
                className="flex-shrink-0 text-[#d92027] text-[13px] font-medium whitespace-nowrap disabled:opacity-50"
                onClick={handleSendCode}
                disabled={countdown > 0 || sending}
              >
                {countdown > 0 ? `${countdown}s` : sending ? '...' : '获取验证码'}
              </button>
            </div>
          </div>

          {/* 复选框点击区域 */}
          <div 
            className="absolute bottom-[18%] left-[8%] right-[8%] h-[6%] flex items-center justify-center cursor-pointer"
            onClick={() => setAgreed(!agreed)}
          />

          {/* 登录按钮点击区域 */}
          <button 
            className="absolute bottom-[4%] left-[10%] right-[10%] h-[12%] bg-transparent cursor-pointer active:opacity-80 z-10"
            onClick={handleLogin}
          />
        </div>

        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
