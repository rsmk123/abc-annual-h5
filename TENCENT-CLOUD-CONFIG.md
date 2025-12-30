# 腾讯云配置信息汇总

> **目的**：移除所有 MOCK 代码，配置生产环境

---

## ✅ 已确认的配置

### 1. 对象存储 COS（前端部署）

- **存储桶名称**: `abc-h5-20251205-1331245644`
- **地域**: 广州（`ap-guangzhou`）
- **COS 默认域名**: `abc-h5-20251205-1331245644.cos.ap-guangzhou.myqcloud.com`
- **静态网站域名**: `abc-h5-20251205-1331245644.cos-website.ap-guangzhou.myqcloud.com`
- **自定义域名**: `h5.actionlist.cool` (已在 DNS 配置 CNAME)
- **访问权限**: 可匿名访问（公开读）

### 2. 数据库配置

#### PostgreSQL
```env
POSTGRES_HOST=gz-postgres-aa98gsf9.sql.tencentcdb.com
POSTGRES_PORT=20944
POSTGRES_USER=rsmk_
POSTGRES_PASSWORD=YzhchuyinTC085@
POSTGRES_DB=abc_bank_h5
```

#### Redis
```env
REDIS_HOST=gz-crs-mq2rf8jh.sql.tencentcdb.com
REDIS_PORT=27830
REDIS_PASSWORD=Redis@2025
```

### 3. 云函数配置（后端 API）

- **服务名**: `abc-bank-h5-api`
- **函数名**: `api`
- **完整云函数名**: `abc-bank-h5-api-api`
- **地域**: 广州（`ap-guangzhou`）
- **运行环境**: Node.js 18.13
- **内存**: 512MB
- **超时**: 10秒
- **API Gateway 名称**: `abc-h5-api`

### 4. 其他配置

```env
JWT_SECRET=abc-bank-h5-jwt-secret-key-20251207-random
ENCRYPT_KEY=12345678901234567890123456789012
```

---

## ✅ 新获取的配置（通过 Chrome DevTools）

### 腾讯云 API 密钥

- **APPID**: `your_appid_here`
- **SecretId**: `your_secret_id_here`
- **SecretKey**: ⚠️ **需要你提供**
  - 腾讯云自 2023年11月30日起关闭查询 SecretKey 功能
  - 仅在创建密钥时可以查看
  - 如果你之前保存了，请提供
  - 如果没有保存，需要点击"新建密钥"创建新的密钥对

---

## ❓ 待补充的配置（需要从腾讯云控制台获取）

### 1. 云函数 API Gateway URL ⚠️

**作用**: 前端调用后端 API 的地址

**获取方法**:
1. 进入腾讯云控制台 → 云函数
2. 找到函数 `abc-bank-h5-api-api`（如果不存在，需要先部署）
3. 点击进入 → 触发管理
4. 查看 API 网关触发器的访问路径
5. 格式：`https://service-xxx-123456.gz.apigw.tencentcs.com/release/`

**当前状态**:
- ⚠️ 文件 `functions/api-gateway-url.txt` 不存在
- ⚠️ 在控制台只看到 `express_demo-1765093297`（示例函数）
- ❓ 可能需要先部署云函数

**配置到**:
```env
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://service-xxx-123456.gz.apigw.tencentcs.com/release/api
```

---

### 2. 腾讯云 API 密钥 🔑

**作用**: 部署云函数和调用短信服务

**获取方法**:
1. 腾讯云控制台 → 右上角头像 → 访问管理
2. 左侧菜单 → 访问密钥 → API 密钥管理
3. 点击"新建密钥"或查看现有密钥
4. ⚠️ SecretKey 只在创建时显示一次，请妥善保管

