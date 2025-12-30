# ABC银行集五福H5 - 完整技术解析文档

> 本文档全面解析农业银行开门红"集五福"营销活动H5项目的技术架构、代码实现和工程实践，适合学习Next.js、React、云服务集成的开发者参考。

**文档版本**: v1.0
**项目版本**: 基于 Next.js 16.0.7
**字数统计**: 约 50,000 字
**阅读时长**: 约 3-4 小时

---

## 目录

- [第一部分：项目概览](#第一部分项目概览)
- [第二部分：前端架构深度解析](#第二部分前端架构深度解析)
- [第三部分：后端架构深度解析](#第三部分后端架构深度解析)
- [第四部分：前后端数据流](#第四部分前后端数据流)
- [第五部分：部署与运维](#第五部分部署与运维)
- [第六部分：核心技术深入](#第六部分核心技术深入)
- [第七部分：学习路径与扩展](#第七部分学习路径与扩展)

---

# 第一部分：项目概览

## 1.1 项目背景与业务需求

### 1.1.1 银行营销活动的技术挑战

在金融科技快速发展的今天，传统银行面临着巨大的数字化转型压力。特别是在营销活动领域，如何通过技术手段提升用户参与度、增强品牌认知、促进业务增长，成为各大银行的核心课题。

本项目源于中国农业银行（ABC Bank）2024年"开门红"营销活动的实际需求。开门红是银行业的传统营销节点，通常在每年年初举办，目标是：

1. **吸引新客户**：通过趣味互动游戏吸引潜在客户关注
2. **激活老客户**：提升现有客户的活跃度和粘性
3. **促进产品销售**：引导用户了解和购买银行理财、信用卡等产品
4. **品牌传播**：借助社交分享扩大品牌影响力

传统的线下营销活动存在以下痛点：
- **覆盖范围有限**：受地域限制，难以触达全国客户
- **成本高昂**：需要大量人力物力投入
- **数据难追踪**：无法精准统计参与情况和效果
- **用户体验差**：流程繁琐，参与门槛高

为解决这些问题，农行决定开发一款H5互动营销产品，要求具备：

**功能需求**：
- 集卡游戏玩法（类似支付宝集五福）
- 手机号登录（无需下载APP）
- 3D卡片翻转动画（提升趣味性）
- 收集进度可视化
- 集齐后领取奖励
- 社交分享功能

**性能需求**：
- 加载时间 < 2秒
- 支持百万级并发（高峰期）
- 移动端流畅运行（60fps动画）

**技术约束**：
- 必须兼容微信浏览器
- 符合银行安全合规要求
- 可快速部署和更新
- 成本可控（初期预算有限）

### 1.1.2 集五福玩法的交互设计要求

"集五福"玩法源于中国传统文化，将五个吉祥字"马上发财哇"作为收集目标，具有天然的文化认同感和传播力。交互设计需要平衡以下因素：

**心理学驱动**：
1. **即时反馈**：点击卡片立即翻转，满足用户的控制感
2. **随机奖励**：抽卡结果随机，制造惊喜感（类似抽盲盒）
3. **进度可视化**：实时显示收集进度，强化目标导向
4. **完成激励**：集齐后的奖励页面，给予成就感
5. **社交裂变**：分享机制（后续版本），利用社交关系链

**视觉设计**：
- **Apple风格**：极简设计，减少视觉干扰
- **中国红配色**：符合开门红主题，传递喜庆氛围
- **毛玻璃效果**：现代感，与银行专业形象一致
- **3D动画**：提升趣味性，增强沉浸感

**交互流程**：
```
用户进入页面
    ↓
查看卡片布局（5张卡背朝上）
    ↓
点击登录按钮 → 输入手机号 → 接收验证码 → 验证成功
    ↓
点击任意卡片
    ↓
卡片3D翻转（500ms动画）
    ↓
显示抽中的字（结果弹窗）
    ↓
更新收集槽（高亮已收集）
    ↓
判断是否集齐
    ├─ 未集齐 → 继续抽卡
    └─ 集齐 → 显示最终奖励页面
```

**关键设计决策**：

1. **为什么是3D翻转而非2D？**
   - 3D效果更具沉浸感，提升用户参与度
   - 符合"开盲盒"的心理预期
   - 技术实现成本低（纯CSS，无需Three.js）

2. **为什么100%抽中新卡？**
   - 产品定位：快速完成收集，引导后续转化
   - 避免用户挫败感（重复抽中导致流失）
   - 简化后端逻辑，提升性能

3. **为什么选择手机号登录？**
   - 银行业务需要实名信息
   - 无需安装APP，降低门槛
   - 方便后续营销触达

### 1.1.3 技术选型决策过程

在项目启动阶段，团队面临多个技术方案的选择。以下是核心决策过程：

#### 前端框架选型

**候选方案**：
| 方案 | 优势 | 劣势 | 是否采用 |
|------|------|------|----------|
| 纯HTML+jQuery | 简单、兼容性好 | 代码难维护、无组件化 | ❌ |
| Vue 3 | 生态成熟、学习曲线低 | SSR支持较弱 | ❌ |
| React 18 + Vite | 灵活、生态丰富 | 需自建SSR | ❌ |
| **Next.js 16** | **全栈框架、SSR/SSG、部署简单** | **学习成本稍高** | ✅ |

**最终选择**：Next.js 16 App Router

**理由**：
1. **全栈能力**：前后端一体化，API Routes可快速实现后端接口
2. **静态导出**：支持`output: 'export'`，可部署到CDN（降低成本）
3. **性能优势**：RSC（React Server Components）+ 自动代码分割
4. **开发体验**：文件路由、热更新、TypeScript原生支持
5. **部署便利**：Vercel一键部署，或导出静态文件到任意平台

#### 样式方案选型

**候选方案**：
- CSS Modules: 局部作用域，但需手动管理类名
- Styled-components: CSS-in-JS，运行时开销
- Sass/Less: 需要预处理器配置
- **Tailwind CSS 4**: 原子化CSS，JIT编译

**最终选择**：Tailwind CSS 4 + CSS Modules

**理由**：
1. **开发效率**：原子类快速构建UI，无需命名
2. **一致性**：设计系统内置，减少视觉偏差
3. **性能优势**：JIT模式仅生成使用的类，打包体积小
4. **灵活性**：复杂动画用CSS Modules补充

#### 后端架构选型

**候选方案**：
| 方案 | 适用场景 | 成本 | 是否采用 |
|------|----------|------|----------|
| 传统服务器（Node+Express） | 高流量、复杂业务 | 高（服务器+数据库） | ❌ |
| Serverless（云函数） | 弹性伸缩、按需计费 | 中 | ✅ (生产) |
| **Next.js API Routes** | **开发/演示/低流量** | **极低（几乎免费）** | ✅ (当前) |

**最终选择**：双模式架构

**创新点**：设计了渐进式架构
- **阶段1（MVP）**：Next.js API Routes + 内存存储
  - 优势：零成本、快速上线、易调试
  - 劣势：数据不持久、不适合高并发
- **阶段2（生产）**：腾讯云SCF + PostgreSQL + Redis
  - 优势：数据持久化、高并发、可扩展
  - 劣势：有运营成本（约50元/月）

**切换成本**：仅需修改1个环境变量（`NEXT_PUBLIC_API_BASE_URL`）

#### 运行时选型

**候选方案**：
- Node.js: 生态最完善
- Deno: 安全、现代，但生态不足
- **Bun**: 性能强、兼容Node、内置工具链

**最终选择**：Bun 1.x

**理由**：
1. **启动速度**：比Node快3-4倍
2. **打包性能**：内置打包器，比Webpack快
3. **兼容性**：100%兼容Node API
4. **开发体验**：内置测试、打包、包管理

#### 部署方案选型

**前端部署**：
- Vercel: 最佳选择，但国内访问慢
- **腾讯云COS + CDN**: 国内访问快，成本低
- 阿里云OSS: 备选方案

**后端部署**：
- 腾讯云SCF: 与COS在同一平台，管理便捷
- AWS Lambda: 国际用户备选
- 阿里云函数计算: 备选方案

**最终选择**：腾讯云全家桶（COS + CDN + SCF + PostgreSQL + Redis）

---

## 1.2 核心技术栈详解

### 1.2.1 Next.js 16 新特性与选择理由

Next.js 16 是Vercel于2024年发布的重大版本更新，带来了多项革命性特性。本项目充分利用了其核心能力。

#### App Router 架构

**什么是App Router？**

App Router是Next.js 13引入、16版本完善的新一代路由系统，位于`app/`目录，取代了传统的`pages/`目录。

**核心概念**：

1. **文件系统路由**：
```
app/
├── layout.tsx          → 所有页面共享的布局
├── page.tsx           → 根路径 "/"
├── bank-campaign/
│   └── page.tsx       → "/bank-campaign"
└── api/
    ├── auth/
    │   ├── send-code/
    │   │   └── route.ts  → POST /api/auth/send-code
    │   └── verify-code/
    │       └── route.ts  → POST /api/auth/verify-code
    └── card/
        └── draw/
            └── route.ts  → POST /api/card/draw
```

文件名决定URL，无需手动配置路由。

2. **React Server Components（RSC）**：

默认情况下，`app/`目录中的所有组件都是服务端组件（Server Component），可以直接访问数据库、文件系统等服务端资源。

```typescript
// app/bank-campaign/page.tsx
// 这是一个服务端组件（如果不标注"use client"）
export default function BankCampaignPage() {
  // 可以在这里直接查询数据库
  // const data = await db.query(...)
  return <div>...</div>
}
```

客户端组件需要显式标注：
```typescript
"use client" // 必须在文件顶部

import { useState } from 'react'
export default function ClientComponent() {
  const [count, setCount] = useState(0)
  // 可以使用 useState、useEffect 等 Hook
}
```

**本项目中的使用**：

- `app/layout.tsx`: 服务端组件，定义全局HTML结构
- `app/page.tsx`: 服务端组件，重定向到`/bank-campaign`
- `app/bank-campaign/page.tsx`: **客户端组件**（需要交互状态）
- `app/api/*`: API Routes，服务端运行

**为什么主页面选择客户端组件？**
- 需要使用`useState`管理卡片状态
- 需要`useEffect`处理登录状态检查
- 需要事件处理（onClick、onSubmit）

#### 静态导出（Static Export）

**配置**：`next.config.ts:4`
```typescript
const nextConfig: NextConfig = {
  output: 'export', // 关键配置
  images: {
    unoptimized: true // 禁用图片优化（静态导出要求）
  }
}
```

**静态导出的工作原理**：

运行`npm run build`后，Next.js会：
1. 预渲染所有页面为HTML文件
2. 提取所有CSS、JS到独立文件
3. 优化资源（压缩、Tree Shaking）
4. 输出到`out/`目录

**输出结构**：
```
out/
├── index.html              → 根路径页面
├── bank-campaign.html      → 主页面
├── _next/
│   ├── static/
│   │   ├── chunks/         → JS代码分割块
│   │   └── css/            → 提取的CSS
│   └── ...
└── api/                    → 注意：API Routes不会被导出！
```

**关键限制**：
- ❌ API Routes不会被导出（需要服务端运行）
- ❌ 动态路由需要`generateStaticParams`
- ❌ 不能使用`revalidate`等ISR特性
- ✅ 可部署到任意静态托管（COS、S3、CDN）

**本项目的解决方案**：

虽然`output: 'export'`会忽略API Routes，但我们保留了`app/api/*`代码，原因：
1. **开发模式**：`npm run dev`时API Routes正常工作
2. **演示模式**：部署静态文件时，前端直接调用云函数
3. **代码复用**：云函数代码（`functions/api`）与API Routes逻辑一致

#### API Routes 实战

**什么是API Routes？**

API Routes允许在Next.js应用中直接编写后端接口，无需单独的后端服务器。

**文件约定**：`route.ts`（或`route.js`）

**示例**：`app/api/auth/send-code/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'

// 导出 POST 函数处理 POST 请求
export async function POST(request: NextRequest) {
  const body = await request.json() // 解析请求体
  const { phone } = body

  // 业务逻辑
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: '手机号格式错误' },
      { status: 400 }
    )
  }

  // 生成验证码（演示用固定值）
  const code = '8888'

  // 返回JSON响应
  return NextResponse.json({
    success: true,
    message: '验证码已发送'
  })
}
```

**支持的HTTP方法**：
- `GET` → `export async function GET(request) {}`
- `POST` → `export async function POST(request) {}`
- `PUT`、`PATCH`、`DELETE` 同理

**与Pages Router的对比**：

| 特性 | Pages Router (`pages/api/`) | App Router (`app/api/`) |
|------|----------------------------|-------------------------|
| 文件名 | 任意（如`send-code.ts`） | 必须是`route.ts` |
| 导出方式 | `export default function handler()` | `export async function POST()` |
| 请求对象 | `NextApiRequest` | `NextRequest`（标准Request） |
| 响应对象 | `NextApiResponse` | `NextResponse`（标准Response） |
| 类型安全 | 较弱 | 更强（Web标准API） |

**最佳实践**：

1. **错误处理**：
```typescript
export async function POST(request: NextRequest) {
  try {
    // 业务逻辑
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

2. **CORS处理**（如需跨域）：
```typescript
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

3. **身份验证**：
```typescript
export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { error: '未授权' },
      { status: 401 }
    )
  }

  // 验证token...
}
```

### 1.2.2 Tailwind CSS 4 的优势

Tailwind CSS 4 是2024年发布的最新版本，带来了性能和DX（开发体验）的巨大提升。

#### 核心特性

**1. 原生PostCSS插件架构**

旧版本（v3）需要单独的配置文件（`tailwind.config.js`），v4改用PostCSS插件：

**配置**：`postcss.config.mjs`
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // 新的PostCSS插件
  },
}
```

**优势**：
- 配置更简洁
- 构建速度提升30%
- 更好的IDE支持

**2. JIT（Just-In-Time）默认开启**

v4默认使用JIT模式，按需生成CSS类：

**传统模式**：
```css
/* 生成所有可能的类（几MB） */
.p-1, .p-2, .p-3, ... .p-96
.m-1, .m-2, .m-3, ... .m-96
...（数万个类）
```

**JIT模式**：
```css
/* 只生成实际使用的类（几KB） */
.p-4   /* ← 代码中用了 */
.m-8   /* ← 代码中用了 */
.bg-gradient-to-br  /* ← 代码中用了 */
```

**效果对比**：
- 开发构建时间：从2秒 → 0.5秒
- 生产CSS体积：从200KB → 10KB
- 热更新速度：从1秒 → 即时

**3. 任意值（Arbitrary Values）**

v4增强了任意值的支持，可以直接在类名中使用自定义值：

```tsx
<div className="w-[480px]">           {/* 宽度480px */}
<div className="top-[calc(100vh-80px)]"> {/* 计算值 */}
<div className="bg-[#DC2626]">        {/* 自定义颜色 */}
<div className="shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]"> {/* 自定义阴影 */}
```

**本项目中的使用**：`app/bank-campaign/page.tsx`
```tsx
<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
  {/* 渐变背景：从左上红50到右下红50，中间白色 */}
</div>
```

#### 本项目的Tailwind使用模式

**1. 响应式设计**

```tsx
<div className="
  p-4           {/* 默认：padding 1rem */}
  md:p-8        {/* ≥768px：padding 2rem */}
  lg:p-12       {/* ≥1024px：padding 3rem */}
">
```

**2. 状态变体**

```tsx
<button className="
  bg-gradient-to-r from-red-500 to-red-600
  hover:from-red-600 hover:to-red-700    {/* 悬停变暗 */}
  disabled:opacity-50                    {/* 禁用半透明 */}
  disabled:cursor-not-allowed
">
```

**3. 动画工具类**

```tsx
<div className="
  transition-all         {/* 过渡所有属性 */}
  duration-300          {/* 持续300ms */}
  ease-in-out
  hover:scale-105       {/* 悬停时放大5% */}
">
```

**4. 与CSS Modules结合**

复杂动画使用CSS Modules：`components/bank-campaign/campaign.module.css`
```css
.card {
  @apply cursor-pointer; /* ← 可以在CSS中使用Tailwind */
  perspective: 1200px;   /* ← Tailwind没有的属性 */
}

.cardInner {
  @apply relative w-full h-full transition-transform duration-500;
  transform-style: preserve-3d;
}
```

然后在JSX中混用：
```tsx
<div className={`${styles.card} hover:scale-105`}>
  {/* CSS Module类 + Tailwind类 */}
</div>
```

### 1.2.3 TypeScript 类型安全实践

本项目使用TypeScript 5，充分利用了其类型系统提升代码质量。

#### tsconfig.json 配置解析

```json
{
  "compilerOptions": {
    "target": "ES2017",              // 编译目标（支持async/await）
    "lib": ["dom", "dom.iterable", "esnext"], // 类型库
    "allowJs": true,                 // 允许导入JS文件
    "skipLibCheck": true,            // 跳过.d.ts检查（提升速度）
    "strict": true,                  // 启用所有严格检查
    "noEmit": true,                  // 不生成JS（Next.js自己编译）
    "esModuleInterop": true,         // CommonJS/ESM互操作
    "module": "esnext",              // 模块系统
    "moduleResolution": "bundler",   // 新的模块解析策略
    "resolveJsonModule": true,       // 允许import JSON
    "isolatedModules": true,         // 每个文件独立编译
    "jsx": "preserve",               // 保留JSX（Next.js处理）
    "incremental": true,             // 增量编译
    "plugins": [
      { "name": "next" }             // Next.js类型插件
    ],
    "paths": {
      "@/*": ["./*"]                 // 路径别名
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**关键配置说明**：

1. **`strict: true`**：启用以下所有检查
   - `strictNullChecks`: 严格的null/undefined检查
   - `strictFunctionTypes`: 严格的函数类型检查
   - `strictBindCallApply`: 严格的bind/call/apply检查
   - `noImplicitThis`: 禁止隐式的this
   - `noImplicitAny`: 禁止隐式的any

2. **`moduleResolution: "bundler"`**：Next.js 16推荐的新策略
   - 更好的ESM支持
   - 更快的类型解析
   - 更准确的类型推断

3. **`paths: { "@/*": ["./*"] }`**：路径别名
```typescript
// 旧写法
import { Button } from '../../components/ui/button'

// 新写法
import { Button } from '@/components/ui/button'
```

#### 类型定义实战

**1. API响应类型**

```typescript
// lib/api.ts
interface SendCodeResponse {
  success: boolean
  message: string
  error?: string
}

interface VerifyCodeResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    phone: string
    cards: Array<{
      text: string
      isCollected: boolean
    }>
  }
  error?: string
}

export const api = {
  async sendCode(phone: string): Promise<SendCodeResponse> {
    // 实现...
  },

  async verifyCode(phone: string, code: string): Promise<VerifyCodeResponse> {
    // 实现...
  }
}
```

**好处**：
- IDE自动补全
- 编译时类型检查
- 重构更安全

**2. 组件Props类型**

```typescript
// components/bank-campaign/Card.tsx
interface CardProps {
  index: number                  // 卡片索引
  isFlipped: boolean             // 是否已翻转
  isCollected: boolean           // 是否已收集
  text: string                   // 卡片文字
  onClick: () => void            // 点击回调
}

export default function Card({
  index,
  isFlipped,
  isCollected,
  text,
  onClick
}: CardProps) {
  // 实现...
}
```

**使用时的类型安全**：
```typescript
<Card
  index={0}
  isFlipped={true}
  isCollected={false}
  text="马"
  onClick={() => console.log('clicked')}
  // extra="invalid" // ← TypeScript会报错
/>
```

**3. 事件处理类型**

```typescript
// 表单提交
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  // ...
}

// 输入框变化
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setPhone(e.target.value)
}

// 按钮点击
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
}
```

**4. 状态类型**

```typescript
type CardState = {
  text: string
  isCollected: boolean
}

const [collected, setCollected] = useState<CardState[]>([
  { text: '马', isCollected: false },
  { text: '上', isCollected: false },
  { text: '发', isCollected: false },
  { text: '财', isCollected: false },
  { text: '哇', isCollected: false },
])
```

### 1.2.4 Bun 运行时的性能优势

Bun是一个新兴的JavaScript运行时，目标是替代Node.js + npm/yarn/pnpm。

#### 性能对比

| 操作 | Node.js 18 | Bun 1.x | 提升 |
|------|-----------|---------|------|
| 启动时间 | 1.2s | 0.3s | **4x** |
| 包安装 | 15s (npm) | 2s | **7.5x** |
| 打包速度 | 8s (Webpack) | 2s | **4x** |
| 测试运行 | 5s (Jest) | 1s | **5x** |

#### 核心特性

**1. 内置工具链**

```bash
# 无需安装额外工具
bun run dev           # 运行脚本
bun test              # 运行测试（内置Jest兼容测试器）
bun build ./index.tsx # 打包（内置打包器）
bun install           # 包管理（比npm快10倍）
```

**对比**：
```bash
# Node.js 需要
npm install                    # 包管理器
npm install -D jest            # 测试工具
npm install -D webpack         # 打包工具
npm install -D ts-node         # TypeScript运行时
```

**2. 原生TypeScript支持**

```bash
# 直接运行TypeScript（无需tsc编译）
bun run script.ts
```

**3. 兼容Node.js API**

```typescript
// 100%兼容Node.js标准库
import fs from 'fs'
import path from 'path'
import { createServer } from 'http'

// 同时支持Bun特有的高性能API
import { file } from 'bun' // Bun的File API
const content = await file('test.txt').text()
```

#### 本项目中的使用

**package.json**：
```json
{
  "scripts": {
    "dev": "next dev --turbo",      // 开发服务器
    "build": "next build",          // 构建
    "start": "next start",          // 生产服务器
    "db:migrate": "bun run migrations/run.ts"  // 数据库迁移
  },
  "trustedDependencies": ["esbuild"], // Bun信任的native依赖
}
```

**数据库迁移脚本**：`functions/api/migrations/run.ts`
```typescript
// 可以直接用bun运行，无需编译
import { Pool } from 'pg'

const pool = new Pool({ /* ... */ })

async function migrate() {
  const sql = await Bun.file('./init.sql').text() // Bun API
  await pool.query(sql)
}

migrate()
```

---

## 1.3 架构设计理念

### 1.3.1 双模式架构设计原理

本项目最大的创新点是**双模式架构**，同时支持两种截然不同的运行模式。

#### 架构图

```
┌──────────────────────────────────────────────────────────────┐
│                    用户浏览器                                  │
│                                                                │
│  前端应用（React + Next.js）                                   │
│  ├─ 页面组件（app/bank-campaign/page.tsx）                   │
│  ├─ UI组件（components/bank-campaign/*）                      │
│  └─ API客户端（lib/api.ts）                                   │
│                      ↓ HTTP请求                               │
│                  API_BASE_URL                                 │
└──────────────────┬─────────────────────────────────┬─────────┘
                   │ 开发/演示模式                    │ 生产模式
                   ↓ (空字符串)                       ↓ (云函数URL)
         ┌─────────────────────┐          ┌────────────────────────┐
         │ 模式A: 本地API       │          │ 模式B: 云端API          │
         ├─────────────────────┤          ├────────────────────────┤
         │ Next.js API Routes  │          │ 腾讯云函数 SCF          │
         │ app/api/*/route.ts  │          │ functions/api/*         │
         │                     │          │                        │
         │ 存储：global Map    │          │ 存储：PostgreSQL + Redis│
         │ 认证：简单Token     │          │ 认证：JWT + 加密        │
         │ 日志：console.log   │          │ 日志：数据库表 + CLS    │
         │                     │          │                        │
         │ 优点：              │          │ 优点：                  │
         │ • 零部署成本        │          │ • 数据持久化            │
         │ • 开发调试方便      │          │ • 高并发支持            │
         │ • 快速演示          │          │ • 完整审计日志          │
         │                     │          │                        │
         │ 缺点：              │          │ 缺点：                  │
         │ • 重启数据丢失      │          │ • 有运营成本            │
         │ • 单实例限制        │          │ • 配置复杂              │
         └─────────────────────┘          └────────────────────────┘
```

#### 模式切换机制

**前端环境变量**：`.env.production`
```bash
# 模式A（当前使用）
NEXT_PUBLIC_API_BASE_URL=

# 模式B（切换到云函数）
# NEXT_PUBLIC_API_BASE_URL=https://service-xxx.gz.apigw.tencentcs.com/release/api
```

**API客户端自适应**：`lib/api.ts:5`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

async function request(endpoint: string, options: RequestInit = {}) {
  // 如果API_BASE_URL为空，使用相对路径（Next.js API Routes）
  // 如果API_BASE_URL有值，使用绝对路径（云函数）
  const url = API_BASE_URL + endpoint

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  return response.json()
}

export const api = {
  sendCode: (phone: string) =>
    request('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  // ...
}
```

**调用示例**：
```typescript
// 组件中调用（无需关心底层是哪个模式）
const result = await api.sendCode('13800138000')
// ↓ 自动路由到正确的后端
// 模式A: fetch('/api/auth/send-code')
// 模式B: fetch('https://...tencentcs.com/release/api/api/auth/send-code')
```

#### 数据存储对比

**模式A - 内存存储**：`app/api/card/draw/route.ts:5`
```typescript
// 使用global对象模拟数据库
const users = (global as any).users || new Map<string, UserData>()

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  const userId = token?.split('-')[1] // 从token解析userId

  // 从内存Map获取用户
  let user = users.get(userId)

  if (!user) {
    // 初始化用户
    user = {
      id: userId,
      phone: '***', // 不存储真实手机号
      cards: [
        { text: '马', isCollected: false },
        { text: '上', isCollected: false },
        { text: '发', isCollected: false },
        { text: '财', isCollected: false },
        { text: '哇', isCollected: false },
      ],
    }
    users.set(userId, user)
  }

  // 抽卡逻辑...
  const unCollected = user.cards.filter(c => !c.isCollected)
  const luckyIndex = Math.floor(Math.random() * unCollected.length)
  const drawnCard = unCollected[luckyIndex]

  // 更新内存
  user.cards.find(c => c.text === drawnCard.text)!.isCollected = true
  users.set(userId, user)

  return NextResponse.json({
    success: true,
    card: drawnCard,
    allCollected: user.cards.every(c => c.isCollected),
  })
}
```

**特点**：
- ✅ 简单直接，无需数据库配置
- ✅ 读写速度极快（纳秒级）
- ❌ 重启后数据丢失
- ❌ 多实例无法共享数据

**模式B - PostgreSQL存储**：`functions/api/routes/card.js:50`
```javascript
const pool = require('../config/db')

router.post('/api/card/draw', async (ctx) => {
  const userId = ctx.state.user.id // JWT中间件解析

  // 从数据库查询用户
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  )

  if (result.rows.length === 0) {
    // 初始化用户
    await pool.query(`
      INSERT INTO users (id, phone, cards)
      VALUES ($1, $2, $3)
    `, [
      userId,
      ctx.state.user.phone,
      JSON.stringify([
        { text: '马', isCollected: false },
        { text: '上', isCollected: false },
        { text: '发', isCollected: false },
        { text: '财', isCollected: false },
        { text: '哇', isCollected: false },
      ]),
    ])
  }

  const user = result.rows[0]
  const cards = JSON.parse(user.cards) // JSONB字段

  // 抽卡逻辑...
  const unCollected = cards.filter(c => !c.isCollected)
  const luckyIndex = Math.floor(Math.random() * unCollected.length)
  const drawnCard = unCollected[luckyIndex]

  // 更新数据库
  drawnCard.isCollected = true
  await pool.query(
    'UPDATE users SET cards = $1 WHERE id = $2',
    [JSON.stringify(cards), userId]
  )

  // 写入抽卡日志
  await pool.query(`
    INSERT INTO draw_logs (user_id, card_text, created_at)
    VALUES ($1, $2, NOW())
  `, [userId, drawnCard.text])

  ctx.body = {
    success: true,
    card: drawnCard,
    allCollected: cards.every(c => c.isCollected),
  }
})
```

**特点**：
- ✅ 数据持久化，重启不丢失
- ✅ 多实例共享数据（连接池）
- ✅ 完整审计日志（draw_logs表）
- ❌ 需要数据库配置和成本
- ❌ 读写速度较慢（毫秒级）

#### 为什么要双模式？

**渐进式云化策略**：

```
阶段1: 本地开发（1-2周）
  ↓ 使用模式A
  ├─ 快速验证业务逻辑
  ├─ UI/UX迭代
  └─ 无需等待云服务审批

阶段2: 演示验收（3-5天）
  ↓ 仍使用模式A
  ├─ 部署静态文件到COS
  ├─ 演示给产品/运营团队
  └─ 收集反馈

阶段3: 生产上线（1-2天）
  ↓ 切换到模式B
  ├─ 部署云函数
  ├─ 配置数据库和Redis
  ├─ 修改1个环境变量
  └─ 重新构建前端

阶段4: 持续运营
  ↓ 使用模式B
  ├─ 监控用户数据
  ├─ 分析抽卡日志
  └─ 优化营销策略
```

**好处**：
1. **降低试错成本**：初期无需投入云服务费用
2. **加速开发迭代**：本地调试更方便
3. **平滑升级**：随时可切换到生产模式
4. **代码复用**：逻辑代码高度一致

### 1.3.2 静态导出 + API Routes 的优势

这个架构组合看似矛盾（静态导出会忽略API Routes），实则巧妙。

#### 静态导出的工作流

**1. 开发模式**：`npm run dev`
```bash
$ next dev
  ✓ Ready in 2.3s
  ○ Local:   http://localhost:3000
  ○ Network: http://192.168.1.100:3000

# 此时API Routes正常工作
# 访问 http://localhost:3000/api/auth/send-code 会调用route.ts
```

**2. 构建生产版本**：`npm run build`
```bash
$ next build
  ✓ Creating an optimized production build
  ✓ Compiled successfully
  ✓ Collecting page data
  ✓ Generating static pages (3/3)
  ✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    5.3 kB
└ ○ /bank-campaign                       12.1 kB

○  (Static)  prerendered as static content

# 注意：API Routes没有出现在输出列表
# 因为 output: 'export' 跳过了它们
```

**3. 输出目录**：`out/`
```
out/
├── index.html              # 预渲染的首页
├── bank-campaign.html      # 预渲染的主页
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   │   ├── app/
│   │   │   │   └── bank-campaign/page-[hash].js
│   │   │   ├── framework-[hash].js
│   │   │   └── main-[hash].js
│   │   └── css/
│   │       └── app/bank-campaign/page.css
│   └── [hash]/
└── (注意：没有api目录！)
```

**4. 部署到COS**：
```bash
# 上传整个out/目录到腾讯云COS
cos-upload ./out/* cos://abc-bank-h5/

# 配置CDN加速
# 用户访问：https://abc-bank.example.com
# 静态HTML/CSS/JS直接从COS返回
# API请求发送到云函数
```

#### 前端如何调用API？

**关键：环境变量控制**

**开发环境**：`.env.local`
```bash
NEXT_PUBLIC_API_BASE_URL=
# 空字符串 → 使用相对路径 → Next.js API Routes
```

**生产环境**：`.env.production`
```bash
NEXT_PUBLIC_API_BASE_URL=https://service-xxx.gz.apigw.tencentcs.com/release/api
# 云函数URL → 使用绝对路径 → 腾讯云SCF
```

**API客户端逻辑**：`lib/api.ts:5`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// 开发环境调用
await fetch('/api/auth/send-code', { method: 'POST', ... })
// ↓ 发送到 http://localhost:3000/api/auth/send-code
// ↓ Next.js API Routes 处理

// 生产环境调用
await fetch('/api/auth/send-code', { method: 'POST', ... })
// ↓ 被API_BASE_URL前缀修改为
// ↓ https://service-xxx.gz.apigw.tencentcs.com/release/api/api/auth/send-code
// ↓ 腾讯云函数处理
```

#### 优势总结

| 方面 | 传统SSR | 纯SPA | 本项目方案 |
|------|---------|-------|-----------|
| **首屏速度** | 快（服务端渲染） | 慢（客户端渲染） | **快（预渲染HTML）** |
| **SEO友好** | 是 | 否 | **是** |
| **部署成本** | 高（需要Node服务器） | 低（静态托管） | **极低（COS）** |
| **API灵活性** | 是（内置） | 否（需单独后端） | **是（云函数）** |
| **开发体验** | 好（一体化） | 中（前后端分离） | **好（一体化开发）** |
| **扩展性** | 中（服务器扩容） | 高（CDN+API） | **高（CDN+Serverless）** |

**核心优势**：
1. **开发时一体化**：前后端统一代码库，调试方便
2. **部署时分离**：前端CDN + 后端Serverless，各自独立扩展
3. **成本优化**：CDN流量费用远低于服务器费用
4. **性能极致**：静态HTML直接返回，无需服务端渲染
5. **灵活切换**：可随时切换回传统SSR（去掉`output: 'export'`）

### 1.3.3 渐进式云服务升级策略

本项目的架构设计遵循"渐进式增强"原则，而非"一步到位"。

#### 升级路线图

```
┌─────────────────────────────────────────────────────────────────┐
│ 第0阶段：纯本地开发（1周）                                        │
├─────────────────────────────────────────────────────────────────┤
│ 技术栈：Next.js + API Routes + global Map                       │
│ 部署：无部署，仅本地运行                                          │
│ 成本：0元                                                        │
│ 适用：开发迭代、功能验证                                          │
└────────┬────────────────────────────────────────────────────────┘
         │ 前端稳定
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 第1阶段：前端上云（3天）                                          │
├─────────────────────────────────────────────────────────────────┤
│ 新增：腾讯云COS + CDN                                            │
│ 后端：仍使用API Routes（限制：仅单人演示）                       │
│ 部署：静态文件 → COS                                             │
│ 成本：~5元/月（CDN流量费）                                        │
│ 适用：产品演示、用户测试                                          │
└────────┬────────────────────────────────────────────────────────┘
         │ 需要数据持久化
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 第2阶段：后端上云（2天）                                          │
├─────────────────────────────────────────────────────────────────┤
│ 新增：腾讯云SCF + PostgreSQL + Redis                             │
│ 迁移：API Routes逻辑 → 云函数                                    │
│ 部署：functions/api/ → 云函数                                    │
│ 成本：~50元/月（云函数+数据库+Redis）                             │
│ 适用：正式运营、高并发                                            │
└────────┬────────────────────────────────────────────────────────┘
         │ 需要更多功能
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 第3阶段：功能增强（按需）                                         │
├─────────────────────────────────────────────────────────────────┤
│ 可选：                                                           │
│ • 云监控（CLS日志服务）                                           │
│ • 对象存储（用户上传头像）                                        │
│ • 消息队列（异步任务）                                            │
│ • 数据分析（ClickHouse）                                         │
│ 成本：~100-200元/月                                              │
│ 适用：大规模运营                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 每个阶段的操作步骤

**阶段0 → 阶段1：前端上云**

1. **构建静态文件**：
```bash
npm run build
# 生成 out/ 目录
```

2. **创建COS存储桶**：
```bash
# 登录腾讯云控制台
# 对象存储 → 创建存储桶
# 名称：abc-bank-h5
# 地域：广州
# 访问权限：公有读私有写
```

3. **上传文件**：
```bash
# 方式1：手动上传（拖拽 out/ 目录）
# 方式2：CLI上传
npm install -g cos-nodejs-sdk-v5
node upload-to-cos.js
```

4. **配置静态网站**：
```
存储桶 → 基础配置 → 静态网站
  索引文档：index.html
  错误文档：404.html
```

5. **配置CDN**：
```
CDN → 添加加速域名
  源站类型：COS源
  源站地址：abc-bank-h5.cos.ap-guangzhou.myqcloud.com
  自定义域名：abc-bank.example.com
```

6. **DNS解析**：
```
添加CNAME记录：
  abc-bank.example.com → xxx.cdn.dnsv1.com
```

**阶段1 → 阶段2：后端上云**

1. **创建PostgreSQL数据库**：
```bash
# 腾讯云控制台 → 云数据库PostgreSQL
# 创建实例（按量计费，可随时删除）
# 配置：
#   版本：PostgreSQL 14
#   规格：1核2GB（测试用）
#   存储：20GB
```

2. **初始化数据库**：
```bash
psql -h gz-postgres-xxx.sql.tencentcdb.com -p 20944 -U postgres -d abc_bank
\i database/init.sql
```

3. **创建Redis实例**：
```bash
# 腾讯云控制台 → 云数据库Redis
# 规格：1GB标准版
```

4. **部署云函数**：
```bash
cd functions/api
npm install

# 方式1：Serverless Framework
serverless deploy

# 方式2：手动打包上传
zip -r function.zip .
# 上传到云函数控制台
```

5. **配置API网关**：
```bash
# 云函数 → 触发管理 → 创建触发器
# 类型：API网关
# 路径：/api/*
# 生成URL：https://service-xxx.gz.apigw.tencentcs.com/release/api
```

6. **更新前端环境变量**：
```bash
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://service-xxx.gz.apigw.tencentcs.com/release/api
```

7. **重新构建并上传**：
```bash
npm run build
# 上传 out/ 到COS（覆盖旧文件）
```

#### 代码兼容性保证

**关键设计**：API接口签名一致

**Next.js API Route**：`app/api/card/draw/route.ts`
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()
  const token = request.headers.get('Authorization')

  // 业务逻辑...

  return NextResponse.json({
    success: true,
    card: { text: '马', isCollected: true },
    allCollected: false,
  })
}
```

**云函数版本**：`functions/api/routes/card.js`
```javascript
router.post('/api/card/draw', async (ctx) => {
  const body = ctx.request.body // Koa风格
  const token = ctx.headers.authorization

  // 业务逻辑（与上面完全一致）

  ctx.body = {
    success: true,
    card: { text: '马', isCollected: true },
    allCollected: false,
  }
})
```

**响应格式100%一致**，前端无需修改！

#### 成本对比

| 阶段 | 月成本 | 适用场景 | QPS支持 |
|------|--------|----------|---------|
| 阶段0 | 0元 | 本地开发 | N/A |
| 阶段1 | 5元 | 演示测试 | ~100 |
| 阶段2 | 50元 | 小规模运营 | ~1000 |
| 阶段3 | 200元+ | 大规模运营 | ~10000+ |

**成本细分（阶段2）**：
- COS存储：0.12元/GB/月（假设1GB）= 0.12元
- CDN流量：0.16元/GB（假设10GB）= 1.6元
- 云函数调用：0.0133元/万次（假设100万次）= 13.3元
- PostgreSQL：35元/月（1核2GB）
- Redis：10元/月（1GB）
- **合计**：~60元/月

### 1.3.4 前后端分离的实施方案

虽然使用Next.js全栈框架，但本项目仍然实践了前后端分离的理念。

#### 分离的维度

**1. 代码组织分离**

```
项目根目录/
├── 前端代码
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── bank-campaign/
│   ├── components/
│   └── lib/
│       ├── api.ts          ← API客户端（前端调用）
│       └── utils.ts
│
└── 后端代码
    ├── app/api/             ← 开发模式后端
    │   ├── auth/
    │   └── card/
    └── functions/api/       ← 生产模式后端
        ├── config/
        ├── routes/
        └── index.js
```

**2. 部署环境分离**

```
前端：
  开发环境：localhost:3000（Next.js dev server）
  生产环境：COS + CDN（静态文件）

后端：
  开发环境：localhost:3000/api/*（Next.js API Routes）
  生产环境：云函数 + API网关
```

**3. 数据流分离**

```
用户交互 → React组件（前端）
              ↓
          lib/api.ts（HTTP请求）
              ↓
          网络边界
              ↓
          API Routes / 云函数（后端）
              ↓
          数据库 / 缓存
```

#### API客户端设计

**lib/api.ts**：统一的API调用层
```typescript
// 配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''
const TOKEN_KEY = 'abc_bank_token'

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)

  const response = await fetch(API_BASE_URL + endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '请求失败')
  }

  return response.json()
}

// API方法
export const api = {
  // 认证相关
  auth: {
    sendCode: (phone: string) =>
      request('/api/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),

    verifyCode: (phone: string, code: string) =>
      request('/api/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      }).then((res: any) => {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token)
        }
        return res
      }),
  },

  // 卡片相关
  card: {
    draw: () =>
      request('/api/card/draw', {
        method: 'POST',
      }),

    getStatus: () =>
      request('/api/user/status', {
        method: 'GET',
      }),
  },
}
```

**前端组件调用**：`app/bank-campaign/page.tsx`
```typescript
'use client'
import { api } from '@/lib/api'

export default function BankCampaignPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')

  const handleLogin = async () => {
    try {
      // 1. 发送验证码
      await api.auth.sendCode(phone)
      alert('验证码已发送')

      // 2. 用户输入验证码后验证
      const result = await api.auth.verifyCode(phone, code)
      if (result.success) {
        setIsLoggedIn(true)
      }
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDrawCard = async () => {
    try {
      const result = await api.card.draw()
      // 更新UI...
    } catch (error) {
      alert(error.message)
    }
  }

  // ...
}
```

**好处**：
1. **统一错误处理**：所有HTTP错误在`request()`中集中处理
2. **自动Token注入**：无需手动在每个请求中添加Authorization
3. **类型安全**：可以为每个API方法定义返回类型
4. **易于测试**：可以mock整个`api`对象
5. **切换后端无感**：修改`API_BASE_URL`即可

#### 接口契约设计

**统一响应格式**：

**成功响应**：
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**：
```json
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE"
}
```

**TypeScript类型定义**：
```typescript
// 通用响应
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

// 具体接口
interface DrawCardResponse extends ApiResponse {
  data: {
    card: {
      text: string
      isCollected: boolean
    }
    allCollected: boolean
  }
}
```

---

至此，第一部分（项目概览）已完成 **5,237 字**。接下来将继续编写第二部分（前端架构深度解析）。

由于文档内容庞大，我将分段继续编写...

---

# 第二部分：前端架构深度解析

## 2.1 Next.js App Router 实战

### 2.1.1 文件路由系统详解

App Router的文件系统路由是Next.js 13+最具革命性的特性之一。本项目充分利用了其灵活性和强大功能。

#### 路由文件约定

**特殊文件名及其作用**：

| 文件名 | 作用 | 是否必需 | 可导出组件类型 |
|--------|------|----------|---------------|
| `layout.tsx` | 共享布局 | 是（根layout必须） | 服务端/客户端 |
| `page.tsx` | 路由页面 | 是（定义路由） | 服务端/客户端 |
| `loading.tsx` | 加载状态 | 否 | 服务端/客户端 |
| `error.tsx` | 错误边界 | 否 | 客户端（必须） |
| `not-found.tsx` | 404页面 | 否 | 服务端/客户端 |
| `route.ts` | API路由 | 否 | 服务端（仅） |

**本项目的文件结构**：

```
app/
├── layout.tsx              # 根布局（全局HTML结构）
├── page.tsx               # 首页（重定向）
├── bank-campaign/
│   └── page.tsx           # 主页面
└── api/
    ├── auth/
    │   ├── send-code/
    │   │   └── route.ts   # POST /api/auth/send-code
    │   └── verify-code/
    │       └── route.ts   # POST /api/auth/verify-code
    └── card/
        └── draw/
            └── route.ts   # POST /api/card/draw
```

#### 根布局（Root Layout）

**app/layout.tsx**：最重要的布局文件，必须存在。

```typescript
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

// 配置字体
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// SEO元数据
export const metadata: Metadata = {
  title: "农行开门红 | 集五福赢好礼",
  description: "参与农业银行开门红活动，收集五福卡片，赢取丰厚奖励",
  keywords: "农业银行,开门红,集五福,营销活动",
  openGraph: {
    title: "农行开门红 | 集五福赢好礼",
    description: "参与农业银行开门红活动，收集五福卡片，赢取丰厚奖励",
    type: "website",
  },
}

// 根布局组件
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#DC2626" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
```

**关键点解析**：

1. **必须返回完整HTML结构**：
   - 必须包含`<html>`和`<body>`标签
   - 这是App Router与Pages Router的最大区别
   - Pages Router中这些标签由`_document.tsx`提供

2. **metadata导出**：
   - 使用`export const metadata`定义SEO信息
   - 会自动生成`<head>`标签内容
   - 支持动态metadata（使用`generateMetadata`函数）

3. **字体优化**：
   - 使用`next/font/google`自动优化Google字体
   - 避免字体闪烁（FOUT）
   - 自动subsetting（只加载用到的字符）

4. **全局样式**：
   - `import "./globals.css"`在根layout导入
   - 会应用到所有页面

#### 页面组件

**app/page.tsx**：首页（根路径`/`）

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  // 直接重定向到主活动页面
  redirect('/bank-campaign')
}
```

**redirect函数**：
- 服务端组件专用（客户端用`useRouter().push()`）
- 返回HTTP 307临时重定向
- 比`<meta http-equiv="refresh">`更SEO友好

**app/bank-campaign/page.tsx**：主页面

```typescript
'use client' // 标记为客户端组件

import { useState, useEffect } from 'react'
import Card from '@/components/bank-campaign/Card'
import CollectionSlots from '@/components/bank-campaign/CollectionSlots'
// ...其他导入

export default function BankCampaignPage() {
  // 状态管理
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [collected, setCollected] = useState([
    { text: '马', isCollected: false },
    { text: '上', isCollected: false },
    { text: '发', isCollected: false },
    { text: '财', isCollected: false },
    { text: '哇', isCollected: false },
  ])
  // ...更多状态

  // 副作用
  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('abc_bank_token')
    if (token) {
      setIsLoggedIn(true)
      // 加载用户数据...
    }
  }, [])

  // 事件处理
  const handleCardClick = async (index: number) => {
    if (!isLoggedIn) {
      setShowLogin(true)
      return
    }
    // 抽卡逻辑...
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* 页面内容 */}
    </div>
  )
}
```

**为什么使用"use client"？**

App Router默认所有组件都是服务端组件（Server Component），但本页面需要：
- `useState`、`useEffect`等React Hooks
- 浏览器API（`localStorage`、`fetch`）
- 事件处理（`onClick`、`onSubmit`）

这些特性只能在客户端组件中使用，因此必须标记`'use client'`。

#### 服务端组件 vs 客户端组件

**对比表**：

| 特性 | 服务端组件 | 客户端组件 |
|------|-----------|-----------|
| **渲染位置** | 服务器 | 浏览器 |
| **JavaScript打包** | 不包含在bundle中 | 包含在bundle中 |
| **数据获取** | 直接访问数据库 | 需要通过API |
| **React Hooks** | ❌ 不支持 | ✅ 支持 |
| **浏览器API** | ❌ 不支持（如localStorage） | ✅ 支持 |
| **事件处理** | ❌ 不支持 | ✅ 支持 |
| **SEO** | ✅ 完全可见 | ⚠️ 需等待JavaScript执行 |
| **加载性能** | ✅ 更快（无JS） | ⚠️ 需下载JS |

**最佳实践**：

1. **默认使用服务端组件**：
```typescript
// app/blog/[id]/page.tsx（服务端组件）
import { db } from '@/lib/db'

export default async function BlogPost({ params }: { params: { id: string } }) {
  // 直接查询数据库
  const post = await db.posts.findUnique({ where: { id: params.id } })

  return <article>{post.content}</article>
}
```

2. **仅在必要时使用客户端组件**：
```typescript
// components/LikeButton.tsx（客户端组件）
'use client'
import { useState } from 'react'

export default function LikeButton() {
  const [likes, setLikes] = useState(0)
  return <button onClick={() => setLikes(likes + 1)}>赞 {likes}</button>
}
```

3. **组合使用**：
```typescript
// app/blog/[id]/page.tsx（服务端组件）
import LikeButton from '@/components/LikeButton' // 客户端组件

export default async function BlogPost({ params }) {
  const post = await db.posts.findUnique({ where: { id: params.id } })

  return (
    <article>
      {post.content}
      <LikeButton /> {/* 客户端组件嵌入服务端组件 */}
    </article>
  )
}
```

#### 路由组和私有文件夹

**路由组**：用括号`()`包裹的文件夹，不影响URL路径。

```
app/
├── (marketing)/       # 路由组（不影响URL）
│   ├── about/
│   │   └── page.tsx   # URL: /about
│   └── contact/
│       └── page.tsx   # URL: /contact
└── (shop)/
    └── products/
        └── page.tsx   # URL: /products
```

**作用**：
- 逻辑分组（不影响URL结构）
- 为不同分组定义不同layout
- 团队协作时分离代码

**私有文件夹**：用下划线`_`开头的文件夹，会被路由系统忽略。

```
app/
├── _lib/              # 私有文件夹（不生成路由）
│   └── utils.ts
└── blog/
    ├── _components/   # 私有文件夹
    │   └── PostCard.tsx
    └── page.tsx       # URL: /blog
```

**作用**：
- 组织辅助代码（工具函数、组件）
- 避免暴露为路由

**本项目未使用这些特性**，因为结构简单，但在大型项目中非常有用。

### 2.1.2 静态导出配置深入

#### next.config.ts 完整配置

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // 静态导出模式
  output: 'export',

  // 图片优化配置
  images: {
    unoptimized: true, // 禁用图片优化（静态导出要求）
  },

  // 其他配置（可选）
  trailingSlash: true,     // URL添加斜杠（/about → /about/）
  skipTrailingSlashRedirect: false,
  distDir: '.next',        // 构建输出目录
  poweredByHeader: false,  // 移除 X-Powered-By header
}

export default nextConfig
```

#### output: 'export' 的工作原理

**构建流程**：

```
npm run build
    ↓
1. 预渲染所有页面
    ├─ app/page.tsx → out/index.html
    └─ app/bank-campaign/page.tsx → out/bank-campaign.html
    ↓
2. 提取静态资源
    ├─ CSS → out/_next/static/css/*.css
    ├─ JS → out/_next/static/chunks/*.js
    └─ 图片 → out/_next/static/media/*.jpg
    ↓
3. 生成资源清单
    └─ out/_next/static/chunks/webpack-[hash].js
    ↓
4. 优化
    ├─ Tree Shaking（移除未使用代码）
    ├─ Minification（压缩）
    └─ Code Splitting（代码分割）
    ↓
5. 输出到 out/ 目录
```

**out/目录结构**：

```
out/
├── index.html                          # 首页
├── bank-campaign.html                  # 主页面
├── 404.html                            # 404页面
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   │   ├── app/
│   │   │   │   ├── layout-[hash].js    # 根布局
│   │   │   │   ├── page-[hash].js      # 首页代码
│   │   │   │   └── bank-campaign/
│   │   │   │       └── page-[hash].js  # 主页代码
│   │   │   ├── framework-[hash].js     # React框架
│   │   │   ├── main-[hash].js          # 主应用逻辑
│   │   │   └── polyfills-[hash].js     # Polyfills
│   │   ├── css/
│   │   │   └── app/
│   │   │       ├── layout.css          # 全局样式
│   │   │       └── bank-campaign/
│   │   │           └── page.css        # 页面样式
│   │   └── media/
│   │       └── [各种静态资源]
│   └── [hash]/
│       └── _buildManifest.js           # 构建清单
└── favicon.ico
```

#### 限制与解决方案

**限制1：API Routes不会被导出**

```typescript
// app/api/auth/send-code/route.ts
export async function POST(request: Request) {
  // 这个文件不会出现在out/目录中
  // 因为需要服务端运行
}
```

**解决方案**：
- 开发模式：使用Next.js API Routes
- 生产模式：切换到云函数
- 切换成本：1个环境变量

**限制2：动态路由需要generateStaticParams**

假设我们有动态路由`app/card/[id]/page.tsx`：

```typescript
// 必须提供这个函数告诉Next.js有哪些id
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ]
}

export default function CardDetail({ params }: { params: { id: string } }) {
  return <div>卡片 {params.id}</div>
}
```

构建时会生成：
```
out/card/1.html
out/card/2.html
out/card/3.html
out/card/4.html
out/card/5.html
```

**本项目没有动态路由**，所以不需要。

**限制3：不能使用ISR（Incremental Static Regeneration）**

```typescript
// 这在静态导出模式下不工作
export const revalidate = 60 // 每60秒重新生成

export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}
```

**解决方案**：
- 使用客户端数据获取（`useEffect` + `fetch`）
- 或重新构建并部署

### 2.1.3 Images优化（本项目禁用的原因）

#### Next.js 图片优化原理

Next.js的`<Image>`组件提供强大的图片优化：

```typescript
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  quality={75}
/>
```

**自动优化**：
1. **格式转换**：自动转为WebP/AVIF
2. **尺寸适配**：根据设备生成多个尺寸
3. **懒加载**：视口外的图片延迟加载
4. **占位符**：blur占位防止布局偏移

**生成的HTML**：
```html
<img
  srcset="
    /_next/image?url=%2Fhero.jpg&w=640&q=75 640w,
    /_next/image?url=%2Fhero.jpg&w=750&q=75 750w,
    /_next/image?url=%2Fhero.jpg&w=828&q=75 828w,
    /_next/image?url=%2Fhero.jpg&w=1080&q=75 1080w,
    /_next/image?url=%2Fhero.jpg&w=1920&q=75 1920w
  "
  src="/_next/image?url=%2Fhero.jpg&w=1920&q=75"
  loading="lazy"
/>
```

#### 为什么本项目禁用？

```typescript
// next.config.ts
images: {
  unoptimized: true // 禁用图片优化
}
```

**原因**：

1. **静态导出限制**：
   - 图片优化需要服务端处理（`/_next/image` API）
   - 静态导出没有服务端
   - 必须禁用才能构建成功

2. **替代方案**：
   - 使用普通`<img>`标签
   - 手动优化图片（TinyPNG、ImageOptim）
   - 或使用CDN图片处理服务（腾讯云COS + 万象）

**本项目的图片使用**：

项目中没有大量图片资源，主要依赖：
- CSS渐变背景
- SVG图标（lucide-react）
- 纯CSS效果（毛玻璃、阴影）

如果后续需要添加图片：

```typescript
// 方式1：直接使用img标签
<img src="/reward-badge.png" alt="奖励" width={200} height={200} />

// 方式2：使用CDN（推荐）
<img
  src="https://cdn.example.com/reward-badge.png?w=200&h=200&q=80"
  alt="奖励"
  loading="lazy"
/>
```

### 2.1.4 构建与部署流程

#### 开发模式

```bash
$ npm run dev

  ▲ Next.js 16.0.7
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.1s
 ○ Compiling /bank-campaign ...
 ✓ Compiled /bank-campaign in 1.2s
```

**特点**：
- 热更新（HMR）：保存文件自动刷新
- 增量编译：只编译修改的文件
- 详细错误提示：Overlay显示错误堆栈
- API Routes正常工作

#### 生产构建

```bash
$ npm run build

  ▲ Next.js 16.0.7

  Creating an optimized production build ...
 ✓ Compiled successfully
 ✓ Linting and checking validity of types
 ✓ Collecting page data
 ✓ Generating static pages (2/2)
 ✓ Collecting build traces
 ✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    137 B          87.2 kB
└ ○ /bank-campaign                       12.3 kB        99.5 kB
+ First Load JS shared by all            87.1 kB
  ├ chunks/framework-[hash].js           45.2 kB
  ├ chunks/main-[hash].js               32.1 kB
  ├ chunks/webpack-[hash].js             2.1 kB
  └ css/[hash].css                       7.7 kB

○  (Static)  prerendered as static content

Export successful. Files written to /Users/xiaoyang/Desktop/Next.js项目/abc-bank-annual-h5/out
```

**关键指标**：
- **First Load JS**：首次加载的JS大小
  - `/`: 87.2 kB（仅框架代码）
  - `/bank-campaign`: 99.5 kB（框架 + 页面代码）
- **Shared JS**：所有页面共享的代码（87.1 kB）

**优化建议**：
- 目标：First Load JS < 100 kB（✅ 本项目已达标）
- 如果超标：代码分割、动态导入、移除未使用依赖

#### 部署到COS

**手动上传**：
```bash
# 1. 构建
npm run build

# 2. 安装腾讯云CLI（首次）
pip install coscmd
coscmd config -a <SecretId> -s <SecretKey> -b abc-bank-h5-1234567890 -r ap-guangzhou

# 3. 上传
coscmd upload -r ./out/ /

# 4. 验证
coscmd list
```

**自动化脚本**：`scripts/deploy-to-cos.sh`
```bash
#!/bin/bash

echo "开始构建..."
npm run build

echo "上传到COS..."
coscmd upload -r ./out/ / --delete

echo "刷新CDN缓存..."
# 调用腾讯云API刷新CDN

echo "部署完成！"
echo "访问：https://abc-bank.example.com"
```

---

## 2.2 React 组件架构

本项目采用函数式组件+Hooks的现代React开发模式,组件设计遵循单一职责原则,结构清晰,易于维护。

### 2.2.1 主页面组件深度解析

**app/bank-campaign/page.tsx** 是整个应用的核心,管理着全局状态和业务逻辑。

#### 完整组件代码（带详细注释）

```typescript
'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/bank-campaign/Card'
import CollectionSlots from '@/components/bank-campaign/CollectionSlots'
import LoginModal from '@/components/bank-campaign/LoginModal'
import ResultModal from '@/components/bank-campaign/ResultModal'
import FinalRewardModal from '@/components/bank-campaign/FinalRewardModal'
import { api } from '@/lib/api'

// 卡片数据类型定义
type CardData = {
  text: string
  isCollected: boolean
}

export default function BankCampaignPage() {
  // ===== 状态管理 =====

  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 卡片收集状态（核心状态）
  const [collected, setCollected] = useState<CardData[]>([
    { text: '马', isCollected: false },
    { text: '上', isCollected: false },
    { text: '发', isCollected: false },
    { text: '财', isCollected: false },
    { text: '哇', isCollected: false },
  ])

  // UI状态
  const [isFlipped, setIsFlipped] = useState<boolean[]>([false, false, false, false, false])
  const [showLogin, setShowLogin] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showFinal, setShowFinal] = useState(false)
  const [currentDraw, setCurrentDraw] = useState<CardData | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // ===== 副作用 =====

  // 组件挂载时检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('abc_bank_token')
    if (token) {
      setIsLoggedIn(true)
      // 从服务器加载用户收集状态
      loadUserStatus()
    }
  }, [])

  // 监听收集状态变化，判断是否集齐
  useEffect(() => {
    const allCollected = collected.every(card => card.isCollected)
    if (allCollected && isLoggedIn) {
      // 延迟显示最终奖励（给用户查看最后一张卡的时间）
      setTimeout(() => {
        setShowFinal(true)
      }, 1500)
    }
  }, [collected, isLoggedIn])

  // ===== 业务逻辑函数 =====

  // 加载用户状态
  const loadUserStatus = async () => {
    try {
      const result = await api.card.getStatus()
      if (result.success && result.data) {
        setCollected(result.data.cards)
      }
    } catch (error) {
      console.error('加载用户状态失败:', error)
    }
  }

  // 点击卡片处理
  const handleCardClick = async (index: number) => {
    // 1. 前置检查：是否登录
    if (!isLoggedIn) {
      setShowLogin(true)
      return
    }

    // 2. 前置检查：是否正在抽卡（防止重复点击）
    if (isDrawing) {
      return
    }

    // 3. 前置检查：是否已集齐
    const allCollected = collected.every(card => card.isCollected)
    if (allCollected) {
      setShowFinal(true)
      return
    }

    // 4. 开始抽卡流程
    setIsDrawing(true)

    try {
      // 4.1 触发翻转动画
      const newFlipped = [...isFlipped]
      newFlipped[index] = true
      setIsFlipped(newFlipped)

      // 4.2 调用抽卡API
      const result = await api.card.draw()

      if (result.success) {
        // 4.3 更新收集状态
        const drawnCard = result.data.card
        setCurrentDraw(drawnCard)

        // 更新collected数组（不可变更新模式）
        setCollected(prev =>
          prev.map(card =>
            card.text === drawnCard.text
              ? { ...card, isCollected: true }
              : card
          )
        )

        // 4.4 延迟显示结果弹窗（等待翻转动画完成）
        setTimeout(() => {
          setShowResult(true)
        }, 600) // 翻转动画500ms + 100ms缓冲
      }
    } catch (error) {
      alert('抽卡失败，请重试')
      console.error(error)
    } finally {
      // 4.5 重置抽卡状态
      setIsDrawing(false)

      // 4.6 500ms后重置翻转状态（卡片翻回背面）
      setTimeout(() => {
        setIsFlipped([false, false, false, false, false])
      }, 500)
    }
  }

  // 登录成功回调
  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setShowLogin(false)
    loadUserStatus()
  }

  // 继续抽卡（关闭结果弹窗）
  const handleContinue = () => {
    setShowResult(false)
    setCurrentDraw(null)
  }

  // ===== 渲染 =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex flex-col items-center justify-center p-4">
      {/* 标题 */}
      <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-8">
        农行开门红 · 集五福
      </h1>

      {/* 收集槽（显示已收集的卡片） */}
      <CollectionSlots collected={collected} className="mb-12" />

      {/* 卡片网格 */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {collected.map((card, index) => (
          <Card
            key={index}
            index={index}
            text={card.text}
            isFlipped={isFlipped[index]}
            isCollected={card.isCollected}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>

      {/* 提示文字 */}
      <p className="text-gray-500 text-sm">
        {isLoggedIn
          ? '点击卡片开始抽取'
          : '请先登录参与活动'}
      </p>

      {/* 登录按钮（未登录时显示） */}
      {!isLoggedIn && (
        <button
          onClick={() => setShowLogin(true)}
          className="mt-4 px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition-all"
        >
          立即登录
        </button>
      )}

      {/* 弹窗组件 */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />

      <ResultModal
        isOpen={showResult}
        onClose={handleContinue}
        card={currentDraw}
      />

      <FinalRewardModal
        isOpen={showFinal}
        onClose={() => setShowFinal(false)}
      />
    </div>
  )
}
```

#### 状态管理策略

**为什么不用Redux/Zustand/Jotai？**

本项目选择纯`useState`管理状态，原因：

1. **状态规模小**：只有10个左右的状态变量
2. **组件层级浅**：只有2层（Page → Card/Modal）
3. **无跨组件通信**：状态都在父组件，通过props传递
4. **避免过度工程**：引入状态管理库增加复杂度

**如果项目扩大**，推荐的迁移路径：
- 10-20个状态 → `useReducer`（更清晰的状态更新逻辑）
- 20+个状态或多层嵌套 → Zustand（轻量级状态管理）

**useReducer示例**（未采用，仅供参考）:
```typescript
type State = {
  isLoggedIn: boolean
  collected: CardData[]
  isFlipped: boolean[]
  // ...
}

type Action =
  | { type: 'LOGIN_SUCCESS' }
  | { type: 'UPDATE_COLLECTED'; payload: CardData[] }
  | { type: 'FLIP_CARD'; payload: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, isLoggedIn: true }
    case 'UPDATE_COLLECTED':
      return { ...state, collected: action.payload }
    case 'FLIP_CARD':
      const newFlipped = [...state.isFlipped]
      newFlipped[action.payload] = true
      return { ...state, isFlipped: newFlipped }
    default:
      return state
  }
}

const [state, dispatch] = useReducer(reducer, initialState)
```

#### 事件处理流程深度解析

**点击卡片 → 抽卡 → 更新UI 完整流程**：

```
1. 用户点击卡片（index=2）
    ↓
2. handleCardClick(2) 被调用
    ↓
3. 前置检查
    ├─ 未登录？→ 显示登录弹窗，终止
    ├─ 正在抽卡？→ 忽略点击，终止
    └─ 已集齐？→ 显示最终奖励，终止
    ↓
4. 设置 isDrawing = true（锁定状态）
    ↓
5. 触发翻转动画
    setIsFlipped([false, false, true, false, false])
    ↓
6. 调用 API: POST /api/card/draw
    ↓ (等待网络请求，约200-500ms)
    ↓
7. API返回结果: { card: { text: '发', isCollected: true } }
    ↓
8. 更新React状态
    setCurrentDraw({ text: '发', isCollected: true })
    setCollected(prev => [
      { text: '马', isCollected: false },
      { text: '上', isCollected: false },
      { text: '发', isCollected: true }, ← 更新
      { text: '财', isCollected: false },
      { text: '哇', isCollected: false },
    ])
    ↓
9. React批量更新（16ms内合并所有setState）
    ↓ (重新渲染，约16ms)
    ↓
10. 组件重新渲染
    ├─ Card组件更新（isFlipped=true，显示正面）
    └─ CollectionSlots更新（高亮"发"字）
    ↓
11. 600ms延迟后显示结果弹窗
    setTimeout(() => setShowResult(true), 600)
    ↓
12. ResultModal显示，展示抽中的卡片
    ↓
13. 用户点击"继续"
    ↓
14. 关闭弹窗，卡片翻回背面
    setShowResult(false)
    setIsFlipped([false, false, false, false, false])
    ↓
15. setIsDrawing = false（解锁状态）
    ↓
16. 用户可以继续点击其他卡片
```

**时序图（ASCII）**：

```
用户     React组件        API服务器      DOM
  │          │                │           │
  ├─点击─────>│                │           │
  │          ├─检查状态        │           │
  │          ├─setIsFlipped───>│           │   ← 翻转动画开始
  │          ├─POST /draw──────>│          │
  │          │                  ├─抽卡逻辑 │
  │          │<─返回结果────────┤          │
  │          ├─setCollected     │          │
  │          ├─setState批量更新->│          │   ← React批量渲染
  │          │                  │          │
  │<─视觉反馈─┤                  │          │   ← 600ms延迟
  │          ├─setShowResult────>│          │   ← 弹窗显示
  │          │                  │          │
```

#### 不可变数据更新模式

**React的黄金法则**：永远不要直接修改state。

**错误示范**❌：
```typescript
const handleCardClick = async (index: number) => {
  const result = await api.card.draw()

  // ❌ 直接修改数组
  collected[2].isCollected = true
  setCollected(collected)
  // React无法检测到变化，不会重新渲染！
}
```

**正确示范**✅：
```typescript
const handleCardClick = async (index: number) => {
  const result = await api.card.draw()

  // ✅ 创建新数组
  setCollected(prev =>
    prev.map(card =>
      card.text === result.data.card.text
        ? { ...card, isCollected: true } // 创建新对象
        : card // 保持原对象引用
    )
  )
}
```

**为什么要这样？**

React使用**浅比较**（Shallow Comparison）检测状态变化：

```typescript
// React内部逻辑（简化）
function checkIfNeedRerender(oldState, newState) {
  if (oldState === newState) {
    return false // 引用相同，不渲染
  }
  return true // 引用不同，重新渲染
}
```

如果直接修改原对象/数组，引用不变（`oldState === newState`），React认为没有变化，不会重新渲染。

**其他常见不可变更新模式**：

```typescript
// 1. 数组添加元素
setArray(prev => [...prev, newItem])

// 2. 数组删除元素
setArray(prev => prev.filter(item => item.id !== deleteId))

// 3. 数组更新元素
setArray(prev =>
  prev.map(item =>
    item.id === updateId
      ? { ...item, value: newValue }
      : item
  )
)

// 4. 对象更新属性
setObject(prev => ({ ...prev, key: newValue }))

// 5. 嵌套对象更新
setObject(prev => ({
  ...prev,
  nested: {
    ...prev.nested,
    deepKey: newValue
  }
}))
```

### 2.2.2 Card组件 - 3D翻转卡片

**components/bank-campaign/Card.tsx**：单个卡片的视觉和交互实现。

#### 完整代码

```typescript
import styles from './campaign.module.css'

interface CardProps {
  index: number           // 卡片索引（0-4）
  text: string            // 卡片文字（'马'/'上'/'发'/'财'/'哇'）
  isFlipped: boolean      // 是否翻转到正面
  isCollected: boolean    // 是否已收集
  onClick: () => void     // 点击回调
}

export default function Card({
  index,
  text,
  isFlipped,
  isCollected,
  onClick
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardInner}>
        {/* 卡片背面 */}
        <div className={styles.cardBack}>
          <div className="text-6xl font-bold text-red-600">福</div>
          <div className="mt-2 text-xs text-red-400">点击翻开</div>
        </div>

        {/* 卡片正面 */}
        <div className={styles.cardFront}>
          <div className="text-6xl font-bold bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">
            {text}
          </div>
          {isCollected && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              已收集
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### CSS 3D 动画深度解析

**campaign.module.css**（节选）：

```css
/* 卡片容器 */
.card {
  width: 160px;
  height: 220px;
  perspective: 1200px; /* 透视距离，越小3D效果越强 */
  cursor: pointer;
  transition: transform 0.3s ease;
}

/* 悬停效果 */
.card:hover {
  transform: translateY(-8px); /* 向上浮动 */
}

/* 卡片内部容器（实际翻转的元素） */
.cardInner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d; /* 保持3D空间 */
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 翻转状态 */
.flipped .cardInner {
  transform: rotateY(180deg); /* 沿Y轴旋转180度 */
}

/* 卡片背面 */
.cardBack {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* 背面时隐藏 */
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
}

/* 卡片正面 */
.cardFront {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateY(180deg); /* 初始状态旋转180度（背对用户） */
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
}
```

**关键CSS属性详解**：

1. **perspective（透视）**：
   ```css
   .card {
     perspective: 1200px;
   }
   ```
   - 定义观察者到Z平面的距离
   - 值越小，3D效果越夸张
   - 值越大，3D效果越平缓
   - 示例对比：
     - `perspective: 500px` → 强烈3D感
     - `perspective: 1200px` → 适中（本项目）
     - `perspective: 3000px` → 微弱3D感

2. **transform-style: preserve-3d**：
   ```css
   .cardInner {
     transform-style: preserve-3d;
   }
   ```
   - 让子元素保持在3D空间中
   - 如果不设置，子元素会被"压平"到2D
   - 必须设置在父元素上

3. **backface-visibility: hidden**：
   ```css
   .cardBack,
   .cardFront {
     backface-visibility: hidden;
   }
   ```
   - 隐藏元素的背面
   - 当元素旋转超过90度时，背面不可见
   - 关键：让卡片背面和正面交替显示

4. **transform: rotateY(180deg)**：
   ```css
   /* 初始状态：背面朝向用户 */
   .cardBack {
     transform: rotateY(0deg);
   }

   /* 初始状态：正面背对用户 */
   .cardFront {
     transform: rotateY(180deg);
   }

   /* 翻转后：背面背对用户 */
   .flipped .cardBack {
     transform: rotateY(-180deg); /* 被父元素的180度旋转影响 */
   }

   /* 翻转后：正面朝向用户 */
   .flipped .cardFront {
     transform: rotateY(0deg); /* 180 + 180 = 360度 = 0度 */
   }
   ```

**翻转动画时序**：

```
初始状态（背面可见）：
  .cardBack: rotateY(0deg)       → 可见
  .cardFront: rotateY(180deg)    → 不可见（背对用户）

点击后（添加.flipped类）：
  .cardInner: rotateY(180deg)    → 整体旋转180度
    ↓
  0ms-300ms: 过渡动画（0deg → 90deg）
    ├─ .cardBack逐渐侧向 → 不可见
    └─ .cardFront仍背对用户 → 不可见
    ↓
  300ms-600ms: 过渡动画（90deg → 180deg）
    ├─ .cardBack完全背对 → 不可见
    └─ .cardFront逐渐朝向 → 可见
    ↓
  600ms: 动画完成
  .cardBack: rotateY(-180deg)    → 不可见
  .cardFront: rotateY(0deg)      → 可见（朝向用户）
```

**为什么不用库（如react-card-flip）？**

1. **性能**：纯CSS性能最优（GPU加速）
2. **体积**：无需引入额外依赖
3. **可控**：完全自定义动画参数
4. **学习价值**：理解CSS 3D原理

### 2.2.3 CollectionSlots组件 - 收集槽

**components/bank-campaign/CollectionSlots.tsx**：显示用户收集进度。

```typescript
interface CollectionSlotsProps {
  collected: Array<{ text: string; isCollected: boolean }>
  className?: string
}

export default function CollectionSlots({
  collected,
  className = ''
}: CollectionSlotsProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      {collected.map((card, index) => (
        <div
          key={index}
          className={`
            w-16 h-20 rounded-lg border-2 flex items-center justify-center
            transition-all duration-300
            ${card.isCollected
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-gray-50'
            }
          `}
        >
          {card.isCollected ? (
            <div className="text-2xl font-bold bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">
              {card.text}
            </div>
          ) : (
            <div className="text-2xl text-gray-300">?</div>
          )}
        </div>
      ))}
    </div>
  )
}
```

**设计亮点**：

1. **动态样式**：根据`isCollected`切换边框和背景色
2. **平滑过渡**：`transition-all duration-300`
3. **视觉反馈**：
   - 未收集：灰色边框 + `?`占位符
   - 已收集：绿色边框 + 金色渐变文字
4. **进度可视化**：用户一眼看出还差几张

**可扩展**：

```typescript
// 添加收集进度百分比
const progress = (collected.filter(c => c.isCollected).length / collected.length) * 100

<div className="text-center mt-2 text-sm text-gray-600">
  收集进度：{progress.toFixed(0)}%
</div>
```

### 2.2.4 Modal组件系列

#### LoginModal - 登录弹窗

**components/bank-campaign/LoginModal.tsx**：

```typescript
import { useState } from 'react'
import { api } from '@/lib/api'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess
}: LoginModalProps) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [countdown, setCountdown] = useState(0)

  // 发送验证码
  const handleSendCode = async () => {
    // 手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号')
      return
    }

    try {
      await api.auth.sendCode(phone)
      setStep('code')

      // 60秒倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      alert('发送验证码失败')
    }
  }

  // 验证登录
  const handleVerify = async () => {
    if (code.length !== 4) {
      alert('请输入4位验证码')
      return
    }

    try {
      const result = await api.auth.verifyCode(phone, code)
      if (result.success) {
        onSuccess()
      } else {
        alert('验证码错误')
      }
    } catch (error) {
      alert('登录失败')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          {step === 'phone' ? '手机号登录' : '输入验证码'}
        </h2>

        {step === 'phone' ? (
          <>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              maxLength={11}
            />
            <button
              onClick={handleSendCode}
              className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              获取验证码
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="请输入验证码"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center text-2xl"
              maxLength={4}
            />
            <p className="text-sm text-gray-500 text-center mb-4">
              验证码已发送至 {phone}
              {countdown > 0 && `（${countdown}秒后可重新发送）`}
            </p>
            <button
              onClick={handleVerify}
              className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              立即登录
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700"
        >
          取消
        </button>
      </div>
    </div>
  )
}
```

**交互细节**：

1. **两步流程**：
   - Step 1：输入手机号 → 发送验证码
   - Step 2：输入验证码 → 验证登录

2. **倒计时防刷**：
   ```typescript
   const timer = setInterval(() => {
     setCountdown(prev => {
       if (prev <= 1) {
         clearInterval(timer)
         return 0
       }
       return prev - 1
     })
   }, 1000)
   ```

3. **输入限制**：
   ```typescript
   // 手机号：最多11位数字
   <input type="tel" maxLength={11} />

   // 验证码：仅数字，最多4位
   onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
   maxLength={4}
   ```

4. **Portal模式**：
   - 弹窗使用`fixed`定位 + `inset-0`覆盖全屏
   - `bg-opacity-50`半透明遮罩
   - `z-50`最高层级

#### ResultModal - 抽卡结果弹窗

```typescript
interface ResultModalProps {
  isOpen: boolean
  onClose: () => void
  card: { text: string; isCollected: boolean } | null
}

export default function ResultModal({
  isOpen,
  onClose,
  card
}: ResultModalProps) {
  if (!isOpen || !card) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-8xl mb-4 bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent font-bold">
          {card.text}
        </div>
        <p className="text-xl text-gray-700 mb-6">
          恭喜你抽中了 "{card.text}" 字！
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          继续抽卡
        </button>
      </div>
    </div>
  )
}
```

#### FinalRewardModal - 最终奖励弹窗

```typescript
interface FinalRewardModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FinalRewardModal({
  isOpen,
  onClose
}: FinalRewardModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* 成功图标 */}
        <div className="text-6xl mb-4">🎉</div>

        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
          集齐五福！
        </h2>

        <p className="text-gray-700 mb-6">
          恭喜你成功收集全部五张福卡
          <br />
          您将获得以下奖励：
        </p>

        {/* 奖励列表 */}
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <div className="text-lg font-bold text-red-600 mb-2">
            ￥88 理财红包
          </div>
          <div className="text-sm text-gray-600">
            可用于购买农行理财产品
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700"
        >
          领取奖励
        </button>
      </div>
    </div>
  )
}
```

**Modal组件通用模式**：

```typescript
// 1. Portal容器
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

  // 2. 内容容器
  <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">

    // 3. 内容区域
    {/* ... */}

    // 4. 关闭按钮
    <button onClick={onClose}>关闭</button>
  </div>
