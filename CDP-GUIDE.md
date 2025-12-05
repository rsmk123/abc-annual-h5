# Chrome DevTools Protocol (CDP) 测试指南

基于 **SPEC 文档 2.5节验收标准** 和 **Anthropic 长程代理最佳实践**

## 📖 什么是 CDP？

Chrome DevTools Protocol 是 Chrome 浏览器提供的底层调试协议，提供比 Playwright 更精细的控制能力。

### CDP vs Playwright

| 能力 | Playwright | CDP (直接) |
|-----|-----------|------------|
| 基础交互 | ✅ 优秀 | ✅ 优秀 |
| 网络监控 | ⚠️ 基础 | ✅ **完整** |
| 控制台监控 | ⚠️ 基础 | ✅ **完整** |
| 性能指标 | ⚠️ 有限 | ✅ **详细** |
| FPS监控 | ❌ 不支持 | ✅ **支持** |
| 内存分析 | ❌ 不支持 | ✅ **支持** |
| CPU分析 | ❌ 不支持 | ✅ **支持** |

**结论**: 我们使用 Playwright + CDP 混合方案 = 最佳体验

---

## 🏗 框架架构

```
测试框架层次:
├── tests/test-harness.ts        # 端到端交互测试（Playwright）
├── tests/cdp-harness.ts         # CDP监控框架（核心）
├── tests/spec-tests.ts          # SPEC验收标准测试（CDP增强）
└── tests/deploy-tests.ts        # 部署流程测试（构建验证）

功能列表:
├── features.json                # 基础版（45功能）
└── features-complete.json       # 完整版（85功能，对齐SPEC）
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
bun add -d playwright @playwright/test
bunx playwright install chromium
```

### 2. 运行测试

```bash
# 基础端到端测试
bun run test:e2e

# SPEC验收标准测试（CDP增强）
bun run test:spec

# 部署配置测试
bun run test:deploy

# CDP专项测试（网络+控制台+性能）
bun run test:cdp

# 运行所有测试
bun run test:all
```

### 3. 查看报告

```bash
bun run test:report
```

---

## 📊 CDP 测试能力

### 1️⃣ **网络监控** (NETWORK-001, 002, 003)

**监控内容**:
- ✅ 所有HTTP请求（URL、方法、状态码）
- ✅ 资源加载时间
- ✅ 传输大小
- ✅ 资源类型（Script、Stylesheet、Document等）

**测试用例**:
```typescript
// NETWORK-001: 所有资源加载成功
const result = await testNetwork(BASE_URL);
// 检查: 无404、无5xx错误

// NETWORK-002: 无404错误
const notFound = harness.get404Requests();
expect(notFound.length).toBe(0);

// NETWORK-003: 无5xx服务器错误
const serverErrors = harness.get5xxRequests();
expect(serverErrors.length).toBe(0);
```

**输出示例**:
```json
{
  "network": {
    "totalRequests": 15,
    "failedRequests": 0,
    "totalSize": 245678,
    "jsSize": 185432,
    "cssSize": 28456,
    "requests": [
      {
        "url": "http://localhost:3000/",
        "method": "GET",
        "status": 200,
        "size": 4532,
        "duration": 123.45,
        "resourceType": "Document"
      },
      ...
    ]
  }
}
```

---

### 2️⃣ **控制台监控** (CONSOLE-001, 002, 003)

**监控内容**:
- ✅ console.error
- ✅ console.warning
- ✅ 未捕获异常（Runtime.exceptionThrown）
- ✅ 堆栈跟踪

**测试用例**:
```typescript
// CONSOLE-001: 页面加载无错误
const result = await testConsole(BASE_URL);
expect(result.passed).toBe(true);

// CONSOLE-002: 交互过程无异常
const errors = harness.getConsoleErrors();
expect(errors.length).toBe(0);
```

**输出示例**:
```json
{
  "console": {
    "errors": [
      {
        "type": "error",
        "text": "Uncaught TypeError: Cannot read property 'x' of undefined",
        "timestamp": 1234567890,
        "stackTrace": "..."
      }
    ],
    "warnings": [],
    "total": 1
  }
}
```

---

### 3️⃣ **性能指标** (PERF-001, 002, 003)

**监控内容**:
- ✅ FCP (First Contentful Paint) - 首次内容绘制
- ✅ LCP (Largest Contentful Paint) - 最大内容绘制
- ✅ TTI (Time to Interactive) - 可交互时间
- ✅ FPS (Frames Per Second) - 动画帧率

**SPEC要求**:
- FCP < 1.5秒
- TTI < 3秒（4G网络）
- 动画 60fps

