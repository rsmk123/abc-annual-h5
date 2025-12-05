# 农业银行年终H5项目 - 技术规格说明书

> 遵循 GitHub SPEC-KIT 格式的可执行规格说明书
> **文档版本**：2.0 | **最后更新**：2025-12-05 | **状态**：生产就绪（待部署配置）

---

## 📜 1. 宪法（项目章程）

### 1.1 核心原则

**P1: 交互优先体验**
- 优先考虑吸引人的游戏机制而非静态内容
- 用户交互驱动价值和留存
- 演示模式用于测试和展示

**P2: 移动端优化设计**
- 针对480px宽度优化（标准移动端视口）
- 触摸友好的交互
- 响应式布局，正确处理安全区域

**P3: 静态导出架构**
- 零服务器端运行时要求
- 纯客户端渲染
- CDN就绪，可全球分发

**P4: AI辅助开发**
- 所有代码通过AI协作生成
- 通过Chrome DevTools MCP进行浏览器自动化部署
- 可执行规格说明驱动实现

**P5: 成本控制基础设施**
- 每月运营成本 < 5元人民币
- 利用免费额度（GitHub Actions、COS免费配额）
- 无需付费服务

### 1.2 技术栈

| 类别 | 技术 | 版本 | 选择理由 |
|------|------|------|----------|
| **框架** | Next.js | 16.0.7 | 最新稳定版，App Router，支持静态导出 |
| **运行时** | React | 19.2.0 | 最新版本，性能改进 |
| **语言** | TypeScript | 5.x | 类型安全，更好的开发体验 |
| **样式** | Tailwind CSS | 4.x | 快速开发，原子化CSS |
| **包管理器** | Bun | 最新版 | 比npm快10-20倍，用户偏好 |
| **图标** | lucide-react | 0.468.0 | 轻量级，可tree-shake |
| **工具库** | clsx, tailwind-merge | 最新版 | 类名管理 |

### 1.3 质量标准

**性能指标**：
- 首次内容绘制（FCP）：< 1.5秒
- 可交互时间（TTI）：4G网络 < 3秒
- 动画帧率：稳定60fps
- 总包大小：< 500KB（gzip压缩后）

**兼容性要求**：
- iOS：Safari 12+（iOS 12+）
- Android：Chrome 80+（Android 8+）
- 微信内置浏览器（最新版）
- 桌面浏览器用于测试

**代码质量**：
- 启用TypeScript严格模式
- 强制执行ESLint规则
- 源代码总量：< 500行
- 基于组件的架构

### 1.4 项目约束

**技术约束**：
- 必须支持静态导出（Next.js配置中 `output: 'export'`）
- 生产环境无需Node.js服务器
- 不使用动态路由或服务器端渲染
- 兼容腾讯云COS静态托管

**业务约束**：
- 开发时间线：< 2天
- 部署时间：每次迭代 < 15分钟
- 月托管成本：< 5元人民币

**运营约束**：
- 仅演示模式（暂无真实后端）
- 固定验证码（8888）用于测试
- 手动重置功能用于演示

---

## 📋 2. 规格说明（需求）

### 2.1 用户画像与场景

**主要用户**：25-45岁的农业银行客户
**设备**：手机（主要是iOS/Android）
**场景**：通过微信分享、银行APP或直接链接访问
**目标**：参与促销活动赢取奖励

**使用场景**：
> *小王通过微信收到农业银行的促销链接。他在午休时用手机打开链接，用手机号登录，玩卡牌收集游戏尝试赢取奖品。整个体验耗时2-3分钟。*

### 2.2 用户旅程

```
[进入] → [登录] → [抽卡] → [收集] → [奖励] → [分享]
  ↓       ↓        ↓        ↓        ↓        ↓
打开链接  手机号  3D翻牌  追踪"马上发财哇"  显示奖品  发小红书
```

**详细流程**：
1. 用户打开H5页面
2. 自动弹出登录弹窗
3. 用户输入11位手机号 + 验证码
4. 主游戏界面显示卡牌
5. 用户点击卡牌触发3D翻转动画
6. 结果弹窗显示抽中的字
7. 收集槽更新新获得的字
8. 重复步骤5-7直到收集全部5个字
9. 最终奖励弹窗出现并提示分享
10. 用户截图并分享到小红书

### 2.3 功能需求

**FR-1: 用户认证**
- 前提：用户打开应用
- 当：页面加载完成
- 则：显示登录弹窗，包含手机号输入框
- 且：验证码输入框（演示：固定8888）
- 且：输入有效的11位数字后用户可以提交
- 且：认证成功后登录弹窗关闭

**FR-2: 卡牌收集游戏 - "集五福"**
- 前提：用户已登录
- 当：用户查看主界面
- 则：显示5个目标字符："马上发财哇"
- 且：抽卡按钮/区域醒目
- 且：底部显示收集进度

**FR-3: 3D卡牌翻转机制**
- 前提：用户点击抽卡区域
- 当：卡牌被点击
- 则：3D翻转动画播放（800ms时长）
- 且：背面显示"?"神秘符号
- 且：翻转后正面显示抽中的字
- 且：动画使用三次贝塞尔曲线缓动以获得流畅感

**FR-4: 智能收集算法**
- 前提：用户抽卡
- 当：确定授予哪个字符
- 则：系统优先选择尚未收集的字符
- 且：确保100%几率获得新字符（演示优化）
- 且：仅在全部5个收集完后才允许重复

**FR-5: 进度追踪系统**
- 前提：用户已抽卡
- 当：查看收集区域
- 则：已收集的字符高亮/填充显示
- 且：未收集的槽位显示占位状态
- 且：视觉反馈（发光/脉冲）表示新收集的物品

**FR-6: 结果反馈弹窗**
- 前提：卡牌翻转动画完成
- 当：字符显示
- 则：结果弹窗出现显示该字符
- 且：弹窗有"继续"操作以关闭
- 且：用户可以立即抽下一张卡

**FR-7: 最终奖励显示**
- 前提：用户收集全部5个字符
- 当：收集完成
- 则：最终奖励弹窗出现并祝贺
- 且：显示手机号（脱敏：138****8888）
- 且：提供分享指导
- 且：用户可以截图

**FR-8: 社交分享集成**
- 前提：显示最终奖励
- 当：用户想要分享
- 则：应用提供小红书分享说明
- 且：建议话题标签：#银行马上发财哇
- 且：鼓励截图 + 手动发布

