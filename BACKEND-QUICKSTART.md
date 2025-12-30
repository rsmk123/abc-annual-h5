# 快速开始指南 - 后端部署

> 所有代码文件已创建完成，按以下步骤操作即可完成部署

## 📊 当前进度

```
✅ 代码文件创建：100%
📋 接下来需要：创建腾讯云资源 + 部署
```

---

## 第一步：检查已创建的文件

```bash
cd "/Users/xiaoyang/Desktop/Next.js项目/abc-bank-annual-h5"

# 检查云函数代码
ls -R functions/api/
# 应该看到：
# - package.json, serverless.yml, index.js
# - config/: db.js, redis.js
# - utils/: jwt.js, crypto.js
# - middlewares/: auth.js
# - routes/: auth.js, user.js, card.js

# 检查前端API客户端
ls -l lib/api.ts

# 检查进度跟踪
cat backend-progress.json | grep totalSteps
# 应该显示：totalSteps: 7

# 检查数据库SQL
ls -l database/init.sql
```

---

## 第二步：在腾讯云创建资源（需手动操作）

### 方法1：使用Chrome DevTools自动填表（推荐）

#### 创建PostgreSQL数据库

1. **打开控制台**：访问 https://console.cloud.tencent.com/postgres
2. **点击「新建」**
3. **打开Chrome DevTools**：按 `Command + Option + I`（macOS）或 `F12`（Windows）
4. **切换到Console标签**
5. **复制粘贴以下脚本并回车**：

```javascript
(function() {
  console.log('🚀 自动填写PostgreSQL表单...');

  setTimeout(() => {
    // 地域
    const regionSelect = document.querySelector('select[name="region"]');
    if (regionSelect) {
      regionSelect.value = 'ap-guangzhou';
      regionSelect.dispatchEvent(new Event('change'));
      console.log('✅ 地域：广州');
    }

    // 实例名称
    const nameInput = document.querySelector('input[placeholder*="实例名称"]');
    if (nameInput) {
      nameInput.value = 'abc-bank-h5-db';
      nameInput.dispatchEvent(new Event('input'));
      console.log('✅ 实例名称：abc-bank-h5-db');
    }

    console.log('\n📋 请手动完成：');
    console.log('1. 版本：PostgreSQL 14');
    console.log('2. 规格：1核2GB');
    console.log('3. 存储：10GB');
    console.log('4. 密码：AbcBank@2025（记住这个密码！）');

  }, 1000);
})();
```

6. **手动设置**：
   - 版本：PostgreSQL 14
   - 规格：1核2GB
   - 密码：`AbcBank@2025`
7. **点击「立即购买」**
8. **等待3-5分钟创建完成**

#### 创建数据库

1. 回到PostgreSQL实例列表
2. 点击实例ID进入详情页
3. 点击「数据库管理」标签
4. 点击「创建数据库」
5. 数据库名：`abc_bank_h5`
6. 字符集：UTF8
7. 点击「确定」

#### 获取连接信息

在实例详情页，复制「内网地址」和「端口」：

```bash
# 创建.env文件（将下面的IP替换为实际值）
cd functions/api
cp .env.template .env

# 编辑.env，替换POSTGRES_HOST为实际的内网地址
nano .env
```

---

#### 创建Redis实例

1. **打开控制台**：访问 https://console.cloud.tencent.com/redis
2. **点击「新建」**
3. **打开Chrome DevTools**（F12），**切换到Console**
4. **复制粘贴以下脚本并回车**：

```javascript
(function() {
  console.log('🚀 自动填写Redis表单...');

  setTimeout(() => {
    const regionSelect = document.querySelector('select[name="region"]');
    if (regionSelect) {
      regionSelect.value = 'ap-guangzhou';
      regionSelect.dispatchEvent(new Event('change'));
      console.log('✅ 地域：广州');
    }

    const nameInput = document.querySelector('input[placeholder*="实例名称"]');
    if (nameInput) {
      nameInput.value = 'abc-bank-h5-redis';
      nameInput.dispatchEvent(new Event('input'));
      console.log('✅ 实例名称：abc-bank-h5-redis');
    }

    console.log('\n📋 请手动完成：');
    console.log('1. 规格：256MB');
    console.log('2. 密码：Redis@2025（记住这个密码！）');

  }, 1000);
})();
```

