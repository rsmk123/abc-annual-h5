/**
 * Polyfills for older browsers (especially Honor/Huawei built-in browsers)
 */

// requestIdleCallback polyfill
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  (window as any).requestIdleCallback = function(cb: (deadline: { timeRemaining: () => number; didTimeout: boolean }) => void, opts?: { timeout?: number }) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        didTimeout: false,
      });
    }, opts?.timeout || 1);
  };

  (window as any).cancelIdleCallback = function(id: number) {
    clearTimeout(id);
  };
}

// IntersectionObserver polyfill (if needed)
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  // 简单的降级实现
  (window as any).IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Promise polyfill check
if (typeof window !== 'undefined' && !window.Promise) {
  console.warn('Promise not supported, please add polyfill');
}

// Object.assign polyfill
if (typeof window !== 'undefined' && typeof Object.assign !== 'function') {
  Object.assign = function(target: any, ...sources: any[]) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    const to = Object(target);
    for (let index = 0; index < sources.length; index++) {
      const nextSource = sources[index];
      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Array.from polyfill (if needed)
if (typeof window !== 'undefined' && !Array.from) {
  Array.from = function<T>(arrayLike: ArrayLike<T>): T[] {
    return Array.prototype.slice.call(arrayLike) as T[];
  };
}

