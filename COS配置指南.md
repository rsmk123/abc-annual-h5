# 腾讯云COS配置指南 - 农行H5项目部署

> **预计用时**：5-10分钟 | **难度**：⭐⭐☆☆☆（简单）

---

## 📋 配置前准备

**您需要**：
- ✅ 腾讯云账号（已登录）
- ✅ 浏览器（Chrome/Edge推荐）
- ✅ 本文档（参考步骤）

**您将获得**：
- ✅ COS存储桶（用于托管H5页面）
- ✅ 静态网站URL（可直接访问）
- ✅ API密钥（用于GitHub自动部署）

---

## 第一步：创建COS存储桶（3分钟）

### 1.1 打开COS控制台

**访问**：https://console.cloud.tencent.com/cos5/bucket

**如果未登录**：
- 使用微信扫码登录
- 或输入腾讯云账号密码

### 1.2 创建新存储桶

**点击**：页面右上角的蓝色按钮 **"创建存储桶"**

**填写信息**：

| 配置项 | 填写内容 | 说明 |
|-------|---------|------|
| **名称** | `abc-h5-20251205` | ⚠️ 复制这个名称，或用 `abc-h5-{任意数字}` |
| **所属地域** | **华南 - 广州（ap-guangzhou）** | ⚠️ 选择广州，国内访问最快 |
| **访问权限** | **公有读私有写** | ⚠️ 必须选这个！否则无法访问 |
| **存储桶标签** | 留空 | 可选 |
| **多AZ特性** | 不启用 | 节省成本 |

**点击**：页面底部的 **"确定"** 按钮

**等待**：3-5秒，出现"创建成功"提示

### 1.3 记录存储桶信息

创建成功后，**记录下**：

```
✅ 存储桶名称: abc-h5-20251205
✅ 地域: ap-guangzhou
```

---

## 第二步：启用静态网站托管（2分钟）

### 2.1 进入存储桶详情

**点击**：刚创建的存储桶名称（`abc-h5-20251205`）

进入存储桶管理页面

### 2.2 开启静态网站功能

**导航**：
- 左侧菜单 → **"基础配置"**
- 或顶部标签 → **"基础配置"**

**滚动**：向下找到 **"静态网站"** 部分

**点击**：静态网站部分右侧的 **"编辑"** 按钮

**配置**：

| 配置项 | 选择/填写 |
|-------|----------|
| **当前状态** | 选择 **"启用"** （单选按钮） |
| **索引文档** | 填写：`index.html` |
| **错误文档** | 填写：`index.html` |
| **重定向规则** | 留空（不填） |
| **强制HTTPS** | 可选（建议不开，避免额外配置） |

**点击**：底部的 **"保存"** 按钮

### 2.3 获取静态网站访问地址

保存成功后，页面会显示：

```
✅ 静态网站域名: http://abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com
```

**⚠️ 重要**：复制并保存这个URL！这就是您的H5页面地址。

**记录模板**（填写后保存）：
```
存储桶名称: abc-h5-20251205
地域: ap-guangzhou
静态网站URL: http://abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com
```

---

## 第三步：获取API密钥（2分钟）

### 3.1 打开API密钥管理页面

**访问**：https://console.cloud.tencent.com/cam/capi

### 3.2 查看或创建密钥

**情况A：已有密钥**
- 页面会显示您的 SecretId 和 SecretKey
- **点击**："显示"按钮查看 SecretKey
- **复制并保存**两个值

**情况B：没有密钥**
- **点击**：页面上的 **"新建密钥"** 按钮
- **确认**：弹窗中点击 **"确定"**
- **复制并保存**显示的 SecretId 和 SecretKey

**⚠️ 安全提示**：
- SecretKey 只会显示一次！请务必保存
- 不要分享给他人
- 不要提交到Git仓库

### 3.3 记录API密钥

**复制以下模板并填写**：

```
SecretId: AKID********************************
SecretKey: ****************************************
```

---

## 第四步：配置GitHub Secrets（3分钟）

### 4.1 获取仓库地址

首先，我需要知道您的GitHub仓库地址。

**请提供**：
- 您的GitHub用户名：`___________`
- 仓库名称：`___________`

**或者直接提供完整URL**：`https://github.com/用户名/仓库名`

### 4.2 打开Secrets配置页面

**访问**：`https://github.com/{您的用户名}/{仓库名}/settings/secrets/actions`

**示例**：如果仓库是 `https://github.com/zhangsan/abc-h5`
则访问：`https://github.com/zhangsan/abc-h5/settings/secrets/actions`

### 4.3 添加4个Secrets

**重复以下步骤4次**（每个Secret一次）：

1. 点击右上角绿色按钮 **"New repository secret"**
2. 填写Name和Secret
3. 点击 **"Add secret"**

**Secret 1/4**：
```
Name: TENCENT_CLOUD_SECRET_ID
Secret: {粘贴您的SecretId，例如：AKIDxxxxxxxx}
```

