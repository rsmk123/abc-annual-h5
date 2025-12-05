# ABC银行开门红 - 集五福活动 H5

## 项目简介

这是一个模仿传统银行开门红营销活动的互动H5页面，通过"集五福"的游戏机制吸引用户参与。

**核心玩法**：用户通过抽卡收集"马上发财哇"5个字，集齐后可参与开奖。

## 技术栈

- **框架**: Next.js 16.0.7 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4.x
- **运行时**: Bun
- **图标**: lucide-react
- **工具库**: clsx, tailwind-merge

## 功能特性

### 🎮 核心功能

1. **手机号登录系统**
   - 手机号验证（11位）
   - 模拟验证码（演示用：8888）
   - 手机号掩码保护

2. **3D翻牌抽卡**
   - 纯CSS实现3D翻转动画
   - 智能抽卡算法（优先抽取未收集的字）
   - 流畅的视觉反馈

3. **收集进度系统**
   - 实时显示收集进度
   - 已收集字卡高亮效果
   - 动态上浮动画

4. **奖励机制**
   - 单次抽卡结果弹窗
   - 集齐后的最终奖励页面
   - 社交传播引导（小红书）

### 🎨 设计亮点

- **Apple极简风格** + 中国红主题色
- **纯CSS 3D效果**（无需three.js）
- **毛玻璃模糊效果**（backdrop-filter）
- **金色渐变文字**（-webkit-background-clip）
- **响应式设计**（最佳宽度：480px）

## 快速开始

### 安装依赖

```bash
bun install
```

### 开发环境（支持多端口）

```bash
# 默认端口 3000
bun dev

# 指定端口 3001
bun run dev:3001

# 指定端口 3002
bun run dev:3002

# 指定端口 3003
bun run dev:3003

# 自动选择可用端口
bun run dev:auto

# 或使用命令行参数指定任意端口
bun dev -- -p 4000
```

**推荐**：如果3000端口被占用，使用 `bun run dev:3001`

访问: http://localhost:3000 (或你指定的端口)

### 生产构建

```bash
bun run build
bun start

# 指定生产端口
bun run start:3001
```

## 项目结构

```
abd-bank-annual-h5/
├── app/
│   ├── bank-campaign/
│   │   └── page.tsx              # 集五福主页面
│   ├── layout.tsx                # 全局布局
│   ├── page.tsx                  # 首页（自动重定向）
│   └── globals.css               # 全局样式
├── components/
│   └── bank-campaign/
│       ├── Card.tsx              # 3D翻转卡片
│       ├── CollectionSlots.tsx   # 收集槽
│       ├── LoginModal.tsx        # 登录弹窗
│       ├── ResultModal.tsx       # 结果弹窗
│       ├── FinalRewardModal.tsx  # 最终奖励弹窗
│       └── campaign.module.css   # 组件样式
├── lib/
│   └── utils.ts                  # 工具函数（cn）
├── package.json
├── tsconfig.json
└── README.md
```

## 核心代码说明

### 智能抽卡算法

```typescript
// 优先抽取未收集的字，确保用户体验流畅
const getLuckyIndex = () => {
  const missing: number[] = [];
  collected.forEach((v, i) => { if(!v) missing.push(i); });
  
  if (missing.length > 0) {
    return missing[Math.floor(Math.random() * missing.length)];
  }
  return Math.floor(Math.random() * 5);
};
```

### 3D翻转动画

```css
.cardContainer {
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.cardContainer.flipped {
  transform: rotateY(180deg);
}

.cardFace {
  backface-visibility: hidden;
}
```

## 页面路由

- `/` - 首页（自动跳转到 /bank-campaign）
- `/bank-campaign` - 集五福活动页面

## 使用说明

### 用户流程

1. **进入页面** → 自动弹出登录框
2. **输入手机号** → 11位数字（演示可用任意11位）
3. **输入验证码** → 固定为 8888
4. **点击"立即参与"** → 进入抽卡界面
5. **点击卡片** → 触发3D翻转，抽取一个字
6. **重复抽卡** → 直到集齐5个字
7. **集齐后** → 弹出最终奖励页面
8. **截图保存** → 发小红书+话题 #银行马上发财哇

### 演示功能

- 右上角"重置"按钮：可重复演示
- 100%抽中未收集的字（demo优化）

## 配置说明

### 主题颜色

```css
--bg-main: #b81c22;           /* 中国红 */
--text-primary: #fff;         /* 主文字白色 */
--card-border: #f0c676;       /* 金色边框 */
--btn-bg: #ffffff;            /* 按钮白色背景 */
--btn-text: #b81c22;          /* 按钮红色文字 */
```

### 卡片字符

在 `app/bank-campaign/page.tsx` 中修改：

```typescript
const CARDS = ['马', '上', '发', '财', '哇'];
```

## 部署指南

### Vercel 部署

```bash
# 安装 Vercel CLI
bun add -g vercel

# 部署
vercel
```

### 生产环境优化

1. **图片优化**：使用 WebP 格式
2. **代码分割**：Next.js 自动处理
3. **CDN加速**：Vercel 自带 Edge Network
4. **性能监控**：集成 Vercel Analytics

## 后续改进建议

### 功能增强

- [ ] 接入真实手机号验证（阿里云/腾讯云短信）
- [ ] 添加后端数据存储（Supabase/PostgreSQL）
- [ ] 实现防作弊机制（一个手机号只能参与一次）
- [ ] 添加数据埋点和统计
- [ ] 创建后台管理系统（奖品配置、中奖名单）

### 技术优化

- [ ] 添加单元测试（Vitest）
- [ ] 实现服务端渲染优化
- [ ] 添加性能监控
- [ ] 实现渐进式Web应用（PWA）

## 常见问题

**Q: 为什么验证码固定是 8888？**  
A: 这是演示版本，方便快速测试。生产环境需要接入真实短信服务。

**Q: 如何修改抽卡字符？**  
A: 修改 `app/bank-campaign/page.tsx` 中的 `CARDS` 数组。

**Q: 如何关闭"100%抽中未收集字"的机制？**  
A: 修改 `getLuckyIndex` 函数，移除优先逻辑。

**Q: 如何添加后端存储？**  
A: 建议使用 Supabase，创建 `campaign_users` 和 `campaign_draws` 表。

## 开发日志

### 2025-12-05

- ✅ 初始化项目结构
- ✅ 完成3D翻牌动画
- ✅ 实现登录系统
- ✅ 完成收集槽系统
- ✅ 实现奖励弹窗
- ✅ 项目文档完善

## 授权协议

MIT License

## 作者

- 开发：Claude Code
- 设计：基于传统银行营销活动

## 致谢

- Next.js Team
- Tailwind CSS Team
- lucide-react Icons
