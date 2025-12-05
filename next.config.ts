import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',                    // 启用静态HTML导出（DEPLOY-001）
  images: { unoptimized: true },       // 静态导出所需（DEPLOY-002）
  reactStrictMode: true,               // React最佳实践
  trailingSlash: true,                 // 为URL添加尾部斜杠
};

export default nextConfig;
