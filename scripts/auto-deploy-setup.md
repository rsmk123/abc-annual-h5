# 自动化部署配置指南

基于 **SPEC 附录B** 的 Chrome DevTools MCP 自动化方案

## 🎯 目标

通过浏览器自动化完成以下任务：
1. ✅ 创建腾讯云COS存储桶
2. ✅ 配置静态网站托管
3. ✅ 获取API密钥
4. ✅ 配置GitHub Secrets

## 📋 前提条件

### 检查MCP工具是否可用

```bash
# 检查是否安装了chrome-devtools MCP
# 在Claude Code中运行：
# 输入 "mcp__" 然后按Tab，查看是否有chrome-devtools相关工具
```

如果没有Chrome DevTools MCP，需要安装：
```bash
# 参考Claude Code MCP安装文档
# https://docs.anthropic.com/claude/docs/mcp
```

---

## 🚀 自动化流程

### 任务1: 创建COS存储桶

**使用AI代理执行**:

```
请使用Chrome DevTools MCP帮我创建腾讯云COS存储桶：

目标配置:
- 存储桶名称: abc-h5-{当前时间戳}
- 地域: ap-guangzhou（广州）
- 访问权限: 公有读、私有写

步骤:
1. 导航到: https://console.cloud.tencent.com/cos5/bucket
2. 点击"创建存储桶"
3. 填写表单:
   - 名称: abc-h5-{Date.now()}
   - 地域: ap-guangzhou
   - 权限: 公有读
4. 确认创建
5. 截图保存存储桶信息

请记录:
- 存储桶名称
- 访问域名
- 静态网站URL
```

**预期结果**:
```
✓ 存储桶已创建
存储桶名称: abc-h5-20251205
地域: ap-guangzhou
访问域名: abc-h5-20251205.cos.ap-guangzhou.myqcloud.com
```

---

### 任务2: 启用静态网站托管

**使用AI代理执行**:

```
请在刚创建的COS存储桶中启用静态网站托管：

配置:
- 索引文档: index.html
- 错误文档: index.html（用于SPA路由）

步骤:
1. 进入存储桶详情页
2. 点击"基础配置"标签
3. 找到"静态网站"部分
4. 点击编辑
5. 启用静态网站
6. 设置索引文档: index.html
7. 设置错误文档: index.html
8. 保存
9. 截图静态网站URL

请记录静态网站URL:
http://abc-h5-{时间戳}.cos-website.ap-guangzhou.myqcloud.com
```

**预期结果**:
```
✓ 静态网站已启用
静态网站URL: http://abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com
索引文档: index.html
错误文档: index.html
```

---

### 任务3: 获取API密钥

**使用AI代理执行**:

```
请帮我获取腾讯云API密钥（SecretId和SecretKey）：

步骤:
1. 导航到: https://console.cloud.tencent.com/cam/capi
2. 如果已有密钥，截图保存
3. 如果没有密钥，点击"新建密钥"
4. 确认创建
5. 截图保存密钥信息（SecretId和SecretKey）

⚠️ 重要: 密钥只显示一次，必须保存！

请将密钥信息保存到本地文件（不要提交到Git）:
- 文件名: .env.local
- 格式:
  TENCENT_CLOUD_SECRET_ID=AKID****
  TENCENT_CLOUD_SECRET_KEY=****
```

**预期结果**:
```
✓ API密钥已获取
✓ 已保存到 .env.local
```

---

### 任务4: 配置GitHub Secrets

**使用AI代理执行**:

```
请帮我在GitHub仓库中配置Secrets：

仓库URL: https://github.com/{username}/abc-bank-annual-h5

需要配置的Secrets（从.env.local读取）:
1. TENCENT_CLOUD_SECRET_ID
2. TENCENT_CLOUD_SECRET_KEY
3. COS_BUCKET = abc-h5-{时间戳}
4. COS_REGION = ap-guangzhou

步骤:
1. 导航到: https://github.com/{username}/{repo}/settings/secrets/actions
2. 点击"New repository secret"
3. 逐个添加4个secrets
4. 每个添加后截图确认

请确认所有4个secrets已成功添加。
```

**预期结果**:
```
✓ 4个Secrets已配置
✓ TENCENT_CLOUD_SECRET_ID ✓
✓ TENCENT_CLOUD_SECRET_KEY ✓
✓ COS_BUCKET ✓
✓ COS_REGION ✓
```

---

## 📝 手动步骤（如果自动化失败）

### 手动创建COS存储桶

