// 简单的测试服务器 - 不依赖数据库
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();

// 中间件
app.use(cors({ origin: '*' }));
app.use(bodyParser());

// 内存存储
const users = new Map();
const smsCache = new Map();

// 健康检查
router.get('/', (ctx) => {
  ctx.body = { success: true, message: 'Test API Running', timestamp: new Date().toISOString() };
});

// 发送验证码
router.post('/api/auth/send-code', (ctx) => {
  const { phone, deviceId } = ctx.request.body;

  const code = '8888';
  smsCache.set(phone, { code, expiresAt: Date.now() + 300000 });

  ctx.body = {
    success: true,
    message: '验证码已发送',
    code,
    expiresIn: 300,
    canResendAfter: 60
  };
});

// 验证码登录
router.post('/api/auth/verify-code', (ctx) => {
  const { phone, code } = ctx.request.body;

  const sms = smsCache.get(phone);
  if (!sms || sms.code !== code) {
    ctx.status = 400;
    ctx.body = { success: false, error: '验证码错误' };
    return;
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

  const user = users.get(phone);
  const token = `test-token-${user.id}-${Date.now()}`;

  ctx.body = {
    success: true,
    token,
    user: {
      id: user.id,
      phone: phone.substr(0, 3) + '****' + phone.substr(7),
      collectedCount: user.collectedCount,
      isCompleted: user.isCompleted
    }
  };
});

// 抽卡
router.post('/api/card/draw', (ctx) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader) {
    ctx.status = 401;
    ctx.body = { success: false, error: 'No token' };
    return;
  }

  // 简单解析token获取userId
  const userId = parseInt(authHeader.split('-')[2]) || 1;

  // 从users中查找
  let user = null;
  for (const [phone, u] of users.entries()) {
    if (u.id === userId) {
      user = u;
      break;
    }
  }

  if (!user) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'User not found' };
    return;
  }

  // 计算未收集的卡片
  const missing = user.cards.map((collected, idx) => collected ? null : idx).filter(i => i !== null);

  if (missing.length === 0) {
    ctx.body = { success: false, error: '已集齐所有卡片' };
    return;
  }

  // 随机抽取
  const luckyIndex = missing[Math.floor(Math.random() * missing.length)];
  const cardTexts = ['马', '上', '发', '财', '哇'];

  user.cards[luckyIndex] = true;
  user.collectedCount++;
  user.isCompleted = user.collectedCount >= 5;

  ctx.body = {
    success: true,
    data: {
      cardIndex: luckyIndex,
      cardText: cardTexts[luckyIndex],
      isNew: true,
      collectedCount: user.collectedCount,
      isCompleted: user.isCompleted,
      cards: user.cards
    }
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 9001;
app.listen(PORT, () => {
  console.log(`\n🧪 测试服务器启动成功！`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`\n✅ 功能:`);
  console.log(`   - 内存存储（不依赖数据库）`);
  console.log(`   - 完整的登录和抽卡逻辑`);
  console.log(`   - 用于快速测试前端\n`);
});