5. **手动设置**：
   - 规格：256MB
   - 密码：`Redis@2025`
6. **点击「立即购买」**
7. **等待2-3分钟创建完成**
8. **获取连接信息**：复制「内网地址」和「端口」，更新 `.env` 文件

---

## 第三步：初始化数据库

```bash
# 安装PostgreSQL客户端（如果没有）
brew install postgresql@14

# 连接数据库（替换IP为你的实际地址）
psql -h 172.x.x.x -p 5432 -U root -d abc_bank_h5
# 输入密码：AbcBank@2025

# 在psql中执行：
\i database/init.sql

# 验证表创建
\dt
# 应该看到：users, draw_logs, sms_logs

# 退出
\q
```

---

## 第四步：部署云函数

```bash
# 1. 进入云函数目录
cd functions/api

# 2. 安装依赖
npm install

# 3. 加载环境变量
source .env

# 4. 部署到腾讯云
serverless deploy

# 5. 记录返回的API网关URL
# 例如：https://service-xxx-123456.gz.apigw.tencentcs.com/release/
```

---

## 第五步：测试API

```bash
# 健康检查
curl https://service-xxx-123456.gz.apigw.tencentcs.com/release/

# 发送验证码
curl -X POST https://service-xxx-123456.gz.apigw.tencentcs.com/release/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "deviceId": "test-001"}'

# 验证码登录
curl -X POST https://service-xxx-123456.gz.apigw.tencentcs.com/release/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "8888", "deviceId": "test-001"}'
```

---

## 第六步：配置前端

```bash
cd "/Users/xiaoyang/Desktop/Next.js项目/abc-bank-annual-h5"

# 复制环境变量模板
cp .env.production.template .env.production

# 编辑.env.production，替换API_BASE_URL为实际地址
nano .env.production
```

---

## 第七步：验证完整流程

```bash
# 启动前端
npm run dev

# 访问 http://localhost:3000/bank-campaign
# 测试登录 + 抽卡流程
```

---

## 遇到问题？

查看详细文档：
- 完整实施方案：`完整后端实施方案-带进度跟踪.md`
- 进度跟踪：`backend-progress.json`

---

## 文件清单

### 已创建的文件 ✅

```
✅ backend-progress.json           - 进度跟踪
✅ functions/api/package.json      - NPM配置
✅ functions/api/serverless.yml    - 部署配置
✅ functions/api/index.js          - SCF入口
✅ functions/api/config/db.js      - PostgreSQL连接
✅ functions/api/config/redis.js   - Redis连接
✅ functions/api/utils/jwt.js      - JWT工具
✅ functions/api/utils/crypto.js   - 加密工具
✅ functions/api/middlewares/auth.js - 认证中间件
✅ functions/api/routes/auth.js    - 认证路由
✅ functions/api/routes/user.js    - 用户路由
✅ functions/api/routes/card.js    - 抽卡路由
✅ functions/api/.env.template     - 环境变量模板
✅ lib/api.ts                      - 前端API客户端
✅ .env.production.template        - 前端环境变量
✅ database/init.sql               - 数据库初始化
✅ BACKEND-QUICKSTART.md           - 本快速指南
✅ 完整后端实施方案-带进度跟踪.md - 详细文档
```

### 需要你手动操作的步骤

```
☐ 创建PostgreSQL数据库（腾讯云控制台）
☐ 创建Redis实例（腾讯云控制台）
☐ 执行数据库初始化SQL
☐ 配置.env文件（填入真实的数据库连接信息）
☐ 部署云函数（serverless deploy）
☐ 配置前端环境变量
```

---

## 预计完成时间

- 创建腾讯云资源：15分钟
- 初始化数据库：5分钟
- 部署云函数：10分钟
- 测试验证：10分钟

**总计**：约40分钟（代码已创建，只需配置和部署）

---

## 成本说明

| 服务 | 成本 |
|------|------|
| PostgreSQL 1核2GB | ￥50/月 |
| Redis 256MB | ￥12/月 |
| SCF + API网关 | ￥11/月 |
| **总计** | **￥73/月** |
