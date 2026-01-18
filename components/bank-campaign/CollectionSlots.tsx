import React from 'react';
// 移除 Next.js Image 组件，使用原生 img 标签以兼容农行 WebView
import { cn } from '@/lib/utils';
import { CARDS, CardChar } from '@/lib/cardConfig';

interface CollectionSlotsProps {
  collected: boolean[];
  cardCounts?: number[];  // 每张卡的数量（可选）
  onCardClick?: (char: CardChar) => void;  // 点击已收集卡片的回调
}

// 卡槽背景图（1-5对应马上发财哇）
const SLOT_BGS = [
  '/images/campaign/slots-new/slot-1.png', // 马
  '/images/campaign/slots-new/slot-2.png', // 上
  '/images/campaign/slots-new/slot-3.png', // 发
  '/images/campaign/slots-new/slot-4.png', // 财
  '/images/campaign/slots-new/slot-5.png', // 哇
];

// 收集后显示的蛙宝IP形象
const WABAO_IMAGES = [
  '/images/campaign/slots-new/ma.png',    // 马
  '/images/campaign/slots-new/shang.png', // 上
  '/images/campaign/slots-new/fa.png',    // 发
  '/images/campaign/slots-new/cai.png',   // 财
  '/images/campaign/slots-new/wa.png',    // 哇
];

// 未收集时的阴影
const SHADOW_IMAGE = '/images/campaign/slots-new/shadow.png';

export const CollectionSlots: React.FC<CollectionSlotsProps> = ({ collected, cardCounts, onCardClick }) => {
  return (
    <div className="w-full px-3 pb-4 z-10">
      {/* 5个卡槽横排 - v16: 使用 margin 替代 justify-between，兼容旧版 WebView */}
      <div className="flex justify-center">
        {CARDS.map((char, idx) => {
          const isCollected = collected[idx];
          const count = cardCounts?.[idx] || 0;

          return (
            <div
              id={`slot-${idx}`}
              key={idx}
              className={cn(
                "relative",
                isCollected && "cursor-pointer active:scale-95 transition-transform"
              )}
              style={{
                width: '18%',
                marginRight: idx < 4 ? '2%' : '0',
              }}
              onClick={() => {
                if (isCollected && onCardClick) {
                  onCardClick(char);
                }
              }}
            >
              {/* 卡槽背景 */}
              <img
                src={SLOT_BGS[idx]}
                alt=""
                className="w-full"
              />

              {/* 内容：阴影或蛙宝 */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ top: '-18%' }}>
                <img
                  id={`slot-img-${idx}`}
                  src={isCollected ? WABAO_IMAGES[idx] : SHADOW_IMAGE}
                  alt={char}
                  className={cn(
                    "w-[75%] h-auto object-contain",
                    isCollected && "animate-[bounceIn_0.5s_ease-out]",
                    !isCollected && "opacity-50"
                  )}
                />
              </div>

              {/* 数量角标 - 奶油色圆形 */}
              {count > 1 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFF8E7] rounded-full flex items-center justify-center text-[#810010] text-[11px] font-bold shadow-md border-2 border-[#F5E6C8]">
                  {count}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部提示文案 - 使用设计稿图片 */}
      <div className="flex justify-center mt-3">
        <img
          src="/images/campaign/design/hint-text.png"
          alt="集齐5张卡即可参与抽奖"
          className="h-5"
        />
      </div>
    </div>
  );
};