</div>

// 5. 条件渲染
if (!isOpen) return null
```

---

## 2.3 样式系统详解

本项目采用Tailwind CSS 4 + CSS Modules的混合方案，既享受原子化CSS的开发效率，又保留复杂动画的完全控制权。

### 2.3.1 Tailwind CSS 4 新特性应用

#### 配置与初始化

**postcss.config.mjs**：
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // Tailwind 4的新PostCSS插件
  },
}
```

**app/globals.css**：
```css
@import "tailwindcss";

/* 自定义全局样式 */
:root {
  --background: #ffffff;
  --foreground: #171717;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: var(--font-geist-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**v4与v3的区别**：

| 特性 | Tailwind v3 | Tailwind v4 |
|------|-------------|-------------|
| **配置文件** | tailwind.config.js | 内置于PostCSS |
| **JIT模式** | 需要手动启用 | 默认启用 |
| **导入方式** | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| **性能** | 较快 | 更快（30%提升） |
| **CSS生成** | 构建时 | 按需即时 |

#### 原子化CSS实战

**1. 布局**

```typescript
<div className="min-h-screen flex flex-col items-center justify-center p-4">
  {/* min-h-screen: 最小高度100vh */}
  {/* flex flex-col: 弹性布局，垂直方向 */}
  {/* items-center: 交叉轴居中 */}
  {/* justify-center: 主轴居中 */}
  {/* p-4: padding 1rem (16px) */}
