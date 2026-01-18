import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // 开发环境不使用静态导出，以便使用代理功能
  ...(isDev ? {} : { output: 'export' }),
  images: { unoptimized: true },       // 静态导出所需（DEPLOY-002）
  reactStrictMode: true,               // React最佳实践
  trailingSlash: true,                 // 为URL添加尾部斜杠
  typescript: {
    ignoreBuildErrors: true,           // 跳过类型检查（已删除 app/api）
  },
  // 编译选项：增强浏览器兼容性
  compiler: {
    // 移除 console.log（生产环境）
    removeConsole: isDev ? false : {
      exclude: ['error', 'warn'],
    },
  },
  // 确保 CSS 正确加载（兼容性）
  experimental: {
    optimizeCss: false, // 禁用 CSS 优化，避免兼容性问题
  },
  // 开发环境 API 代理，绕过 CORS 问题
  async rewrites() {
    if (isDev) {
      return [
        {
          source: '/api/:path*',
          destination: 'https://1331245644-lnsmyztba1.ap-guangzhou.tencentscf.com/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