**测试用例**:
```typescript
// PERF-001: FCP < 1.5秒
const result = await testPerformance(BASE_URL, {
  maxFCP: 1500
});

// PERF-003: 动画FPS稳定60fps
const fps = await harness.monitorAnimationFPS(1000);
expect(fps).toBeGreaterThanOrEqual(55);
```

**输出示例**:
```json
{
  "performance": {
    "fcp": 1234,
    "lcp": 1987,
    "tti": 2543,
    "fps": 58,
    "jsSize": 185432,
    "cssSize": 28456
  }
}
```

---

### 4️⃣ **包大小验证** (PERF-004, 005, 006)

**SPEC要求**:
- 总包大小 < 500KB (gzip后)
- JS包 < 200KB (gzip后)
- CSS包 < 50KB (gzip后)

**测试用例**:
```typescript
// PERF-004: 总包大小验证
const result = await testBundleSize(BASE_URL, {
  maxTotal: 500 * 1024,
  maxJS: 200 * 1024,
  maxCSS: 50 * 1024
});
```

**输出示例**:
```json
{
  "totalSize": "245.67KB",
  "jsSize": "185.43KB",
  "cssSize": "28.46KB",
  "totalRequests": 15
}
```

---

## 🎯 完整功能列表 (85个)

### SPEC验收标准 (8个)
- ✅ `SPEC-P0-001` - 登录弹窗接受11位手机号
- ✅ `SPEC-P0-002` - 卡牌翻转动画在800ms内流畅完成
- ✅ `SPEC-P0-003` - 智能收集算法工作正常
- ✅ `SPEC-P0-004` - 收集全部5个字符后显示最终奖励
- ✅ `SPEC-P0-005` - 重置按钮清除所有状态
- ✅ `SPEC-P0-006` - 在375px-480px视口上移动端响应式
- ✅ `SPEC-P0-007` - 浏览器中无控制台错误
- ✅ `SPEC-P0-008` - TypeScript编译成功无错误

### 部署配置 (6个)
- ⚠️ `DEPLOY-001` - next.config.ts添加output: 'export'
- ⚠️ `DEPLOY-002` - images: { unoptimized: true }
- ⚠️ `DEPLOY-003` - 验证构建创建out/目录
- ⚠️ `DEPLOY-004` - 创建.github/workflows/deploy.yml
- ⚠️ `DEPLOY-005` - 工作流包含Bun设置
- ⚠️ `DEPLOY-006` - 工作流包含COS部署

### 基础设施 (8个)
- ⚠️ `INFRA-001` - COS存储桶已创建
- ⚠️ `INFRA-002` - 访问权限公有读、私有写
- ⚠️ `INFRA-003` - 启用静态网站托管
- ⚠️ `INFRA-004` - 索引文档设置为index.html
- ⚠️ `INFRA-005-008` - GitHub Secrets配置（4个）

### 构建测试 (4个)
- ⚠️ `BUILD-001` - 构建成功
- ⚠️ `BUILD-002` - out/目录创建
- ⚠️ `BUILD-003` - index.html存在
- ⚠️ `BUILD-004` - _next/static/包含JS/CSS

### 性能监控 (6个)
- 🔄 `PERF-001` - FCP < 1.5秒
- 🔄 `PERF-002` - TTI < 3秒
- 🔄 `PERF-003` - 动画60fps
- 🔄 `PERF-004` - 总包< 500KB
- 🔄 `PERF-005` - JS包< 200KB
- 🔄 `PERF-006` - CSS包< 50KB

### 网络监控 (3个)
- 🔄 `NETWORK-001` - 所有资源加载成功
- 🔄 `NETWORK-002` - 无404错误
- 🔄 `NETWORK-003` - 无5xx错误

### 控制台监控 (3个)
- 🔄 `CONSOLE-001` - 加载过程无错误
- 🔄 `CONSOLE-002` - 交互过程无异常
- 🔄 `CONSOLE-003` - 无TypeScript运行时错误

### 其他分类
- 登录系统、3D翻牌、收集系统、结果弹窗、最终奖励、重置功能
- 智能算法、视觉设计、可访问性、浏览器兼容性、代码质量

**总计**: 85个功能点

---

## 📋 工作流示例

### 场景1: 验证SPEC-P0-007（无控制台错误）

```bash
# 1. 启动开发服务器
bun dev

# 2. 运行CDP控制台测试
bun run test:cdp --grep "CONSOLE-001"

# 输出:
# ✓ CONSOLE-001: 页面加载过程中无console.error (3s)
# 控制台检查结果: {
#   "errors": [],
#   "warnings": [],
#   "total": 0
# }
# ✓ Feature CONSOLE-001 marked as PASSED
```

