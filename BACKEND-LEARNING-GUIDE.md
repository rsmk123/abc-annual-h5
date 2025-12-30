# 🎓 后端技术难点学习指南

> **目标**：帮助新手理解这个项目的后端核心技术点
> **适合**：想深入了解后端实现的开发者

---

## 📚 学习路线图

```
第1关：基础概念 → 第2关：核心难点 → 第3关：高级技巧 → 第4关：生产实践
```

---

## 🎯 难点分级

### ⭐ 初级（必须掌握）

1. Koa 框架基础
2. 环境变量管理
3. 路由设计

### ⭐⭐ 中级（需要理解）

4. PostgreSQL 数据库操作
5. Redis 缓存应用
6. JWT Token 认证

### ⭐⭐⭐ 高级（深入理解）

7. 腾讯云函数（Serverless）
8. 数据加密与安全
9. API 错误处理

### ⭐⭐⭐⭐ 专家级（生产经验）

10. 公网数据库连接
11. 防刷与限流
12. 部署与监控

---

## 第1关：基础概念

### 难点1：Koa 框架 vs Express ⭐

**问题**：为什么用 Koa 而不是 Express？

**关键代码** (`functions/api/index.js`)：

```javascript
const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

// Koa 的洋葱模型中间件
app.use(cors({ origin: 'https://h5.actionlist.cool' }));
app.use(bodyParser());

// 路由注册
app.use(router.routes());

// 启动服务器
app.listen(9000, '0.0.0.0');
```

**核心区别**：

| 特性 | Koa | Express |
|------|-----|---------|
| 中间件模型 | 洋葱模型（async/await） | 线性模型（callback） |
| 错误处理 | try/catch 自然处理 | 需要 next(err) |
| 代码风格 | 现代（async/await） | 传统（callback） |
| 学习曲线 | 稍陡 | 平缓 |

**学习建议**：
- 理解洋葱模型：请求 → 中间件1 → 中间件2 → 路由 → 中间件2 → 中间件1 → 响应
- 掌握 `ctx`（上下文对象）：`ctx.request`, `ctx.response`, `ctx.body`

**实战练习**：
```javascript
// 创建一个简单的 Koa 中间件
app.use(async (ctx, next) => {
  console.log('请求开始');
  await next();  // 调用下一个中间件
  console.log('响应结束');
});
```

---

### 难点2：环境变量管理 ⭐

**问题**：为什么有 `.env`, `.env.production`, `.env.local`？

**关键配置** (`functions/api/.env`)：

```env
POSTGRES_HOST=gz-postgres-aa98gsf9.sql.tencentcdb.com
REDIS_PASSWORD=RedisPass123
JWT_SECRET=abc-bank-h5-jwt-secret-key-20251207-random
```

**读取方式** (`functions/api/config/db.js`)：

```javascript
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
});
```

**核心原则**：

1. **从不硬编码敏感信息**：
   ```javascript
   // ❌ 错误
   const password = 'RedisPass123';

   // ✅ 正确
   const password = process.env.REDIS_PASSWORD;
   ```

2. **不同环境不同配置**：
   - `.env` - 默认配置
   - `.env.local` - 本地开发（已删除）
   - `.env.production` - 生产环境

3. **云函数的环境变量**：
   - 通过 API 同步：`UpdateFunctionConfiguration`
   - 在云端读取：`process.env.REDIS_PASSWORD`

**学习建议**：
- 理解为什么要用环境变量（安全、灵活）
- 掌握 `process.env` 的使用
- 了解不同环境的配置管理

**常见错误**：
```javascript
// ❌ 忘记 parseInt
const port = process.env.POSTGRES_PORT;  // 这是字符串！

// ✅ 正确
const port = parseInt(process.env.POSTGRES_PORT);
```

---

### 难点3：路由设计 ⭐

**问题**：为什么路由要分模块？

**项目结构**：

```
routes/
├── auth.js      # 认证相关：/api/auth/send-code, /api/auth/verify-code
├── user.js      # 用户相关：/api/user/status
└── card.js      # 抽卡相关：/api/card/draw
```

**路由注册** (`functions/api/index.js`)：

```javascript
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cardRoutes = require('./routes/card');

// 注册路由（注意前缀 /api）
router.use('/api/auth', authRoutes.routes());
router.use('/api/user', userRoutes.routes());
router.use('/api/card', cardRoutes.routes());
```

