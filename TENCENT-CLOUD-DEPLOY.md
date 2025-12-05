# 腾讯云COS部署完整指南

**目标**: 将ABC银行H5部署到腾讯云COS + 绑定自定义域名

**GitHub仓库**: https://github.com/rsmk123/abc-annual-h5
**构建输出**: out/ 目录（1.0MB）

---

## 🎯 部署架构

```
用户访问
   ↓
自定义域名 (你的域名)
   ↓
腾讯云CDN（可选，加速）
   ↓
腾讯云COS存储桶（静态网站托管）
   ├─ index.html
   ├─ _next/static/chunks/*.js
   └─ _next/static/css/*.css
   ↑
GitHub Actions自动部署
   ↑
git push origin main
```

---

## 📋 配置清单（6步完成）

- [ ] Step 1: 创建COS存储桶
- [ ] Step 2: 配置公有读权限
- [ ] Step 3: 启用静态网站托管
- [ ] Step 4: 获取API密钥
- [ ] Step 5: 配置GitHub Secrets
- [ ] Step 6: 绑定自定义域名

---

## 🚀 Step 1: 创建COS存储桶

### 方式A: 网页手动创建（推荐）

1. **访问COS控制台**
   ```
   https://console.cloud.tencent.com/cos5/bucket
   ```

2. **点击"创建存储桶"**

3. **填写配置**:
   ```
   名称: abc-h5-20251205（建议使用日期）
   所属地域: 广州（ap-guangzhou）
   访问权限: 公有读私有写
   存储桶标签: 可选
   ```

4. **点击"创建"**

5. **记录信息**:
   ```
   存储桶名称: abc-h5-20251205
   地域: ap-guangzhou
   访问域名: abc-h5-20251205.cos.ap-guangzhou.myqcloud.com
   ```

### 方式B: 命令行创建（需要先有API密钥）

```bash
# 安装coscmd
pip3 install coscmd

# 配置密钥（先从Step 4获取密钥）
coscmd config -a <SecretId> -s <SecretKey> -b abc-h5-20251205 -r ap-guangzhou

# 创建存储桶
coscmd createbucket abc-h5-20251205 -r ap-guangzhou
```

---

## 🔓 Step 2: 配置公有读权限

### 网页操作

1. **进入存储桶详情**
   - 在存储桶列表中点击刚创建的存储桶名称

2. **配置权限**
   - 左侧菜单选择 **"权限管理" → "存储桶访问权限"**
   - 找到 **"公共权限"** 部分
   - 设置为：
     ```
     公有读：√ 启用
     私有写：√ 启用
     ```

3. **保存设置**

### 命令行操作

```bash
# 使用coscmd设置ACL
coscmd putbucketacl -g public-read
```

---

## 🌐 Step 3: 启用静态网站托管

### 网页操作

1. **进入存储桶详情**（如果不在的话）

2. **进入基础配置**
   - 左侧菜单选择 **"基础配置" → "静态网站"**

3. **编辑静态网站配置**
   - 点击 **"编辑"**
   - 当前状态: 选择 **"启用"**
   - 索引文档: 输入 `index.html`
   - 错误文档: 输入 `index.html`（用于SPA路由）
   - 点击 **"保存"**

4. **记录静态网站访问域名**
   ```
   静态网站域名:
   http://abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com
   ```

### 命令行操作

```bash
# 使用coscmd配置静态网站
coscmd putbucketwebsite -i index.html -e index.html
```

---

## 🔑 Step 4: 获取API密钥

### 网页操作

1. **访问API密钥管理页面**
   ```
   https://console.cloud.tencent.com/cam/capi
   ```

2. **查看或创建密钥**
   - 如果已有密钥，点击 **"显示"** 查看
   - 如果没有密钥，点击 **"新建密钥"**

3. **记录密钥信息** ⚠️ 重要！
   ```
   SecretId: AKID********************************
   SecretKey: ****************************************
   ```

4. **保存到本地文件**（不要提交到Git）
   ```bash
   # 创建 .env.local 文件
   cat > .env.local << 'EOF'
   TENCENT_CLOUD_SECRET_ID=AKID你的SecretId
   TENCENT_CLOUD_SECRET_KEY=你的SecretKey
   COS_BUCKET=abc-h5-20251205
   COS_REGION=ap-guangzhou
   EOF

   # 设置权限
   chmod 600 .env.local
   ```

---

## 🔐 Step 5: 配置GitHub Secrets

### 网页操作

1. **访问仓库Secrets设置页面**
   ```
   https://github.com/rsmk123/abc-annual-h5/settings/secrets/actions
   ```

2. **添加第1个Secret**
   - 点击 **"New repository secret"**
   - Name: `TENCENT_CLOUD_SECRET_ID`
   - Value: `AKID你的SecretId`（从.env.local复制）
   - 点击 **"Add secret"**

3. **添加第2个Secret**
   - 点击 **"New repository secret"**
   - Name: `TENCENT_CLOUD_SECRET_KEY`
   - Value: `你的SecretKey`（从.env.local复制）
   - 点击 **"Add secret"**