**FR-9: 演示重置功能**
- 前提：应用正在运行
- 当：用户点击重置按钮（右上角）
- 则：所有游戏状态重置为初始
- 且：登录弹窗重新出现
- 且：收集进度清空
- 且：用户可以立即重玩

### 2.4 非功能需求

**NFR-1: 性能**
- 首次绘制：4G网络 < 1.5秒
- 动画流畅度：60fps（卡牌翻转期间无掉帧）
- JavaScript包总大小：< 300KB（gzip前）
- CSS包：< 50KB
- 可交互时间：< 3秒

**NFR-2: 视觉设计**
- 主色调：农业银行红（#b81c22）
- 辅助色：金色（#f0c676、#d4af37）
- 背景：浅灰（#f5f5f7）
- 字体：系统字体（PingFang SC、sans-serif）
- 最大视口宽度：480px（大屏幕上居中）

**NFR-3: 可访问性**
- 触摸目标：最小44x44px
- 文本对比度：符合WCAG AA标准
- 禁用自定义交互的点击高亮
- 尊重安全区域插入（iOS刘海）

**NFR-4: 浏览器兼容性**
- 微信浏览器（iOS/Android）
- Safari 12+（iOS 12+）
- Chrome 80+（Android 8+）
- 桌面浏览器用于开发

**NFR-5: 可维护性**
- 基于组件的架构
- 每个组件最多145行
- 应用代码总量：< 500行
- TypeScript自文档化代码

### 2.5 验收标准

**关键（P0）- 必须通过**：
- [ ] 登录弹窗接受11位手机号
- [ ] 卡牌翻转动画在800ms内流畅完成
- [ ] 智能收集算法工作正常（收集完全前无重复）
- [ ] 收集全部5个字符后显示最终奖励弹窗
- [ ] 重置按钮清除所有状态并重启游戏
- [ ] 在375px-480px视口上移动端响应式
- [ ] 浏览器中无控制台错误
- [ ] TypeScript编译成功无错误

**重要（P1）- 应该通过**：
- [ ] 动画以60fps运行无掉帧
- [ ] 页面在4G网络上 < 3秒内加载
- [ ] 在微信内置浏览器中工作
- [ ] 触摸交互感觉响应迅速（< 100ms反馈）
- [ ] 视觉设计符合农业银行品牌

**Nice-to-Have（P2）- 可推迟**：
- [ ] 在平板上工作（768px+）
- [ ] 键盘导航支持
- [ ] 屏幕阅读器兼容性
- [ ] 集成性能监控

---

## 🏗️ 3. 规划（技术设计）

### 3.1 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户设备                             │
│                    (手机/微信)                               │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    腾讯云 CDN                                │
│                   (边缘缓存与加速)                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                 腾讯云 COS (对象存储)                         │
│                    (静态网站托管)                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  静态文件:                                            │  │
│  │  - index.html                                         │  │
│  │  - _next/static/chunks/*.js (React + Next.js)        │  │
│  │  - _next/static/css/*.css (Tailwind)                 │  │
│  │  - _next/static/media/* (字体，如有)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    GITHUB 仓库                               │
│                  (版本控制 + CI/CD)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  GitHub Actions 工作流:                              │  │
│  │  1. git push → main 分支                             │  │
│  │  2. 安装依赖 (bun install)                           │  │
│  │  3. 构建静态站点 (bun run build)                     │  │
│  │  4. 上传到 COS (TencentCloud/cos-action)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**架构原则**：
- **无服务器**：无需后端，所有逻辑在客户端运行
- **无状态**：暂无数据库（演示模式）
- **可缓存**：静态文件在CDN边缘缓存
- **可扩展**：COS + CDN可处理数百万请求

### 3.2 组件架构

```
app/
├── layout.tsx (根布局)
│   └── 元数据 (SEO、视口、字体)
│
├── page.tsx (首页 - 自动重定向)
│   └── 重定向到 /bank-campaign
│
└── bank-campaign/page.tsx (主游戏页面)
    ├── 状态管理 (React Hooks)
    │   ├── collected: boolean[5]
    │   ├── userPhone: string
    │   ├── isFlipped: boolean
    │   ├── currentResult: string
    │   └── 弹窗可见性状态
    │
    ├── 游戏逻辑
    │   ├── getLuckyIndex() - 智能收集算法
    │   ├── drawCard() - 卡牌翻转触发
    │   ├── closeResult() - 弹窗管理
    │   └── resetDemo() - 状态重置
    │
    └── 渲染的组件:
        ├── <Card> - 带正反面的3D翻转卡牌
        ├── <CollectionSlots> - 进度显示
        ├── <LoginModal> - 手机号认证UI
        ├── <ResultModal> - 单次抽卡结果
        └── <FinalRewardModal> - 最终奖品显示

components/bank-campaign/
├── Card.tsx
│   ├── 属性: isFlipped, resultChar, onDraw, disabled
│   ├── 正面: 显示抽中的字
│   └── 背面: 显示"?"神秘符号
│
├── CollectionSlots.tsx
│   ├── 属性: collected[], cards[]
│   └── 显示5个槽位，已收集的高亮
│
├── LoginModal.tsx
│   ├── 属性: isOpen, onLogin, onClose
│   ├── 手机号输入（11位）
│   ├── 验证码输入（演示：8888）
│   └── 提交按钮
│
├── ResultModal.tsx
│   ├── 属性: isOpen, char, onClose
│   └── 显示单个字符结果
│
├── FinalRewardModal.tsx
│   ├── 属性: isOpen, userPhone, onClose
│   ├── 祝贺消息
│   ├── 脱敏手机号显示
│   └── 分享说明
│
└── campaign.module.css
    ├── 3D变换样式
    ├── 动画关键帧
    ├── 渐变效果
    └── 弹窗背景/主体样式
```

**组件职责**：
- **页面**：编排状态和业务逻辑
- **组件**：纯UI，通过props接口
- **CSS模块**：复杂动画的作用域样式
- **Tailwind**：布局和基础样式的工具类

### 3.3 技术栈选型理由

**决策1: Next.js 16 (vs Vite/Create React App)**

| 因素 | Next.js | Vite | 胜者 |
|------|---------|------|------|
| 静态导出 | ✅ 内置 | ⚠️ 需要插件 | Next.js |
| 图片优化 | ✅ 自动 | ❌ 手动 | Next.js |
| TypeScript | ✅ 零配置 | ✅ 零配置 | 平局 |
| 包大小 | ✅ 优化 | ✅ 优化 | 平局 |
| 学习曲线 | 📚 中等 | 📚 简单 | Vite |

**结论**：Next.js，因其生产就绪功能和静态导出成熟度

**决策2: Tailwind CSS 4 (vs CSS-in-JS/纯CSS)**

| 因素 | Tailwind | Styled-Components | 胜者 |
|------|----------|-------------------|------|
| 开发速度 | ⚡ 非常快 | 🐌 较慢 | Tailwind |
| 包大小 | 🎯 小（清除后） | ❌ 较大 | Tailwind |
| 学习曲线 | 📚 中等 | 📚 简单 | SC |
| 动态样式 | ❌ 有限 | ✅ 完整JS | SC |

**结论**：Tailwind用于快速开发 + 最小包大小（混合CSS模块用于3D动画）

**决策3: Bun (vs npm/pnpm)**

| 因素 | Bun | npm | pnpm |
|------|-----|-----|------|
| 安装速度 | ⚡ 快15-20倍 | 🐌 基准 | ⚡ 快2-3倍 |
| 磁盘空间 | 💾 高效 | 💾 大 | 💾 高效 |
| 生态系统 | ✅ 100%兼容 | ✅ 标准 | ✅ 兼容 |
| 稳定性 | ⚠️ 较新 | ✅ 成熟 | ✅ 成熟 |

**结论**：Bun，因用户偏好和卓越速度（H5项目可接受的风险）

**决策4: React 19 (vs React 18)**

| 因素 | React 19 | React 18 |
|------|----------|----------|
| 性能 | ⚡ 改进 | ✅ 良好 |
| 新功能 | ✅ Actions、use() | ❌ 无 |
| 包大小 | 📦 相似 | 📦 相似 |
| 稳定性 | ⚠️ 较新 | ✅ 成熟 |

**结论**：React 19用于最新功能，与Next.js 16完全兼容

### 3.4 状态管理策略

**方案**：仅使用React Hooks（无Redux/Zustand/Jotai）

**理由**：
- 简单应用，< 10个状态变量
- 无复杂状态同步需求
- 组件树浅（1-2层）
- 演示模式 = 无需持久化

**状态变量**：

```typescript
// 用户状态
const [userPhone, setUserPhone] = useState<string>('');

// 游戏状态
const [collected, setCollected] = useState<boolean[]>([false, false, false, false, false]);
const [currentResult, setCurrentResult] = useState<string>('');

// UI状态
const [isFlipped, setIsFlipped] = useState<boolean>(false);
const [showLogin, setShowLogin] = useState<boolean>(true);
const [showResult, setShowResult] = useState<boolean>(false);
const [showFinal, setShowFinal] = useState<boolean>(false);
```

**未来考虑**：如果添加后端持久化，使用SWR或TanStack Query进行服务器状态管理

### 3.5 动画策略

**混合方案**：CSS模块 + Tailwind

**3D卡牌翻转（CSS模块）**：
```css
/* campaign.module.css */
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