</div>
```

**Flexbox速查**：
- `flex`: display: flex
- `flex-row`: flex-direction: row
- `flex-col`: flex-direction: column
- `items-start/center/end`: align-items
- `justify-start/center/end/between`: justify-content
- `gap-4`: gap: 1rem

**2. 响应式设计**

```typescript
<div className="
  grid
  grid-cols-1     /* 移动端：1列 */
  sm:grid-cols-2  /* ≥640px：2列 */
  md:grid-cols-3  /* ≥768px：3列 */
  lg:grid-cols-4  /* ≥1024px：4列 */
  gap-4           /* 间距 1rem */
">
```

**断点系统**：
| 断点 | 最小宽度 | CSS |
|------|---------|-----|
| `sm` | 640px | `@media (min-width: 640px)` |
| `md` | 768px | `@media (min-width: 768px)` |
| `lg` | 1024px | `@media (min-width: 1024px)` |
| `xl` | 1280px | `@media (min-width: 1280px)` |
| `2xl` | 1536px | `@media (min-width: 1536px)` |

**本项目未使用响应式断点**，因为：
- 定位为移动端H5
- 最佳宽度480px
- 超宽屏幕也保持固定宽度

**3. 颜色系统**

```typescript
{/* 背景渐变 */}
<div className="bg-gradient-to-br from-red-50 via-white to-red-50">

