import React, { useState, useEffect, useRef, useCallback } from 'react';

interface FrameAnimationProps {
  /** 帧图片路径前缀，如 '/images/frames/card-spin/集福卡_' */
  framePrefix: string;
  /** 帧文件扩展名，默认 '.png' */
  frameExtension?: string;
  /** 总帧数 */
  totalFrames: number;
  /** 帧率 (fps)，默认 25 */
  fps?: number;
  /** 是否循环播放 */
  loop?: boolean;
  /** 动画完成回调 */
  onComplete?: () => void;
  /** 额外的 className */
  className?: string;
  /** 额外的 style */
  style?: React.CSSProperties;
  
  // ========== 两段式播放支持 ==========
  /** 第二段帧路径前缀（可选，用于抽卡动画：共用问号帧 + 卡片特定帧） */
  secondPrefix?: string;
  /** 第二段起始帧编号（在原始序列中的编号），默认等于 totalFrames */
  secondStartIndex?: number;
  /** 第二段帧数量 */
  secondFrames?: number;
}

/**
 * 序列帧动画组件
 * 使用 Canvas 高性能播放序列帧，避免 iOS 视频兼容性问题
 * 支持两段式播放：先播放共用帧，再播放卡片特定帧
 */
export const FrameAnimation: React.FC<FrameAnimationProps> = ({
  framePrefix,
  frameExtension = '.png',
  totalFrames,
  fps = 25,
  loop = false,
  onComplete,
  className = '',
  style = {},
  secondPrefix,
  secondStartIndex,
  secondFrames = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const frameIndexRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const isFinishedRef = useRef(false);
  
  // 用 ref 保存回调，避免依赖变化导致重新播放
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // 计算实际总帧数
  const actualTotalFrames = totalFrames + secondFrames;
  const actualSecondStartIndex = secondStartIndex ?? totalFrames;

  // 生成帧文件名（5位数字补零）
  const getFramePath = useCallback((index: number) => {
    const paddedIndex = String(index).padStart(5, '0');
    // 如果是两段式播放且当前是第二段
    if (secondPrefix && index >= totalFrames) {
      const secondIndex = actualSecondStartIndex + (index - totalFrames);
      const paddedSecondIndex = String(secondIndex).padStart(5, '0');
      return `${secondPrefix}${paddedSecondIndex}${frameExtension}`;
    }
    return `${framePrefix}${paddedIndex}${frameExtension}`;
  }, [framePrefix, frameExtension, secondPrefix, totalFrames, actualSecondStartIndex]);

  // 预加载所有帧（包括两段）
  useEffect(() => {
    let isMounted = true;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    // 重置状态
    setIsLoaded(false);
    isFinishedRef.current = false;
    frameIndexRef.current = 0;

    const loadImage = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (isMounted) {
            loadedImages[index] = img;
            loadedCount++;
            if (loadedCount === actualTotalFrames) {
              setImages(loadedImages);
              setIsLoaded(true);
            }
          }
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load frame: ${getFramePath(index)}`);
          loadedCount++;
          if (loadedCount === actualTotalFrames) {
            setImages(loadedImages);
            setIsLoaded(true);
          }
          resolve();
        };
        img.src = getFramePath(index);
      });
    };

    Promise.all(
      Array.from({ length: actualTotalFrames }, (_, i) => loadImage(i))
    );

    return () => {
      isMounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [actualTotalFrames, getFramePath]);

  // 播放动画 - 只依赖 isLoaded 和 images，不依赖 onComplete
  useEffect(() => {
    if (!isLoaded || images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const firstImage = images[0];
    if (firstImage) {
      canvas.width = firstImage.naturalWidth;
      canvas.height = firstImage.naturalHeight;
    }

    const frameDuration = 1000 / fps;
    
    // 重置播放状态
    frameIndexRef.current = 0;
    lastFrameTimeRef.current = 0;
    isFinishedRef.current = false;

    const animate = (timestamp: number) => {
      if (isFinishedRef.current) return;

      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameDuration) {
        const frameIndex = frameIndexRef.current;
        const img = images[frameIndex];

        if (img) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }

        frameIndexRef.current++;
        lastFrameTimeRef.current = timestamp;

        if (frameIndexRef.current >= actualTotalFrames) {
          if (loop) {
            frameIndexRef.current = 0;
          } else {
            isFinishedRef.current = true;
            onCompleteRef.current?.(); // 使用 ref 调用回调
            return;
          }
        }
      }

      if (!isFinishedRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isLoaded, images, fps, loop, actualTotalFrames]); // 使用 actualTotalFrames

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
};

export default FrameAnimation;