.cardBack {
  transform: rotateY(180deg);
}
```

**为什么用CSS模块做动画？**
- 对复杂3D变换有更多控制
- 性能优于JS动画
- 更容易维护三次贝塞尔曲线计时函数
- 作用域到组件（无全局冲突）

**Tailwind用于其他一切**：
- 布局（flexbox、grid）
- 颜色、间距、排版
- 悬停状态、过渡
- 响应式断点

**性能优化**：
- 使用 `transform` 和 `opacity`（GPU加速）
- 避免动画 `width`、`height`、`top`、`left`
- 谨慎使用 `will-change`
- 利用 `backface-visibility: hidden` 进行3D

### 3.6 数据流

**线性流**（无需Redux风格的actions）：

```
用户交互 → 事件处理器 → 状态更新 → UI重新渲染
```

**示例：抽卡流程**：

```typescript
// 1. 用户点击卡牌
onClick={() => drawCard()}

// 2. 处理器执行
const drawCard = () => {
  // 验证
  if (!userPhone) { setShowLogin(true); return; }
  if (collected.every(Boolean)) { setShowFinal(true); return; }
  if (isFlipped) return;

  // 计算结果
  const newIndex = getLuckyIndex();
  const char = CARDS[newIndex];
  setCurrentResult(char);

  // 触发动画
  setIsFlipped(true);

  // 动画后更新状态
  setTimeout(() => {
    const newCollected = [...collected];
    newCollected[newIndex] = true;
    setCollected(newCollected);

    setTimeout(() => setShowResult(true), 500);
  }, 800);
};

// 3. React重新渲染受影响的组件
<Card isFlipped={isFlipped} />
<CollectionSlots collected={collected} />
<ResultModal isOpen={showResult} />
```

**关键原则**：
- 单向数据流
- 不可变状态更新
- 派生状态内联计算（此规模无需 `useMemo`）
- 事件处理器中的副作用（业务逻辑不用 `useEffect`）

### 3.7 关键设计决策

**决策D1: 静态导出 vs 服务器端渲染**

| 因素 | 静态导出 | SSR |
|------|---------|-----|
| 成本 | 💰 ~0.5元/月（COS） | 💰 ~50元/月（服务器） |
| 性能 | ⚡ 即时（CDN缓存） | 🐌 100-300ms TTFB |
| 复杂度 | ✅ 简单 | ❌ 复杂 |
| 动态内容 | ❌ 仅客户端 | ✅ 服务器 + 客户端 |
| 可扩展性 | ⚡ 无限（CDN） | ⚠️ 受服务器限制 |

**结论**：静态导出
**理由**：H5活动无服务器端数据，超低成本至关重要，CDN性能优越

**决策D2: CSS模块 vs 纯Tailwind**

| 因素 | CSS模块 | 纯Tailwind |
|------|---------|-----------|
| 3D动画 | ✅ 优秀 | ❌ 有限 |
| 维护性 | ✅ 复杂时更易 | ⚠️ 类名字符串长 |
| 包大小 | ❌ 略大 | ✅ 最小 |
| 开发体验 | ✅ 熟悉的CSS语法 | ⚡ 更快开发 |

**结论**：混合（CSS模块用于3D，Tailwind用于布局）
**理由**：两全其美 - CSS用于复杂变换，Tailwind用于快速UI开发

**决策D3: 演示模式 vs 真实后端**

| 因素 | 演示模式 | 真实后端 |
|------|---------|---------|
| 开发时间 | ⚡ < 2天 | 🐌 1-2周 |
| 成本 | 💰 免费 | 💰 ~50-100元/月 |
| 复杂度 | ✅ 简单 | ❌ 复杂 |
| 生产就绪 | ❌ 否 | ✅ 是 |
| 用户测试 | ✅ 简单 | ⚠️ 需要设置 |

**结论**：演示模式（MVP阶段）
**理由**：快速验证，零成本，易于展示。后端可在第2阶段添加。

**决策D4: 多端口开发支持**

**问题**：默认端口3000经常与其他开发服务器冲突
**解决方案**：添加4个便利脚本 + 自动端口选项

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:3001": "next dev -p 3001",
    "dev:3002": "next dev -p 3002",
    "dev:3003": "next dev -p 3003",
    "dev:auto": "next dev -p 0"
  }
}
```