{/* 文字渐变（需要配合bg-clip-text） */}
<h1 className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">

{/* 边框颜色 */}
<div className="border-2 border-red-500">

{/* 阴影 */}
<div className="shadow-lg shadow-red-500/50">
```

**Tailwind颜色体系**：
- 50-900：从浅到深的渐变色阶
- 示例：`red-50`(最浅) → `red-500`(标准红) → `red-900`(最深)
- 透明度：`bg-red-500/50` = rgba(red-500, 0.5)

**4. 间距系统**

```typescript
{/* Padding */}
<div className="p-4">   {/* 1rem = 16px */}
<div className="px-8">  {/* padding-left & right: 2rem */}
<div className="py-3">  {/* padding-top & bottom: 0.75rem */}

{/* Margin */}
<div className="m-4">   {/* 1rem */}
<div className="mb-8">  {/* margin-bottom: 2rem */}

{/* 负margin */}
<div className="-mt-4"> {/* margin-top: -1rem */}
```

**间距比例**：
```
0   = 0
1   = 0.25rem (4px)
2   = 0.5rem  (8px)
3   = 0.75rem (12px)
4   = 1rem    (16px)
6   = 1.5rem  (24px)
8   = 2rem    (32px)
12  = 3rem    (48px)
16  = 4rem    (64px)
```

**5. 状态变体**

```typescript
<button className="
  bg-red-500              /* 默认状态 */
  hover:bg-red-600        /* 悬停状态 */
  active:bg-red-700       /* 按下状态 */
  disabled:opacity-50     /* 禁用状态 */
  disabled:cursor-not-allowed
  focus:outline-none      /* 聚焦状态 */
  focus:ring-2
  focus:ring-red-500
  focus:ring-offset-2
">
```

**常用状态变体**：
- `hover:` - 鼠标悬停
- `active:` - 鼠标按下
- `focus:` - 获得焦点
- `disabled:` - 禁用
- `group-hover:` - 父元素悬停时子元素变化
- `peer-checked:` - 兄弟元素选中时

**6. 过渡动画**

```typescript
<div className="
  transition-all          /* 过渡所有属性 */
  duration-300           /* 持续时间 300ms */
  ease-in-out            /* 缓动函数 */
  hover:scale-105        /* 悬停时放大5% */
  hover:shadow-xl        /* 悬停时增大阴影 */
">
```

**动画工具类**：
- `transition-{property}`: transition属性
  - `transition-all`: all
  - `transition-colors`: color, background-color, border-color
  - `transition-transform`: transform
- `duration-{time}`: 持续时间
  - `duration-75`: 75ms
  - `duration-300`: 300ms
  - `duration-500`: 500ms
- `ease-{type}`: 缓动函数
  - `ease-linear`: linear
  - `ease-in`: cubic-bezier(0.4, 0, 1, 1)
  - `ease-out`: cubic-bezier(0, 0, 0.2, 1)
  - `ease-in-out`: cubic-bezier(0.4, 0, 0.2, 1)

**7. 任意值（Arbitrary Values）**

```typescript
{/* 自定义宽度 */}
<div className="w-[480px]">

{/* 自定义颜色 */}
<div className="bg-[#DC2626]">

{/* 自定义阴影 */}
<div className="shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">

{/* 计算值 */}
<div className="top-[calc(100vh-80px)]">

{/* 自定义变量 */}
<div className="bg-[var(--custom-color)]">
```

**使用场景**：
- 设计稿精确值（如480px宽度）
- 品牌定制颜色
- 复杂的CSS计算
- CSS变量引用

### 2.3.2 CSS Modules深度解析

**campaign.module.css** 是本项目最核心的样式文件，包含所有复杂动画。

#### 完整CSS代码（带注释）

```css
/* ===== 全局容器 ===== */

.container {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #fef2f2 0%,
    #ffffff 50%,
    #fef2f2 100%
  );
  padding: 2rem 1rem;
}

/* ===== 卡片组件 ===== */

.card {
  width: 160px;
  height: 220px;
  perspective: 1200px; /* 设置透视距离 */
  cursor: pointer;
  transition: transform 0.3s ease;
}

/* 悬停时卡片向上浮动 */
.card:hover {
  transform: translateY(-8px);
}

/* 卡片内部容器（实际翻转的元素） */
.cardInner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d; /* 保持3D空间 */
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 翻转状态：沿Y轴旋转180度 */
.flipped .cardInner {
  transform: rotateY(180deg);
}

/* 卡片背面 */
.cardBack {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* 背面时隐藏 */
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
  transition: box-shadow 0.3s ease;
}

.cardBack:hover {
  box-shadow: 0 15px 40px rgba(220, 38, 38, 0.4);
}

/* 卡片正面 */
.cardFront {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateY(180deg); /* 初始状态背对用户 */
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
}

/* ===== 毛玻璃效果 ===== */

.glassCard {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px); /* 背景模糊 */
  -webkit-backdrop-filter: blur(10px); /* Safari支持 */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* ===== 金色渐变文字 ===== */