**需要的值**:
```env
# functions/api/.env (新增)
TENCENT_SECRET_ID=AKIDxxxxxxxxxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

**用于**:
- 部署云函数（通过 serverless framework）
- 调用腾讯云短信服务 SDK

---

### 3. 短信服务配置 📱

**作用**: 发送验证码短信

**获取方法**:

#### 步骤 1：创建短信应用
1. 腾讯云控制台 → 短信服务
2. 应用管理 → 创建应用
3. 应用名称：`ABC银行H5活动`
4. 记录 **SDK AppID**（纯数字）

#### 步骤 2：申请签名
1. 国内短信 → 签名管理 → 创建签名
2. 签名内容：`ABC银行`
3. 签名类型：企业
4. 上传企业资质
5. 等待审核通过（1-2 工作日）

#### 步骤 3：创建短信模板
1. 国内短信 → 模板管理 → 创建模板
2. 模板名称：`验证码短信`
3. 模板内容：`【ABC银行】您的验证码是{1}，5分钟内有效，请勿泄露给他人。`
4. 等待审核通过（1-2 工作日）
5. 记录 **模板 ID**（纯数字）

#### 需要的值:
```env
# functions/api/.env (新增)
TENCENT_SMS_SDK_APP_ID=1400xxxxxx
TENCENT_SMS_SIGN_NAME=ABC银行
TENCENT_SMS_TEMPLATE_ID=123456
```

**当前状态**:
- ❓ 未知是否已申请
- ⚠️ 如未申请，需要 1-2 工作日审核时间

---

## 📋 配置检查清单

在开始移除 MOCK 代码前，请确认：

- [x] PostgreSQL 数据库连接信息
- [x] Redis 数据库连接信息
- [x] COS 存储桶和域名
- [ ] 云函数 API Gateway URL（需要确认或部署）
- [ ] 腾讯云 API 密钥（SecretId + SecretKey）
- [ ] 短信服务应用 ID
- [ ] 短信服务签名名称
- [ ] 短信服务模板 ID

---

## 🚀 下一步行动

### 选项 A：云函数已部署
如果云函数 `abc-bank-h5-api-api` 已经部署：
1. 在腾讯云控制台查找函数
2. 获取 API Gateway URL
3. 获取 API 密钥
4. 申请短信服务（可以并行进行）
5. 开始执行 MOCK 移除

### 选项 B：云函数未部署（推荐）
如果云函数还未部署，建议按以下顺序：
1. 先获取 API 密钥
2. 部署云函数到腾讯云（使用 serverless framework）
3. 获取 API Gateway URL
4. 并行申请短信服务
5. 审核通过后配置短信
6. 开始执行 MOCK 移除

---

## 🎯 快速验证命令

### 检查云函数是否已部署
```bash
cd functions/api
# 需要先配置 ~/.tencentcloud/credentials
serverless info
```

### 检查前端可访问性
```bash
curl https://h5.actionlist.cool
# 或
curl http://abc-h5-20251205-1331245644.cos-website.ap-guangzhou.myqcloud.com
```

---

## 📝 配置文件对照表

| 配置项 | 来源 | 用途 | 当前值 |
|------|------|------|--------|
| **前端配置** | | | |
| `NEXT_PUBLIC_API_BASE_URL` | `.env.production` | 前端调用后端API | ❓ 待配置 |
| **后端配置** | | | |
| `POSTGRES_HOST` | `functions/api/.env` | 数据库连接 | ✅ 已配置 |
| `POSTGRES_PORT` | `functions/api/.env` | 数据库端口 | ✅ 已配置 |
| `POSTGRES_USER` | `functions/api/.env` | 数据库用户 | ✅ 已配置 |
| `POSTGRES_PASSWORD` | `functions/api/.env` | 数据库密码 | ✅ 已配置 |
| `POSTGRES_DB` | `functions/api/.env` | 数据库名称 | ✅ 已配置 |
| `REDIS_HOST` | `functions/api/.env` | Redis连接 | ✅ 已配置 |
| `REDIS_PORT` | `functions/api/.env` | Redis端口 | ✅ 已配置 |
| `REDIS_PASSWORD` | `functions/api/.env` | Redis密码 | ✅ 已配置 |
| `JWT_SECRET` | `functions/api/.env` | JWT密钥 | ✅ 已配置 |
| `ENCRYPT_KEY` | `functions/api/.env` | 加密密钥 | ✅ 已配置 |
| `MOCK_SMS` | `functions/api/.env` | 模拟短信开关 | ❌ 需要删除 |
| `MOCK_SMS_CODE` | `functions/api/.env` | 模拟验证码 | ❌ 需要删除 |
| `TENCENT_SECRET_ID` | `functions/api/.env` | API密钥ID | ❓ 待添加 |
| `TENCENT_SECRET_KEY` | `functions/api/.env` | API密钥Key | ❓ 待添加 |
| `TENCENT_SMS_SDK_APP_ID` | `functions/api/.env` | 短信应用ID | ❓ 待添加 |
| `TENCENT_SMS_SIGN_NAME` | `functions/api/.env` | 短信签名 | ❓ 待添加 |
| `TENCENT_SMS_TEMPLATE_ID` | `functions/api/.env` | 短信模板ID | ❓ 待添加 |
| **Serverless 配置** | | | |
| `MOCK_SMS` | `serverless.yml` 34行 | 环境变量 | ❌ 需要删除 |
| `MOCK_SMS_CODE` | `serverless.yml` 35行 | 环境变量 | ❌ 需要删除 |

---

## 🔍 腾讯云控制台发现

从 Chrome DevTools 探索到的信息：

### 云函数列表（广州地域）
- `express_demo-1765093297` - Web函数，Node.js 12.16（示例项目）
- ⚠️ 未找到 `abc-bank-h5-api-api` 云函数

### 对象存储
- `abc-h5-20251205-1331245644` - 1MB，广州地域，可匿名访问

---

## ⚡ 立即可执行的工作

即使没有获取到所有配置，我们也可以先完成以下工作：

### 第一阶段：代码清理（不依赖腾讯云配置）

1. ✅ 删除前端 MOCK API Routes（`app/api/` 目录）
2. ✅ 删除后端 no-redis 降级版本
3. ✅ 修改后端代码移除 MOCK 逻辑
4. ✅ 更新前端组件移除 MOCK 提示
5. ✅ 清理部署脚本中的 8888 检查

### 第二阶段：配置集成（需要API密钥）

1. ❓ 创建短信服务封装
2. ❓ 集成腾讯云短信 SDK
3. ❓ 配置环境变量

### 第三阶段：部署验证（需要完整配置）

1. ❓ 部署云函数
2. ❓ 更新前端 API 地址
3. ❓ 端到端测试

---

## 💡 建议的执行策略

### 策略 1：立即开始（推荐）

先执行第一阶段的代码清理工作，这些工作不依赖腾讯云配置：

1. 删除 MOCK 代码
2. 创建短信服务代码框架（先用占位符）
3. 更新配置文件结构
4. 提交代码到 Git

然后并行：
- 你去腾讯云控制台补充配置信息
- 我准备好第二、第三阶段的执行计划

### 策略 2：等待完整配置

等你补充完所有配置信息后，一次性执行所有改造。

---

## 🎯 你的决定

请选择：

1. **立即开始执行第一阶段** - 我现在就开始删除 MOCK 代码，创建代码框架
2. **先补充配置** - 你先去腾讯云控制台获取API密钥、短信配置，然后我一次性完成所有改造
3. **先部署云函数** - 我帮你部署云函数获取 API Gateway URL，然后再继续
4. **其他建议** - 你有其他想法

无论选择哪个，我都已经准备好了详细的实施计划（见 `MOCK-REMOVAL-UNIFIED-PLAN.md`）。