1. 访问: https://console.cloud.tencent.com/cos5/bucket
2. 点击"创建存储桶"
3. 填写信息:
   - 名称: `abc-h5-` + 当前日期（例如: abc-h5-20251205）
   - 地域: 选择"广州（ap-guangzhou）"
   - 访问权限: 选择"公有读私有写"
4. 点击"确定"
5. 创建成功后，记录存储桶名称

### 手动启用静态网站

1. 点击进入刚创建的存储桶
2. 左侧菜单选择"基础配置"
3. 滚动到"静态网站"部分
4. 点击"编辑"
5. 状态选择"启用"
6. 索引文档输入: `index.html`
7. 错误文档输入: `index.html`
8. 点击"保存"
9. 记录显示的静态网站访问域名

### 手动获取API密钥

1. 访问: https://console.cloud.tencent.com/cam/capi
2. 如果已有密钥，点击"显示"查看
3. 如果没有，点击"新建密钥"
4. 确认后会显示 SecretId 和 SecretKey
5. **立即复制保存**（只显示一次！）
6. 保存到本地 `.env.local` 文件

### 手动配置GitHub Secrets

1. 访问你的GitHub仓库
2. 点击 Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. 添加第1个secret:
   - Name: `TENCENT_CLOUD_SECRET_ID`
   - Value: `AKID****`（从.env.local复制）
5. 点击 "Add secret"
6. 重复步骤3-5，添加其他3个secrets:
   - `TENCENT_CLOUD_SECRET_KEY`
   - `COS_BUCKET` (例如: abc-h5-20251205)
   - `COS_REGION` (例如: ap-guangzhou)
7. 验证所有4个secrets都在列表中

---

## ✅ 验证清单

完成后，验证以下内容：

### COS配置验证
```bash
# 使用curl验证存储桶（应该返回NoSuchKey，因为还没上传文件）
curl -I http://abc-h5-{时间戳}.cos-website.ap-guangzhou.myqcloud.com

# 预期: HTTP 404（正常，因为还没部署）
```

### GitHub Secrets验证
访问: https://github.com/{username}/{repo}/settings/secrets/actions

应该看到4个secrets:
- ✅ TENCENT_CLOUD_SECRET_ID
- ✅ TENCENT_CLOUD_SECRET_KEY
- ✅ COS_BUCKET
- ✅ COS_REGION

### 配置文件验证
```bash
# 验证next.config.ts
cat next.config.ts | grep "output: 'export'"

# 验证GitHub Actions工作流
test -f .github/workflows/deploy.yml && echo "✓ 存在"
```

---

## 🎯 更新功能列表

配置完成后，手动更新 `features-complete.json`:

```bash
# 打开文件
code features-complete.json

# 找到以下功能ID，将 passes: false 改为 passes: true:
# - INFRA-001 (COS存储桶已创建)
# - INFRA-002 (访问权限配置)
# - INFRA-003 (静态网站启用)
# - INFRA-004 (索引文档配置)
# - INFRA-005 (SECRET_ID配置)
# - INFRA-006 (SECRET_KEY配置)
# - INFRA-007 (COS_BUCKET配置)
# - INFRA-008 (COS_REGION配置)
```

或者运行：
```bash
node -e "
const data = require('./features-complete.json');
['INFRA-001', 'INFRA-002', 'INFRA-003', 'INFRA-004',
 'INFRA-005', 'INFRA-006', 'INFRA-007', 'INFRA-008'].forEach(id => {
  const feature = data.features.find(f => f.id === id);
  if (feature) feature.passes = true;
});
data.metadata.completedFeatures = data.features.filter(f => f.passes).length;
data.metadata.testCoverage = Math.round(data.metadata.completedFeatures / data.metadata.totalFeatures * 100) + '%';
require('fs').writeFileSync('./features-complete.json', JSON.stringify(data, null, 2));
console.log('✓ 已更新8个基础设施功能状态');
"
```

---

## 📊 预期进度

完成本指南后的功能完成度：

```
总功能: 85
已完成: 8/85 (基础设施)
完成度: 9%

分类统计:
- 阶段3-基础设施: 8/8 (100%) ✅
- 阶段3-部署配置: 0/6 (0%) ⚠️
- SPEC验收标准-P0: 0/8 (0%) ⚠️
```

---

## 🔜 下一步

完成基础设施配置后：

```bash
# 1. 验证配置
bash init.sh

# 2. 实现部署配置（DEPLOY-001至006）
# 修改next.config.ts和创建GitHub Actions工作流

# 3. 运行部署测试
bun run test:deploy

# 4. 首次部署
git push origin main

# 5. 监控部署
# 访问GitHub Actions查看部署状态
```

祝你配置顺利！🎉
