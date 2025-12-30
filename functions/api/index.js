const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
// 使用手动 CORS 中间件替代 @koa/cors

// 路由（使用 Redis 完整版本）
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cardRoutes = require('./routes/card');

const app = new Koa();
const router = new Router();

// CORS 配置 - 允许的域名列表
const allowedOrigins = [
  'https://h5.actionlist.cool',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// 手动 CORS 中间件（确保所有响应都带 CORS 头）
app.use(async (ctx, next) => {
  const requestOrigin = ctx.request.header.origin;

  // 设置 CORS 响应头
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    ctx.set('Access-Control-Allow-Origin', requestOrigin);
  } else if (requestOrigin) {
    // 开发阶段暂时允许所有来源
    ctx.set('Access-Control-Allow-Origin', requestOrigin);
  } else {
    ctx.set('Access-Control-Allow-Origin', '*');
  }

  ctx.set('Access-Control-Allow-Credentials', 'true');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  ctx.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  ctx.set('Access-Control-Max-Age', '86400');

  // 处理 OPTIONS 预检请求
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    ctx.body = '';
    return;
  }

  await next();
});

app.use(bodyParser());

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Error:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      error: err.message || 'Internal server error'
    };
  }
});

// 健康检查
router.get('/', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'ABC Bank H5 API is running',
    timestamp: new Date().toISOString()
  };
});

// 简单测试端点（不连接数据库）
router.get('/api/ping', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
    env: {
      hasPostgres: !!process.env.POSTGRES_HOST,
      hasRedis: !!process.env.REDIS_HOST,
      mockSms: process.env.MOCK_SMS
    }
  };
});

// 数据库测试端点（调试用）
router.get('/api/db-test', async (ctx) => {
  const pool = require('./config/db');
  try {
    // 测试连接
    const timeResult = await pool.query('SELECT NOW() as now');

    // 查看最近的 sms_logs
    const smsResult = await pool.query(
      'SELECT id, phone, code, verified, expires_at, sent_at FROM sms_logs ORDER BY sent_at DESC LIMIT 5'
    );

    ctx.body = {
      success: true,
      dbTime: timeResult.rows[0].now,
      recentSmsLogs: smsResult.rows
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: err.message,
      stack: err.stack
    };
  }
});

// 注册路由
router.use('/api/auth', authRoutes.routes());
router.use('/api/user', userRoutes.routes());
router.use('/api/card', cardRoutes.routes());

app.use(router.routes());
app.use(router.allowedMethods());

// Web函数：启动HTTP服务器（监听9000端口）
const PORT = process.env.PORT || 9000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ABC Bank H5 API is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.TENCENTCLOUD_RUNENV || 'Local'}`);
});