**结论**：多端口便利脚本
**理由**：消除端口冲突挫折，改善开发者体验

### 3.8 文件组织

**当前结构**（已实现）：

```
abc-bank-annual-h5/
├── app/
│   ├── bank-campaign/
│   │   └── page.tsx                    # 主游戏 (145行)
│   ├── layout.tsx                      # 根布局 (34行)
│   ├── page.tsx                        # 首页重定向 (21行)
│   └── globals.css                     # 全局样式 (27行)
│
├── components/
│   └── bank-campaign/
│       ├── Card.tsx                    # 3D翻转卡牌 (41行)
│       ├── CollectionSlots.tsx         # 进度显示 (33行)
│       ├── LoginModal.tsx              # 手机号认证 (87行)
│       ├── ResultModal.tsx             # 抽卡结果 (51行)
│       ├── FinalRewardModal.tsx        # 最终奖品 (55行)
│       └── campaign.module.css         # 组件样式 (145行CSS)
│
├── lib/
│   └── utils.ts                        # cn()工具 (6行)
│
├── public/                             # 静态资源（目前为空）
│
├── .github/                            # ⚠️ 缺失 - 需要创建
│   └── workflows/
│       └── deploy.yml                  # GitHub Actions CI/CD
│
├── package.json                        # 依赖 + 脚本
├── tsconfig.json                       # TypeScript配置
├── next.config.ts                      # ⚠️ 不完整 - 缺少静态导出
├── postcss.config.mjs                  # PostCSS + Tailwind
├── eslint.config.mjs                   # Lint规则
├── .gitignore                          # Git排除
├── bun.lockb                           # Bun锁文件
└── README.md                           # 项目文档 (271行)
```

**源代码总量**：467行（在 < 500行预算内 ✅）

**缺失/不完整的文件**：
1. `.github/workflows/deploy.yml` - 部署自动化
2. `next.config.ts` - 需要 `output: 'export'` 配置
3. `tailwind.config.ts` - 可选但建议用于自定义农业银行颜色

---

## ✅ 4. 任务（实施路线图）

### 4.1 当前状态矩阵

| 阶段 | 任务 | 状态 | 受影响文件 | 预估时间 | 优先级 |
|------|------|------|-----------|---------|---------|
| **阶段1：基础搭建** | | **100%完成** | | | |
| 1.1 | 项目初始化 | ✅ 完成 | package.json, bun.lockb | 10分钟 | P0 |
| 1.2 | 配置文件 | ✅ 完成 | tsconfig.json, postcss.config.mjs, eslint.config.mjs | 15分钟 | P0 |
| 1.3 | Tailwind CSS设置 | ✅ 完成 | globals.css, postcss.config.mjs | 10分钟 | P0 |
| **阶段2：核心功能** | | **100%完成** | | | |
| 2.1 | 布局和路由 | ✅ 完成 | app/layout.tsx, app/page.tsx | 20分钟 | P0 |
| 2.2 | 主游戏页面 | ✅ 完成 | app/bank-campaign/page.tsx | 40分钟 | P0 |
| 2.3 | 卡牌组件 | ✅ 完成 | components/bank-campaign/Card.tsx | 30分钟 | P0 |
| 2.4 | 收集槽 | ✅ 完成 | components/bank-campaign/CollectionSlots.tsx | 20分钟 | P0 |
| 2.5 | 弹窗组件 | ✅ 完成 | LoginModal, ResultModal, FinalRewardModal | 60分钟 | P0 |
| 2.6 | CSS动画 | ✅ 完成 | campaign.module.css | 30分钟 | P0 |
| 2.7 | 智能收集逻辑 | ✅ 完成 | page.tsx (getLuckyIndex) | 15分钟 | P0 |
| **阶段3：部署** | | **0%完成** | | | |
| 3.1 | 更新next.config.ts | ⚠️ **待完成** | next.config.ts | 5分钟 | **P0** |
| 3.2 | 创建GitHub Actions工作流 | ⚠️ **待完成** | .github/workflows/deploy.yml | 15分钟 | **P0** |
| 3.3 | 配置COS存储桶 | ⚠️ **待完成** | 腾讯云控制台 | 20分钟 | **P0** |
| 3.4 | 设置GitHub Secrets | ⚠️ **待完成** | GitHub仓库设置 | 10分钟 | **P0** |
| 3.5 | 测试构建与部署 | ⚠️ **待完成** | 手动验证 | 10分钟 | **P0** |
| **阶段4：优化** | | **可选** | | | |
| 4.1 | 添加页脚法律信息 | 🔲 可选 | 新组件 | 10分钟 | P2 |
| 4.2 | 添加404错误页 | 🔲 可选 | app/not-found.tsx | 5分钟 | P2 |
| 4.3 | 性能监控 | 🔲 可选 | Vercel/Google Analytics | 15分钟 | P2 |
| 4.4 | 创建tailwind.config.ts | 🔲 可选 | tailwind.config.ts | 10分钟 | P1 |

**图例**：
- ✅ 完成
- ⚠️ 待完成（阻止部署）
- 🔲 可选（未来增强）

### 4.2 阶段1：基础搭建（✅ 完成）

所有基础任务已成功完成。项目结构已建立。

**主要成就**：
- 配置Bun包管理器
- 安装Next.js 16 + React 19 + TypeScript
- 集成Tailwind CSS 4
- 配置ESLint + TypeScript
- 添加多端口开发脚本

### 4.3 阶段2：核心功能（✅ 完成）

所有游戏功能已实现并在本地测试。

**主要成就**：
- 互动"集五福"游戏机制
- 3D翻牌动画（纯CSS）
- 智能收集算法（优先未收集字符）
- 手机号登录系统（演示模式）
- 完整弹窗流程（登录 → 结果 → 最终奖励）
- 演示重置功能
- 移动端响应式设计（480px优化）

### 4.4 阶段3：部署（⚠️ 不完整 - 阻止上线）

**状态**：0%完成 - 阻止生产部署

**任务3.1: 更新next.config.ts**

**当前状态**：
```typescript
// next.config.ts (不完整)
const nextConfig: NextConfig = {
  /* config options here */
};
```

