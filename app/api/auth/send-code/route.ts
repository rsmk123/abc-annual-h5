// 发送验证码API
import { NextRequest, NextResponse } from 'next/server';

// 内存缓存（替代Redis）
const smsCache = new Map<string, { code: string; expiresAt: number; lastSent: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, deviceId } = body;

    // 验证手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, error: '手机号格式错误' }, { status: 400 });
    }

    // 防刷检查
    const cached = smsCache.get(phone);
    if (cached && Date.now() - cached.lastSent < 60000) {
      return NextResponse.json({
        success: false,
        error: '验证码已发送，请60秒后重试'
      }, { status: 429 });
    }

    // 模拟验证码
    const code = '8888';
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // 缓存验证码
    smsCache.set(phone, { code, expiresAt, lastSent: Date.now() });

    // 60秒后清除
    setTimeout(() => {
      const cached = smsCache.get(phone);
      if (cached && cached.lastSent === smsCache.get(phone)?.lastSent) {
        smsCache.delete(phone);
      }
    }, 60000);

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      code, // 测试环境返回验证码
      expiresIn: 300,
      canResendAfter: 60
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