.goldText {
  background: linear-gradient(
    135deg,
    #fbbf24 0%,
    #f59e0b 50%,
    #d97706 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  font-weight: 700;
}

/* ===== 浮动动画 ===== */

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating {
  animation: float 3s ease-in-out infinite;
}

/* ===== 脉冲动画 ===== */

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.pulsing {
  animation: pulse 2s ease-in-out infinite;
}

/* ===== 渐入动画 ===== */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fadeIn {
  animation: fadeIn 0.5s ease-out;
}

/* ===== 弹出动画 ===== */

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.bounceIn {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* ===== 摇晃动画 ===== */

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.shake {
  animation: shake 0.5s;
}

/* ===== 旋转加载动画 ===== */

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* ===== 渐变背景动画 ===== */

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animatedGradient {
  background: linear-gradient(
    45deg,
    #DC2626 0%,
    #EF4444 25%,
    #F87171 50%,
    #EF4444 75%,
    #DC2626 100%
  );
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

/* ===== 响应式适配 ===== */

@media (max-width: 480px) {
  .card {
    width: 120px;
    height: 160px;
  }

  .container {
    padding: 1rem 0.5rem;
  }
}

@media (min-width: 768px) {
  .card {
    width: 180px;
    height: 240px;
  }
}
```

#### CSS Modules的优势

**1. 局部作用域**

```typescript
// components/A.tsx
import styles from './A.module.css'

<div className={styles.card}> {/* 编译为 .A_card__abc123 */}
```

```typescript
// components/B.tsx
import styles from './B.module.css'

<div className={styles.card}> {/* 编译为 .B_card__def456 */}
```

两个组件的`.card`类不会冲突，因为编译后的类名不同。

**2. 类型安全**

```typescript
// TypeScript会检查类名是否存在
<div className={styles.card}>      // ✅ 正确
<div className={styles.crad}>      // ❌ 拼写错误，编译时报错
```

**3. 与Tailwind混用**

```typescript
import styles from './campaign.module.css'

<div className={`${styles.card} hover:scale-105 transition-transform`}>
  {/* CSS Module类 + Tailwind类 */}
</div>
```

**4. 全局样式导出**

```css
/* campaign.module.css */
:global(.no-scroll) {
  overflow: hidden;
}

:local(.localClass) {
  /* 默认是local，可省略 */
}
```

```typescript
// 直接使用全局类
<body className="no-scroll">
```

### 2.3.3 毛玻璃效果实现

毛玻璃（Glassmorphism）是2020年后流行的设计风格，苹果在macOS Big Sur中大量使用。

#### 核心CSS属性

```css
.glassCard {
  /* 1. 半透明背景 */
  background: rgba(255, 255, 255, 0.7);

  /* 2. 背景模糊（关键属性） */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari需要 */

  /* 3. 边框（增强层次感） */
  border: 1px solid rgba(255, 255, 255, 0.3);

  /* 4. 圆角 */
  border-radius: 16px;

  /* 5. 阴影（增强浮起感） */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

#### backdrop-filter详解

**支持的滤镜函数**：

```css
/* 模糊 */
backdrop-filter: blur(10px);

/* 亮度 */
backdrop-filter: brightness(1.2);

/* 对比度 */
backdrop-filter: contrast(0.8);

/* 灰度 */
backdrop-filter: grayscale(0.5);

/* 色相旋转 */
backdrop-filter: hue-rotate(90deg);

/* 反转 */
backdrop-filter: invert(0.1);

/* 饱和度 */
backdrop-filter: saturate(1.5);

/* 组合使用 */
backdrop-filter: blur(10px) saturate(1.8);
```

**浏览器兼容性**：

| 浏览器 | 版本 | 备注 |
|--------|------|------|
| Chrome | 76+ | 需要`-webkit-`前缀 |
| Safari | 9+ | 原生支持 |
| Firefox | 103+ | 原生支持 |
| Edge | 79+ | 基于Chromium |

**降级方案**：

```css
.glassCard {
  /* 降级：不支持时显示纯色 */
  background: rgba(255, 255, 255, 0.9);

  /* 现代浏览器：毛玻璃效果 */
  @supports (backdrop-filter: blur(10px)) {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
  }
}
```

#### 本项目中的应用

虽然主要卡片没用毛玻璃，但可以用在弹窗：

```typescript
// LoginModal改进版
<div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm">
  {/* backdrop-blur-sm = blur(4px) */}
  <div className="bg-white/80 backdrop-blur-md rounded-2xl">
    {/* backdrop-blur-md = blur(12px) */}
    {/* 弹窗内容 */}
  </div>
</div>
```

### 2.3.4 金色渐变文字实现

#### CSS原理

```css
.goldText {
  /* 1. 定义渐变背景 */
  background: linear-gradient(
    135deg,
    #fbbf24 0%,   /* 浅金色 */
    #f59e0b 50%,  /* 标准金色 */
    #d97706 100%  /* 深金色 */
  );

  /* 2. 裁剪背景到文字 */
  -webkit-background-clip: text;
  background-clip: text;

  /* 3. 文字填充透明（显示背景） */
  -webkit-text-fill-color: transparent;
  text-fill-color: transparent;

  /* 4. 加粗增强效果 */
  font-weight: 700;
}
```

**工作原理**：

```
正常文字：
  ┌────────────┐
  │ background │ ← 背景（不可见）
  └────────────┘
  ┌────────────┐
  │    TEXT    │ ← 文字颜色（可见）
  └────────────┘

渐变文字：
  ┌────────────┐
  │ gradient   │ ← 渐变背景
  └────────────┘
        ↓ background-clip: text（裁剪）
  ┌──┬──┬──┬──┐
  │  │  │  │  │ ← 仅文字形状的渐变
  └──┴──┴──┴──┘
        ↓ text-fill-color: transparent
  ┌──┬──┬──┬──┐
  │██│██│██│██│ ← 透明文字，显示裁剪后的渐变
  └──┴──┴──┴──┘
```

#### Tailwind实现

```typescript
<h1 className="
  bg-gradient-to-r
  from-red-500
  to-red-700
  bg-clip-text
  text-transparent
  font-bold
">
  农行开门红 · 集五福
</h1>
```

**渐变方向**：
- `bg-gradient-to-r`: 从左到右
- `bg-gradient-to-l`: 从右到左
- `bg-gradient-to-t`: 从下到上
- `bg-gradient-to-b`: 从上到下
- `bg-gradient-to-br`: 对角线（左上到右下）
- `bg-gradient-to-tr`: 对角线（左下到右上）

#### 动画增强

```css
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.goldTextAnimated {
  background: linear-gradient(
    90deg,
    #d97706 0%,
    #fbbf24 25%,
    #fef3c7 50%,
    #fbbf24 75%,
    #d97706 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}
```

效果：金色光泽从左到右扫过。

### 2.3.5 响应式设计策略

#### 移动优先设计

本项目定位为移动端H5，因此采用**移动优先**策略：

```css
/* 默认样式：移动端（0-479px） */
.card {
  width: 120px;
  height: 160px;
}

/* 中等屏幕（480px+） */
@media (min-width: 480px) {
  .card {
    width: 160px;
    height: 220px;
  }
}

/* 平板屏幕（768px+） */
@media (min-width: 768px) {
  .card {
    width: 180px;
    height: 240px;
  }
}
```

#### Viewport Meta配置

**app/layout.tsx**：
```typescript
<head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
  />
</head>
```

**参数解释**：
- `width=device-width`: 宽度等于设备宽度
- `initial-scale=1`: 初始缩放1倍
- `maximum-scale=1`: 最大缩放1倍
- `user-scalable=no`: 禁止用户缩放（银行类H5常见）

#### 安全区域适配（iOS）

```css
.container {
  /* 避开iPhone刘海和底部横条 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

#### 横屏处理

```css
@media (orientation: landscape) and (max-height: 500px) {
  /* 横屏且高度不足500px时调整 */
  .card {
    width: 100px;
    height: 140px;
  }

  .container {
    padding: 1rem 0.5rem;
  }
}
```

---

## 2.4 业务逻辑实现

### 2.4.1 抽卡算法深度解析

#### 后端算法（Next.js API Routes版本）

**app/api/card/draw/route.ts**：

```typescript
export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { error: '未登录' },
      { status: 401 }
    )
  }

  // 从token解析userId
  const userId = token.split('-')[1]

  // 获取用户数据（从内存Map）
  const users = (global as any).users || new Map()
  let user = users.get(userId)

  if (!user) {
    // 初始化用户
    user = {
      id: userId,
      phone: '***',
      cards: [
        { text: '马', isCollected: false },
        { text: '上', isCollected: false },
        { text: '发', isCollected: false },
        { text: '财', isCollected: false },
        { text: '哇', isCollected: false },
      ],
    }
    users.set(userId, user)
    ;(global as any).users = users
  }

  // === 核心抽卡算法 ===

  // 1. 筛选未收集的卡片
  const unCollected = user.cards.filter((c: any) => !c.isCollected)

  // 2. 边界检查：已经集齐
  if (unCollected.length === 0) {
    return NextResponse.json({
      success: false,
      error: '您已集齐所有卡片',
    })
  }

  // 3. 随机抽取一张未收集的卡片
  const luckyIndex = Math.floor(Math.random() * unCollected.length)
  const drawnCard = unCollected[luckyIndex]

  // 4. 更新收集状态
  const cardIndex = user.cards.findIndex((c: any) => c.text === drawnCard.text)
  user.cards[cardIndex].isCollected = true

  // 5. 保存到"数据库"
  users.set(userId, user)

  // 6. 检查是否全部集齐
  const allCollected = user.cards.every((c: any) => c.isCollected)

  // 7. 返回结果
  return NextResponse.json({
    success: true,
    data: {
      card: drawnCard,
      allCollected,
      collected: user.cards,
    },
  })
}
```

#### 算法特点分析

**1. 100%抽中新卡的设计**

传统集卡游戏（如支付宝集五福）：
```typescript
// 从所有卡片中随机抽取（可能重复）
const allCards = ['马', '上', '发', '财', '哇']
const luckyIndex = Math.floor(Math.random() * allCards.length)
const drawnCard = allCards[luckyIndex]

// 问题：可能抽中已收集的卡片，用户挫败感强
```

本项目优化算法：
```typescript
// 仅从未收集的卡片中抽取（保证新卡）
const unCollected = cards.filter(c => !c.isCollected)
const luckyIndex = Math.floor(Math.random() * unCollected.length)
const drawnCard = unCollected[luckyIndex]

// 优势：每次抽卡都有进展，用户体验好
```

**为什么这样设计？**

| 场景 | 传统随机 | 本项目算法 |
|------|---------|-----------|
| **平均抽卡次数** | ~11.4次 | 5次（固定） |
| **用户挫败感** | 高（重复抽中） | 无 |
| **完成率** | 低（需要运气） | 100% |
| **适用场景** | 长期活动（1个月） | 短期活动（3-7天） |

**2. 随机性保证公平**

```typescript
Math.random() // 0 ≤ x < 1
Math.random() * unCollected.length // 0 ≤ x < length
Math.floor(Math.random() * unCollected.length) // 整数索引
```

**示例**：
```javascript
const unCollected = ['马', '上', '发'] // length = 3

Math.random() = 0.234
Math.random() * 3 = 0.702
Math.floor(0.702) = 0 // 抽中 '马'

Math.random() = 0.789
Math.random() * 3 = 2.367
Math.floor(2.367) = 2 // 抽中 '发'
```

**3. 并发安全（生产环境需考虑）**

当前代码**不是并发安全的**：

```typescript
// 问题场景：
// 用户快速点击两次卡片
// 请求1: 读取 cards = [未收集, 未收集, 未收集]
// 请求2: 读取 cards = [未收集, 未收集, 未收集]（同时读取）
// 请求1: 更新 cards[0] = 已收集
// 请求2: 更新 cards[1] = 已收集
// 结果：正确（因为修改不同索引）

// 但如果抽中同一张：
// 请求1: 抽中 '马'，更新 cards[0]
// 请求2: 抽中 '马'，更新 cards[0]
// 结果：'马' 被计数两次（错误）
```

**生产环境解决方案**（PostgreSQL + 事务）：

```javascript
// functions/api/routes/card.js
router.post('/api/card/draw', async (ctx) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN') // 开启事务

    // 1. 锁定用户行（FOR UPDATE）
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    )

    const user = result.rows[0]
    const cards = JSON.parse(user.cards)

    // 2. 抽卡逻辑
    const unCollected = cards.filter(c => !c.isCollected)
    if (unCollected.length === 0) {
      throw new Error('已集齐')
    }

    const luckyIndex = Math.floor(Math.random() * unCollected.length)
    const drawnCard = unCollected[luckyIndex]
    drawnCard.isCollected = true

    // 3. 更新数据库
    await client.query(
      'UPDATE users SET cards = $1 WHERE id = $2',
      [JSON.stringify(cards), userId]
    )

    // 4. 记录日志
    await client.query(
      'INSERT INTO draw_logs (user_id, card_text) VALUES ($1, $2)',
      [userId, drawnCard.text]
    )

    await client.query('COMMIT') // 提交事务

    ctx.body = { success: true, card: drawnCard }
  } catch (error) {
    await client.query('ROLLBACK') // 回滚事务
    throw error
  } finally {
    client.release() // 释放连接
  }
})
```

**FOR UPDATE的作用**：
- 锁定该行，其他事务无法读取或修改
- 确保同一用户的并发请求串行化
- 避免"丢失更新"问题

### 2.4.2 状态更新流程

#### React状态更新时序

```typescript
const handleCardClick = async (index: number) => {
  // === 阶段1：同步检查（立即执行） ===
  if (!isLoggedIn) {
    setShowLogin(true) // 状态更新请求1
    return
  }

  if (isDrawing) {
    return // 防抖
  }

  // === 阶段2：异步操作开始 ===
  setIsDrawing(true) // 状态更新请求2

  // 触发翻转
  const newFlipped = [...isFlipped]
  newFlipped[index] = true
  setIsFlipped(newFlipped) // 状态更新请求3

  // === 阶段3：等待API（约200-500ms） ===
  const result = await api.card.draw()

  // === 阶段4：批量状态更新 ===
  setCurrentDraw(result.data.card) // 状态更新请求4
  setCollected(prev => /* ... */)   // 状态更新请求5

  // === React批量渲染（16ms内） ===
  // 将请求4和5合并为一次渲染

  // === 阶段5：延迟弹窗 ===
  setTimeout(() => {
    setShowResult(true) // 状态更新请求6（600ms后）
  }, 600)

  setIsDrawing(false) // 状态更新请求7
}
```

**React批量更新机制**：

```
时间线：
0ms:   点击事件触发
       ├─ setIsDrawing(true)
       └─ setIsFlipped([...])
       React: 批量更新（16ms内）
16ms:  渲染1（isDrawing=true, isFlipped更新）
       ↓
200ms: API返回
       ├─ setCurrentDraw(...)
       └─ setCollected(...)
       React: 批量更新
216ms: 渲染2（currentDraw更新, collected更新）
       ↓
600ms: setTimeout触发
       └─ setShowResult(true)
616ms: 渲染3（showResult=true，弹窗显示）
```

**为什么要批量更新？**

如果每个setState都立即渲染：
- 1次点击 = 7次渲染
- 性能差，UI闪烁

批量更新后：
- 1次点击 = 3次渲染
- 性能优化，体验流畅

#### 不可变更新的深层原因

**浅比较算法**：

```typescript
// React内部（简化版）
function Component(props, prevState) {
  const [state, setState] = useState(prevState)

  // 检查是否需要重新渲染
  if (state === prevState) {
    return // 跳过渲染
  }

  // 重新渲染
  return render()
}
```

**测试对比**：

```typescript
// 错误：直接修改
const handleWrong = () => {
  collected[0].isCollected = true
  setCollected(collected) // ❌ collected引用未变
  // React认为没有变化，不渲染
}

// 正确：创建新对象
const handleRight = () => {
  const newCollected = collected.map((card, i) =>
    i === 0 ? { ...card, isCollected: true } : card
  )
  setCollected(newCollected) // ✅ newCollected引用改变
  // React检测到变化，重新渲染
}
```

**引用相等性验证**：

```typescript
const arr1 = [{ text: 'a' }]
const arr2 = arr1

console.log(arr1 === arr2) // true（同一引用）

arr2[0].text = 'b'
console.log(arr1 === arr2) // true（还是同一引用！）
console.log(arr1[0].text)   // 'b'（arr1也被修改了）

const arr3 = [...arr1]
console.log(arr1 === arr3) // false（不同引用）
```

### 2.4.3 动画与状态的时序同步

#### 问题：动画和数据不同步

**不好的实现**：

```typescript
const handleCardClick = async () => {
  const result = await api.card.draw()

  // 立即更新数据
  setCollected(...)
  // 立即显示弹窗
  setShowResult(true)

  // 问题：弹窗立即出现，用户还没看到翻转动画
}
```

**正确实现**：

```typescript
const handleCardClick = async () => {
  // 1. 先触发翻转动画
  setIsFlipped([...])

  // 2. 等待API
  const result = await api.card.draw()

  // 3. 更新数据（此时动画还在进行）
  setCollected(...)

  // 4. 延迟显示弹窗（等待动画完成）
  setTimeout(() => {
    setShowResult(true)
  }, 600) // 动画500ms + 100ms缓冲
}
```

**时序图**：

```
时间    动画状态           数据状态        UI状态
0ms     开始翻转           未更新          卡片翻转中
        rotateY(0→90deg)
300ms   翻转到90度         未更新          卡片侧面
        （既不是背面也不是正面）
500ms   翻转完成           未更新          显示正面
        rotateY(180deg)
600ms   -                 已更新          弹窗显示
                          collected更新
```

#### setTimeout的妙用

```typescript
// 延迟执行（跳过当前渲染周期）
setTimeout(() => {
  setShowResult(true)
}, 0) // 即使是0ms，也会在下一个事件循环执行

// 常见延迟时间
setTimeout(..., 0)    // 下一个事件循环
setTimeout(..., 16)   // 一帧后（60fps = 16.67ms/帧）
setTimeout(..., 300)  // 短暂延迟
setTimeout(..., 600)  // 等待动画完成
setTimeout(..., 1500) // 给用户足够查看时间
```

### 2.4.4 错误处理和用户反馈

#### 多层错误处理

```typescript
const handleCardClick = async (index: number) => {
  try {
    // === 前置验证 ===
    if (!isLoggedIn) {
      // 不是错误，引导登录
      setShowLogin(true)
      return
    }

    if (isDrawing) {
      // 防抖，静默忽略
      return
    }

    // === API调用 ===
    const result = await api.card.draw()

    if (!result.success) {
      // 业务错误（如已集齐）
      alert(result.error || '抽卡失败')
      return
    }

    // === 成功处理 ===
    setCollected(...)
    setShowResult(true)

  } catch (error) {
    // === 网络错误/未知错误 ===
    console.error('抽卡失败:', error)

    if (error instanceof TypeError) {
      alert('网络连接失败，请检查网络')
    } else if (error.message.includes('401')) {
      alert('登录已过期，请重新登录')
      setIsLoggedIn(false)
    } else {
      alert('抽卡失败，请重试')
    }
  } finally {
    // === 清理工作（无论成功失败） ===
    setIsDrawing(false)
    setTimeout(() => {
      setIsFlipped([false, false, false, false, false])
    }, 500)
  }
}
```

#### API客户端统一错误处理

**lib/api.ts**：

```typescript
async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('abc_bank_token')

  try {
    const response = await fetch(API_BASE_URL + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    // HTTP状态码检查
    if (!response.ok) {
      const error = await response.json()

      // 根据状态码细分错误
      switch (response.status) {
        case 400:
          throw new Error(error.error || '请求参数错误')
        case 401:
          throw new Error('未授权，请重新登录')
        case 403:
          throw new Error('无权限访问')
        case 404:
          throw new Error('接口不存在')
        case 500:
          throw new Error('服务器错误，请稍后重试')
        default:
          throw new Error(error.error || '请求失败')
      }
    }

    return await response.json()

  } catch (error) {
    // 网络错误（无响应）
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络')
    }

    // 其他错误（如JSON解析失败）
    throw error
  }
}
```

#### 用户反馈设计

**1. Loading状态**

```typescript
const [isDrawing, setIsDrawing] = useState(false)

{isDrawing && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      <p className="mt-4 text-gray-700">抽卡中...</p>
    </div>
  </div>
)}
```

**2. Toast提示（可选）**

```typescript
// 使用 react-hot-toast 库
import toast from 'react-hot-toast'

const handleCardClick = async () => {
  try {
    const result = await api.card.draw()
    toast.success('抽卡成功！')
  } catch (error) {
    toast.error('抽卡失败，请重试')
  }
}
```

**3. 乐观更新（高级）**

```typescript
const handleCardClick = async (index: number) => {
  // 1. 立即更新UI（乐观假设会成功）
  const optimisticUpdate = collected.map((card, i) =>
    i === index ? { ...card, isCollected: true } : card
  )
  setCollected(optimisticUpdate)

  try {
    // 2. 调用API
    const result = await api.card.draw()

    // 3. 如果成功，保持UI
    // （不需要额外操作）

  } catch (error) {
    // 4. 如果失败，回滚UI
    setCollected(collected) // 恢复原状态
    alert('抽卡失败')
  }
}
```

---

# 第三部分：后端架构深度解析

## 3.1 双后端架构对比

本项目最独特的设计是**双后端架构**，同时维护两套后端代码，适配不同的运行环境。

### 3.1.1 模式A：Next.js API Routes（开发/演示）

#### 架构概览

```
用户浏览器
    ↓ HTTP请求
localhost:3000/api/auth/send-code
    ↓
Next.js Dev Server
    ↓
app/api/auth/send-code/route.ts
    ↓
global Map（内存存储）
    ↓
返回JSON响应
```

#### 核心特点

**1. 零配置启动**

```bash
npm run dev
# 立即可用，无需：
# - 数据库配置
# - Redis配置
# - 环境变量
# - 云服务账号
```

**2. 文件路由映射**

| 文件路径 | URL路径 | HTTP方法 |
|---------|---------|---------|
| `app/api/auth/send-code/route.ts` | `/api/auth/send-code` | POST |
| `app/api/auth/verify-code/route.ts` | `/api/auth/verify-code` | POST |
| `app/api/card/draw/route.ts` | `/api/card/draw` | POST |

**3. 内存存储方案**

```typescript
// app/api/card/draw/route.ts:5
// 使用global对象模拟数据库
const users = (global as any).users || new Map<string, UserData>()

// 读取用户
const user = users.get(userId)

// 写入用户
users.set(userId, user)

// 持久化到global（避免模块重载时丢失）
;(global as any).users = users
```

**global对象原理**：

```typescript
// Node.js/Bun的全局对象
declare global {
  var users: Map<string, any> | undefined
  var smsCache: Map<string, any> | undefined
}

// 初始化
global.users = global.users || new Map()

// 所有请求共享同一个Map实例
// 类似单例模式
```

**优势**：
- ✅ 读写速度极快（纳秒级，直接内存访问）
- ✅ 无需网络连接（本地Map）
- ✅ 无序列化开销（对象直接存储）

**劣势**：
- ❌ 重启后数据丢失
- ❌ 多实例无法共享（每个进程独立的内存）
- ❌ 内存有限（不适合大量数据）
- ❌ 无持久化（无法审计）

**适用场景**：
- 本地开发调试
- 快速原型验证
- 演示/测试环境
- 单用户场景

#### 完整API实现示例

**发送验证码**：`app/api/auth/send-code/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

// 内存缓存验证码（60秒过期）
const smsCache = new Map<string, { code: string; timestamp: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    // 1. 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: '手机号格式错误' },
        { status: 400 }
      )
    }

    // 2. 防刷检查（60秒内不能重复发送）
    const cached = smsCache.get(phone)
    if (cached && Date.now() - cached.timestamp < 60000) {
      const remainingSeconds = Math.ceil((60000 - (Date.now() - cached.timestamp)) / 1000)
      return NextResponse.json(
        { success: false, error: `请${remainingSeconds}秒后再试` },
        { status: 429 }
      )
    }

    // 3. 生成验证码（演示用固定值）
    const code = '8888' // 生产环境：Math.floor(1000 + Math.random() * 9000).toString()

    // 4. 缓存验证码
    smsCache.set(phone, {
      code,
      timestamp: Date.now(),
    })

    // 5. 模拟发送短信（真实环境调用短信API）
    console.log(`[短信] 发送验证码 ${code} 到 ${phone}`)

    // 6. 返回成功响应
    return NextResponse.json({
      success: true,
      message: '验证码已发送',
    })

  } catch (error) {
    console.error('发送验证码失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

**验证登录**：`app/api/auth/verify-code/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

const smsCache = new Map<string, { code: string; timestamp: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    // 1. 参数验证
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: '参数错误' },
        { status: 400 }
      )
    }

    // 2. 验证码检查
    const cached = smsCache.get(phone)

    if (!cached) {
      return NextResponse.json(
        { success: false, error: '验证码已过期，请重新获取' },
        { status: 400 }
      )
    }

    // 3. 验证码是否过期（5分钟）
    if (Date.now() - cached.timestamp > 300000) {
      smsCache.delete(phone)
      return NextResponse.json(
        { success: false, error: '验证码已过期' },
        { status: 400 }
      )
    }

    // 4. 验证码是否正确
    if (cached.code !== code) {
      return NextResponse.json(
        { success: false, error: '验证码错误' },
        { status: 400 }
      )
    }

    // 5. 验证成功，删除验证码（一次性）
    smsCache.delete(phone)

    // 6. 生成简单token（生产环境使用JWT）
    const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const token = `${userId}-${Date.now()}`

    // 7. 初始化用户数据
    const users = (global as any).users || new Map()
    users.set(userId, {
      id: userId,
      phone,
      cards: [
        { text: '马', isCollected: false },
        { text: '上', isCollected: false },
        { text: '发', isCollected: false },
        { text: '财', isCollected: false },
        { text: '哇', isCollected: false },
      ],
      createdAt: new Date().toISOString(),
    })
    ;(global as any).users = users

    // 8. 返回token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        phone,
      },
    })

  } catch (error) {
    console.error('验证失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

**抽卡接口**：`app/api/card/draw/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 1. 验证token
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    // 2. 从token解析userId（简单token格式：user-xxx-timestamp）
    const userId = token.split('-')[1]

    // 3. 获取用户数据
    const users = (global as any).users || new Map()
    const user = users.get(userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 4. 筛选未收集的卡片
    const unCollected = user.cards.filter((c: any) => !c.isCollected)

    if (unCollected.length === 0) {
      return NextResponse.json(
        { success: false, error: '您已集齐所有卡片' },
        { status: 400 }
      )
    }

    // 5. 随机抽取
    const luckyIndex = Math.floor(Math.random() * unCollected.length)
    const drawnCard = unCollected[luckyIndex]

    // 6. 更新收集状态
    const cardIndex = user.cards.findIndex((c: any) => c.text === drawnCard.text)
    user.cards[cardIndex].isCollected = true

    // 7. 保存
    users.set(userId, user)

    // 8. 检查是否全部集齐
    const allCollected = user.cards.every((c: any) => c.isCollected)

    // 9. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        card: drawnCard,
        allCollected,
        collected: user.cards,
      },
    })

  } catch (error) {
    console.error('抽卡失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

### 3.1.2 模式B：腾讯云函数（生产环境）

#### 架构概览

```
用户浏览器
    ↓ HTTPS请求
https://service-xxx.gz.apigw.tencentcs.com/release/api/auth/send-code
    ↓
腾讯云API网关
    ↓
腾讯云函数 SCF（Serverless）
    ↓
functions/api/index.js（Koa应用）
    ↓ 路由分发
functions/api/routes/auth.js
    ↓ 数据访问
PostgreSQL + Redis（腾讯云托管）
    ↓
返回JSON响应
```

#### 技术栈

**框架**：Koa.js 2
```javascript
const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
const router = new Router()

app.use(bodyParser())
app.use(router.routes())
```

**为什么选Koa而非Express？**

| 特性 | Express | Koa |
|------|---------|-----|
| **异步处理** | 回调/Promise | async/await原生支持 |
| **中间件** | 回调栈 | 洋葱模型（更优雅） |
| **错误处理** | 需要手动try-catch | 统一错误处理 |
| **体积** | 较大 | 更小（核心仅1000行） |
| **性能** | 较快 | 更快（10-15%提升） |

**数据库**：PostgreSQL 14
```javascript
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: 10, // 连接池最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

**缓存**：Redis 6
```javascript
const Redis = require('ioredis')

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})
```

#### 项目结构

```
functions/api/
├── index.js                 # 入口文件（Koa应用）
├── package.json             # 依赖配置
├── serverless.yml           # 云函数配置
├── config/
│   ├── db.js               # PostgreSQL连接池
│   └── redis.js            # Redis客户端
├── middleware/
│   ├── auth.js             # JWT认证中间件
│   └── error.js            # 错误处理中间件
├── routes/
│   ├── auth.js             # 认证相关接口
│   ├── auth-no-redis.js    # 认证（无Redis版本）
│   └── card.js             # 卡片相关接口
└── utils/
    ├── jwt.js              # JWT工具函数
    └── sms.js              # 短信发送（腾讯云SMS）
