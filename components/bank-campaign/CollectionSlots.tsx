import React from 'react';
import styles from './campaign.module.css';
import { cn } from '@/lib/utils';

interface CollectionSlotsProps {
  collected: boolean[];
  cards: string[];
}

export const CollectionSlots: React.FC<CollectionSlotsProps> = ({ collected, cards }) => {
  return (
    <div className="w-full px-5 pb-10 z-10">
      <div className="flex justify-between bg-black/20 p-4 rounded-2xl backdrop-blur-[5px] border border-white/10">
        {cards.map((char, idx) => (
          <div 
            key={idx}
            className={cn(
              "w-[18%] aspect-[3/4] rounded-lg flex justify-center items-center text-2xl font-bold transition-all duration-400 ease-out relative",
              collected[idx] 
                ? cn(styles.slotActive, "text-[#d92027] border-2 border-[#f0c676] -translate-y-1") 
                : "bg-white/5 border border-dashed border-[#f0c676]/30 text-[#f0c676]/20"
            )}
          >
            {char}
          </div>
        ))}
      </div>
      <div className="text-center text-white/50 text-xs mt-4">
        集齐5张卡即可参与开奖
      </div>
    </div>
  );
};
