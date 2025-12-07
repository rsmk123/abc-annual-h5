const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000/api';

// 获取token
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// 发送验证码
export async function sendCode(phone: string, deviceId: string) {
  return request('/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ phone, deviceId }),
  });
}

// 验证码登录
export async function verifyCode(phone: string, code: string, deviceId: string) {
  const response = await request<{
    success: boolean;
    token: string;
    user: any;
  }>('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ phone, code, deviceId }),
  });

  // 保存token
  if (response.token) {
    localStorage.setItem('token', response.token);
  }

  return response;
}

// 获取用户状态
export async function getUserStatus() {
  return request('/user/status');
}

// 抽卡
export async function drawCard(deviceId: string) {
  return request('/card/draw', {
    method: 'POST',
    body: JSON.stringify({ deviceId }),
  });
}