**所需更改**：
```typescript
// next.config.ts (静态导出所需)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',                    // 启用静态HTML导出
  images: { unoptimized: true },       // 静态导出所需
  typedRoutes: true,                   // 类型安全路由
  reactStrictMode: true,               // React最佳实践
  trailingSlash: true,                 // 为URL添加尾部斜杠
};

export default nextConfig;
```

**验证**：
```bash
bun run build
# 应创建带静态文件的'out/'目录
ls -la out/
```

**任务3.2: 创建GitHub Actions工作流**

**文件**：`.github/workflows/deploy.yml`

```yaml
name: 部署到腾讯云COS

on:
  push:
    branches: [main]
  workflow_dispatch:  # 手动触发选项

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 设置Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: 安装依赖
        run: bun install --frozen-lockfile

      - name: 构建静态站点
        run: bun run build

      - name: 部署到COS
        uses: TencentCloud/cos-action@v1
        with:
          secret_id: ${{ secrets.TENCENT_CLOUD_SECRET_ID }}
          secret_key: ${{ secrets.TENCENT_CLOUD_SECRET_KEY }}
          cos_bucket: ${{ secrets.COS_BUCKET }}
          cos_region: ${{ secrets.COS_REGION }}
          local_path: out
          remote_path: /
          clean: true
```

**验证**：
- 在 `.github/workflows/deploy.yml` 创建文件
- 语法是有效的YAML
- 工作流出现在GitHub Actions选项卡中

**任务3.3: 配置COS存储桶**

**方法A: 手动（首次设置推荐）**

1. 登录腾讯云控制台：https://console.cloud.tencent.com/cos5/bucket
2. 创建新存储桶：
   - 名称：`abc-h5-{时间戳}`（例如：`abc-h5-20251205`）
   - 地域：`ap-guangzhou`（广州 - 中国最佳）
   - 访问权限：公有读、私有写
3. 启用静态网站托管：
   - 进入存储桶 → 基础配置 → 静态网站
   - 启用静态网站
   - 索引文档：`index.html`
   - 错误文档：`index.html`（用于SPA路由）
4. 记录：
   - 存储桶名称：`abc-h5-20251205`
   - 地域：`ap-guangzhou`
   - 静态网站URL：`http://abc-h5-20251205.cos-website.ap-guangzhou.myqcloud.com`

**方法B: AI自动化（使用Chrome DevTools MCP）**

详细Chrome DevTools自动化脚本见附录B。

**任务3.4: 设置GitHub Secrets**

**所需Secrets**（共4个）：

| Secret名称 | 示例值 | 获取位置 |
|-----------|--------|---------|
| `TENCENT_CLOUD_SECRET_ID` | `AKID****` | https://console.cloud.tencent.com/cam/capi |
| `TENCENT_CLOUD_SECRET_KEY` | `****` | https://console.cloud.tencent.com/cam/capi |
| `COS_BUCKET` | `abc-h5-20251205` | 来自任务3.3 |
| `COS_REGION` | `ap-guangzhou` | 来自任务3.3 |

**步骤**：
1. 访问：https://github.com/{用户名}/{仓库}/settings/secrets/actions
2. 点击"New repository secret"
3. 添加上述4个secrets
4. 验证所有4个出现在列表中

**验证**：
- 所有4个secrets在GitHub设置中可见
- Secret名称完全匹配（区分大小写）

**任务3.5: 测试构建与部署**

**本地构建测试**：
```bash
cd ~/Desktop/Next.js项目/abc-bank-annual-h5
bun run build

# 验证输出
ls -lh out/
cat out/index.html | head -20

# 本地预览
bunx serve out -p 8080
# 访问 http://localhost:8080
```

**部署测试**：
```bash
git add .
git commit -m "chore: 配置静态导出和部署"
git push origin main

# 监控部署
# 访问: https://github.com/{用户名}/{仓库}/actions
```

**验证清单**：
- [ ] 构建无错误完成
- [ ] 创建`out/`目录
- [ ] `out/index.html`存在且非空
- [ ] `out/_next/static/`包含JS/CSS包
- [ ] 本地预览工作（登录 → 游戏 → 奖励）
- [ ] GitHub Actions工作流在push时触发
- [ ] 工作流成功完成（绿色勾号）
- [ ] COS存储桶包含上传的文件
- [ ] 静态网站URL可访问
- [ ] 移动端视图工作正常

### 4.5 阶段4：优化（可选）

**任务4.1: 添加页脚组件**

**目的**：显示法律信息和银行品牌

**实现**：
```typescript
// components/Footer.tsx
export const Footer = () => (
  <footer className="bg-gray-900 text-white/70 py-6 text-center text-xs">
    <p>中国农业银行版权所有 © 2025</p>
    <p className="mt-2 text-white/50">活动最终解释权归ABC银行所有</p>
  </footer>
);

// app/bank-campaign/page.tsx
import { Footer } from '@/components/Footer';

return (
  <div>
    {/* 现有内容 */}
    <Footer />
  </div>
);
```

**任务4.2: 添加404错误页**

**文件**：`app/not-found.tsx`

```typescript
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-gray-600 mt-4">页面未找到</p>
        <a href="/" className="mt-6 inline-block px-6 py-3 bg-[#b81c22] text-white rounded-lg">
          返回首页
        </a>
      </div>
    </div>
  );
}
```

**任务4.3: 性能监控**

**选项A: Vercel Analytics**（如果部署到Vercel）
```bash
bun add @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**选项B: Google Analytics**
```typescript
// app/layout.tsx
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

**任务4.4: 创建tailwind.config.ts**

**目的**：显式农业银行颜色定义

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'abc-red': {
          DEFAULT: '#b81c22',
          dark: '#9a161b',
          light: '#d42129',
        },
        'abc-gold': {
          DEFAULT: '#f0c676',
          dark: '#d4af37',
          light: '#ffd700',
        },
      },
    },
  },
};

export default config;
```

---

## 🚀 5. 实施（执行指南）

### 5.1 开发工作流

**启动开发服务器**：

```bash
# 导航到项目
cd ~/Desktop/Next.js项目/abc-bank-annual-h5

# 安装依赖（仅首次）
bun install

# 启动开发服务器
bun dev                 # 默认端口3000
bun run dev:3001       # 端口3001（如果3000被占用）
bun run dev:3002       # 端口3002
bun run dev:3003       # 端口3003
bun run dev:auto       # 自动选择可用端口

