// 验证码登录API
import { NextRequest, NextResponse } from 'next/server';

// 共享的内存存储
const smsCache = (global as any).smsCache || new Map();
const users = (global as any).users || new Map();
(global as any).smsCache = smsCache;
(global as any).users = users;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, deviceId } = body;

    // 验证手机号和验证码
    if (!phone || !code) {
      return NextResponse.json({ success: false, error: '参数错误' }, { status: 400 });
    }

    // 检查验证码
    const cached: any = smsCache.get(phone);
    if (!cached || cached.code !== code) {
      return NextResponse.json({ success: false, error: '验证码错误' }, { status: 400 });
    }

    if (Date.now() > cached.expiresAt) {
      return NextResponse.json({ success: false, error: '验证码已过期' }, { status: 400 });
    }

    // 创建或获取用户
    if (!users.has(phone)) {
      users.set(phone, {
        id: users.size + 1,
        phone,
        cards: [false, false, false, false, false],
        collectedCount: 0,
        isCompleted: false
      });
    }

    const user: any = users.get(phone);
    const token = `token-${user.id}-${Date.now()}`;

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: phone.substr(0, 3) + '****' + phone.substr(7),
        collectedCount: user.collectedCount,
        isCompleted: user.isCompleted
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