**Secret 2/4**：
```
Name: TENCENT_CLOUD_SECRET_KEY
Secret: {粘贴您的SecretKey}
```

**Secret 3/4**：
```
Name: COS_BUCKET
Secret: abc-h5-20251205
```
⚠️ 这里填写您实际创建的存储桶名称

**Secret 4/4**：
```
Name: COS_REGION
Secret: ap-guangzhou
```

### 4.4 验证Secrets已添加

配置完成后，页面应该显示4个Secrets：

```
✅ TENCENT_CLOUD_SECRET_ID     Updated now by you
✅ TENCENT_CLOUD_SECRET_KEY    Updated now by you
✅ COS_BUCKET                  Updated now by you
✅ COS_REGION                  Updated now by you
```

---

## 第五步：测试部署（2分钟）

### 5.1 提交代码触发部署

**返回到本地终端**，我会帮您执行：

```bash
cd ~/Desktop/Next.js项目/abc-bank-annual-h5
git add .
git commit -m "chore: 配置COS部署流程"
git push origin main
```

### 5.2 监控部署进度

**访问**：`https://github.com/{您的用户名}/{仓库名}/actions`

**查看**：
- 应该看到一个新的工作流运行（"部署到腾讯云COS"）
- 点击进入查看详细进度
- 等待所有步骤完成（约3-5分钟）

**成功标志**：
- ✅ 所有步骤都是绿色勾号
- ✅ 最后一步显示"✅ 部署成功！"

### 5.3 访问您的H5页面

**打开浏览器**，访问：

```
http://abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com
```

**应该看到**：
- ✅ 农行"集五福"游戏页面
- ✅ 可以正常登录和抽卡
- ✅ 动画流畅

---

## 🎯 配置完成检查清单

**完成第一步后**：
- [ ] 存储桶已创建
- [ ] 名称是：`abc-h5-20251205`（或您自定义的）
- [ ] 地域是：`ap-guangzhou`
- [ ] 访问权限是：**公有读私有写**

**完成第二步后**：
- [ ] 静态网站已启用
- [ ] 索引文档是：`index.html`
- [ ] 错误文档是：`index.html`
- [ ] 获得了静态网站URL

**完成第三步后**：
- [ ] 获得了SecretId
- [ ] 获得了SecretKey
- [ ] 已安全保存（不要泄露）

**完成第四步后**：
- [ ] GitHub仓库Secrets页面显示4个secrets
- [ ] 名称完全匹配（区分大小写）
- [ ] 值正确无误

**完成第五步后**：
- [ ] GitHub Actions运行成功
- [ ] 静态网站URL可访问
- [ ] H5页面功能正常

---

## ❓ 常见问题

**Q1: 存储桶名称已被占用怎么办？**
```
改用: abc-h5-20251205-01
或: abc-bank-h5-{随机数字}
```

**Q2: 找不到"公有读私有写"选项？**
```
位置: 创建存储桶 → 访问权限 → 第二个单选按钮
不是第一个（私有读写），也不是第三个（公有读写）
```

**Q3: 静态网站URL访问404？**
```
检查清单:
1. 静态网站是否启用（状态显示"已启用"）
2. 索引文档是否填写 index.html
3. 访问权限是否是公有读
4. 是否等待了GitHub Actions部署完成
```

**Q4: GitHub Actions失败？**
```
检查:
1. Secrets名称是否完全匹配（区分大小写）
2. SecretId和SecretKey是否正确
3. 存储桶名称是否正确
4. 查看Actions日志中的具体错误信息
```

**Q5: SecretKey忘记保存了？**
```
解决方案:
1. 返回 https://console.cloud.tencent.com/cam/capi
2. 删除旧密钥
3. 创建新密钥
4. 重新保存
5. 更新GitHub Secrets中的值
```

---

## 📞 需要帮助？

**配置过程中遇到问题**，请告诉我：
1. 您卡在哪一步了
2. 看到了什么错误提示
3. 我会帮您诊断和解决

**配置完成后**，告诉我：
- "已配置好COS"
- 提供您的存储桶名称和GitHub仓库地址
- 我会帮您完成最后的部署测试

---

## 🚀 快速配置路径（推荐）

如果您想最快完成配置，按以下顺序：

```
1️⃣ 打开第一个标签页：
   https://console.cloud.tencent.com/cos5/bucket
   → 创建存储桶（2分钟）

2️⃣ 在同一页面：
   → 启用静态网站（1分钟）
   → 复制静态网站URL

3️⃣ 打开第二个标签页：
   https://console.cloud.tencent.com/cam/capi
   → 获取API密钥（1分钟）

4️⃣ 打开第三个标签页：
   https://github.com/{您的用户名}/{仓库名}/settings/secrets/actions
   → 添加4个Secrets（3分钟）

✅ 完成！回来告诉我
```

---

**准备好了吗？开始配置吧！**

完成后回复我：**"COS配置完成"** + **您的存储桶名称**，我会立即帮您测试部署。
