"use client";

import React, { useState } from 'react';
import styles from '@/components/bank-campaign/campaign.module.css';
import { Card } from '@/components/bank-campaign/Card';
import { CollectionSlots } from '@/components/bank-campaign/CollectionSlots';
import { LoginModal } from '@/components/bank-campaign/LoginModal';
import { ResultModal } from '@/components/bank-campaign/ResultModal';
import { FinalRewardModal } from '@/components/bank-campaign/FinalRewardModal';
import { cn } from '@/lib/utils';

const CARDS = ['马', '上', '发', '财', '哇'];

export default function BankCampaignPage() {
  // State
  const [collected, setCollected] = useState<boolean[]>([false, false, false, false, false]);
  const [userPhone, setUserPhone] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentResult, setCurrentResult] = useState('');
  
  // Modals
  const [showLogin, setShowLogin] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  // Logic
  const handleLogin = (phone: string) => {
    setUserPhone(phone);
    setShowLogin(false);
  };

  const getLuckyIndex = () => {
    const missing: number[] = [];
    collected.forEach((v, i) => { if(!v) missing.push(i); });
    
    if (missing.length > 0) {
      // 100% chance to get a new card for demo purposes
      return missing[Math.floor(Math.random() * missing.length)];
    }
    return Math.floor(Math.random() * 5);
  };

  const drawCard = () => {
    if (!userPhone) {
      setShowLogin(true);
      return;
    }
    
    // Check if already collected all
    if (collected.every(Boolean)) {
      setShowFinal(true);
      return;
    }

    if (isFlipped) return;

    const newIndex = getLuckyIndex();
    const char = CARDS[newIndex];
    setCurrentResult(char);
    
    // Flip animation
    setIsFlipped(true);

    // Update state after animation
    setTimeout(() => {
      const newCollected = [...collected];
      newCollected[newIndex] = true;
      setCollected(newCollected);
      
      // Show result modal
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }, 800);
  };

  const closeResult = () => {
    setShowResult(false);
    
    // Flip back
    setTimeout(() => {
      setIsFlipped(false);
    }, 300);

    // Check if collected all
    if (collected.every(Boolean)) {
      setTimeout(() => {
        setShowFinal(true);
      }, 800);
    }
  };

  const resetDemo = () => {
    setCollected([false, false, false, false, false]);
    setIsFlipped(false);
    setShowFinal(false);
    setShowResult(false);
    setShowLogin(true);
    setUserPhone('');
  };

  return (
    <div className="w-full h-screen bg-[#f5f5f7] overflow-hidden font-sans">
      <div className={cn(
        "relative w-full h-full max-w-[480px] mx-auto flex flex-col items-center shadow-2xl overflow-hidden", 
        styles.campaignRoot
      )}>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 z-[200] flex gap-2">
          <button 
            onClick={resetDemo}
            className="bg-black/10 backdrop-blur-md text-white/80 px-3 py-1 rounded-full text-xs hover:bg-black/20 transition-all flex items-center"
          >
            ↻ 重置
          </button>
        </div>

        {/* Header */}
        <div className="mt-[8vh] z-10 text-center">
          <div className="text-white/80 text-sm tracking-[2px] mb-1 font-light opacity-90">银行开门红活动</div>
          <div className={cn(styles.titleMain, "text-4xl font-black tracking-widest")}>集五福 · 赢大奖</div>
        </div>

        {/* Draw Area */}
        <div className="flex-1 w-full flex justify-center items-center relative z-10 perspective-[1200px]">
          <Card 
            isFlipped={isFlipped} 
            resultChar={currentResult} 
            onDraw={drawCard} 
            disabled={false}
          />
        </div>

        {/* Collection Area */}
        <CollectionSlots collected={collected} cards={CARDS} />

        {/* Modals */}
        <LoginModal isOpen={showLogin} onLogin={handleLogin} onClose={() => setShowLogin(false)} />
        <ResultModal isOpen={showResult} char={currentResult} onClose={closeResult} />
        <FinalRewardModal isOpen={showFinal} userPhone={userPhone} onClose={() => setShowFinal(false)} />
      </div>
    </div>
  );
}