**最终 API 路径**：
- `/api/auth/send-code` = `/api/auth` + `/send-code`
- `/api/user/status` = `/api/user` + `/status`

**核心设计原则**：

1. **RESTful 风格**：
   - `POST /api/auth/send-code` - 发送验证码
   - `POST /api/auth/verify-code` - 验证验证码
   - `GET /api/user/status` - 获取状态（幂等）
   - `POST /api/card/draw` - 抽卡（非幂等）

2. **模块化分离**：
   - 认证逻辑独立
   - 用户逻辑独立
   - 业务逻辑独立

**学习建议**：
- 理解 REST 设计原则
- GET 用于查询，POST 用于修改
- URL 设计清晰、语义化

---

## 第2关：核心难点

### 难点4：PostgreSQL 数据库操作 ⭐⭐

**问题**：如何安全地操作数据库，防止 SQL 注入？

**关键代码** (`functions/api/routes/auth.js:54-58`)：

```javascript
await pool.query(
  `INSERT INTO sms_logs (phone, code, expires_at, ip)
   VALUES ($1, $2, $3, $4)`,
  [phone, code, expiresAt, ctx.request.ip]
);
```

**核心技术点**：

#### A. 参数化查询（防止 SQL 注入）

```javascript
// ❌ 危险！SQL 注入漏洞
const query = `SELECT * FROM users WHERE phone = '${phone}'`;
await pool.query(query);

// ✅ 安全！使用参数化查询
const query = `SELECT * FROM users WHERE phone = $1`;
await pool.query(query, [phone]);
```

**为什么安全？**
- `$1` 是占位符，PostgreSQL 会自动转义
- 攻击者无法通过输入 `' OR '1'='1` 来绕过

#### B. 连接池管理

**配置** (`functions/api/config/db.js`)：

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: 10,          // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

**为什么用连接池？**
- 避免每次请求都创建新连接（慢）
- 复用连接，提高性能
- 自动管理连接生命周期

#### C. 事务处理（这个项目没用到，但要知道）

```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

**学习建议**：
1. 练习：手动连接数据库
   ```bash
   psql -h gz-postgres-aa98gsf9.sql.tencentcdb.com \
        -p 20944 \
        -U rsmk_ \
        -d abc_bank_h5
   ```

2. 查看数据：
   ```sql
   SELECT * FROM sms_logs ORDER BY sent_at DESC LIMIT 10;
   SELECT * FROM users;
   ```

3. 理解异步操作：
   ```javascript
   const result = await pool.query('SELECT ...');
   console.log(result.rows);  // 查询结果数组
   ```

---

### 难点5：Redis 缓存应用 ⭐⭐

**问题**：Redis 在这个项目中扮演什么角色？

**使用场景1：防刷保护** (`functions/api/routes/auth.js:29-38`)：

```javascript
// 检查用户是否在 60 秒内发送过验证码
const phoneKey = `sms:phone:${phone}:last_sent`;
const lastSent = await redis.get(phoneKey);

if (lastSent) {
  ctx.body = {
    success: false,
    error: '验证码已发送，请60秒后重试'
  };
  return;
}

// 记录发送时间（60秒后自动过期）
await redis.setex(phoneKey, 60, Date.now().toString());
```

**核心技术**：

#### A. Redis 数据类型

```javascript
// String 类型（最常用）
await redis.set('key', 'value');
await redis.get('key');

// 带过期时间
await redis.setex('key', 60, 'value');  // 60秒后自动删除

// 检查是否存在
const exists = await redis.exists('key');
```

#### B. Redis 连接配置 (`functions/api/config/redis.js`)：

```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;  // 重连延迟策略
  }
});
```

#### C. Redis 7.0 ACL 认证（这是一个坑！）

**问题**：为什么一开始 Redis 连接失败？

```javascript
// ❌ Redis 7.0 之前
const redis = new Redis({
  password: 'RedisPass123'
});

