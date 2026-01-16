import { useEffect } from 'react';

/**
 * 弹窗打开时锁定 body 滚动，防止 iOS 橡皮筋效果
 */
export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      
      // 锁定 body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // 恢复 body
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        
        // 恢复滚动位置
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
}

