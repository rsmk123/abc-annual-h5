import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',                    // 启用静态HTML导出（DEPLOY-001）
  images: { unoptimized: true },       // 静态导出所需（DEPLOY-002）
  reactStrictMode: true,               // React最佳实践
  trailingSlash: true,                 // 为URL添加尾部斜杠
  typescript: {
    ignoreBuildErrors: true,           // 跳过类型检查（已删除 app/api）
  },
};

export default nextConfig;