# 或指定自定义端口
bun dev -- -p 4000
```

**开发URL**：
- 本地：`http://localhost:3000`
- 网络：`http://{你的IP}:3000`（用于移动端测试）

**热重载**：自动启用（保存文件即可立即看到更改）

### 5.2 生产构建

**构建命令**：
```bash
# 构建静态站点
bun run build

# 输出: out/目录
# ├── index.html
# ├── bank-campaign.html
# └── _next/
#     ├── static/
#     │   ├── chunks/
#     │   └── css/
#     └── ...
```

**验证**：
```bash
# 检查构建输出
ls -lh out/
du -sh out/

# 本地预览
bunx serve out -p 8080
# 访问: http://localhost:8080
```

**预期结果**：
- 总大小：300-500KB（gzip后）
- HTML文件：index.html, bank-campaign.html
- JavaScript块：总共 < 200KB
- CSS包：< 50KB

### 5.3 部署自动化

**方法A: 自动（GitHub Actions）**

**前提条件**：
1. 任务3.1-3.4已完成（见第4.4节）
2. 所有GitHub Secrets已配置
3. COS存储桶已创建和配置

**触发部署**：
```bash
# 提交并推送更改
git add .
git commit -m "feat: 添加新功能"
git push origin main

# GitHub Actions将自动:
# 1. 安装依赖
# 2. 构建静态站点
# 3. 上传到COS
# 4. 在约3-5分钟内完成
```

**监控进度**：
1. 访问：https://github.com/{用户名}/{仓库}/actions
2. 点击最新的工作流运行
3. 实时观看每个步骤执行
4. 绿色勾号 = 成功 ✅
5. 红色X = 失败 ❌（查看日志了解错误详情）

**方法B: 手动（Chrome DevTools MCP自动化）**

**自动化浏览器操作** - 完整自动化脚本见附录B

**高层步骤**：
1. 使用MCP导航到COS控制台
2. 截图以识别UI元素
3. 点击"创建存储桶"并填写表单
4. 启用静态网站托管
5. 从`out/`目录上传构建文件
6. 验证部署

### 5.4 测试清单

**部署前测试**（推送前本地运行）：

```bash
# 1. 类型检查
bunx tsc --noEmit

# 2. Lint检查
bun run lint

# 3. 构建测试
bun run build

# 4. 视觉测试（手动）
bunx serve out -p 8080
# 访问 http://localhost:8080 并测试:
```

**手动测试用例**：

| 测试用例 | 步骤 | 预期结果 |
|---------|------|---------|
| **登录弹窗** | 1. 打开页面 | 登录弹窗出现 |
| | 2. 输入10位数字 | 提交按钮禁用 |
| | 3. 输入第11位数字 | 提交按钮启用 |
| | 4. 点击提交 | 弹窗关闭，游戏可见 |
| **抽卡** | 1. 点击卡牌 | 3D翻转动画（流畅） |
| | 2. 等待800ms | 字符显示 |
| | 3. 结果弹窗出现 | 显示抽中的字 |
| | 4. 点击继续 | 弹窗关闭，卡牌翻回 |
| **收集** | 1. 抽5次 | 所有槽位填满 |
| | 2. 抽最后一张卡 | 最终奖励弹窗出现 |
| **重置** | 1. 点击重置按钮 | 所有状态清除 |
| | 2. 检查槽位 | 所有空 |
| | 3. 检查弹窗 | 登录弹窗重新出现 |
| **移动端** | 1. 在手机上打开 | 页面适配视口 |
| | 2. 测试触摸 | 所有交互工作 |
| | 3. 检查动画 | 流畅60fps |

**部署后测试**（推送到COS后）：

```bash
# 1. 访问静态网站URL
curl -I http://abc-h5-{时间戳}.cos-website.ap-guangzhou.myqcloud.com

# 预期: HTTP 200 OK

# 2. 检查内容
curl http://abc-h5-{时间戳}.cos-website.ap-guangzhou.myqcloud.com | head -50

# 预期: 带正确meta标签的有效HTML
```

**浏览器测试**：
- [ ] 桌面Chrome（最新版）
- [ ] 桌面Safari（最新版）
- [ ] 移动端Safari（iOS 12+）
- [ ] 移动端Chrome（Android 8+）
- [ ] 微信内置浏览器（iOS）
- [ ] 微信内置浏览器（Android）

### 5.5 监控与回滚

**监控部署健康状况**：

**GitHub Actions仪表板**：
1. 访问：https://github.com/{用户名}/{仓库}/actions
2. 检查最新工作流状态
3. 如果失败则查看构建日志

**COS文件验证**：
1. 登录：https://console.cloud.tencent.com/cos5/bucket
2. 选择存储桶：`abc-h5-{时间戳}`
3. 验证文件：
   - `index.html`（时间戳应该是最近的）
   - `_next/static/`文件夹存在
   - 文件数量与`out/`目录匹配

**实时站点监控**：
```bash
# 运行状态检查（每5分钟）
curl -I http://abc-h5-{时间戳}.cos-website.ap-guangzhou.myqcloud.com

# 性能检查
curl -w "@curl-format.txt" -o /dev/null -s http://abc-h5-{时间戳}.cos-website.ap-guangzhou.myqcloud.com

# curl-format.txt:
# time_namelookup: %{time_namelookup}\n
# time_connect: %{time_connect}\n
# time_starttransfer: %{time_starttransfer}\n
# time_total: %{time_total}\n
```

**回滚程序**（如果部署破坏生产）：

**选项1: 回退Git提交**
```bash
# 查找工作的提交
git log --oneline

# 回退到之前的提交
git revert HEAD
git push origin main

# GitHub Actions将自动部署旧版本
```

**选项2: 手动COS回滚**
1. 进入COS控制台
2. 查找有问题版本的文件
3. 点击"版本"选项卡（如果启用了版本控制）
4. 恢复之前的版本
5. 或手动重新上传旧的`out/`目录

**选项3: 紧急静态文件替换**
```bash
# 如果你有旧的'out/'目录
cd old-working-version/
bun run build

# 手动上传到COS
coscmd upload -r out/ / --delete
```

### 5.6 故障排查

**问题1: 构建失败，报"类型错误"**

**症状**：
```
Error: Type 'X' is not assignable to type 'Y'
```

**解决方案**：
```bash
# 检查TypeScript错误
bunx tsc --noEmit

# 修复报告文件中的错误
# 然后重建
bun run build
```

**问题2: GitHub Actions失败 - "未找到Secrets"**

**症状**：
```
Error: Input required and not supplied: secret_id
```