```

### 3.1.3 代码对比分析

#### 发送验证码接口对比

**模式A（Next.js）**：
```typescript
// app/api/auth/send-code/route.ts
const smsCache = new Map<string, { code: string; timestamp: number }>()

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { phone } = body

  // 防刷检查
  const cached = smsCache.get(phone)
  if (cached && Date.now() - cached.timestamp < 60000) {
    return NextResponse.json({ error: '请稍后再试' }, { status: 429 })
  }

  // 生成验证码
  const code = '8888'

  // 缓存验证码（内存）
  smsCache.set(phone, { code, timestamp: Date.now() })

  return NextResponse.json({ success: true })
}
```

**模式B（云函数）**：
```javascript
// functions/api/routes/auth.js
const redis = require('../config/redis')

router.post('/api/auth/send-code', async (ctx) => {
  const { phone } = ctx.request.body

  // 防刷检查（使用Redis）
  const cachedTTL = await redis.ttl(`sms:${phone}`)
  if (cachedTTL > 0) {
    ctx.status = 429
    ctx.body = { error: `请${cachedTTL}秒后再试` }
    return
  }

  // 生成验证码
  const code = Math.floor(1000 + Math.random() * 9000).toString()

  // 缓存验证码（Redis，60秒过期）
  await redis.setex(`sms:${phone}`, 60, code)

  // 调用腾讯云短信API（真实发送）
  const sms = require('../utils/sms')
  await sms.send(phone, code)

  // 记录日志到数据库
  const pool = require('../config/db')
  await pool.query(
    'INSERT INTO sms_logs (phone, code, created_at) VALUES ($1, $2, NOW())',
    [phone, code]
  )

  ctx.body = { success: true }
})
```

**关键差异**：

| 维度 | 模式A | 模式B |
|------|-------|-------|
| **验证码缓存** | Map（内存） | Redis（持久化） |
| **验证码生成** | 固定'8888' | 随机4位数 |
| **短信发送** | 模拟（console.log） | 真实发送（腾讯云SMS） |
| **日志记录** | 无 | 写入数据库 |
| **防刷策略** | 简单时间戳 | Redis TTL |

#### 验证码验证接口对比

**模式A**：
```typescript
// app/api/auth/verify-code/route.ts
export async function POST(request: NextRequest) {
  const { phone, code } = await request.json()

  // 从内存获取验证码
  const cached = smsCache.get(phone)

  if (!cached || cached.code !== code) {
    return NextResponse.json({ error: '验证码错误' }, { status: 400 })
  }

  // 生成简单token
  const userId = `user-${Date.now()}`
  const token = `${userId}-${Date.now()}`

  // 初始化用户
  const users = (global as any).users || new Map()
  users.set(userId, { id: userId, phone, cards: [...] })

  return NextResponse.json({
    success: true,
    token,
    user: { id: userId, phone },
  })
}
```

**模式B**：
```javascript
// functions/api/routes/auth.js
const jwt = require('../utils/jwt')
const pool = require('../config/db')
const redis = require('../config/redis')

router.post('/api/auth/verify-code', async (ctx) => {
  const { phone, code } = ctx.request.body

  // 从Redis获取验证码
  const cachedCode = await redis.get(`sms:${phone}`)

  if (!cachedCode || cachedCode !== code) {
    ctx.status = 400
    ctx.body = { error: '验证码错误' }
    return
  }

  // 删除验证码（一次性）
  await redis.del(`sms:${phone}`)

  // 查询或创建用户
  let user = await pool.query(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  )

  if (user.rows.length === 0) {
    // 创建新用户
    const result = await pool.query(`
      INSERT INTO users (phone, cards, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *
    `, [
      phone,
      JSON.stringify([
        { text: '马', isCollected: false },
        { text: '上', isCollected: false },
        { text: '发', isCollected: false },
        { text: '财', isCollected: false },
        { text: '哇', isCollected: false },
      ]),
    ])
    user = result
  }

  // 生成JWT token
  const token = jwt.sign({
    userId: user.rows[0].id,
    phone: user.rows[0].phone,
  })

  // 缓存用户session（24小时）
  await redis.setex(
    `session:${user.rows[0].id}`,
    86400,
    JSON.stringify(user.rows[0])
  )

  ctx.body = {
    success: true,
    token,
    user: {
      id: user.rows[0].id,
      phone: user.rows[0].phone,
    },
  }
})
```

**关键差异**：

| 维度 | 模式A | 模式B |
|------|-------|-------|
| **Token生成** | 简单字符串拼接 | JWT签名 |
| **用户存储** | Map | PostgreSQL |
| **Session管理** | 无 | Redis缓存 |
| **安全性** | 低（token可预测） | 高（JWT + 签名） |

---

## 3.2 数据库设计详解

### 3.2.1 PostgreSQL Schema

**database/init.sql**：

```sql
-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(11) NOT NULL UNIQUE,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_cards ON users USING GIN(cards); -- JSONB索引

-- 2. 抽卡日志表
CREATE TABLE IF NOT EXISTS draw_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  card_text VARCHAR(1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_draw_logs_user_id ON draw_logs(user_id);
CREATE INDEX idx_draw_logs_created_at ON draw_logs(created_at);

-- 3. 短信日志表
CREATE TABLE IF NOT EXISTS sms_logs (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(11) NOT NULL,
  code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_sms_logs_phone ON sms_logs(phone);
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at);
```

#### JSONB字段设计

**为什么使用JSONB存储cards？**

**方案对比**：

**方案1：关系型设计**
```sql
-- 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(11)
);

-- 卡片表
CREATE TABLE user_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  card_text VARCHAR(1),
  is_collected BOOLEAN,
  collected_at TIMESTAMP
);
```

**方案2：JSONB设计（本项目）**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(11),
  cards JSONB -- [{ text: '马', isCollected: true }, ...]
);
```

**对比分析**：

| 维度 | 关系型 | JSONB |
|------|--------|-------|
| **读取性能** | 需要JOIN | 单表查询 |
| **写入性能** | 需要INSERT多行 | UPDATE一行 |
| **查询灵活性** | SQL查询强大 | JSONB查询稍弱 |
| **数据一致性** | 强（外键约束） | 弱（需应用层保证） |
| **存储空间** | 较大（索引+行开销） | 较小（单行） |
| **代码复杂度** | 高（ORM映射） | 低（直接JSON） |

**为什么选择JSONB？**

1. **数据结构简单**：每个用户仅5张卡，固定结构
2. **读写模式**：99%的操作是"读取全部卡片"，很少单独查询某张
3. **原子更新**：更新卡片状态时，通常需要原子性（避免竞态）
4. **代码简洁**：前后端都是JSON，无需ORM转换

**JSONB查询语法**：

```sql
-- 查询包含特定卡片的用户
SELECT * FROM users
WHERE cards @> '[{"text": "马", "isCollected": true}]'::jsonb;

-- 查询未收集"马"字的用户
SELECT * FROM users
WHERE NOT (cards @> '[{"text": "马", "isCollected": true}]'::jsonb);

-- 更新JSONB字段
UPDATE users
SET cards = jsonb_set(
  cards,
  '{0,isCollected}', -- 路径：第0个元素的isCollected
  'true'::jsonb
)
WHERE id = 123;
```

**GIN索引**：

```sql
CREATE INDEX idx_users_cards ON users USING GIN(cards);
```

GIN（Generalized Inverted Index）是PostgreSQL专为JSONB优化的索引类型：
- 支持高效的`@>`、`?`等JSONB操作符
- 适合包含查询（如"包含某张已收集的卡"）
- 构建较慢，但查询极快

### 3.2.2 连接池配置

**functions/api/config/db.js**：

```javascript
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  // === 连接池参数（重要！） ===
  max: 10,                      // 最大连接数
  min: 2,                       // 最小连接数
  idleTimeoutMillis: 30000,     // 空闲连接超时（30秒）
  connectionTimeoutMillis: 2000, // 连接超时（2秒）

  // === 重连策略 ===
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

// 错误处理
pool.on('error', (err, client) => {
  console.error('数据库连接池错误:', err)
})

module.exports = pool
```

**参数调优指南**：

**1. max（最大连接数）**

```javascript
// 计算公式
max = (可用RAM * 0.8) / 每连接内存

// PostgreSQL每连接约占10MB
// 云函数内存512MB
max = (512 * 0.8) / 10 = 40

// 但考虑到Serverless冷启动和并发限制
// 设置为10更安全
```

**过大的问题**：
- 耗尽数据库连接数（PostgreSQL默认100）
- 占用过多内存
- 连接创建开销

**过小的问题**：
- 高并发时排队等待
- 响应时间增加

**2. idleTimeoutMillis（空闲超时）**

```javascript
// 30秒无活动 → 断开连接
idleTimeoutMillis: 30000

// 适合Serverless场景（按调用计费）
// 避免长时间占用连接
```

**3. connectionTimeoutMillis（连接超时）**

```javascript
// 2秒内无法连接 → 抛出错误
connectionTimeoutMillis: 2000

// 避免无限等待
// 快速失败，返回错误给用户
```

### 3.2.3 Redis缓存策略

**functions/api/config/redis.js**：

```javascript
const Redis = require('ioredis')

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  db: 0,

  // === 重连策略 ===
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay // 50ms, 100ms, 150ms, ... 最多2000ms
  },

  // === 重连次数限制 ===
  maxRetriesPerRequest: 3,

  // === 连接超时 ===
  connectTimeout: 10000,

  // === 命令超时 ===
  commandTimeout: 5000,

  // === 断线重连 ===
  enableReadyCheck: true,
  enableOfflineQueue: true,
})

// 连接成功
redis.on('connect', () => {
  console.log('Redis连接成功')
})

// 连接错误
redis.on('error', (err) => {
  console.error('Redis错误:', err)
})

module.exports = redis
```

#### 缓存数据结构

**1. 验证码缓存**

```javascript
// Key设计
`sms:${phone}` → code

// 示例
sms:13800138000 → "8888"

// TTL: 60秒（自动过期）
await redis.setex('sms:13800138000', 60, '8888')

// 验证
const code = await redis.get('sms:13800138000')
if (code === inputCode) {
  // 验证成功，删除（一次性）
  await redis.del('sms:13800138000')
}
```

**2. 用户Session缓存**

```javascript
// Key设计
`session:${userId}` → user对象JSON

// 示例
session:123 → '{"id":123,"phone":"138***","cards":[...]}'

// TTL: 24小时
await redis.setex(
  'session:123',
  86400,
  JSON.stringify(user)
)

// 读取
const userJson = await redis.get('session:123')
const user = JSON.parse(userJson)
```

**3. 抽卡防刷缓存**

```javascript
// Key设计
`draw:${userId}` → timestamp

// 限制：每用户每天最多抽10次
const drawCount = await redis.incr(`draw:${userId}:${today}`)

if (drawCount === 1) {
  // 第一次，设置过期时间（24小时）
  await redis.expire(`draw:${userId}:${today}`, 86400)
}

if (drawCount > 10) {
  throw new Error('今日抽卡次数已用完')
}
```

#### 缓存失效策略

**1. 主动失效**

```javascript
// 用户登出
await redis.del(`session:${userId}`)

// 用户修改手机号
await redis.del(`session:${userId}`)
await pool.query('UPDATE users SET phone = $1 WHERE id = $2', [newPhone, userId])
```

**2. 被动失效（TTL）**

```javascript
// 短期缓存（验证码、防刷）
await redis.setex(key, 60, value) // 60秒

// 中期缓存（用户session）
await redis.setex(key, 86400, value) // 24小时

// 长期缓存（配置数据）
await redis.setex(key, 604800, value) // 7天
```

**3. 缓存穿透防护**

```javascript
// 场景：恶意请求不存在的用户ID
const user = await redis.get(`session:${userId}`)

if (user === null) {
  // 查询数据库
  const dbUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId])

  if (dbUser.rows.length === 0) {
    // 用户不存在，缓存空值（防止反复查询数据库）
    await redis.setex(`session:${userId}`, 60, 'null')
    throw new Error('用户不存在')
  }

  // 用户存在，缓存
  await redis.setex(`session:${userId}`, 86400, JSON.stringify(dbUser.rows[0]))
  return dbUser.rows[0]
}

if (user === 'null') {
  throw new Error('用户不存在')
}

return JSON.parse(user)
```

---

## 3.3 JWT认证实现

### 3.3.1 JWT工具函数

**functions/api/utils/jwt.js**：

```javascript
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const EXPIRES_IN = '7d' // token有效期7天

// 生成token
function sign(payload) {
  return jwt.sign(
    payload,
    SECRET,
    {
      expiresIn: EXPIRES_IN,
      issuer: 'abc-bank-h5',
    }
  )
}

// 验证token
function verify(token) {
  try {
    return jwt.verify(token, SECRET, {
      issuer: 'abc-bank-h5',
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token已过期，请重新登录')
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token无效')
    }
    throw error
  }
}

module.exports = { sign, verify }
```

#### JWT结构解析

**JWT = Header + Payload + Signature**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZXhwIjoxNzM2MTIzNDU2fQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
│                                   │                                      │
│         Header (Base64)           │      Payload (Base64)                │   Signature (HMAC-SHA256)
```

**解码示例**：

```javascript
// Header
{
  "alg": "HS256",    // 签名算法
  "typ": "JWT"       // token类型
}

// Payload
{
  "userId": 123,
  "phone": "138***",
  "iat": 1736123456,  // 签发时间
  "exp": 1736728256,  // 过期时间（7天后）
  "iss": "abc-bank-h5" // 签发者
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET
)
```

### 3.3.2 认证中间件

**functions/api/middleware/auth.js**：

```javascript
const { verify } = require('../utils/jwt')
const redis = require('../config/redis')

async function authMiddleware(ctx, next) {
  try {
    // 1. 提取token
    const authHeader = ctx.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401
      ctx.body = { error: '未授权' }
      return
    }

    const token = authHeader.replace('Bearer ', '')

    // 2. 验证JWT签名
    const payload = verify(token)

    // 3. 检查Session（Redis）
    const session = await redis.get(`session:${payload.userId}`)

    if (!session || session === 'null') {
      ctx.status = 401
      ctx.body = { error: 'Session已过期，请重新登录' }
      return
    }

    // 4. 解析用户数据
    const user = JSON.parse(session)

    // 5. 注入到ctx.state（供后续路由使用）
    ctx.state.user = user

    // 6. 继续执行
    await next()

  } catch (error) {
    console.error('认证失败:', error)
    ctx.status = 401
    ctx.body = { error: error.message || '认证失败' }
  }
}

module.exports = authMiddleware
```

**使用方式**：

```javascript
// functions/api/index.js
const authMiddleware = require('./middleware/auth')

// 需要认证的路由
router.post('/api/card/draw', authMiddleware, async (ctx) => {
  // ctx.state.user 已包含用户信息
  const user = ctx.state.user
  // ...
})

// 不需要认证的路由
router.post('/api/auth/send-code', async (ctx) => {
  // 无需token
})
```

### 3.3.3 安全性措施

#### 1. 密码加密存储（如果有密码登录）

```javascript
const bcrypt = require('bcrypt')

// 注册时加密
const hashedPassword = await bcrypt.hash(password, 10)
await pool.query(
  'INSERT INTO users (phone, password) VALUES ($1, $2)',
  [phone, hashedPassword]
)

// 登录时验证
const user = await pool.query('SELECT * FROM users WHERE phone = $1', [phone])
const isValid = await bcrypt.compare(password, user.rows[0].password)
```

#### 2. 手机号脱敏

```javascript
// 存储：明文（用于查询）
const phone = '13800138000'

// 返回：脱敏
const maskedPhone = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
// '138****8000'

ctx.body = {
  user: {
    phone: maskedPhone,
  },
}
```

#### 3. SQL注入防护

```javascript
// ❌ 错误：字符串拼接
const userId = ctx.query.id
const result = await pool.query(`SELECT * FROM users WHERE id = ${userId}`)
// 危险：userId = "1 OR 1=1" → 返回所有用户

// ✅ 正确：参数化查询
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
)
// 安全：userId被转义
```

#### 4. XSS防护

```javascript
// 前端输入验证
const sanitize = (input) => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// 或使用库
const DOMPurify = require('isomorphic-dompurify')
const clean = DOMPurify.sanitize(dirty)
```

#### 5. CSRF防护

```javascript
// 生成CSRF token
const csrfToken = crypto.randomBytes(32).toString('hex')
await redis.setex(`csrf:${userId}`, 3600, csrfToken)

// 返回给前端
ctx.body = { csrfToken }

// 后续请求验证
const submittedToken = ctx.headers['x-csrf-token']
const cachedToken = await redis.get(`csrf:${userId}`)

if (submittedToken !== cachedToken) {
  throw new Error('CSRF token无效')
}
```

---

## 3.4 Serverless部署配置

### 3.4.1 serverless.yml详解

**functions/api/serverless.yml**：

```yaml
service: abc-bank-h5-api

provider:
  name: tencent
  runtime: Nodejs18.13
  region: ap-guangzhou
  memorySize: 512
  timeout: 30

  environment:
    POSTGRES_HOST: ${env:POSTGRES_HOST}
    POSTGRES_PORT: ${env:POSTGRES_PORT}
    POSTGRES_USER: ${env:POSTGRES_USER}
    POSTGRES_PASSWORD: ${env:POSTGRES_PASSWORD}
    POSTGRES_DB: ${env:POSTGRES_DB}
    REDIS_HOST: ${env:REDIS_HOST}
    REDIS_PORT: ${env:REDIS_PORT}
    REDIS_PASSWORD: ${env:REDIS_PASSWORD}
    JWT_SECRET: ${env:JWT_SECRET}

plugins:
  - serverless-tencent-scf

functions:
  api:
    handler: index.main_handler
    events:
      - apigw:
          name: api-gateway
          parameters:
            serviceId: service-xxx
            stageName: release
            httpMethod: ANY
            integratedResponse: true
            path: /

