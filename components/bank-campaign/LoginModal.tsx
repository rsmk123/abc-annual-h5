import React, { useState } from 'react';
import Image from 'next/image';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';
import { sendCode, verifyCode } from '@/lib/api';
import { ClientPortal } from './ClientPortal';
import { RulesModal } from './RulesModal';
import { useBodyScrollLock } from './useBodyScrollLock';

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
  const [loggingIn, setLoggingIn] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // 锁定 body 滚动
  useBodyScrollLock(isOpen);

  // 显示 Toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // 生成设备ID
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  // 启动倒计时
  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (phone.length !== 11) {
      showToast('请输入正确的11位手机号');
      return;
    }

    if (countdown > 0) return;

    // 乐观更新：立即开始倒计时
    setSending(true);
    startCountdown(testMode ? 10 : 60);
    
    // 测试模式：直接模拟成功
    if (testMode) {
      setSending(false);
      return;
    }
    
    // 真实模式：调用API（后台执行，不阻塞）
    try {
      const result = await sendCode(phone, getDeviceId());
      if (!result.success) {
        showToast(result.error || '发送失败');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleLogin = async () => {
    // 乐观更新：点击后立即变灰显示loading
    setLoggingIn(true);

    if (!agreed) {
      showToast('请先阅读并同意活动详情');
      setLoggingIn(false);
      return;
    }

    if (phone.length !== 11) {
      showToast('请输入正确的11位手机号');
      setLoggingIn(false);
      return;
    }

    // 测试模式：任意验证码都通过
    if (testMode) {
      if (code.length < 1) {
        showToast('请输入任意验证码');
        setLoggingIn(false);
        return;
      }
      console.log('【测试模式】登录成功:', phone);
      onLogin(phone);
      return;
    }

    // 真实模式：验证6位验证码
    if (code.length !== 6) {
      showToast('请输入6位验证码');
      setLoggingIn(false);
      return;
    }
    console.log('[登录] 开始验证...', { phone, code: code.length + '位' });
    const startTime = Date.now();
    
    try {
      const result = await verifyCode(phone, code, getDeviceId());
      console.log('[登录] 验证完成，耗时:', Date.now() - startTime, 'ms');
      
      if (result.success) {
        onLogin(phone);
      } else {
        showToast(result.error || '验证失败，请重试');
      }
    } catch (error) {
      console.error('[登录] 验证失败:', error);
      showToast(error instanceof Error ? error.message : '验证失败，请重试');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <ClientPortal>
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
                className="w-full bg-transparent border-none outline-none text-[16px] text-[#333] placeholder:text-[#999]"
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
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[16px] text-[#333] placeholder:text-[#999]"
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

          {/* 复选框和协议文字 */}
          <div className="absolute bottom-[26%] left-[8%] right-[8%] h-[6%] flex items-center justify-center gap-2">
            {/* 勾选框 */}
            <div 
              className={cn(
                "w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors duration-200",
                agreed ? "bg-[#1890ff] border-[#1890ff]" : "bg-white border-gray-300"
              )}
              onClick={() => setAgreed(!agreed)}
            >
              {agreed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {/* 协议文字 */}
            <span className="text-white text-[12px] cursor-pointer" onClick={() => setShowRules(true)}>
              我已阅读并知悉<span className="text-[#1890ff] underline">本活动详情</span>
            </span>
          </div>

            {/* 登录按钮点击区域 */}
            <button 
              className={cn(
                "absolute bottom-[4%] left-[10%] right-[10%] h-[12%] cursor-pointer z-10 flex items-center justify-center rounded-full overflow-hidden",
                loggingIn ? "pointer-events-none" : "active:opacity-80"
              )}
              onClick={handleLogin}
              disabled={loggingIn}
            >
              {/* 按钮灰色遮罩 - loggingIn 时立即变灰 */}
              {loggingIn && (
                <div className="absolute inset-0 bg-black/60 rounded-full" />
              )}
            </button>
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

      {/* 活动详情弹窗 */}
      <RulesModal 
        isOpen={showRules} 
        onClose={() => setShowRules(false)} 
      />

      {/* Loading 浮层 */}
      {loggingIn && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center">
          <div className="bg-black/80 text-white px-6 py-4 rounded-lg flex items-center gap-3 shadow-xl">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">登录中...</span>
          </div>
        </div>
      )}

      {/* Toast 提示 */}
      {toastMsg && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 text-white px-6 py-4 rounded-lg shadow-xl max-w-[280px] text-center">
            <span className="text-sm">{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
    </ClientPortal>
  );
};