4. **添加第3个Secret**
   - 点击 **"New repository secret"**
   - Name: `COS_BUCKET`
   - Value: `abc-h5-20251205`（你的存储桶名称）
   - 点击 **"Add secret"**

5. **添加第4个Secret**
   - 点击 **"New repository secret"**
   - Name: `COS_REGION`
   - Value: `ap-guangzhou`
   - 点击 **"Add secret"**

6. **验证所有4个Secrets存在**

### 命令行操作（使用GitHub CLI）

```bash
# 安装GitHub CLI（如果没有）
brew install gh

# 登录
gh auth login

# 添加Secrets（从.env.local读取）
source .env.local
gh secret set TENCENT_CLOUD_SECRET_ID --body "$TENCENT_CLOUD_SECRET_ID"
gh secret set TENCENT_CLOUD_SECRET_KEY --body "$TENCENT_CLOUD_SECRET_KEY"
gh secret set COS_BUCKET --body "$COS_BUCKET"
gh secret set COS_REGION --body "$COS_REGION"

# 验证
gh secret list
```

---

## 🚀 Step 6: 触发部署

### 方式A: 推送新提交（自动触发）

```bash
# 创建一个空提交来触发部署
git commit --allow-empty -m "chore: trigger deployment to COS"
git push origin main

# 监控部署进度
# 访问: https://github.com/rsmk123/abc-annual-h5/actions
```

### 方式B: 手动触发（GitHub网页）

1. 访问: https://github.com/rsmk123/abc-annual-h5/actions
2. 点击左侧 **"部署到腾讯云COS"** 工作流
3. 点击 **"Run workflow"**
4. 选择分支 **"main"**
5. 点击 **"Run workflow"** 确认

### 监控部署

访问: https://github.com/rsmk123/abc-annual-h5/actions

**预期流程**（3-5分钟）:
```
✓ 检出代码
✓ 设置Bun
✓ 安装依赖
✓ 类型检查
✓ Lint检查
✓ 构建静态站点
✓ 验证构建输出
✓ 部署到COS
✓ 部署成功通知
```

**成功标志**: 绿色勾号 ✅

---

## 🌐 Step 7: 绑定自定义域名

### 前提条件

- [ ] 你有域名（例如: h5.yourdomain.com）
- [ ] 域名DNS可以修改

### 配置步骤

1. **在COS中添加自定义域名**

   访问存储桶配置:
   ```
   https://console.cloud.tencent.com/cos5/bucket
   → 选择你的存储桶
   → 左侧菜单: "域名与传输管理" → "自定义源站域名"
   → 点击 "添加域名"
   ```

   填写:
   ```
   域名: h5.yourdomain.com
   源站类型: 静态网站源站
   回源协议: HTTP
   ```

2. **配置DNS解析**

   在你的域名DNS服务商处添加CNAME记录:
   ```
   记录类型: CNAME
   主机记录: h5
   记录值: abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com
   TTL: 600
   ```

3. **等待DNS生效**（5-10分钟）

   验证:
   ```bash
   nslookup h5.yourdomain.com
   # 应该解析到COS域名
   ```

4. **（可选）配置CDN加速**

   访问CDN控制台:
   ```
   https://console.cloud.tencent.com/cdn
   → 添加域名
   → 源站配置: COS源站
   → 选择你的存储桶
   ```

5. **（可选）启用HTTPS**

   需要：
   - SSL证书（免费: Let's Encrypt / 腾讯云免费证书）
   - 在CDN中上传证书
   - 开启强制HTTPS

---

## 📊 验证部署成功

### 1. 验证COS上传

```bash
# 检查存储桶内容（需要先配置coscmd）
coscmd list

# 应该看到:
# index.html
# _next/
# bank-campaign/
# 404.html
# ...
```

### 2. 验证静态网站URL

```bash
# 测试访问
curl -I http://abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com

# 预期: HTTP/1.1 200 OK
```

浏览器访问:
```
http://abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com
```

### 3. 验证自定义域名（如果配置了）

```bash
curl -I http://h5.yourdomain.com
```

### 4. 完整功能测试

在线上URL测试：
- [ ] 登录弹窗出现
- [ ] 输入手机号可以登录
- [ ] 点击卡片3D翻转流畅
- [ ] 收集系统正常工作
- [ ] 集齐5个字显示奖励
- [ ] 重置功能正常
- [ ] 移动端响应式正常

---

## 🛠 命令行自动化方案（coscmd）

如果你更喜欢命令行，可以使用coscmd直接上传：

### 安装coscmd

```bash
# 使用pip安装
pip3 install coscmd

# 验证安装
coscmd --version
```

### 配置coscmd

```bash
# 从.env.local读取配置
source .env.local

# 配置coscmd
coscmd config \
  -a $TENCENT_CLOUD_SECRET_ID \
  -s $TENCENT_CLOUD_SECRET_KEY \
  -b $COS_BUCKET \
  -r $COS_REGION
```

### 手动上传部署

```bash
# 1. 构建
bun run build

# 2. 上传到COS（删除旧文件）
coscmd upload -r out/ / --delete

# 3. 验证
coscmd list

# 4. 访问静态网站URL
open "http://$COS_BUCKET.cos-website.$COS_REGION.myqcloud.com"
```