**解决方案**：
1. 访问：https://github.com/{用户名}/{仓库}/settings/secrets/actions
2. 验证所有4个secrets存在：
   - TENCENT_CLOUD_SECRET_ID
   - TENCENT_CLOUD_SECRET_KEY
   - COS_BUCKET
   - COS_REGION
3. 检查secret名称完全匹配（区分大小写）
4. 重新运行工作流：Actions → 失败的运行 → 重新运行所有作业

**问题3: COS上传成功但站点显示404**

**症状**：
- GitHub Actions成功完成 ✅
- 访问URL显示"NoSuchKey"或404错误

**可能原因与解决方案**：

| 原因 | 检查 | 解决方案 |
|-----|------|---------|
| 未启用静态网站 | COS控制台 → 存储桶 → 基础配置 → 静态网站 | 启用并设置index.html |
| 工作流中remote_path错误 | .github/workflows/deploy.yml | 确保`remote_path: /`而非`/abc/` |
| 存储桶非公有读 | COS控制台 → 存储桶 → 权限 | 设置为"公有读、私有写" |
| 文件未上传 | COS控制台 → 文件列表 | 检查根目录中是否存在文件 |

**问题4: 移动端动画卡顿**

**症状**：
- 卡牌翻转不流畅
- FPS降至30以下

**解决方案**：
```css
/* 添加到campaign.module.css */
.cardContainer {
  will-change: transform;  /* 预优化 */
  transform: translateZ(0); /* 强制GPU */
}

/* 动画后移除will-change */
.cardContainer:not(.flipped) {
  will-change: auto;
}
```

**问题5: 端口3000已被使用**

**症状**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：
```bash
# 选项1: 使用替代端口
bun run dev:3001

# 选项2: 终止端口3000上的进程
lsof -ti:3000 | xargs kill -9

# 选项3: 自动选择端口
bun run dev:auto
```

**问题6: 生产环境CSS未加载**

**症状**：
- 在开发环境工作（`bun dev`）
- 在生产环境中断（部署到COS）
- 样式缺失

**解决方案**：
1. 验证`postcss.config.mjs`存在
2. 检查Tailwind配置包含正确的内容路径
3. 重建：`bun run build`
4. 检查`out/_next/static/css/`有CSS文件
5. 验证COS上传了CSS文件

---

## 📊 附录

### 附录A: 配置文件参考

**A.1 package.json**（完整）

```json
{
  "name": "abc-bank-annual-h5",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "dev:3001": "next dev -p 3001",
    "dev:3002": "next dev -p 3002",
    "dev:3003": "next dev -p 3003",
    "dev:auto": "next dev -p 0",
    "build": "next build",
    "start": "next start",
    "start:3001": "next start -p 3001",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.0.7",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "lucide-react": "^0.468.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.7",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**A.2 next.config.ts**（所需更新 - 见任务3.1）

**A.3 tsconfig.json**（完整）

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**A.4 postcss.config.mjs**（完整）

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**A.5 .gitignore**（完整）

```gitignore
# 依赖
node_modules/
bun.lockb

# Next.js
.next/
out/
next-env.d.ts

# 生产
build/
dist/

# 调试
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 本地环境文件
.env*.local
.env

# 操作系统
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

### 附录B: Chrome DevTools MCP自动化

**COS配置的完整自动化脚本**

**任务: 创建COS存储桶**

```javascript
// 步骤1: 导航到COS控制台
await mcp__chrome-devtools__navigate_page({
  url: "https://console.cloud.tencent.com/cos5/bucket"
});

// 步骤2: 等待页面加载
await mcp__chrome-devtools__wait_for({
  text: "创建存储桶",
  timeout: 5000
});

// 步骤3: 截图以识别元素
const snapshot = await mcp__chrome-devtools__take_snapshot();
// AI分析snapshot以找到按钮UID

// 步骤4: 点击"创建存储桶"
await mcp__chrome-devtools__click({
  uid: "{snapshot中的按钮uid}"
});

// 步骤5: 填写存储桶名称
await mcp__chrome-devtools__fill({
  uid: "{名称输入框uid}",
  value: `abc-h5-${Date.now()}`
});

// 步骤6: 选择地域（广州）
await mcp__chrome-devtools__fill({
  uid: "{地域选择器uid}",
  value: "ap-guangzhou"
});

// 步骤7: 设置访问权限（公有读）
await mcp__chrome-devtools__click({
  uid: "{公有读单选按钮uid}"
});

// 步骤8: 确认创建
await mcp__chrome-devtools__click({
  uid: "{确认按钮uid}"
});

// 步骤9: 等待成功
await mcp__chrome-devtools__wait_for({
  text: "创建成功",
  timeout: 10000
});

// 步骤10: 截图确认
await mcp__chrome-devtools__take_screenshot();
```

**任务: 启用静态网站**

```javascript
// 步骤1: 点击进入存储桶详情
await mcp__chrome-devtools__click({
  uid: "{存储桶名称链接uid}"
});

// 步骤2: 进入基础配置
await mcp__chrome-devtools__click({
  uid: "{基础配置标签uid}"
});

// 步骤3: 查找"静态网站"部分
await mcp__chrome-devtools__scroll({
  to: "静态网站"
});

// 步骤4: 点击编辑
await mcp__chrome-devtools__click({
  uid: "{静态网站编辑uid}"
});

// 步骤5: 启用静态网站
await mcp__chrome-devtools__click({
  uid: "{启用单选按钮uid}"
});

// 步骤6: 设置索引文档
await mcp__chrome-devtools__fill({
  uid: "{索引输入框uid}",
  value: "index.html"
});

// 步骤7: 设置错误文档
await mcp__chrome-devtools__fill({
  uid: "{错误输入框uid}",
  value: "index.html"
});

// 步骤8: 保存
await mcp__chrome-devtools__click({
  uid: "{保存按钮uid}"
});

// 步骤9: 截图静态网站URL
await mcp__chrome-devtools__take_screenshot();
```

**任务: 获取API密钥**

```javascript
// 步骤1: 导航到API密钥页面
await mcp__chrome-devtools__navigate_page({
  url: "https://console.cloud.tencent.com/cam/capi"
});

// 步骤2: 截图
const snapshot = await mcp__chrome-devtools__take_snapshot();

// 步骤3: 截图密钥（如果存在）
await mcp__chrome-devtools__take_screenshot();

// 步骤4: 如需创建新密钥
await mcp__chrome-devtools__click({
  uid: "{创建密钥按钮uid}"
});

// 步骤5: 确认
await mcp__chrome-devtools__click({
  uid: "{确认uid}"
});

// 步骤6: 截图新密钥
await mcp__chrome-devtools__take_screenshot();
```

