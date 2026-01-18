import React from 'react';
// 移除 Next.js Image 组件，使用原生 img 标签以兼容农行 WebView
// v22: 移除 cn，完全使用内联样式
import { useBodyScrollLock } from './useBodyScrollLock';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  // 锁定 body 滚动
  useBodyScrollLock(isOpen);

  // v22: 完全内联样式，兼容旧版 WebView

  return (
    <>
      {/* v22: 完全内联样式版本，兼容荣耀等旧版 WebView */}
      <div
        id="rules-modal"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 300,
          display: 'none', // 默认隐藏，由内联脚本控制
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          transition: 'opacity 0.3s',
        }}
      >
        {/* 弹窗容器 */}
        <div
          style={{
            position: 'relative',
            width: '90%',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 外层卡片背景：使用 padding-top 技巧实现 3:4 宽高比 */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '133.33%', // 4/3 * 100% = 133.33% 实现 3:4 宽高比
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              backgroundColor: '#FFFBF0',
              border: '4px solid #FAEBD7',
            }}
          >
            {/* 白色圆角矩形内容区 - 使用绝对定位填满 */}
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '8px',
                bottom: '12px',
                backgroundColor: 'white',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  overflowY: 'auto',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* 使用原生 img 标签兼容农行 WebView */}
                <img
                  src="/images/campaign/modals/rules.png"
                  alt="抽奖流程"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 关闭按钮 - 悬浮在底部，完全内联样式 */}
          <button
            id="rules-close"
            style={{
              position: 'absolute',
              bottom: '-64px',
              left: '50%',
              WebkitTransform: 'translateX(-50%)',
              msTransform: 'translateX(-50%)',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.6)',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
            }}
          >
            <svg
              style={{ width: '20px', height: '20px' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