### 场景2: 验证网络请求（NETWORK-001）

```bash
# 运行网络监控测试
bun run test:cdp --grep "NETWORK-001"

# 输出:
# ✓ NETWORK-001: 所有资源加载成功 (3s)
# 网络请求统计: {
#   "totalRequests": 15,
#   "failedRequests": false,
#   "totalSize": 245678
# }
# ✓ Feature NETWORK-001 marked as PASSED
```

### 场景3: 验证性能指标（PERF-001）

```bash
# 运行性能测试
bun run test:cdp --grep "PERF-001"

# 输出:
# ✓ PERF-001: 首次内容绘制（FCP）< 1.5秒 (5s)
# 性能指标: {
#   "fcp": 1234,
#   "lcp": 1987,
#   "fps": 58,
#   "jsSize": 185432,
#   "cssSize": 28456
# }
# ✓ Feature PERF-001 marked as PASSED
```

### 场景4: 验证部署配置（DEPLOY-001）

```bash
# 运行部署配置测试
bun run test:deploy

# 输出:
# ✓ DEPLOY-001: next.config.ts包含output: export (0.1s)
# ✓ Feature DEPLOY-001 marked as PASSED
#
# ✓ DEPLOY-002: next.config.ts包含images: { unoptimized: true } (0.1s)
# ✓ Feature DEPLOY-002 marked as PASSED
#
# ✗ DEPLOY-004: .github/workflows/deploy.yml存在
#   Error: 文件不存在
# ✗ Feature DEPLOY-004 marked as FAILED
```

---

## 🔧 CDP API 详解

### CDPTestHarness 类

**初始化**:
```typescript
const harness = new CDPTestHarness();
await harness.initialize('http://localhost:3000');
```

**网络监控方法**:
```typescript
// 获取所有请求
const requests = harness.getNetworkRequests();

// 检查失败请求
const hasFailed = harness.hasFailedRequests();

// 获取404错误
const notFound = harness.get404Requests();

// 获取5xx错误
const serverErrors = harness.get5xxRequests();

// 获取总传输大小
const totalSize = harness.getTotalTransferSize();

// 获取JS包大小
const jsSize = harness.getJavaScriptSize();

// 获取CSS包大小
const cssSize = harness.getCSSSize();
```

**控制台监控方法**:
```typescript
// 获取所有错误
const errors = harness.getConsoleErrors();

// 获取所有警告
const warnings = harness.getConsoleWarnings();

// 检查是否有错误
const hasErrors = harness.hasConsoleErrors();
```

**性能监控方法**:
```typescript
// 获取Web Vitals
const metrics = await harness.getPerformanceMetrics();
// 返回: { fcp, lcp, tti, cls, fid }

// 监控动画FPS
const fps = await harness.monitorAnimationFPS(1000); // 1秒
console.log(`平均FPS: ${fps}`);
```

**报告生成**:
```typescript
// 生成JSON报告
const report = harness.generateReport();

// 保存报告到文件
harness.saveReport('network-report.json');
// 保存位置: test-results/network-report.json
```

---

## 📈 测试报告示例

### 完整测试报告结构

```json
{
  "timestamp": "2025-12-05T15:45:30.123Z",
  "network": {
    "totalRequests": 15,
    "failedRequests": 0,
    "totalSize": 245678,
    "jsSize": 185432,
    "cssSize": 28456,
    "requests": [
      {
        "url": "http://localhost:3000/_next/static/chunks/main.js",
        "method": "GET",
        "status": 200,
        "size": 125678,
        "duration": 234.56,
        "resourceType": "Script"
      }
    ]
  },
  "console": {
    "errors": [],
    "warnings": [
      {
        "type": "warning",
        "text": "Deprecated API usage",
        "timestamp": 1234567890
      }
    ],
    "total": 1
  },
  "performance": {
    "fcp": 1234,
    "lcp": 1987,
    "tti": 2543,
    "cls": 0.05,
    "fps": 58
  }
}
```

---

## 🎯 SPEC对齐验证

### 验收标准 P0 (必须通过)