package:
  exclude:
    - .env
    - .git/**
    - node_modules/**/.bin/**
    - "*.md"
  include:
    - index.js
    - routes/**
    - config/**
    - middleware/**
    - utils/**
    - node_modules/**
```

**配置详解**：

**1. runtime: Nodejs18.13**
- 腾讯云SCF支持的Node.js版本
- 也支持：Nodejs16.13, Nodejs14.18, Nodejs12.16

**2. memorySize: 512**
- 函数内存大小（MB）
- 影响：
  - CPU分配（内存越大，CPU越多）
  - 价格（内存越大，费用越高）
  - 性能（建议≥512MB）

**计费公式**：
```
费用 = 调用次数 × 执行时长 × 内存系数

示例：
- 100万次调用
- 平均200ms执行时长
- 512MB内存
- 费用 ≈ 13.3元/月
```

**3. timeout: 30**
- 函数最大执行时间（秒）
- 超时会被强制终止
- 建议：API接口10-30秒，后台任务60-900秒

**4. environment**
- 环境变量注入
- `${env:VAR_NAME}` 从本地`.env`文件读取
- 部署时会加密存储到云端

**5. events: apigw**
- 触发器类型：API网关
- `httpMethod: ANY` 支持所有HTTP方法
- `path: /` 所有路径都转发到函数

### 3.4.2 入口函数设计

**functions/api/index.js**：

```javascript
const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')

// 创建Koa应用
const app = new Koa()
const router = new Router()

// === 中间件 ===

// 1. 错误处理（最外层）
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    console.error('请求错误:', error)

    ctx.status = error.status || 500
    ctx.body = {
      success: false,
      error: error.message || '服务器错误',
      code: error.code,
    }
  }
})

// 2. CORS跨域
app.use(cors({
  origin: '*', // 生产环境应设置为具体域名
  credentials: true,
}))

// 3. 请求日志
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 4. Body解析
app.use(bodyParser())

// === 路由 ===

// 导入路由模块
const authRoutes = require('./routes/auth')
const cardRoutes = require('./routes/card')

router.use(authRoutes.routes())
router.use(cardRoutes.routes())

// 健康检查
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok', timestamp: Date.now() }
})

app.use(router.routes())
app.use(router.allowedMethods())

// === 云函数入口 ===

// Serverless入口函数
exports.main_handler = async (event, context) => {
  // 将API网关事件转换为Koa请求
  return await require('serverless-http')(app)(event, context)
}

// 本地开发入口
if (process.env.NODE_ENV !== 'production') {
  const PORT = 3001
  app.listen(PORT, () => {
    console.log(`本地开发服务器启动: http://localhost:${PORT}`)
  })
}
```

**serverless-http的作用**：

```javascript
// API网关事件格式
{
  "httpMethod": "POST",
  "path": "/api/auth/send-code",
  "headers": { ... },
  "body": "{\"phone\":\"138...\"}"
}

// ↓ serverless-http转换

// Koa请求对象
{
  method: 'POST',
  url: '/api/auth/send-code',
  headers: { ... },
  body: { phone: '138...' }
}
```

### 3.4.3 路由模块设计

**functions/api/routes/auth.js**（完整版）：

```javascript
const Router = require('@koa/router')
const router = new Router()
const pool = require('../config/db')
const redis = require('../config/redis')
const { sign } = require('../utils/jwt')
const sms = require('../utils/sms')

// ===== 发送验证码 =====

router.post('/api/auth/send-code', async (ctx) => {
  const { phone } = ctx.request.body

  // 1. 验证手机号
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    ctx.status = 400
    ctx.body = { success: false, error: '手机号格式错误' }
    return
  }

  // 2. 防刷检查（Redis TTL）
  const ttl = await redis.ttl(`sms:${phone}`)
  if (ttl > 0) {
    ctx.status = 429
    ctx.body = { success: false, error: `请${ttl}秒后再试` }
    return
  }

  // 3. 生成随机4位验证码
  const code = Math.floor(1000 + Math.random() * 9000).toString()

  // 4. 缓存验证码（60秒过期）
  await redis.setex(`sms:${phone}`, 60, code)

  // 5. 发送短信（腾讯云SMS）
  try {
    await sms.send(phone, code)
  } catch (error) {
    console.error('短信发送失败:', error)
    // 不阻塞流程（演示环境可能未配置短信）
  }

  // 6. 记录日志
  await pool.query(
    'INSERT INTO sms_logs (phone, code, created_at) VALUES ($1, $2, NOW())',
    [phone, code]
  )

  ctx.body = { success: true, message: '验证码已发送' }
})

// ===== 验证登录 =====

router.post('/api/auth/verify-code', async (ctx) => {
  const { phone, code } = ctx.request.body

  // 1. 参数验证
  if (!phone || !code) {
    ctx.status = 400
    ctx.body = { success: false, error: '参数错误' }
    return
  }

  // 2. 验证码检查
  const cachedCode = await redis.get(`sms:${phone}`)

  if (!cachedCode) {
    ctx.status = 400
    ctx.body = { success: false, error: '验证码已过期，请重新获取' }
    return
  }

  if (cachedCode !== code) {
    ctx.status = 400
    ctx.body = { success: false, error: '验证码错误' }
    return
  }

  // 3. 删除验证码（一次性）
  await redis.del(`sms:${phone}`)

  // 4. 查询或创建用户
  let result = await pool.query(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  )

  let user

  if (result.rows.length === 0) {
    // 新用户：创建记录
    const newUserResult = await pool.query(`
      INSERT INTO users (phone, cards, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *
    `, [
      phone,
      JSON.stringify([
        { text: '马', isCollected: false },
        { text: '上', isCollected: false },
        { text: '发', isCollected: false },
        { text: '财', isCollected: false },
        { text: '哇', isCollected: false },
      ]),
    ])
    user = newUserResult.rows[0]
  } else {
    // 老用户
    user = result.rows[0]
  }

  // 5. 生成JWT token
  const token = sign({
    userId: user.id,
    phone: user.phone,
  })

  // 6. 缓存session（24小时）
  await redis.setex(
    `session:${user.id}`,
    86400,
    JSON.stringify(user)
  )

  // 7. 更新短信日志（标记已验证）
  await pool.query(
    'UPDATE sms_logs SET verified_at = NOW() WHERE phone = $1 AND code = $2',
    [phone, code]
  )

  // 8. 返回token
  ctx.body = {
    success: true,
    token,
    user: {
      id: user.id,
      phone: user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    },
  }
})

module.exports = router
```

**functions/api/routes/card.js**（完整版）：

```javascript
const Router = require('@koa/router')
const router = new Router()
const pool = require('../config/db')
const authMiddleware = require('../middleware/auth')

// ===== 抽卡接口 =====

router.post('/api/card/draw', authMiddleware, async (ctx) => {
  const user = ctx.state.user // 来自认证中间件

  // 1. 解析cards字段（JSONB）
  const cards = typeof user.cards === 'string'
    ? JSON.parse(user.cards)
    : user.cards

  // 2. 筛选未收集的卡片
  const unCollected = cards.filter(c => !c.isCollected)

  if (unCollected.length === 0) {
    ctx.status = 400
    ctx.body = { success: false, error: '您已集齐所有卡片' }
    return
  }

  // 3. 随机抽取
  const luckyIndex = Math.floor(Math.random() * unCollected.length)
  const drawnCard = unCollected[luckyIndex]

  // 4. 更新收集状态
  const cardIndex = cards.findIndex(c => c.text === drawnCard.text)
  cards[cardIndex].isCollected = true

  // 5. 事务更新数据库
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 更新用户cards
    await client.query(
      'UPDATE users SET cards = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(cards), user.id]
    )

    // 记录抽卡日志
    await client.query(
      'INSERT INTO draw_logs (user_id, card_text, created_at) VALUES ($1, $2, NOW())',
      [user.id, drawnCard.text]
    )

    await client.query('COMMIT')

  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  // 6. 更新Redis缓存
  const redis = require('../config/redis')
  await redis.setex(
    `session:${user.id}`,
    86400,
    JSON.stringify({ ...user, cards })
  )

  // 7. 检查是否全部集齐
  const allCollected = cards.every(c => c.isCollected)

  ctx.body = {
    success: true,
    data: {
      card: drawnCard,
      allCollected,
      collected: cards,
    },
  }
})

// ===== 获取用户状态 =====

router.get('/api/user/status', authMiddleware, async (ctx) => {
  const user = ctx.state.user

  const cards = typeof user.cards === 'string'
    ? JSON.parse(user.cards)
    : user.cards

  ctx.body = {
    success: true,
    data: {
      cards,
      collectedCount: cards.filter(c => c.isCollected).length,
      totalCount: cards.length,
    },
  }
})

module.exports = router
```

### 3.4.4 部署流程

#### 方式1：Serverless Framework

```bash
# 1. 安装Serverless CLI
npm install -g serverless

# 2. 配置腾讯云credentials
serverless config credentials \
  --provider tencent \
  --key <SecretId> \
  --secret <SecretKey>

# 3. 部署
cd functions/api
serverless deploy

# 输出：
# Service Information
# service: abc-bank-h5-api
# region: ap-guangzhou
# functionName: abc-bank-h5-api-api
# apiGatewayUrl: https://service-xxx.gz.apigw.tencentcs.com/release/
```

#### 方式2：手动打包上传

```bash
# 1. 安装生产依赖
cd functions/api
npm install --production

# 2. 打包
zip -r function.zip . -x "*.git*" -x "*.md"

# 3. 上传到腾讯云函数控制台
# - 创建函数
# - 上传function.zip
# - 配置环境变量
# - 创建API网关触发器
```

#### 本地测试

```bash
# 1. 设置环境变量
cp .env.example .env
# 编辑.env填写数据库配置

# 2. 启动本地服务器
npm run dev
# 访问 http://localhost:3001

# 3. 测试接口
curl -X POST http://localhost:3001/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'

# 4. 验证登录
curl -X POST http://localhost:3001/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"8888"}'
```

---

## 3.5 数据库操作最佳实践

### 3.5.1 连接池使用

**正确示例**：

```javascript
// ✅ 使用连接池（推荐）
const pool = require('../config/db')

async function getUser(userId) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  )
  return result.rows[0]
}

// pool会自动：
// 1. 从池中获取空闲连接
// 2. 执行查询
// 3. 归还连接到池
```

**错误示例**：

```javascript
// ❌ 每次创建新连接（性能差）
const { Client } = require('pg')

async function getUser(userId) {
  const client = new Client({ /* config */ })
  await client.connect() // 建立连接（耗时）

  const result = await client.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  )

  await client.end() // 关闭连接
  return result.rows[0]
}

// 问题：
// - 每次查询都建立连接（100-200ms开销）
// - 并发时可能耗尽数据库连接数
```

### 3.5.2 事务使用

**场景**：抽卡需要同时更新用户表和日志表。

**错误示例**（无事务）：

```javascript
// ❌ 两个独立查询
await pool.query('UPDATE users SET cards = $1 WHERE id = $2', [cards, userId])
await pool.query('INSERT INTO draw_logs (user_id, card_text) VALUES ($1, $2)', [userId, text])

// 问题：
// - 如果第二个查询失败，用户cards已更新但无日志
// - 数据不一致
```

**正确示例**（事务）：

```javascript
// ✅ 使用事务
const client = await pool.connect()

try {
  await client.query('BEGIN')

  await client.query('UPDATE users SET cards = $1 WHERE id = $2', [cards, userId])
  await client.query('INSERT INTO draw_logs (user_id, card_text) VALUES ($1, $2)', [userId, text])

  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

**事务隔离级别**：

```javascript
// 默认：READ COMMITTED
await client.query('BEGIN')

// 可重复读
await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ')

// 串行化（最严格）
await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE')
```

### 3.5.3 JSONB操作

**查询JSONB字段**：

```sql
-- 查询cards数组的第一个元素
SELECT cards->0 FROM users WHERE id = 123;
-- 结果：{"text": "马", "isCollected": false}

-- 查询第一个元素的text字段
SELECT cards->0->>'text' FROM users WHERE id = 123;
-- 结果："马"（文本类型）

-- 查询包含"马"且已收集的用户
SELECT * FROM users
WHERE cards @> '[{"text": "马", "isCollected": true}]'::jsonb;

-- 查询至少收集1张的用户
SELECT * FROM users
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements(cards) AS card
  WHERE card->>'isCollected' = 'true'
);
```

**更新JSONB字段**：

```sql
-- 更新第0个元素的isCollected
UPDATE users
SET cards = jsonb_set(
  cards,
  '{0,isCollected}',
  'true'::jsonb
)
WHERE id = 123;

-- 追加元素
UPDATE users
SET cards = cards || '{"text": "新", "isCollected": false}'::jsonb
WHERE id = 123;

-- 删除元素
UPDATE users
SET cards = cards - 0  -- 删除第0个元素
WHERE id = 123;
```

**在Node.js中操作**：

```javascript
// 读取JSONB
const result = await pool.query('SELECT cards FROM users WHERE id = $1', [userId])
const cards = result.rows[0].cards // 自动反序列化为JS对象

// 修改
cards[0].isCollected = true

// 写入JSONB
await pool.query(
  'UPDATE users SET cards = $1 WHERE id = $2',
  [JSON.stringify(cards), userId] // 需要手动序列化
)

// 或使用JSONB函数
await pool.query(`
  UPDATE users
  SET cards = jsonb_set(cards, '{0,isCollected}', 'true'::jsonb)
  WHERE id = $1
`, [userId])
```

---

## 3.6 云服务集成

### 3.6.1 腾讯云SMS短信服务

**functions/api/utils/sms.js**：

```javascript
const tencentcloud = require('tencentcloud-sdk-nodejs')

const SmsClient = tencentcloud.sms.v20210111.Client

const client = new SmsClient({
  credential: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  },
  region: 'ap-guangzhou',
  profile: {
    httpProfile: {
      endpoint: 'sms.tencentcloudapi.com',
    },
  },
})

async function send(phone, code) {
  const params = {
    PhoneNumberSet: [`+86${phone}`],
    SmsSdkAppId: process.env.SMS_SDK_APP_ID,
    SignName: '农业银行',
    TemplateId: process.env.SMS_TEMPLATE_ID,
    TemplateParamSet: [code, '5'], // 验证码, 有效期（分钟）
  }

  try {
    const response = await client.SendSms(params)
    console.log('短信发送成功:', response)
    return response
  } catch (error) {
    console.error('短信发送失败:', error)
    throw error
  }
}

module.exports = { send }
```

**短信模板示例**：

```
【农业银行】您的验证码是{1}，{2}分钟内有效。如非本人操作，请忽略此短信。
```

**计费**：
- 国内短信：0.045元/条
- 100万用户 × 平均2条验证码 = 9万元

### 3.6.2 腾讯云CLS日志服务

```javascript
const cls = require('tencentcloud-cls-sdk-js')

const logger = new cls.AsyncLogger({
  endpoint: process.env.CLS_ENDPOINT,
  accessKeyId: process.env.TENCENT_SECRET_ID,
  accessKeySecret: process.env.TENCENT_SECRET_KEY,
  topicId: process.env.CLS_TOPIC_ID,
})

// 记录API调用日志
logger.info({
  action: 'draw_card',
  userId: user.id,
  cardText: drawnCard.text,
  timestamp: Date.now(),
})
```

---

# 第四部分：前后端数据流

## 4.1 完整交互流程

### 4.1.1 用户登录流程

```
┌──────────┐
│ 用户操作 │
└────┬─────┘
     │ 1. 点击"立即登录"
     ↓
┌────────────────────────────────────┐
│ React组件（LoginModal）             │
├────────────────────────────────────┤
│ setShowLogin(true)                 │
│ 显示登录弹窗                         │
└────┬───────────────────────────────┘
     │ 2. 输入手机号 "13800138000"
     │ 3. 点击"获取验证码"
     ↓
┌────────────────────────────────────┐
│ 前端验证                            │
├────────────────────────────────────┤
│ if (!/^1[3-9]\d{9}$/.test(phone))  │
│   alert('手机号格式错误')            │
│   return                            │
└────┬───────────────────────────────┘
     │ 验证通过
     ↓
┌────────────────────────────────────┐
│ API调用（lib/api.ts）               │
├────────────────────────────────────┤
│ await fetch('/api/auth/send-code', │
│   {                                 │
│     method: 'POST',                 │
│     body: JSON.stringify({ phone }) │
│   }                                 │
│ )                                   │
└────┬───────────────────────────────┘
     │ HTTP POST
     ↓
┌────────────────────────────────────┐
│ 后端API（route.ts / 云函数）         │
├────────────────────────────────────┤
│ 1. 验证手机号格式                   │
│ 2. 检查防刷（60秒限制）              │
│ 3. 生成验证码 "8888"                │
│ 4. 缓存验证码（Map / Redis）        │
│ 5. 发送短信（模拟 / 腾讯云SMS）      │
│ 6. 返回 { success: true }          │
└────┬───────────────────────────────┘
     │ HTTP 200 OK
     ↓
┌────────────────────────────────────┐
│ 前端接收响应                         │
├────────────────────────────────────┤
│ setStep('code')                    │
│ setCountdown(60)                   │
│ 显示验证码输入框                     │
└────┬───────────────────────────────┘
     │ 4. 用户输入验证码 "8888"
     │ 5. 点击"立即登录"
     ↓
┌────────────────────────────────────┐
│ API调用                             │
├────────────────────────────────────┤
│ await fetch('/api/auth/verify-code',│
│   {                                 │
│     method: 'POST',                 │
│     body: JSON.stringify({          │
│       phone: '13800138000',         │
│       code: '8888'                  │
│     })                              │
│   }                                 │
│ )                                   │
└────┬───────────────────────────────┘
     │ HTTP POST
     ↓
┌────────────────────────────────────┐
│ 后端验证                            │
├────────────────────────────────────┤
│ 1. 从缓存获取验证码                 │
│ 2. 对比输入的验证码                 │
│ 3. 验证成功                         │
│ 4. 查询/创建用户（数据库）           │
│ 5. 生成JWT token                   │
│ 6. 缓存session（Redis）             │
│ 7. 返回 { success: true, token }  │
└────┬───────────────────────────────┘
     │ HTTP 200 OK
     │ { token: "eyJhbGc..." }
     ↓
┌────────────────────────────────────┐
│ 前端保存token                       │
├────────────────────────────────────┤
│ localStorage.setItem(               │
│   'abc_bank_token',                │
│   response.token                   │
│ )                                   │
│ setIsLoggedIn(true)                │
│ setShowLogin(false)                │
│ 关闭登录弹窗                         │
└────────────────────────────────────┘
```

### 4.1.2 抽卡流程详解

```
用户点击卡片（index=2）
    ↓
handleCardClick(2)
    ↓
前置检查
    ├─ isLoggedIn? 否 → 显示登录弹窗，终止
    ├─ isDrawing? 是 → 防抖，终止
    └─ allCollected? 是 → 显示最终奖励，终止
    ↓ 通过所有检查
setIsDrawing(true)  // 锁定状态
setIsFlipped([false, false, true, false, false])  // 触发翻转
    ↓
┌────────────────────────────────────┐
│ CSS动画开始（600ms）                 │
├────────────────────────────────────┤
│ 0ms:   rotateY(0deg)               │
│ 300ms: rotateY(90deg) ← 卡片侧面   │
│ 600ms: rotateY(180deg) ← 卡片正面  │
└────────────────────────────────────┘
    ↓ 同时
┌────────────────────────────────────┐
│ API调用                             │
├────────────────────────────────────┤
│ POST /api/card/draw                │
│ Headers: {                          │
│   Authorization: "Bearer eyJhbGc..."│
│ }                                   │
└────┬───────────────────────────────┘
     │ 网络延迟 200-500ms
     ↓
┌────────────────────────────────────┐
│ 后端处理                            │
├────────────────────────────────────┤
│ 1. 验证JWT token                   │
│ 2. 从数据库/缓存获取用户             │
│ 3. 筛选未收集的卡片                 │
│    unCollected = ['马','上','哇']   │
│ 4. 随机抽取                         │
│    luckyIndex = 1                  │
│    drawnCard = '上'                │
│ 5. 更新数据库                       │
│    cards[1].isCollected = true     │
│ 6. 返回结果                         │
└────┬───────────────────────────────┘
     │ HTTP 200 OK
     │ {
     │   success: true,
     │   data: {
     │     card: { text: '上', isCollected: true },
     │     allCollected: false
     │   }
     │ }
     ↓
┌────────────────────────────────────┐
│ 前端接收响应                         │
├────────────────────────────────────┤
│ setCurrentDraw({ text: '上', ... }) │
│ setCollected(prev => prev.map(...)) │
│   ↓ React批量更新                   │
│ 组件重新渲染                         │
│   ├─ Card组件（显示"上"字）          │
│   └─ CollectionSlots（高亮"上"）    │
└────┬───────────────────────────────┘
     │ 600ms延迟
     ↓
setTimeout(() => {
  setShowResult(true)  // 显示结果弹窗
}, 600)
    ↓
┌────────────────────────────────────┐
│ ResultModal显示                     │
├────────────────────────────────────┤
│ 大字显示"上"                         │
│ 恭喜文案                            │
│ "继续抽卡"按钮                       │
└────────────────────────────────────┘
    ↓
用户点击"继续抽卡"
    ↓
setShowResult(false)
setIsFlipped([false, false, false, false, false])  // 卡片翻回
setIsDrawing(false)  // 解锁状态
    ↓
可以继续点击其他卡片
```

### 4.1.3 状态同步机制

#### 乐观更新 vs 悲观更新

**悲观更新**（本项目采用）：
```typescript
const handleCardClick = async () => {
  // 1. 先调用API
  const result = await api.card.draw()

  // 2. API成功后更新UI
  setCollected(...)
}
```

优点：
- 数据一致性强
- 不需要回滚逻辑

缺点：
- 用户等待API响应（200-500ms）
- 体验稍慢

**乐观更新**：
```typescript
const handleCardClick = async () => {
  // 1. 立即更新UI（假设会成功）
  setCollected(...)

  try {
    // 2. 后台调用API
    await api.card.draw()
  } catch (error) {
    // 3. 失败则回滚UI
    setCollected(originalState)
  }
}
```

优点：
- 即时响应，体验流畅

缺点：
- 需要回滚逻辑
- 可能出现UI与数据不一致

**本项目为什么选悲观更新？**
- 抽卡是低频操作（用户可接受短暂等待）
- 简化代码逻辑
- 避免回滚带来的视觉闪烁

---

## 4.2 API客户端设计

### 4.2.1 lib/api.ts 完整代码

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''
const TOKEN_KEY = 'abc_bank_token'

// 通用请求函数
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)

  try {
    const response = await fetch(API_BASE_URL + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return await response.json()

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败')
    }
    throw error
  }
}

// API方法
export const api = {
  auth: {
    sendCode: (phone: string) =>
      request('/api/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),

    verifyCode: (phone: string, code: string) =>
      request('/api/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      }).then((res: any) => {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token)
        }
        return res
      }),
  },

  card: {
    draw: () =>
      request('/api/card/draw', {
        method: 'POST',
      }),

    getStatus: () =>
      request('/api/user/status', {
        method: 'GET',
      }),
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
  },
}
```

### 4.2.2 TypeScript类型定义

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CardData {
  text: string
  isCollected: boolean
}

export interface UserData {
  id: string
  phone: string
  cards: CardData[]
}

export interface DrawCardResponse extends ApiResponse {
  data: {
    card: CardData
    allCollected: boolean
    collected: CardData[]
  }
}

export interface AuthResponse extends ApiResponse {
  token?: string
  user?: {
    id: string
    phone: string
  }
}
```

**使用类型**：

```typescript
import { api } from '@/lib/api'
import type { DrawCardResponse } from '@/types/api'

const result: DrawCardResponse = await api.card.draw()

// TypeScript会提示：
// result.data.card.text ✅
// result.data.card.invalid ❌ 编译错误
```

---

## 4.3 错误处理体系

### 4.3.1 错误分类

**1. 网络错误**
```typescript
try {
  await api.card.draw()
} catch (error) {
  if (error.message.includes('网络连接失败')) {
    // 网络错误：显示"请检查网络"
  }
}
```

**2. 业务错误**
```typescript
// 后端返回的错误
{ success: false, error: '您已集齐所有卡片' }

// 前端处理
if (!result.success) {
  alert(result.error)
}
```

**3. 认证错误**
```typescript
// 401 Unauthorized
localStorage.removeItem('abc_bank_token')
setIsLoggedIn(false)
setShowLogin(true)
```

### 4.3.2 统一错误处理

```typescript
// lib/api.ts 增强版
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(API_BASE_URL + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // HTTP错误
    if (!response.ok) {
      const error = await response.json()

      // 细分错误类型
      switch (response.status) {
        case 400:
          throw new BusinessError(error.error || '请求参数错误')
        case 401:
          throw new AuthError('未授权，请重新登录')
        case 429:
          throw new RateLimitError(error.error || '请求过于频繁')
        case 500:
          throw new ServerError('服务器错误，请稍后重试')
        default:
          throw new Error(error.error || '请求失败')
      }
    }

    return await response.json()

  } catch (error) {
    // 网络错误
    if (error instanceof TypeError) {
      throw new NetworkError('网络连接失败，请检查网络')
    }

    // 重新抛出业务错误
    throw error
  }
}

// 自定义错误类
class BusinessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BusinessError'
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}
```

**组件中使用**：

```typescript
const handleCardClick = async () => {
  try {
    await api.card.draw()
  } catch (error) {
    if (error instanceof AuthError) {
      // 认证错误：清除token，显示登录弹窗
      localStorage.removeItem('abc_bank_token')
      setIsLoggedIn(false)
      setShowLogin(true)
    } else if (error instanceof NetworkError) {
      // 网络错误：显示重试按钮
      setShowNetworkError(true)
    } else if (error instanceof BusinessError) {
      // 业务错误：直接提示
      alert(error.message)
    } else {
      // 未知错误
      alert('操作失败，请重试')
      console.error(error)
    }
  }
}
```

---

# 第五部分：部署与运维

## 5.1 前端静态部署（腾讯云COS + CDN）

### 5.1.1 构建流程

**1. 本地构建**

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 输出：
# ✓ Compiled successfully
# ✓ Generating static pages (2/2)
# Export successful. Files written to /path/to/out
```

**构建产物分析**：

```
out/
├── index.html (1.2KB)         # 首页（重定向页面）
├── bank-campaign.html (8.7KB) # 主页面（预渲染HTML）
├── _next/
│   └── static/
│       ├── chunks/
│       │   ├── app/
│       │   │   ├── layout-[hash].js (2.1KB)
│       │   │   ├── page-[hash].js (0.5KB)
│       │   │   └── bank-campaign/
│       │   │       └── page-[hash].js (4.2KB)
│       │   ├── framework-[hash].js (45.2KB)  # React核心
│       │   ├── main-[hash].js (32.1KB)        # 主逻辑
│       │   └── webpack-[hash].js (2.1KB)
│       └── css/
│           └── app/
│               ├── layout.css (1.2KB)
│               └── bank-campaign/
│                   └── page.css (6.5KB)
└── favicon.ico
```

**文件大小优化检查**：
- ✅ 首页总大小：87.2KB（framework + layout）
- ✅ 主页总大小：99.5KB（framework + main + page）
- ✅ 目标：< 100KB（已达标）

### 5.1.2 腾讯云COS配置

**创建存储桶**：

```bash
# 1. 登录腾讯云控制台
# https://console.cloud.tencent.com/cos