**注意**：实际的UID取决于当前腾讯云控制台结构。AI必须先截图以识别正确的元素。

### 附录C: 部署预检清单

**推送到生产前**：

**代码质量**：
- [ ] `bunx tsc --noEmit`通过（无类型错误）
- [ ] `bun run lint`通过（无ESLint错误）
- [ ] `bun run build`成功（无构建错误）
- [ ] `out/`目录已创建（非空）

**配置**：
- [ ] `next.config.ts`有`output: 'export'`
- [ ] `.github/workflows/deploy.yml`存在
- [ ] GitHub Secrets已配置（4个secrets）
- [ ] COS存储桶已创建且公有
- [ ] COS上已启用静态网站

**功能**：
- [ ] 登录弹窗工作（接受11位数字）
- [ ] 卡牌翻转动画流畅（无延迟）
- [ ] 收集算法正确（无重复）
- [ ] 5张卡后显示最终奖励
- [ ] 重置按钮清除状态
- [ ] 移动端响应式（在真机上测试）

**性能**：
- [ ] 总包大小 < 500KB
- [ ] Lighthouse分数 > 90（桌面）
- [ ] Lighthouse分数 > 80（移动端）
- [ ] 动画60fps

**浏览器兼容性**：
- [ ] Chrome（桌面 + 移动端）
- [ ] Safari（桌面 + 移动端）
- [ ] 微信浏览器（iOS + Android）

**部署**：
- [ ] GitHub Actions工作流存在
- [ ] Secrets正确（用手动触发测试）
- [ ] COS存储桶可访问（测试URL）
- [ ] 静态网站URL工作

**部署后**：
- [ ] 实时站点加载 < 3秒
- [ ] 所有游戏功能工作
- [ ] 移动端触摸交互响应
- [ ] 浏览器中无控制台错误

### 附录D: 成本估算

**每月运营成本**（假设10,000次访问/月）：

| 服务 | 项目 | 成本估算 |
|-----|------|---------|
| **腾讯云COS** | 存储（1GB） | ¥0.10 |
| | 流量（10GB） | ¥0.80 |
| | 请求（100,000） | ¥0.05 |
| **小计** | | **¥0.95/月** |
| **GitHub Actions** | 构建分钟数（免费额度: 2,000分钟/月） | ¥0 |
| | 存储（免费额度: 500MB） | ¥0 |
| **总计** | | **< ¥1.00/月** ✅ |

**扩展成本**（100,000次访问/月）：

| 流量 | COS带宽成本 |
|-----|-----------|
| 10GB | ¥0.80 |
| 100GB | ¥8.00 |
| 1TB | ¥80.00 |

**成本优化技巧**：
1. 启用COS CDN加速（每月前10GB免费）
2. 使用WebP图片（比JPEG小50%）
3. 在COS上启用Gzip压缩
4. 积极缓存静态资源（max-age: 1年）

### 附录E: 性能基准

**目标指标**（4G网络，中端Android）：

| 指标 | 目标 | 当前* |
|-----|------|------|
| 首次内容绘制 | < 1.5秒 | ~1.2秒 ✅ |
| 最大内容绘制 | < 2.5秒 | ~2.0秒 ✅ |
| 可交互时间 | < 3.0秒 | ~2.5秒 ✅ |
| 累积布局偏移 | < 0.1 | ~0.05 ✅ |
| 首次输入延迟 | < 100ms | ~50ms ✅ |

*基于构建输出大小和Next.js默认值的估算

**包大小分解**：

| 资源 | 大小（Gzip） | 备注 |
|-----|------------|------|
| HTML（index.html） | ~5KB | 最小标记 |
| JavaScript（总计） | ~180KB | React 19 + Next.js 16 + 应用代码 |
| CSS（总计） | ~25KB | Tailwind（已清除） + CSS模块 |
| 字体 | ~0KB | 仅系统字体 |
| **总计** | **~210KB** | 远低于500KB预算 ✅ |

**动画性能**：

| 动画 | 时长 | FPS | GPU | 备注 |
|-----|------|-----|-----|------|
| 卡牌翻转 | 800ms | 60fps | ✅ | `transform: rotateY()` |
| 弹窗淡入 | 300ms | 60fps | ✅ | `opacity` |
| 槽位高亮 | 200ms | 60fps | ✅ | `transform: scale()` |

**已应用的优化技术**：
- ✅ Tailwind CSS清除（移除未使用的类）
- ✅ Next.js自动代码分割
- ✅ React 19性能改进
- ✅ CSS `transform`和`opacity`（GPU加速）
- ✅ `backface-visibility: hidden`（3D性能）
- ✅ 无外部字体（系统字体栈）
- ✅ 最少依赖（6个总计）

---

## 📝 文档变更日志

### 版本2.0（2025-12-05）
- ✅ 重构为GitHub SPEC-KIT格式
- ✅ 记录实际实现（互动游戏 vs 静态页面）
- ✅ 添加全面的组件架构
- ✅ 识别缺失的部署文件（GitHub Actions、配置更新）
- ✅ 保留Chrome DevTools MCP自动化说明
- ✅ 添加详细故障排查部分
- ✅ 包含性能基准和成本估算

### 版本1.0（2025-12-05）
- 初始SPEC文档（自定义格式）
- 以任务为中心的结构（9个顺序任务）
- 描述简单静态页面（未实现）

---

## 🎯 快速启动命令

**开发人员**：
```bash
# 克隆和设置
git clone {仓库URL}
cd abc-bank-annual-h5
bun install

# 开发
bun dev             # 启动开发服务器（端口3000）
bun run dev:3001    # 使用端口3001

# 构建
bun run build       # 在out/中创建静态导出

# 预览
bunx serve out -p 8080

# 部署（任务3.1-3.4完成后）
git push origin main  # GitHub Actions自动部署
```

**AI代理**：
```bash
# 完成缺失的部署配置
# 按顺序执行:
# 1. 更新next.config.ts（见任务3.1）
# 2. 创建.github/workflows/deploy.yml（见任务3.2）
# 3. 通过Chrome DevTools MCP配置COS（见任务3.3 + 附录B）
# 4. 通过Chrome DevTools MCP设置GitHub Secrets（见任务3.4）
# 5. 测试构建和部署（见任务3.5）
```

---

**规格说明书结束**

**状态**：核心功能100%完成。部署配置0%完成（阻止生产）。
**下一步**：执行阶段3任务（3.1到3.5）以启用生产部署。
**联系**：项目信息见README.md。