| ID | 描述 | 测试方法 | 状态 |
|----|------|---------|------|
| SPEC-P0-001 | 登录弹窗接受11位手机号 | E2E | ⏳ |
| SPEC-P0-002 | 卡牌翻转800ms流畅完成 | E2E+时间测量 | ⏳ |
| SPEC-P0-003 | 智能算法无重复 | E2E+逻辑验证 | ⏳ |
| SPEC-P0-004 | 集齐后显示奖励 | E2E | ⏳ |
| SPEC-P0-005 | 重置清除状态 | E2E | ⏳ |
| SPEC-P0-006 | 移动端响应式 | E2E+视口测试 | ⏳ |
| SPEC-P0-007 | 无控制台错误 | **CDP** | ⏳ |
| SPEC-P0-008 | TypeScript编译通过 | Build | ⏳ |

### 部署任务 (阻止上线)

| ID | 描述 | 测试方法 | 状态 |
|----|------|---------|------|
| DEPLOY-001 | output: 'export' | Config检查 | ⚠️ |
| DEPLOY-002 | images: unoptimized | Config检查 | ⚠️ |
| DEPLOY-003 | out/目录创建 | Build验证 | ⚠️ |
| DEPLOY-004 | GitHub Actions存在 | 文件检查 | ⚠️ |
| DEPLOY-005 | Bun设置步骤 | YAML检查 | ⚠️ |
| DEPLOY-006 | COS部署步骤 | YAML检查 | ⚠️ |

### 基础设施 (手动验证)

| ID | 描述 | 验证方法 | 状态 |
|----|------|---------|------|
| INFRA-001 | COS存储桶创建 | 腾讯云控制台 | ⚠️ |
| INFRA-002 | 公有读权限 | 控制台验证 | ⚠️ |
| INFRA-003 | 静态网站托管 | 控制台验证 | ⚠️ |
| INFRA-004 | index.html配置 | 控制台验证 | ⚠️ |
| INFRA-005-008 | GitHub Secrets | GitHub设置 | ⚠️ |

---

## 🤖 AI代理使用CDP的工作流

### 启动新会话

```bash
# 1. 初始化环境
bash init.sh

# 输出会显示:
# 功能完成度统计...
#   总功能数: 85
#   已通过: 0
#   完成度: 0%
#
#   分类统计:
#   - SPEC验收标准-P0: 0/8 (0%)
#   - 阶段3-部署配置: 0/6 (0%)
#   - 阶段3-基础设施: 0/8 (0%)
#   - 网络监控: 0/3 (0%)
#   - 控制台监控: 0/3 (0%)
#   - 性能监控: 0/6 (0%)
#   ...

# 2. 查看features-complete.json
cat features-complete.json | grep '"passes": false' | grep 'P0' | head -10
```

### 选择优先任务

**优先级规则**:
1. **SPEC-P0-XXX** - 最高优先级（验收标准）
2. **DEPLOY-XXX** - 次高（阻止部署）
3. **INFRA-XXX** - 中等（基础设施）
4. **其他** - 常规

### 开发单功能

```bash
# 示例: 完成DEPLOY-001

# 1. 查看功能详情
cat features-complete.json | grep -A 10 "DEPLOY-001"

# 输出:
# {
#   "id": "DEPLOY-001",
#   "category": "阶段3-部署配置",
#   "specRef": "4.4节-任务3.1",
#   "description": "更新next.config.ts添加output: 'export'",
#   "priority": "P0",
#   "passes": false,
#   "testType": "config",
#   "testCommand": "bun test:config deploy-001"
# }

# 2. 实现功能（修改next.config.ts）
# 添加 output: 'export'

# 3. 运行测试
bun run test:deploy --grep "DEPLOY-001"

# 输出:
# ✓ DEPLOY-001: next.config.ts包含output: export (0.1s)
# ✓ Feature DEPLOY-001 marked as PASSED

# 4. Git提交
git add next.config.ts features-complete.json
git commit -m "feat: add static export config - DEPLOY-001"
```

---

## 🛠 部署自动化流程

### 完整部署检查清单

```bash
# ============================================
# 阶段A: 配置验证
# ============================================

# 1. 验证next.config.ts
bun run test:deploy --grep "DEPLOY-001|DEPLOY-002"

# 2. 验证GitHub Actions工作流存在
test -f .github/workflows/deploy.yml && echo "✓ 工作流存在"

# ============================================
# 阶段B: 构建验证
# ============================================

# 3. 运行完整构建
bun run build

# 4. 验证输出
bun run test:deploy --grep "BUILD"

# 5. 验证包大小
bun run test:cdp --grep "PERF-004|PERF-005|PERF-006"

# ============================================
# 阶段C: 质量验证
# ============================================

# 6. TypeScript检查
bunx tsc --noEmit

# 7. ESLint检查
bun run lint

# 8. CDP网络检查
bun run test:cdp --grep "NETWORK"

# 9. CDP控制台检查
bun run test:cdp --grep "CONSOLE"

# 10. CDP性能检查
bun run test:cdp --grep "PERF-001|PERF-003"

# ============================================
# 阶段D: SPEC验收
# ============================================

# 11. 运行所有SPEC-P0测试
bun run test:spec --grep "SPEC-P0"

# ============================================
# 阶段E: 部署
# ============================================

# 12. 提交代码
git add .
git commit -m "chore: ready for deployment"
git push origin main

# 13. 监控GitHub Actions
# 访问: https://github.com/{user}/{repo}/actions

# 14. 验证COS部署
curl -I http://{bucket}.cos-website.{region}.myqcloud.com
```