// ✅ Redis 7.0（支持ACL，需要用户名）
const redis = new Redis({
  username: 'default',  // 关键！
  password: 'RedisPass123'
});
```

**但我们最终的解决方案**：
```javascript
// ✅ 不指定 username，使用默认认证
const redis = new Redis({
  password: 'RedisPass123'  // 只用密码
});
```

**学习建议**：
1. 理解 Redis 的使用场景：
   - 缓存（提高性能）
   - 限流（防刷）
   - 会话存储
   - 消息队列

2. 掌握基本命令：
   ```javascript
   await redis.set('key', 'value');
   await redis.get('key');
   await redis.del('key');
   await redis.expire('key', 60);
   ```

3. 实战练习：
   ```bash
   # 连接 Redis
   redis-cli -h gz-crs-mq2rf8jh.sql.tencentcdb.com -p 27830 -a RedisPass123

   # 查看所有键
   KEYS sms:phone:*

   # 查看值
   GET sms:phone:13800138000:last_sent
   ```

---

### 难点6：JWT Token 认证 ⭐⭐

**问题**：用户登录后，如何保持登录状态？

**JWT 生成** (`functions/api/utils/jwt.js`)：

```javascript
const jwt = require('jsonwebtoken');

function sign(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,  // 密钥
    { expiresIn: '7d' }      // 7天过期
  );
}