### 创建部署脚本

```bash
# 创建 scripts/manual-deploy.sh
cat > scripts/manual-deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "开始部署到腾讯云COS..."

# 1. 加载环境变量
source .env.local

# 2. 构建
echo "1. 构建静态站点..."
bun run build

# 3. 上传
echo "2. 上传到COS..."
coscmd upload -r out/ / --delete

# 4. 验证
echo "3. 验证部署..."
coscmd list | head -10

echo "✅ 部署成功！"
echo "访问: http://$COS_BUCKET.cos-website.$COS_REGION.myqcloud.com"
EOF

chmod +x scripts/manual-deploy.sh
```

**使用**:
```bash
bash scripts/manual-deploy.sh
```

---

## 📝 配置信息模板

完成上述步骤后，请填写以下信息：

```yaml
# COS配置
存储桶名称: abc-h5-20251205
地域: ap-guangzhou
静态网站URL: http://abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com

# API密钥
SecretId: AKID********************************
SecretKey: ****************************************

# GitHub Secrets状态
✓ TENCENT_CLOUD_SECRET_ID
✓ TENCENT_CLOUD_SECRET_KEY
✓ COS_BUCKET
✓ COS_REGION

# 自定义域名（可选）
域名: h5.yourdomain.com
DNS配置: CNAME → abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com
CDN加速: 启用/未启用
HTTPS: 启用/未启用
```

---

## 🔍 故障排查

### 问题1: GitHub Actions部署失败

**症状**:
```
Error: Input required and not supplied: secret_id
```

**解决**:
- 检查GitHub Secrets是否配置（4个全部需要）
- 确认Secret名称完全匹配（区分大小写）

### 问题2: 访问COS URL显示403

**症状**:
```
<Code>AccessDenied</Code>
```

**解决**:
- 检查存储桶是否设置为"公有读"
- 确认文件已上传（coscmd list查看）

### 问题3: 访问COS URL显示404

**症状**:
```
<Code>NoSuchKey</Code>
```

**可能原因**:
- 静态网站未启用
- index.html未设置
- 文件未上传

**解决**:
```bash
# 检查静态网站配置
# 在COS控制台查看"基础配置 → 静态网站"

# 检查文件是否存在
coscmd list | grep index.html
```

### 问题4: 自定义域名无法访问

**症状**: 域名无法访问或解析失败

**解决**:
```bash
# 1. 检查DNS解析
nslookup h5.yourdomain.com

# 应该返回:
# h5.yourdomain.com canonical name = abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com

# 2. 检查域名是否在COS中添加
# 在COS控制台 → 域名与传输管理 → 自定义源站域名

# 3. 等待DNS传播（可能需要5-30分钟）
```

---

## 📊 成本估算

### 月度成本（假设10,000访问/月）

| 项目 | 用量 | 单价 | 成本 |
|-----|------|------|------|
| 存储 | 1GB | ¥0.099/GB/月 | ¥0.10 |
| 流量 | 10GB | ¥0.50/GB | ¥5.00 |
| 请求 | 10万次 | ¥0.01/万次 | ¥0.10 |
| **小计** | | | **¥5.20/月** |

**优化建议**:
- 启用COS CDN（前10GB免费）→ 可降至 **¥0.20/月**
- 使用Gzip压缩 → 流量减少70%

---

## 🎯 快速部署脚本（一键执行）

我为你创建一个交互式部署脚本：

```bash
# 运行交互式配置
bash scripts/setup-cos.sh
```

脚本会引导你：
1. 输入存储桶名称
2. 输入SecretId和SecretKey
3. 自动配置coscmd
4. 自动构建和上传
5. 输出访问URL

---

## ✅ 完成检查清单

部署完成后，确认以下内容：

**COS配置**:
- [ ] 存储桶已创建
- [ ] 访问权限为"公有读私有写"
- [ ] 静态网站已启用
- [ ] 索引文档设置为index.html

**GitHub配置**:
- [ ] 4个Secrets已配置
- [ ] GitHub Actions工作流存在
- [ ] 工作流可以手动触发

**部署验证**:
- [ ] GitHub Actions部署成功（绿色勾号）
- [ ] COS存储桶包含out/目录的所有文件
- [ ] 静态网站URL可访问
- [ ] 所有功能正常工作

**域名配置**（可选）:
- [ ] DNS CNAME记录已添加
- [ ] 自定义域名可访问
- [ ] HTTPS已启用（可选）

---

## 🤝 需要我帮助的地方

完成Step 1-4后，请告诉我：

```
存储桶名称: abc-h5-YYYYMMDD
地域: ap-guangzhou
静态网站URL: http://...
```

我会帮你：
1. ✅ 使用GitHub CLI配置Secrets（如果你安装了gh命令）
2. ✅ 触发首次部署
3. ✅ 验证部署成功
4. ✅ 运行CDP性能测试
5. ✅ 更新features-complete.json标记完成
6. ✅ 协助绑定自定义域名

**现在开始配置吧！** 先完成Step 1-4，然后告诉我结果 🚀
