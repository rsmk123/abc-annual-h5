import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// 导入 polyfills（必须在其他导入之前，确保兼容性）
import "@/lib/polyfills";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "哇宝年货节 天天集福卡",
  description: "农行哇宝年货节，集福卡抽大奖",
};

// 禁止 iOS 在输入框聚焦时自动缩放
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