function verify(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
```

**使用流程**：

#### A. 登录时生成 Token (`routes/auth.js:142-148`)：

```javascript
// 用户验证码验证成功后
const token = jwtUtil.sign({
  userId: user.id,
  phone: phoneHash
});

ctx.body = {
  success: true,
  token: token,  // 返回给前端
  user: { ... }
};
```

#### B. 前端保存 Token：

```javascript
// 前端代码
localStorage.setItem('token', token);

// 后续请求带上 Token
fetch('/api/user/status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### C. 后端验证 Token (`middlewares/auth.js`)：

```javascript
module.exports = async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ctx.status = 401;
    ctx.body = { success: false, error: 'No token provided' };
    return;
  }

  try {
    const decoded = jwtUtil.verify(token);
    ctx.state.userId = decoded.userId;  // 保存到上下文
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { success: false, error: 'Invalid token' };
  }
};
```

**核心技术点**：

1. **Token 结构**：
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← Header (Base64)
   .
   eyJ1c2VySWQiOiIxIiwicGhvbmUiOiIxMzgi...  ← Payload (Base64)
   .
   ZoxQed2TGld9XvghoehGc9snqVgENNBSVUpCFmj0F3Q  ← Signature (加密)
   ```

2. **安全性**：
   - 不存储敏感信息（密码）
   - 有过期时间（7天）
   - 无法伪造（需要密钥）

3. **无状态认证**：
   - 服务器不保存会话
   - Token 包含所有信息
   - 适合分布式系统

**学习建议**：
- 在线解码 JWT：https://jwt.io/
- 理解为什么 JWT 更适合 API 认证
- 掌握 Token 刷新机制（进阶）

**实战练习**：
```javascript
// 创建一个简单的 JWT
const token = jwt.sign({ userId: 1 }, 'my-secret', { expiresIn: '1h' });
console.log(token);

// 解码
const decoded = jwt.verify(token, 'my-secret');
console.log(decoded);  // { userId: 1, iat: ..., exp: ... }
```

---

## 第3关：高级技巧

### 难点7：腾讯云函数（Serverless）⭐⭐⭐

**问题**：云函数和传统服务器有什么区别？

**关键文件** (`functions/api/scf_bootstrap`)：

```bash
#!/bin/bash

# 设置环境变量
export PORT=9000
export TENCENTCLOUD_RUNENV=SCF

# 启动 Node.js 应用
exec /var/lang/node18/bin/node index.js
```

**核心概念**：

#### A. Web 函数 vs 事件函数

| 类型 | 触发方式 | 代码结构 |
|------|---------|---------|
| 事件函数 | 事件触发 | `exports.main_handler = async (event) => {}` |
| Web 函数 | HTTP 请求 | `app.listen(9000)` |

**我们用的是 Web 函数**！

#### B. 冷启动问题

**什么是冷启动？**
- 函数长时间没被调用
- 云平台回收资源
- 下次调用需要重新启动（2-5秒）

**影响**：
- 第一次访问慢
- 长时间不用后第一次访问慢

**优化方法**（进阶）：
- 预留实例（付费）
- 定时ping（保活）
- 优化启动代码

#### C. 在线依赖安装

**关键参数**：

```javascript
InstallDependency: 'TRUE'
```

**工作原理**：
1. 上传代码（不含 node_modules，只有 9KB）
2. 云端运行 `npm install`
3. 安装依赖到 `/var/user/node_modules`
4. 启动应用

**好处**：
- ZIP 文件小
- 支持 native 模块
- 不用担心平台兼容性

**坑点**：
- 安装时间：20-40秒
- 网络问题可能失败
- 某些包可能不兼容

**学习建议**：
- 理解 Serverless 的优缺点
- 掌握云函数的生命周期
- 了解冷启动优化

---

### 难点8：数据加密与安全 ⭐⭐⭐

**问题**：如何安全地存储用户手机号？

**加密工具** (`functions/api/utils/crypto.js`)：

```javascript
const crypto = require('crypto');

// 哈希（不可逆，用于查询）
function hashPhone(phone) {
  return crypto
    .createHash('sha256')
    .update(phone + process.env.ENCRYPT_KEY)
    .digest('hex');
}

// 加密（可逆，用于存储）
function encryptPhone(phone) {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPT_KEY),
    Buffer.alloc(16, 0)
  );

  let encrypted = cipher.update(phone, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// 解密
function decryptPhone(encrypted) {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPT_KEY),
    Buffer.alloc(16, 0)
  );

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

**使用场景**：

```javascript
// 1. 用户登录时
const phoneHash = cryptoUtil.hashPhone(phone);      // 用于查询
const phoneEncrypted = cryptoUtil.encryptPhone(phone);  // 用于存储

// 2. 查询用户
const user = await pool.query(
  'SELECT * FROM users WHERE phone_hash = $1',
  [phoneHash]  // 用哈希值查询
);

// 3. 显示手机号（脱敏）
const phone = cryptoUtil.decryptPhone(user.phone_encrypted);
const masked = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
// 13800138000 → 138****8000
```

**核心技术**：

1. **哈希 vs 加密**：
   - 哈希（Hash）：不可逆，用于查询和验证
   - 加密（Encrypt）：可逆，用于存储和还原

2. **AES-256-CBC 加密**：
   - 对称加密（同一个密钥加密和解密）
   - 256 位密钥（非常安全）
   - CBC 模式（分块加密）

3. **盐值（Salt）**：
   ```javascript
   crypto.update(phone + process.env.ENCRYPT_KEY)
   ```
   - 加入密钥，防止彩虹表攻击

**学习建议**：
- 理解哈希和加密的区别
- 掌握 Node.js crypto 模块
- 了解常见加密算法

**常见错误**：
```javascript
// ❌ 密钥太短
const key = '12345678';  // 只有8字节，不安全

// ✅ 密钥足够长
const key = '12345678901234567890123456789012';  // 32字节
```

---

### 难点9：API 错误处理 ⭐⭐⭐

**问题**：如何优雅地处理各种错误？

**错误处理层次**：

#### A. 参数验证（Joi）

```javascript
const Joi = require('joi');

const schema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  code: Joi.string().length(6).required(),
  deviceId: Joi.string().required()
});

const { error, value } = schema.validate(ctx.request.body);

if (error) {
  ctx.status = 400;
  ctx.body = {
    success: false,
    error: error.details[0].message
  };
  return;
}
```

**为什么用 Joi？**
- 声明式验证（清晰）
- 自动生成错误消息
- 支持复杂验证规则

#### B. 业务逻辑错误

```javascript
if (smsResult.rows.length === 0 && !isTestCode) {
  ctx.status = 400;
  ctx.body = {
    success: false,
    error: '验证码错误或已过期'
  };
  return;
}
```

#### C. 系统异常捕获

```javascript
try {
  lastSent = await redis.get(phoneKey);
} catch (redisError) {
  console.error('Redis错误:', redisError.message);
  ctx.status = 500;
  ctx.body = {
    success: false,
    error: `Redis connection failed: ${redisError.message}`
  };
  return;
}
```

**错误响应格式统一**：

```javascript
// 成功
{ success: true, data: {...} }

// 失败
{ success: false, error: '错误描述' }
```

**HTTP 状态码使用**：

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | 成功 | 请求成功 |
| 400 | 客户端错误 | 参数错误、验证失败 |
| 401 | 未授权 | Token 无效或缺失 |
| 500 | 服务器错误 | 数据库错误、系统异常 |

**学习建议**：
- 理解 HTTP 状态码的含义
- 掌握 try/catch 异常处理
- 学会记录日志（方便排查）

---

## 第4关：生产实践

### 难点10：公网数据库连接 ⭐⭐⭐⭐

**问题**：云函数如何连接数据库？

**两种方案对比**：

#### A. VPC 内网连接（推荐）

```
云函数 ──VPC内网──> 数据库
         ├─ 安全（不暴露公网）
         ├─ 快速（1-2ms延迟）
         └─ 免费（内网流量）
```

**配置**：
- 云函数加入 VPC
- 数据库在同一 VPC
- 使用内网 IP 连接

#### B. 公网连接（我们用的）

```
云函数 ──公网──> 数据库公网IP
         ├─ 简单（无需配置VPC）
         ├─ 慢（20-50ms延迟）
         ├─ 不安全（端口暴露）
         └─ 收费（公网流量0.8元/GB）
```

**安全加固**：
- ✅ 安全组限流（只允许特定IP）
- ✅ 复杂密码
- ⚠️ 但仍有风险

**我们的配置** (`functions/api/.env`)：

```env
# 使用公网地址
POSTGRES_HOST=gz-postgres-aa98gsf9.sql.tencentcdb.com
POSTGRES_PORT=20944  # 非标准端口（标准是5432）

REDIS_HOST=gz-crs-mq2rf8jh.sql.tencentcdb.com
REDIS_PORT=27830     # 非标准端口（标准是6379）
```

**关键步骤**：

1. **开启公网访问**：
   - 控制台 → 实例详情 → 开启外网地址

2. **配置安全组**：
   - 添加入站规则
   - 协议：TCP
   - 端口：5432,6379,20944,27830
   - 来源：0.0.0.0/0（允许所有IP）

3. **测试连接**：
   ```bash
   # PostgreSQL
   psql -h gz-postgres-aa98gsf9.sql.tencentcdb.com -p 20944 -U rsmk_ -d abc_bank_h5

   # Redis
   redis-cli -h gz-crs-mq2rf8jh.sql.tencentcdb.com -p 27830 -a RedisPass123
   ```

**学习建议**：
- 理解 VPC 的概念
- 掌握安全组配置
- 了解公网 vs 内网的区别

**常见问题**：

Q: 为什么云函数连不上数据库？
A: 检查安全组规则是否开放端口

Q: 公网访问安全吗？
A: 不够安全，生产环境建议用 VPC

---

### 难点11：防刷与限流 ⭐⭐⭐⭐

**问题**：如何防止恶意用户刷接口？

**我们的防刷策略**：

#### A. 60秒防刷（Redis 实现）

```javascript
// 1. 检查是否在60秒内发送过
const phoneKey = `sms:phone:${phone}:last_sent`;
const lastSent = await redis.get(phoneKey);

if (lastSent) {
  return { error: '请60秒后重试' };
}

// 2. 记录本次发送时间（60秒后自动删除）
await redis.setex(phoneKey, 60, Date.now().toString());
```

**为什么用 Redis？**
- 快速（内存操作）
- 自动过期（setex）
- 分布式共享（多实例）

#### B. IP 限流（未实现，但要知道）

```javascript
// 限制每个 IP 每分钟最多 10 次请求
const ipKey = `rate:ip:${ctx.request.ip}`;
const count = await redis.incr(ipKey);

if (count === 1) {
  await redis.expire(ipKey, 60);  // 首次访问，设置过期时间
}

if (count > 10) {
  ctx.status = 429;
  ctx.body = { error: '请求过于频繁' };
  return;
}
```

#### C. 设备指纹（已使用）

```javascript
// 前端生成唯一设备ID
const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem('deviceId', deviceId);

// 后端记录
await pool.query(
  'INSERT INTO sms_logs (phone, code, device_id, ip) VALUES ($1, $2, $3, $4)',
  [phone, code, deviceId, ctx.request.ip]
);
```

**防刷技术对比**：

| 方法 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| Redis 时间窗口 | 记录最后操作时间 | 简单、准确 | 需要 Redis |
| IP 限流 | 限制每个IP请求数 | 防止暴力攻击 | 可能误伤正常用户 |
| 设备指纹 | 唯一设备ID | 跨IP识别 | 可以伪造 |
| 图形验证码 | 人机验证 | 有效 | 用户体验差 |

**学习建议**：
- 理解常见的攻击方式
- 掌握多层防护策略
- 平衡安全性和用户体验

---

### 难点12：部署与监控 ⭐⭐⭐⭐

**问题**：如何实现自动化部署？

**部署流程**：

#### A. 代码打包

```bash
# 1. 设置启动文件权限（关键！）
chmod 755 scf_bootstrap

# 2. 打包（不含 node_modules）
zip -r -X abc-bank-h5.zip \
  scf_bootstrap \
  index.js \
  package.json \
  .env \
  config \
  routes \
  utils \
  middlewares
```

**关键参数**：
- `-r`：递归打包目录
- `-X`：保留文件权限（scf_bootstrap 的执行权限）

#### B. API 部署

```javascript
const tencentcloud = require("tencentcloud-sdk-nodejs");
const ScfClient = tencentcloud.scf.v20180416.Client;

// 1. 读取 ZIP 并转 Base64
const zipData = fs.readFileSync('abc-bank-h5.zip');
const zipBase64 = zipData.toString('base64');

// 2. 调用 API
await client.UpdateFunctionCode({
  FunctionName: 'abc-bank-h5-api',
  Code: { ZipFile: zipBase64 },
  InstallDependency: 'TRUE'
});
```

#### C. 状态监控

```javascript
// 等待函数变为 Active
let status = 'Updating';
while (status === 'Updating') {
  await sleep(2000);

  const info = await client.GetFunction({
    FunctionName: 'abc-bank-h5-api'
  });

  status = info.Status;
  console.log('当前状态:', status);
}
```

**函数状态**：
- `Creating` - 创建中
- `Updating` - 更新中
- `Active` - 运行中
- `CreateFailed` - 创建失败
- `UpdateFailed` - 更新失败

#### D. 环境变量同步

```javascript
// 本地 .env → 云函数环境变量
await client.UpdateFunctionConfiguration({
  Environment: {
    Variables: [
      { Key: 'REDIS_PASSWORD', Value: 'RedisPass123' }
    ]
  }
});
```

**学习建议**：
- 理解 CI/CD 概念
- 掌握腾讯云 SDK
- 学会监控和日志查看

---

## 🎯 学习路径建议

### 第1周：基础巩固

1. **学习 Koa 框架**
   - 官方文档：https://koajs.com/
   - 重点：中间件、ctx、async/await

2. **掌握 PostgreSQL**
   - 练习：SQL 查询
   - 理解：连接池、参数化查询

3. **了解 Redis**
   - 练习：基本命令
   - 理解：key-value、过期时间

### 第2周：核心功能

4. **JWT 认证**
   - 实现：简单的登录系统
   - 理解：Token 生成和验证

5. **数据加密**
   - 练习：加密/解密字符串
   - 理解：哈希 vs 加密

### 第3周：云服务

6. **腾讯云函数**
   - 实践：部署一个简单函数
   - 理解：Serverless 概念

7. **自动化部署**
   - 实践：使用 SDK 部署
   - 理解：CI/CD 流程

---

## 💡 实战练习建议

### 练习1：简化版验证码系统

**目标**：实现一个最小的验证码发送和验证功能

```javascript
// 1. 生成验证码
const code = Math.floor(100000 + Math.random() * 900000).toString();

// 2. 存储到内存（简化版，生产用数据库）
const codes = new Map();
codes.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });

// 3. 验证
const stored = codes.get(phone);
if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
  return { success: false, error: '验证码错误或已过期' };
}
```

### 练习2：实现简单的防刷

```javascript
// 使用 Map 模拟 Redis
const lastSent = new Map();

function canSend(phone) {
  const last = lastSent.get(phone);
  if (last && Date.now() - last < 60000) {
    return false;  // 60秒内不能重复发送
  }
  lastSent.set(phone, Date.now());
  return true;
}
```

### 练习3：JWT 认证中间件

```javascript
async function authMiddleware(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized' };
    return;
  }

  try {
    const decoded = jwt.verify(token, 'secret');
    ctx.state.user = decoded;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid token' };
  }
}
```

---

## 🔍 深入理解：关键代码剖析

### 发送验证码完整流程

**代码位置**：`functions/api/routes/auth.js:12-76`

**流程图**：

```
1. 接收请求：{ phone, deviceId }
    ↓
2. 参数验证（Joi）
    ├─ 手机号格式：/^1[3-9]\d{9}$/
    └─ deviceId 必填
    ↓
3. 防刷检查（Redis）
    ├─ 查询：redis.get(`sms:phone:${phone}:last_sent`)
    ├─ 如果存在 → 返回错误"请60秒后重试"
    └─ 如果不存在 → 继续
    ↓
4. 生成验证码
    ├─ 6位随机数字
    └─ code = Math.floor(100000 + Math.random() * 900000)
    ↓
5. 存储验证码（PostgreSQL）
    ├─ 表：sms_logs
    ├─ 字段：phone, code, expires_at, ip
    └─ 过期时间：5分钟
    ↓
6. 记录发送时间（Redis）
    ├─ redis.setex(phoneKey, 60, Date.now())
    └─ 60秒后自动删除
    ↓
7. 发送短信（占位符）
    ├─ smsService.sendVerificationCode()
    └─ 返回 { success: true, message: '短信服务待集成' }
    ↓
8. 返回响应
    └─ { success: true, message: '验证码已发送', code: '888888' }
```

**每一步的作用**：

1. **参数验证**：防止非法输入
2. **防刷检查**：防止恶意刷验证码
3. **生成验证码**：真实随机，无硬编码
4. **存储数据库**：持久化，可查询
5. **Redis 限流**：60秒自动过期
6. **短信发送**：真实环境会调用短信服务
7. **返回响应**：前端显示"验证码已发送"

**学习要点**：
- 理解每一步的必要性
- 思考：如果去掉某一步会有什么问题？
- 实践：修改代码，观察结果

---

### 验证验证码完整流程

**代码位置**：`functions/api/routes/auth.js:80-154`

**流程图**：

```
1. 接收请求：{ phone, code, deviceId }
    ↓
2. 参数验证
    ├─ 手机号格式
    ├─ 验证码长度：6位
    └─ deviceId 必填
    ↓
3. 检查万能验证码
    ├─ if (code === '888888') → 跳过数据库查询
    └─ else → 查询数据库
    ↓
4. 查询验证码（PostgreSQL）
    ├─ SELECT * FROM sms_logs
    ├─ WHERE phone = $1 AND code = $2
    ├─ AND verified = false
    ├─ AND expires_at > NOW()
    └─ ORDER BY sent_at DESC LIMIT 1
    ↓
5. 验证结果判断
    ├─ 数据库有记录 OR 是万能验证码 → 继续
    └─ 否则 → 返回错误"验证码错误或已过期"
    ↓
6. 标记验证码已使用
    ├─ UPDATE sms_logs SET verified = true
    └─ （万能验证码跳过）
    ↓
7. 查找或创建用户
    ├─ 哈希手机号：hashPhone(phone)
    ├─ 加密手机号：encryptPhone(phone)
    ├─ SELECT * FROM users WHERE phone_hash = $1
    └─ 如果不存在 → INSERT INTO users
    ↓
8. 生成 JWT Token
    ├─ jwtUtil.sign({ userId, phone })
    └─ 有效期：7天
    ↓
9. 返回响应
    └─ { success: true, token: 'eyJh...', user: {...} }
```

**关键技术点**：

1. **验证码唯一性**：
   - 一个验证码只能用一次（`verified = false`）
   - 使用后标记为 `verified = true`

2. **时间有效性**：
   - 5分钟过期（`expires_at > NOW()`）
   - 数据库自动比较时间

3. **安全性**：
   - 手机号哈希后存储（不可逆）
   - 手机号加密后存储（可逆，用于显示）
   - 验证码不明文传输

**学习要点**：
- 理解数据库查询条件的重要性
- 掌握时间处理（过期判断）
- 了解加密存储的必要性

---

## 🎓 进阶话题

### 话题1：为什么要用 Redis + PostgreSQL 双存储？

**PostgreSQL**：
- 持久化存储
- 复杂查询
- 数据完整性

**Redis**：
- 高速缓存
- 自动过期
- 简单 key-value

**使用场景对比**：

| 数据 | PostgreSQL | Redis | 原因 |
|------|------------|-------|------|
| 验证码 | ✅ 存储 | ✅ 防刷 | 需要持久化 + 快速检查 |
| 用户信息 | ✅ 存储 | ❌ 不存 | 需要复杂查询 |
| 抽卡记录 | ✅ 存储 | ❌ 不存 | 需要持久化 |
| 限流计数 | ❌ 不存 | ✅ 存储 | 需要自动过期 |

**组合使用**：
```javascript
// 先查 Redis（快）
let user = await redis.get(`user:${userId}`);

if (!user) {
  // Redis 没有，查数据库（慢）
  user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

  // 写入 Redis（下次快）
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
}
```

---

### 话题2：Web 函数 vs 传统服务器

**传统服务器**：
```javascript
// 启动后一直运行
app.listen(3000);

// 优点：
// - 响应快（无冷启动）
// - 可控性强

// 缺点：
// - 需要自己管理服务器
// - 闲时也占资源
// - 成本固定
```

**云函数（Serverless）**：
```javascript
// 按需启动
// 请求来了才启动，没请求时关闭

// 优点：
// - 自动扩容
// - 按使用量付费
// - 无需运维

// 缺点：
// - 冷启动延迟（2-5秒）
// - 调试复杂
// - 依赖云平台
```

**我们的选择**：
- 用云函数（成本低、无需运维）
- 接受冷启动（用户可接受）
- 通过预留实例优化（可选）

---

## 🔨 常见问题排查

### Q1：Redis 连接失败

**错误信息**：
```
ERR invalid password
WRONGPASS invalid username-password pair
```

**排查步骤**：

1. 测试密码：
   ```bash
   cd functions/api
   node test-redis-connection.js
   ```

2. 检查配置：
   ```javascript
   console.log(process.env.REDIS_PASSWORD);
   ```

3. 检查 Redis 版本：
   - Redis 7.0 需要用户名
   - 或者不指定用户名（我们的方案）

**解决方案**：
```javascript
// 方案1：指定 username
const redis = new Redis({
  username: 'default',
  password: 'RedisPass123'
});

// 方案2：不指定 username（我们用的）
const redis = new Redis({
  password: 'RedisPass123'
});
```

---

### Q2：数据库查询返回空

**问题**：明明插入了数据，为什么查不到？

**可能原因**：

1. **大小写敏感**：
   ```sql
   -- ❌ 表名大小写错误
   SELECT * FROM SMS_LOGS;

   -- ✅ 正确
   SELECT * FROM sms_logs;
   ```

2. **时间过期了**：
   ```sql
   -- 检查过期时间
   SELECT phone, code, expires_at,
          expires_at > NOW() as is_valid
   FROM sms_logs;
   ```

3. **已被标记为 verified**：
   ```sql
   -- 查看所有记录（包括已验证的）
   SELECT * FROM sms_logs WHERE verified = true;
   ```

**调试技巧**：
```javascript
// 打印 SQL 查询结果
const result = await pool.query('SELECT ...');
console.log('查询结果:', result.rows);
console.log('记录数:', result.rowCount);
```

---

### Q3：云函数找不到模块

**错误信息**：
```
Cannot find module '../middlewares/auth'
```

**原因**：
- ZIP 文件没包含该目录
- 打包命令遗漏了文件夹

**解决方案**：

检查 ZIP 内容：
```bash
unzip -l abc-bank-h5.zip | grep middleware
```

重新打包（确保包含所有目录）：
```bash
zip -r -X abc-bank-h5.zip \
  scf_bootstrap \
  index.js \
  package.json \
  .env \
  config \
  routes \
  utils \
  middlewares  ← 确保这个目录在列表中
```

---

## 📖 推荐学习资源

### 官方文档

1. **Koa**：https://koajs.com/
2. **PostgreSQL**：https://www.postgresql.org/docs/
3. **Redis**：https://redis.io/docs/
4. **JWT**：https://jwt.io/introduction
5. **腾讯云函数**：https://cloud.tencent.com/document/product/583

### 实战教程

1. **Koa 教程**：阮一峰的网络日志
2. **PostgreSQL 教程**：PostgreSQL 中文文档
3. **Redis 实战**：Redis 设计与实现

---

## 🎯 总结：核心能力清单

掌握这个项目后，你将具备：

✅ **基础能力**
- [x] Koa 框架使用
- [x] 环境变量管理
- [x] RESTful API 设计

✅ **数据库能力**
- [x] PostgreSQL 增删改查
- [x] Redis 缓存应用
- [x] 连接池管理

✅ **安全能力**
- [x] JWT 认证
- [x] 数据加密
- [x] 防刷限流

✅ **云服务能力**
- [x] Serverless 部署
- [x] 自动化部署
- [x] 监控调试

**下一步**：
- 深入学习某个感兴趣的难点
- 尝试修改代码，观察效果
- 实现一个自己的小功能

---

**文档版本**：1.0
**创建时间**：2025-12-14
**适合人群**：后端新手、想深入了解项目的开发者
