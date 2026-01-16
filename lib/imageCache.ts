/**
 * 全局图片缓存
 * 用于预加载序列帧图片，避免 FrameAnimation 组件重复加载
 */

// 全局图片缓存 Map
const imageCache = new Map<string, HTMLImageElement>();

// 正在加载中的 Promise Map（避免重复加载同一图片）
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

/**
 * 预加载图片并存入缓存
 * @param src 图片路径
 * @returns Promise<HTMLImageElement>
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  // 已缓存，直接返回
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  // 正在加载中，返回现有 Promise
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }

  // 创建新的加载 Promise
  const promise = new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      loadingPromises.delete(src);
      resolve(img);
    };
    img.onerror = () => {
      // 加载失败也存入缓存（空图片），避免重复尝试
      loadingPromises.delete(src);
      resolve(img);
    };
    img.src = src;
  });

  loadingPromises.set(src, promise);
  return promise;
}

/**
 * 从缓存获取图片
 * @param src 图片路径
 * @returns HTMLImageElement | undefined
 */
export function getCachedImage(src: string): HTMLImageElement | undefined {
  return imageCache.get(src);
}

/**
 * 检查图片是否已缓存
 * @param src 图片路径
 */
export function isImageCached(src: string): boolean {
  return imageCache.has(src);
}

/**
 * 批量预加载图片
 * @param srcs 图片路径数组
 * @returns Promise<HTMLImageElement[]>
 */
export function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map(src => preloadImage(src)));
}

/**
 * 获取缓存状态
 */
export function getCacheStats(): { total: number; loading: number } {
  return {
    total: imageCache.size,
    loading: loadingPromises.size,
  };
}

