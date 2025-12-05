"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 自动重定向到集五福页面
    router.push('/bank-campaign');
  }, [router]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#b81c22] to-[#8a1519] flex flex-col justify-center items-center text-white">
      <div className="text-6xl font-bold mb-4">🧧</div>
      <div className="text-2xl font-bold tracking-widest mb-2">农行开门红</div>
      <div className="text-sm opacity-80">正在跳转...</div>
    </div>
  );
}