---

## 📊 进度追踪

### 查看完成度

```bash
# 使用init.sh（推荐）
bash init.sh

# 或手动查询
node -e "
const d = require('./features-complete.json');
console.log('总功能: ', d.metadata.totalFeatures);
console.log('已完成: ', d.metadata.completedFeatures);
console.log('完成度: ', d.metadata.testCoverage);
"
```

### 按优先级查看

```bash
# P0功能
cat features-complete.json | grep '"priority": "P0"' -B 5 | grep '"description"'

# 未完成的P0
cat features-complete.json | grep -B 10 '"passes": false' | grep '"priority": "P0"' -B 5 | grep '"id"'
```

### 按分类查看

```bash
node -e "
const features = require('./features-complete.json').features;
const categories = {};
features.forEach(f => {
  if (!categories[f.category]) categories[f.category] = { total: 0, passed: 0 };
  categories[f.category].total++;
  if (f.passes) categories[f.category].passed++;
});
Object.entries(categories).forEach(([cat, stats]) => {
  const pct = Math.round(stats.passed / stats.total * 100);
  console.log(cat + ': ' + stats.passed + '/' + stats.total + ' (' + pct + '%)');
});
"
```

---

## 🎓 最佳实践

### ✅ 推荐做法

1. **先CDP后E2E**
   - 先运行CDP测试（网络、控制台、性能）
   - 确保无底层问题
   - 再运行E2E交互测试

2. **分层测试**
   ```bash
   bun run test:deploy   # Layer 1: 配置和构建
   bun run test:cdp      # Layer 2: 底层监控
   bun run test:spec     # Layer 3: SPEC验收
   bun run test:e2e      # Layer 4: 完整交互
   ```

3. **持续监控**
   - 每次代码修改后运行CDP测试
   - Git提交前运行完整测试套件

4. **报告保存**
   - CDP测试会自动生成JSON报告
   - 保存在`test-results/`目录
   - 方便长程任务追踪

### ❌ 禁止做法

1. **跳过CDP测试直接E2E**
   - CDP能更早发现问题
   - 节省调试时间

2. **忽略性能指标**
   - 性能是SPEC的P1要求
   - FCP、FPS必须达标

3. **未验证就标记通过**
   - 必须看到测试输出
   - features.json会自动更新

---

## 🔍 故障排查

### 问题1: CDP连接失败

**症状**:
```
Error: Protocol error: Connection closed
```

**解决**:
```bash
# 1. 确认Chromium已安装
bunx playwright install chromium

# 2. 检查端口占用
lsof -ti:9222 | xargs kill -9

# 3. 重新运行测试
bun run test:cdp
```

### 问题2: 性能指标为0

**症状**:
```json
{
  "fcp": 0,
  "lcp": 0
}
```

**原因**: Performance API未触发或页面加载太快

**解决**:
```typescript
// 增加等待时间
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);
```

### 问题3: FPS测试不稳定

**症状**: FPS在30-60之间波动

**解决**:
```typescript
// 多次测量取平均
const fps1 = await harness.monitorAnimationFPS(1000);
const fps2 = await harness.monitorAnimationFPS(1000);
const fps3 = await harness.monitorAnimationFPS(1000);
const avgFPS = Math.round((fps1 + fps2 + fps3) / 3);
```

---

## 📚 参考资料

- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Playwright CDP Sessions](https://playwright.dev/docs/api/class-cdpsession)
- [Anthropic Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Web Vitals](https://web.dev/vitals/)

---

## 🎉 总结

CDP测试框架提供：

1. **精细监控**: 网络、控制台、性能、FPS
2. **SPEC对齐**: 85个功能点完全对齐SPEC文档
3. **自动化**: 测试通过自动更新features-complete.json
4. **可追溯**: JSON报告 + Git提交 + 工作日志
5. **防作弊**: 严格规则，不允许跳过测试

**核心优势**: 比Playwright更强大，比手动测试更可靠！

开始使用CDP进行长程任务开发吧！🚀
