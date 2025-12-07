// 抽卡API
import { NextRequest, NextResponse } from 'next/server';

// 共享内存存储
const users = (global as any).users || new Map();
(global as any).users = users;

const CARD_TEXTS = ['马', '上', '发', '财', '哇'];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'No token' }, { status: 401 });
    }

    // 解析token获取userId
    const userId = parseInt(authHeader.split('-')[1]) || 1;

    // 查找用户
    let user: any = null;
    for (const [phone, u] of (users as any).entries()) {
      if ((u as any).id === userId) {
        user = u;
        break;
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 计算未收集的卡片
    const missing = user.cards.map((collected: boolean, idx: number) => collected ? null : idx).filter((i: number | null) => i !== null);

    if (missing.length === 0) {
      return NextResponse.json({ success: false, error: '已集齐所有卡片' }, { status: 400 });
    }

    // 随机抽取
    const luckyIndex = missing[Math.floor(Math.random() * missing.length)];

    user.cards[luckyIndex] = true;
    user.collectedCount++;
    user.isCompleted = user.collectedCount >= 5;

    return NextResponse.json({
      success: true,
      data: {
        cardIndex: luckyIndex,
        cardText: CARD_TEXTS[luckyIndex],
        isNew: true,
        collectedCount: user.collectedCount,
        isCompleted: user.isCompleted,
        cards: user.cards
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
