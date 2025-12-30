// 本地启动云函数API服务器
require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

// 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cardRoutes = require('./routes/card');

const app = new Koa();
const router = new Router();

// 中间件
app.use(cors({
  origin: '*',
  credentials: true
}));
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
    message: 'ABC Bank H5 API is running (Local)',
    timestamp: new Date().toISOString(),
    env: {
      pgHost: process.env.POSTGRES_HOST,
      redisHost: process.env.REDIS_HOST,
      mockSMS: process.env.MOCK_SMS
    }
  };
});

// 注册路由
router.use('/api/auth', authRoutes.routes());
router.use('/api/user', userRoutes.routes());
router.use('/api/card', cardRoutes.routes());

app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log('🚀 ABC银行H5 API服务启动成功！');
  console.log('');
  console.log(`📍 本地地址: http://localhost:${PORT}`);
  console.log('');
  console.log('✅ 数据库连接:');
  console.log(`   PostgreSQL: ${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}`);
  console.log(`   Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  console.log('');
  console.log('🧪 测试API:');
  console.log(`   curl http://localhost:${PORT}/`);
  console.log(`   curl http://localhost:${PORT}/api/auth/send-code -X POST -H "Content-Type: application/json" -d '{"phone":"13800138000","deviceId":"test"}'`);
  console.log('');
  console.log('💡 前端配置:');
  console.log(`   NEXT_PUBLIC_API_BASE_URL=http://localhost:${PORT}/api`);
  console.log('');
  console.log('按 Ctrl+C 停止服务');
});
