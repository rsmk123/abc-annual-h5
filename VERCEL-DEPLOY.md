# Vercel 部署指南

## ✅ 代码已准备就绪

- ✅ GitHub仓库: https://github.com/rsmk123/abc-annual-h5
- ✅ 最新提交: 08f1f6d
- ✅ 构建验证通过（1.0MB输出）
- ✅ 静态导出配置完成

---

## 🚀 方案1: 网页端部署（推荐 - 30秒上线）

### Step 1: 访问Vercel

打开浏览器访问: **https://vercel.com/new**

### Step 2: 导入GitHub仓库

1. 点击 **"Import Git Repository"**
2. 如果未登录，使用GitHub账号登录
3. 找到仓库 **rsmk123/abc-annual-h5**
4. 点击 **"Import"**

### Step 3: 配置项目

**项目设置**（保持默认即可）:
```
Framework Preset: Next.js
Root Directory: ./
Build Command: bun run build
Output Directory: out
Install Command: bun install
```

**环境变量**: 无需配置（纯前端项目）

### Step 4: 部署

1. 点击 **"Deploy"**
2. 等待2-3分钟（Vercel自动构建和部署）
3. 部署成功后会显示：
   ```
   🎉 Congratulations!
   Your project is live at:
   https://abc-annual-h5-xxxx.vercel.app
   ```

### Step 5: 测试线上地址

访问生成的URL，完整测试：
- [ ] 登录弹窗出现
- [ ] 输入手机号（13800138000）
- [ ] 点击立即参与
- [ ] 点击卡片抽卡
- [ ] 看到3D翻转动画
- [ ] 收集进度更新
- [ ] 集齐5个字后看到最终奖励

---

## 🛠 方案2: CLI部署（适合自动化）

### Step 1: 登录Vercel

```bash
vercel login
```

会打开浏览器要求登录，完成后回到终端。

### Step 2: 部署

```bash
cd ~/Desktop/Next.js项目/abc-bank-annual-h5
vercel
```

**交互式问答**:
```
? Set up and deploy "~/Desktop/Next.js项目/abc-bank-annual-h5"? [Y/n] y
? Which scope do you want to deploy to? [选择你的账号]
? Link to existing project? [Y/n] n
? What's your project's name? abc-bank-annual-h5
? In which directory is your code located? ./
Auto-detected Project Settings (Next.js):
- Build Command: `bun run build`
- Output Directory: out
- Development Command: bun dev
? Want to modify these settings? [y/N] n
```

等待部署完成（2-3分钟）。

### Step 3: 生产部署

首次部署是预览环境，运行以下命令部署到生产：

```bash
vercel --prod
```

---

## 📊 部署后验证清单

### 自动验证

部署成功后，Vercel会显示：
```
✅ Deployment ready
Preview: https://abc-annual-h5-xxxx.vercel.app
Production: https://abc-annual-h5.vercel.app
```

### 手动验证

访问生产URL并测试：

**功能测试**:
- [ ] 页面加载正常（< 3秒）
- [ ] 登录功能正常
- [ ] 抽卡动画流畅（60fps）
- [ ] 收集系统工作正常
- [ ] 最终奖励显示正常
- [ ] 重置功能正常

**移动端测试**:
- [ ] 在iPhone上测试
- [ ] 在Android手机上测试
- [ ] 在微信中打开测试

**性能测试**:
```bash
# 使用curl测试响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://abc-annual-h5.vercel.app

# curl-format.txt内容:
# time_total: %{time_total}s\n
```

**控制台检查**:
- [ ] 打开浏览器DevTools
- [ ] 检查Console无错误
- [ ] 检查Network所有资源加载成功

---

## 🎯 Vercel 自动化特性

部署后，Vercel会自动：

1. **持续部署**: 每次git push到main都会自动部署
2. **预览部署**: PR会自动生成预览URL
3. **全球CDN**: 自动分发到全球边缘节点
4. **HTTPS**: 自动配置SSL证书
5. **性能监控**: 内置Analytics和Web Vitals

---

## 📈 部署成功后的输出

Vercel会显示：

```
✅ Production: https://abc-annual-h5.vercel.app
Inspect: https://vercel.com/rsmk123/abc-annual-h5

📊 Build Logs:
   Installing dependencies...
   Building your application...
   Optimizing files...
   Deployment complete!

⚡ Instant Rollback available
🌍 Deployed to 77 regions worldwide
🔒 HTTPS enabled
📊 Analytics ready
```

---

## 🔄 后续更新流程

部署成功后，每次更新只需：

```bash
# 1. 修改代码
# 2. 提交
git add .
git commit -m "feat: 新功能"

# 3. 推送
git push origin main

# 4. 自动部署（2-3分钟）
# Vercel自动检测推送并部署

# 5. 访问线上地址验证
open https://abc-annual-h5.vercel.app
```

---

## 🎉 完成标志

当你看到以下内容时，说明部署成功：

1. ✅ Vercel显示 "Deployment ready"
2. ✅ 生产URL可访问
3. ✅ 页面加载正常
4. ✅ 所有功能正常工作
5. ✅ 移动端适配正常

---

## 📞 获取帮助

**Vercel文档**: https://vercel.com/docs
**Next.js部署**: https://nextjs.org/docs/app/building-your-application/deploying

**常见问题**:

Q: 部署失败怎么办？
A: 查看Vercel部署日志，检查构建错误

Q: 如何绑定自定义域名？
A: Vercel控制台 → Settings → Domains

Q: 如何查看Analytics？
A: Vercel控制台 → Analytics

---

**准备好开始部署了吗？** 选择方案1（网页）或方案2（CLI）开始吧！🚀
