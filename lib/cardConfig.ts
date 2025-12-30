// 卡片配置常量

// 五张福卡的文字
export const CARDS = ['马', '上', '发', '财', '哇'] as const;

// 卡片键名（用于图片路径）
export const CARD_KEYS = ['ma', 'shang', 'fa', 'cai', 'wa'] as const;

export type CardChar = typeof CARDS[number];
export type CardKey = typeof CARD_KEYS[number];

// 字符到键名的映射
export const CHAR_TO_KEY: Record<CardChar, CardKey> = {
  '马': 'ma',
  '上': 'shang',
  '发': 'fa',
  '财': 'cai',
  '哇': 'wa',
};

// 键名到字符的映射
export const KEY_TO_CHAR: Record<CardKey, CardChar> = {
  'ma': '马',
  'shang': '上',
  'fa': '发',
  'cai': '财',
  'wa': '哇',
};

// 卡片对应的祝福语
export const CARD_BLESSINGS: Record<CardChar, string> = {
  '马': '马跃新程 福泽四海',
  '上': '上福临门 骏业兴旺',
  '发': '发家兴业 财聚福来',
  '财': '财源广进 金玉满堂',
  '哇': '哇宝送福 农情长存',
};

// 图片路径配置
export const IMAGES = {
  // 哇宝大图
  wabao: {
    ma: '/images/campaign/wabao/ma.png',
    shang: '/images/campaign/wabao/shang.png',
    fa: '/images/campaign/wabao/fa.png',
    cai: '/images/campaign/wabao/cai.png',
    wa: '/images/campaign/wabao/wa.png',
  },
  // 结果弹窗切图（不含按钮）
  resultModals: {
    ma: '/images/campaign/modals/result-ma-new.png',
    shang: '/images/campaign/modals/result-shang-new.png',
    fa: '/images/campaign/modals/result-fa-new.png',
    cai: '/images/campaign/modals/result-cai-new.png',
    wa: '/images/campaign/modals/result-wa-new.png',
  },
  // 卡槽图标
  slots: {
    frame: '/images/campaign/slots/frame.png',
    silhouette: '/images/campaign/slots/silhouette.png',
    coins: {
      ma: '/images/campaign/slots/ma-coin.png',
      shang: '/images/campaign/slots/shang-coin.png',
      fa: '/images/campaign/slots/fa-coin.png',
      cai: '/images/campaign/slots/cai-coin.png',
      wa: '/images/campaign/slots/wa-coin.png',
    },
  },
  // 按钮
  buttons: {
    draw: '/images/campaign/buttons/draw-btn.png',
    rules: '/images/campaign/buttons/rules-btn.png',
  },
  // 弹窗背景
  modals: {
    login: '/images/campaign/modals/login-modal.png',
    finalReward: '/images/campaign/modals/final-reward-modal.png',
    thanksComeTomorrow: '/images/campaign/modals/thanks-come-tomorrow.png',
  },
} as const;

// 根据字符获取对应的哇宝图片路径
export function getWabaoImage(char: CardChar): string {
  const key = CHAR_TO_KEY[char];
  return IMAGES.wabao[key];
}

// 根据字符获取对应的结果弹窗完整切图路径
export function getResultModalImage(char: CardChar): string {
  const key = CHAR_TO_KEY[char];
  return IMAGES.resultModals[key];
}

// 根据字符获取对应的金币图标路径
export function getCoinImage(char: CardChar): string {
  const key = CHAR_TO_KEY[char];
  return IMAGES.slots.coins[key];
}

// 根据索引获取配置
export function getCardByIndex(index: number) {
  return {
    char: CARDS[index],
    key: CARD_KEYS[index],
    wabaoImage: IMAGES.wabao[CARD_KEYS[index]],
    coinImage: IMAGES.slots.coins[CARD_KEYS[index]],
    blessing: CARD_BLESSINGS[CARDS[index]],
  };
}