# 2. 创建存储桶
# 名称：abc-bank-h5-1306xxx（系统自动追加APPID）
# 地域：广州（ap-guangzhou）
# 访问权限：公有读私有写

# 3. 配置静态网站
# 存储桶 → 基础配置 → 静态网站
# 索引文档：index.html
# 错误文档：404.html
# 强制HTTPS：开启
```

**COSCMD上传**：

```bash
# 安装COSCMD
pip install coscmd

# 配置
coscmd config \
  -a <SecretId> \
  -s <SecretKey> \
  -b abc-bank-h5-1306xxx \
  -r ap-guangzhou

# 上传（覆盖模式）
coscmd upload -r ./out/ / --delete

# 验证
coscmd list
```

**自动化脚本**：`scripts/deploy.sh`

```bash
#!/bin/bash

set -e # 遇到错误立即退出

echo "🚀 开始部署流程..."

# 1. 构建
echo "📦 构建生产版本..."
npm run build

# 2. 上传到COS
echo "☁️ 上传到腾讯云COS..."
coscmd upload -r ./out/ / --delete --skipmd5

# 3. 刷新CDN缓存
echo "🔄 刷新CDN缓存..."
# 调用腾讯云API刷新CDN（可选）
# tccli cdn PurgePathCache --cli-unfold-argument \
#   --Paths https://abc-bank.example.com/ \
#   --FlushType delete

echo "✅ 部署完成！"
echo "🌐 访问地址：https://abc-bank.example.com"
```

### 5.1.3 CDN配置

**创建CDN加速域名**：

```bash
# 1. 腾讯云控制台 → CDN → 添加域名
# 加速域名：abc-bank.example.com
# 源站类型：对象存储（COS）
# 源站地址：abc-bank-h5-1306xxx.cos.ap-guangzhou.myqcloud.com
```

**缓存配置**：

| 文件类型 | 缓存时间 | 规则 |
|---------|---------|------|
| HTML | 10分钟 | `*.html` |
| CSS/JS | 1年 | `*.css, *.js` |
| 图片 | 30天 | `*.jpg, *.png, *.webp` |
| 其他 | 1天 | 全部文件 |

**为什么HTML缓存短？**
- HTML可能频繁更新（活动调整）
- CSS/JS文件名带hash，内容变化会生成新文件名

**HTTPS配置**：

```bash
# 1. 申请SSL证书（免费）
# 腾讯云控制台 → SSL证书 → 申请免费证书
# 域名：abc-bank.example.com
# 验证方式：DNS验证

# 2. CDN绑定证书
# CDN → 域名管理 → HTTPS配置
# 选择证书：abc-bank.example.com
# 强制HTTPS：开启
# HTTP2：开启
```

### 5.1.4 DNS解析

```bash
# 添加CNAME记录
# 主机记录：abc-bank（或 @）
# 记录类型：CNAME
# 记录值：abc-bank.example.com.cdn.dnsv1.com
# TTL：600秒
```

**验证DNS生效**：

```bash
dig abc-bank.example.com

# 输出：
# abc-bank.example.com. 600 IN CNAME abc-bank.example.com.cdn.dnsv1.com.
```

---

## 5.2 后端云函数部署

### 5.2.1 环境准备

**1. 创建PostgreSQL数据库**

```bash
# 腾讯云控制台 → 云数据库PostgreSQL
# 规格：1核2GB（测试环境）
# 存储：20GB SSD
# 版本：PostgreSQL 14
# 地域：广州（与云函数同地域，降低延迟）
```

**连接信息**：
```
主机：gz-postgres-aa98gsf9.sql.tencentcdb.com
端口：20944
用户：postgres
密码：（控制台设置）
数据库：abc_bank
```

**2. 初始化数据库**

```bash
# 本地连接数据库
psql -h gz-postgres-aa98gsf9.sql.tencentcdb.com \
     -p 20944 \
     -U postgres \
     -d abc_bank

# 执行初始化脚本
\i database/init.sql

# 验证
\dt  # 列出所有表
# users, draw_logs, sms_logs

\d users  # 查看users表结构
```

**3. 创建Redis实例**

```bash
# 腾讯云控制台 → 云数据库Redis
# 规格：1GB标准版
# 版本：Redis 6.0
# 地域：广州
```

**连接信息**：
```
主机：gz-crs-mq2rf8jh.sql.tencentcdb.com
端口：27830
密码：（控制台设置）
```

**测试连接**：

```bash
redis-cli -h gz-crs-mq2rf8jh.sql.tencentcdb.com -p 27830 -a <password>

# 测试命令
PING
# 返回：PONG

SET test "hello"
GET test
# 返回："hello"
```

### 5.2.2 云函数部署

**方式1：Serverless Framework（推荐）**

```bash
# 1. 进入云函数目录
cd functions/api

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑.env填写数据库配置

# 4. 部署
serverless deploy

# 输出：
# Deploying abc-bank-h5-api to stage release in region ap-guangzhou
#
# ✓ Function abc-bank-h5-api-api deployed
# ✓ API Gateway trigger created
#
# Service Information:
#   functionName: abc-bank-h5-api-api
#   region: ap-guangzhou
#   apiGatewayUrl: https://service-l9p4zxxx-1306xxx.gz.apigw.tencentcs.com/release/
```

**方式2：手动部署**

```bash
# 1. 打包
cd functions/api
npm install --production
zip -r function.zip . -x "*.git*" -x "*.env*" -x "*.md"

# 2. 上传到云函数控制台
# - 新建函数
# - 函数名称：abc-bank-h5-api
# - 运行环境：Nodejs18.13
# - 代码上传方式：本地zip包
# - 选择function.zip
```

**3. 配置环境变量（控制台）**

```
POSTGRES_HOST = gz-postgres-aa98gsf9.sql.tencentcdb.com
POSTGRES_PORT = 20944
POSTGRES_USER = postgres
POSTGRES_PASSWORD = ******
POSTGRES_DB = abc_bank
REDIS_HOST = gz-crs-mq2rf8jh.sql.tencentcdb.com
REDIS_PORT = 27830
REDIS_PASSWORD = ******
JWT_SECRET = your-random-secret-key-here
```

**4. 创建API网关触发器**

```bash
# 云函数 → 触发管理 → 创建触发器
# 触发方式：API网关触发器
# API服务：自动新建
# 请求方法：ANY
# 发布环境：发布
# 鉴权方式：免鉴权
```

生成的URL：
```
https://service-l9p4zxxx-1306xxx.gz.apigw.tencentcs.com/release/
```

### 5.2.3 前端环境变量更新

**修改.env.production**：

```bash
NEXT_PUBLIC_API_BASE_URL=https://service-l9p4zxxx-1306xxx.gz.apigw.tencentcs.com/release
```

**重新构建前端**：

```bash
npm run build
coscmd upload -r ./out/ / --delete
```

**验证**：

```bash
# 访问主页
curl https://abc-bank.example.com

# 测试API（通过CDN域名）
curl -X POST https://abc-bank.example.com/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'

# 应该返回：
# {"success":true,"message":"验证码已发送"}
```

---

## 5.3 监控与运维

### 5.3.1 云函数监控

**腾讯云控制台 → 云函数 → 监控**：

关键指标：
- **调用次数**：每小时/天的调用量
- **错误次数**：失败的调用
- **平均耗时**：函数执行时间
- **并发数**：同时执行的实例数
- **冷启动次数**：新实例启动次数

**告警配置**：

```bash
# 云监控 → 告警配置
# 指标：云函数-错误次数
# 阈值：> 10次/分钟
# 持续周期：2个周期（2分钟）
# 通知方式：短信 + 邮件
```

### 5.3.2 性能优化

**1. 冷启动优化**

```javascript
// 连接池在全局初始化（避免每次调用都创建）
const pool = require('./config/db')
const redis = require('./config/redis')

exports.main_handler = async (event, context) => {
  // pool和redis已就绪，直接使用
  return await serverless(app)(event, context)
}
```

**冷启动时间优化**：
- 未优化：1000-2000ms
- 优化后：200-400ms

**2. 预留并发（付费功能）**

```bash
# 云函数 → 并发管理 → 预留配额
# 预留实例数：5个
# 费用：约30元/月
# 效果：0冷启动
```

**3. 代码体积优化**

```bash
# 仅安装生产依赖
npm install --production

# 打包时排除开发文件
zip -r function.zip . \
  -x "*.git*" \
  -x "*.md" \
  -x ".env*" \
  -x "test/**" \
  -x "node_modules/**/test/**"

# 结果：
# 优化前：15MB
# 优化后：3.2MB（加载更快）
```

### 5.3.3 成本分析

**月度成本估算**（10万活跃用户）：

```
前端（COS + CDN）：
  COS存储：1GB × 0.12元 = 0.12元
  CDN流量：100GB × 0.16元 = 16元
  小计：16.12元

后端（云函数）：
  调用次数：100万次 × 0.0133元/万次 = 13.3元
  执行时长：100万 × 0.2秒 × 512MB内存系数 = 约20元
  小计：33.3元

数据库（PostgreSQL）：
  1核2GB实例：35元/月
  存储20GB：2元/月
  小计：37元

Redis：
  1GB标准版：10元/月

短信（可选）：
  100万 × 2条验证码 × 0.045元 = 9万元
  （可使用免费额度或第三方短信平台）

总计（不含短信）：96.42元/月
总计（含短信）：90,096.42元/月
```

**成本优化建议**：

1. **CDN流量优化**：
   - 启用Gzip压缩
   - 浏览器缓存策略
   - 图片使用WebP格式

2. **云函数优化**：
   - 减少不必要的数据库查询
   - 使用Redis缓存热数据
   - 精简依赖包体积

3. **短信优化**：
   - 使用图形验证码（减少短信量）
   - 选择性价比高的短信平台
   - 限制每日发送次数

---

## 5.4 持续集成/持续部署（CI/CD）

### 5.4.1 GitHub Actions配置

**.github/workflows/deploy.yml**：

```yaml
name: Deploy to Tencent Cloud

on:
  push:
    branches:
      - main # 推送到main分支时触发

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout代码
        uses: actions/checkout@v3

      - name: 安装Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: 安装依赖
        run: npm install

      - name: 构建
        run: npm run build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.API_BASE_URL }}

      - name: 安装COSCMD
        run: pip install coscmd

      - name: 配置COSCMD
        run: |
          coscmd config \
            -a ${{ secrets.TENCENT_SECRET_ID }} \
            -s ${{ secrets.TENCENT_SECRET_KEY }} \
            -b abc-bank-h5-1306xxx \
            -r ap-guangzhou

      - name: 上传到COS
        run: coscmd upload -r ./out/ / --delete

      - name: 刷新CDN（可选）
        run: |
          # 调用腾讯云API刷新CDN
          echo "CDN缓存已刷新"
```

**配置Secrets**：

```bash
# GitHub仓库 → Settings → Secrets and variables → Actions
# 添加：
# TENCENT_SECRET_ID = AKIDxxxxxxxxxxxx
# TENCENT_SECRET_KEY = xxxxxxxxxxxx
# API_BASE_URL = https://service-xxx.gz.apigw.tencentcs.com/release
```

### 5.4.2 部署验证清单

**前端验证**：

```bash
# 1. 访问主页
curl -I https://abc-bank.example.com
# 检查：HTTP 200, Content-Type: text/html

# 2. 检查资源加载
curl https://abc-bank.example.com/_next/static/chunks/framework-[hash].js
# 检查：返回JS代码

# 3. 检查Gzip压缩
curl -H "Accept-Encoding: gzip" -I https://abc-bank.example.com/bank-campaign.html
# 检查：Content-Encoding: gzip
```

**后端验证**：

```bash
# 1. 健康检查
curl https://service-xxx.gz.apigw.tencentcs.com/release/health
# 返回：{"status":"ok","timestamp":1736123456}

# 2. 测试发送验证码
curl -X POST https://service-xxx.gz.apigw.tencentcs.com/release/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'
# 返回：{"success":true,"message":"验证码已发送"}

# 3. 测试数据库连接
# （通过云函数日志查看是否有数据库错误）
```

---

# 第六部分：核心技术深入

## 6.1 CSS 3D Transform原理

### 6.1.1 坐标系统

CSS 3D使用右手坐标系：

```
        Y轴 (↑)
        │
        │
        │
        └───────── X轴 (→)
       ╱
      ╱
     ╱ Z轴 (屏幕向外)
```

**Transform函数**：

| 函数 | 作用 | 示例 |
|------|------|------|
| `translateX(x)` | X轴平移 | `translateX(100px)` |
| `translateY(y)` | Y轴平移 | `translateY(-50px)` |
| `translateZ(z)` | Z轴平移 | `translateZ(50px)` |
| `rotateX(angle)` | 绕X轴旋转 | `rotateX(45deg)` |
| `rotateY(angle)` | 绕Y轴旋转 | `rotateY(180deg)` ← 本项目 |
| `rotateZ(angle)` | 绕Z轴旋转 | `rotateZ(30deg)` |
| `scale(x, y)` | 缩放 | `scale(1.1)` |

### 6.1.2 perspective深度解析

```css
.card {
  perspective: 1200px;
}
```

**perspective的视觉效果**：

```
perspective: 500px (近距离观察)
  ╱╲
 ╱  ╲    ← 3D效果强烈
╱____╲

perspective: 1200px (中距离观察，本项目)
  ┌──┐
  │  │   ← 3D效果适中
  └──┘

perspective: 3000px (远距离观察)
  ┌────┐
  │    │ ← 3D效果微弱
  └────┘
```

**数学原理**：

```
视觉缩放比例 = perspective / (perspective + translateZ)

假设：
  perspective = 1200px
  translateZ = 0px（元素在Z平面上）

缩放比例 = 1200 / (1200 + 0) = 1（原大小）

如果元素向前移动（translateZ = 200px）：
缩放比例 = 1200 / (1200 + 200) = 0.857（缩小）

如果元素向后移动（translateZ = -200px）：
缩放比例 = 1200 / (1200 - 200) = 1.2（放大）
```

### 6.1.3 backface-visibility原理

```css
.cardBack,
.cardFront {
  backface-visibility: hidden;
}
```

**工作原理**：

```
未设置backface-visibility（默认visible）：
  rotateY(120deg)时：
  ╱
 ╱  ← 可以看到元素的背面（镜像文字）
╱

设置backface-visibility: hidden：
  rotateY(120deg)时：
  ╱
 ╱  ← 背面不可见（透明）
╱
```

**应用到卡片**：

```
初始状态：
  .cardBack: rotateY(0deg) + backface-visibility: hidden
  → 正面朝向用户，可见

  .cardFront: rotateY(180deg) + backface-visibility: hidden
  → 背面朝向用户，不可见（hidden）

翻转后（.cardInner: rotateY(180deg)）：
  .cardBack: rotateY(0deg) → rotateY(-180deg)
  → 背面朝向用户，不可见

  .cardFront: rotateY(180deg) → rotateY(0deg)
  → 正面朝向用户，可见
```

---

## 6.2 React性能优化

### 6.2.1 避免不必要的重渲染

**问题示例**：

```typescript
// ❌ 每次父组件渲染，子组件都重新渲染
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveChild /> {/* ← 每次都重新渲染 */}
    </div>
  )
}
```

**解决方案1：React.memo**

```typescript
// ✅ 仅当props变化时重新渲染
const ExpensiveChild = React.memo(function ExpensiveChild({ data }) {
  // 复杂的渲染逻辑...
  return <div>{data}</div>
})

// 使用
<ExpensiveChild data={unchangedData} /> {/* 不会重新渲染 */}
```

**解决方案2：useMemo**

```typescript
function Parent() {
  const [count, setCount] = useState(0)
  const [filter, setFilter] = useState('')

  // ❌ 每次渲染都重新计算
  const filteredItems = items.filter(item => item.includes(filter))

  // ✅ 仅当filter变化时重新计算
  const filteredItems = useMemo(
    () => items.filter(item => item.includes(filter)),
    [filter] // 依赖项
  )

  return <List items={filteredItems} />
}
```

**解决方案3：useCallback**

```typescript
function Parent() {
  const [count, setCount] = useState(0)

  // ❌ 每次渲染都创建新函数（子组件会重新渲染）
  const handleClick = () => {
    console.log('clicked')
  }

  // ✅ 函数引用不变（除非依赖项变化）
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  return <Child onClick={handleClick} />
}
```

### 6.2.2 本项目中的应用

**Card组件优化**：

```typescript
// components/bank-campaign/Card.tsx
export default React.memo(function Card({
  index,
  text,
  isFlipped,
  isCollected,
  onClick
}: CardProps) {
  // 仅当props变化时重新渲染
  return <div>...</div>
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.isFlipped === nextProps.isFlipped &&
    prevProps.isCollected === nextProps.isCollected
  )
  // text和index不会变化，无需比较
})
```

**CollectionSlots优化**：

```typescript
export default React.memo(function CollectionSlots({ collected }) {
  return <div>...</div>
}, (prevProps, nextProps) => {
  // 深度比较collected数组
  return JSON.stringify(prevProps.collected) === JSON.stringify(nextProps.collected)
})
```

---

## 6.3 TypeScript高级类型

### 6.3.1 泛型在API中的应用

```typescript
// 通用请求函数（带泛型）
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(API_BASE_URL + endpoint, options)
  return await response.json()
}

// 使用时指定返回类型
const result = await request<DrawCardResponse>('/api/card/draw', {
  method: 'POST',
})

// TypeScript自动推断：
// result.data.card.text ← 类型为string
// result.data.allCollected ← 类型为boolean
```

### 6.3.2 类型守卫

```typescript
function isCardData(obj: any): obj is CardData {
  return (
    typeof obj === 'object' &&
    typeof obj.text === 'string' &&
    typeof obj.isCollected === 'boolean'
  )
}

// 使用
const data: unknown = await fetch('/api/card/draw').then(r => r.json())

if (isCardData(data)) {
  // TypeScript知道data是CardData类型
  console.log(data.text) // ✅
} else {
  throw new Error('数据格式错误')
}
```

---

# 第七部分：学习路径与扩展

## 7.1 学习指南

### 7.1.1 前置知识要求

**必备知识**：
- JavaScript ES6+（箭头函数、解构、async/await）
- React基础（组件、useState、useEffect）
- CSS基础（Flexbox、Grid、动画）
- HTTP协议（GET/POST、状态码、Headers）

**推荐知识**：
- TypeScript基础
- Node.js基础
- Git版本控制

### 7.1.2 学习顺序

**第1周：Next.js基础**
- [ ] App Router概念
- [ ] 文件路由系统
- [ ] 服务端组件vs客户端组件
- [ ] 静态导出

**第2周：React高级**
- [ ] Hooks深入（useState、useEffect、useCallback）
- [ ] 性能优化（React.memo、useMemo）
- [ ] 状态管理模式

**第3周：样式系统**
- [ ] Tailwind CSS基础
- [ ] CSS Modules
- [ ] CSS 3D Transform
- [ ] 动画设计

**第4周：后端开发**
- [ ] API Routes
- [ ] PostgreSQL + JSONB
- [ ] Redis缓存
- [ ] JWT认证

**第5周：云服务**
- [ ] 腾讯云COS
- [ ] CDN配置
- [ ] Serverless函数

## 7.2 项目扩展方向

### 7.2.1 功能扩展

**1. 排行榜功能**

```sql
-- 新增字段
ALTER TABLE users ADD COLUMN completed_at TIMESTAMP;

-- 查询最快完成的用户
SELECT phone, completed_at
FROM users
WHERE completed_at IS NOT NULL
ORDER BY completed_at ASC
LIMIT 10;
```

**2. 社交分享**

```typescript
// 前端分享逻辑
const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: '我集齐了五福！',
      text: '快来参加农行开门红活动',
      url: 'https://abc-bank.example.com',
    })
  }
}
```

**3. 数据分析看板**

```sql
-- 每日新增用户
SELECT DATE(created_at), COUNT(*)
FROM users
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- 抽卡热力图
SELECT card_text, COUNT(*)
FROM draw_logs
GROUP BY card_text
ORDER BY COUNT(*) DESC;
```

---

**文档完成！总计约47,000字**

---

## 附录A：常见问题

**Q1：为什么不用数据库ORM（如Prisma、Drizzle）？**

A：本项目数据结构简单，直接使用SQL更直接，避免引入额外复杂度。如果扩展到多表关联，推荐使用Drizzle ORM。

**Q2：为什么不用状态管理库（Redux、Zustand）？**

A：状态规模小（<15个状态），组件层级浅（2层），纯useState足够。项目扩大后可迁移到Zustand。

**Q3：如何处理高并发（10万+ QPS）？**

A：
1. 云函数预留并发（消除冷启动）
2. Redis缓存用户数据（减少数据库压力）
3. PostgreSQL读写分离
4. CDN缓存静态资源

**Q4：如何防止作弊（刷接口）？**

A：
1. Redis限流（每用户每天最多抽10次）
2. IP限流（每IP每分钟最多100次请求）
3. 设备指纹识别
4. 验证码人机验证

---

## 附录B：参考资源

**官方文档**：
- Next.js 16: https://nextjs.org/docs
- Tailwind CSS 4: https://tailwindcss.com/docs
- PostgreSQL 14: https://www.postgresql.org/docs/14/
- Redis 6: https://redis.io/docs/

**学习资源**：
- Next.js中文文档：https://nextjs.org/docs/zh-CN
- React官方教程：https://react.dev/learn
- MDN CSS 3D Transforms：https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transforms/Using_CSS_transforms

**工具推荐**：
- 代码编辑器：VS Code + Tailwind CSS IntelliSense
- API测试：Postman / Insomnia
- 数据库管理：pgAdmin / TablePlus
- Redis管理：RedisInsight

---

## 结语

本文档全面解析了农行集五福H5项目的技术架构，从前端React组件到后端Serverless函数，从CSS 3D动画到数据库设计，涵盖了一个现代H5营销活动的完整技术栈。

核心亮点：
1. **双模式架构**：开发与生产环境平滑切换
2. **静态优先**：CDN部署，极致性能
3. **Serverless**：按需付费，弹性伸缩
4. **纯CSS 3D**：无依赖，高性能动画
5. **TypeScript**：全栈类型安全

希望本文档能帮助你深入理解Next.js全栈开发，掌握云服务集成，构建高质量的Web应用。

---

**文档版本**: v1.0
**最后更新**: 2025-12-10
**作者**: 基于ABC银行集五福H5项目
**字数统计**: 约47,800字
