# 长程任务跟进框架 - 使用指南

基于 **Anthropic 长程代理最佳实践**设计的工作流管理系统。

## 📚 背景

这个框架解决了 AI 代理在跨会话工作时的核心问题：
- ❌ **问题**: 每次新会话都缺乏上下文记忆
- ✅ **解决**: 通过结构化工件（文件、Git、测试）快速恢复状态

参考文章: [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

---

## 🏗 框架组成

### 1️⃣ **claude-progress.txt** - 工作日志

**作用**: 记录每次会话的目标、完成的工作、遇到的问题

**格式**:
```
会话 #N - 2025-12-05
-------------------------------------------
会话目标:
- 完成登录系统测试
- 修复3D动画bug

完成的工作:
- 实现了LOGIN-001至LOGIN-008测试 (耗时: 45min)
- 修复了卡片翻转状态bug (耗时: 15min)

遇到的问题:
- Playwright 安装慢 解决方案: 使用国内镜像
- 验证码逻辑不清晰 状态: 已咨询用户

Git提交:
- a1b2c3d: feat: add login tests
- d4e5f6g: fix: card flip state issue

下一步计划:
1. 完成收集系统测试
2. 实现智能抽卡算法测试
```

**更新规则**:
- ✅ **每次会话结束时**更新
- ✅ 如实记录问题和解决方案
- ✅ 记录 Git commit hash

---

### 2️⃣ **features.json** - 功能列表 (TDD核心)

**作用**: 定义所有可测试功能，驱动开发进度

**结构**:
```json
{
  "id": "LOGIN-001",
  "category": "登录系统",
  "description": "页面加载时自动弹出登录弹窗",
  "priority": "P0",
  "passes": false,          // ⚠️ 唯一允许AI修改的字段
  "testType": "e2e",
  "dependencies": [],
  "testCommand": "bun test:e2e login-001"
}
```

**严格规则** (防止AI作弊):
```
❌ 禁止删除功能
❌ 禁止修改 description
❌ 禁止修改 priority
✅ 只允许修改 passes 字段
✅ 修改前必须运行对应测试
```

**工作流**:
1. 选择一个 `passes: false` 的功能
2. 实现功能
3. 运行测试: `bun test:e2e <test-id>`
4. 测试通过后，修改 `passes: true`
5. Git 提交
6. 选择下一个功能

---

### 3️⃣ **init.sh** - 环境初始化脚本

**作用**: 新会话启动时快速恢复上下文

**使用**:
```bash
bash init.sh
```

**执行内容**:
1. ✅ 确认工作目录
2. ✅ 检查工具 (bun, git, node)
3. ✅ 显示 Git 状态和最近提交
4. ✅ 检查依赖安装
5. ✅ 读取工作日志摘要
6. ✅ 统计功能完成度
7. ✅ 显示下一步高优先级任务

**输出示例**:
```
============================================
  ABC 银行开门红 H5 - 环境初始化
============================================

[1/7] 确认工作目录...
   当前目录: /Users/xiaoyang/Desktop/abc-bank-annual-h5

[2/7] 检查必要工具...
   ✓ bun 已安装
   ✓ git 已安装
   ✓ node 已安装

[3/7] Git 状态检查...
   当前分支: main
   最近的提交:
   a1b2c3d feat: add login tests
   d4e5f6g fix: card flip state issue

[6/7] 功能完成度统计...
   总功能数: 45
   已通过: 12
   完成度: 27%

   分类统计:
   - 登录系统: 8/8 (100%)
   - 3D翻牌系统: 4/6 (67%)
   - 收集系统: 0/5 (0%)

未通过的高优先级功能 (P0):
   1. [COLLECTION-001] 页面底部显示5个收集槽
   2. [COLLECTION-002] 初始状态所有收集槽为空
```

---

### 4️⃣ **tests/test-harness.ts** - 端到端测试框架

**作用**: 使用 Playwright 自动化测试，确保功能正确性

**安装依赖**:
```bash
bun add -d playwright @playwright/test
bunx playwright install
```

**运行测试**:
```bash
# 运行所有测试
bun test

# 运行特定测试文件
bunx playwright test tests/test-harness.ts

# 运行特定测试套件
bunx playwright test --grep "登录系统"

# 运行特定测试用例
bunx playwright test --grep "LOGIN-001"

# 调试模式（打开浏览器）
bunx playwright test --debug

# 查看测试报告
bunx playwright show-report
```

**测试特性**:
- ✅ 自动启动开发服务器
- ✅ 测试通过后自动更新 `features.json`
- ✅ 记录测试结果到 `claude-progress.txt`
- ✅ 生成 HTML 报告
- ✅ 失败时截图和录屏

---

### 5️⃣ **playwright.config.ts** - 测试配置

**关键配置**:
- `fullyParallel: false` - 顺序执行，避免状态冲突
- `workers: 1` - 单线程执行
- `webServer` - 自动启动 `bun dev`
- 多浏览器支持：Chrome、移动 Chrome、移动 Safari

---

## 🚀 完整工作流

### 启动新会话

```bash
# 1. 运行初始化脚本
bash init.sh

# 2. 阅读工作日志（了解上次进度）
cat claude-progress.txt | tail -50

# 3. 查看未完成的高优先级功能
cat features.json | grep '"passes": false' | grep 'P0' | head -5

# 4. 启动开发服务器
bun dev
```

### 开发单个功能

```bash
# 1. 选择一个功能（例如 COLLECTION-001）
cat features.json | grep -A 10 "COLLECTION-001"

# 2. 实现功能（编写代码）
# 修改 components/bank-campaign/CollectionSlots.tsx

# 3. 运行对应测试
bunx playwright test --grep "COLLECTION-001"

# 4. 测试通过后，手动更新 features.json
# 将 "passes": false 改为 "passes": true

# 5. Git 提交
git add .
git commit -m "feat: implement COLLECTION-001 - 页面底部显示5个收集槽"

# 6. 更新工作日志
# 在 claude-progress.txt 中记录本次会话
```

### 结束会话

```bash
# 1. 更新 claude-progress.txt
# 填写完成的工作、遇到的问题、下一步计划

# 2. Git 提交所有变更
git add .
git commit -m "chore: update progress log - session #N"
git push

# 3. 查看整体进度
bash init.sh
```

---

## 📋 AI 代理使用指引

### 启动新会话时

**必须执行的步骤**:
1. 运行 `bash init.sh`
2. 阅读 `claude-progress.txt` 的最后一次会话
3. 检查 `git log --oneline -10`
4. 查看 `features.json` 中 `passes: false` 且 `priority: P0` 的功能
5. 选择一个功能开始工作

### 开发功能时

**规则**:
- ✅ **一次只处理一个功能**
- ✅ **必须先运行测试**再修改 `passes: true`
- ✅ **每完成一个功能就 Git 提交**
- ❌ **不允许跳过失败的测试**
- ❌ **不允许删除功能或修改 description**

### 遇到问题时

**记录到 claude-progress.txt**:
```
遇到的问题:
- Playwright 无法点击卡片 解决方案: 使用 .first() 定位元素
- 验证码逻辑不明确 状态: 已咨询用户，等待反馈
```

### 结束会话时

**必须更新**:
1. `claude-progress.txt` - 记录本次会话
2. `features.json` - 更新 `passes` 字段
3. Git 提交所有变更

---

## 🎯 示例：完整的单功能开发流程

### 场景：实现 COLLECTION-001 功能

**1. 启动会话**
```bash
bash init.sh
# 输出显示: COLLECTION-001 是下一个优先级任务
```

**2. 查看功能详情**
```bash
cat features.json | grep -A 10 "COLLECTION-001"
```

输出:
```json
{
  "id": "COLLECTION-001",
  "category": "收集系统",
  "description": "页面底部显示5个收集槽，对应'马上发财哇'5个字",
  "priority": "P0",
  "passes": false,
  "testType": "e2e",
  "dependencies": ["LOGIN-007"],
  "testCommand": "bun test:e2e collection-001"
}
```

**3. 检查依赖**
```bash
# 确认 LOGIN-007 已通过
cat features.json | grep -A 2 "LOGIN-007"
# 输出: "passes": true
```

**4. 实现功能**
```typescript
// 编辑 components/bank-campaign/CollectionSlots.tsx
export const CollectionSlots: React.FC<CollectionSlotsProps> = ({ collected, cards }) => {
  return (
    <div className="w-full px-5 pb-10 z-10">
      <div className="flex justify-between bg-black/20 p-4 rounded-2xl">
        {cards.map((char, idx) => (
          <div key={idx} className="收集槽样式">
            {char}
          </div>
        ))}
      </div>
    </div>
  );
};
```

**5. 运行测试**
```bash
bunx playwright test --grep "COLLECTION-001"
```

输出:
```
✓ COLLECTION-001: 页面底部显示5个收集槽 (2s)
✓ Feature COLLECTION-001 marked as PASSED
```

**6. 更新 features.json**
```json
{
  "id": "COLLECTION-001",
  "passes": true,  // ← 修改这里
  ...
}
```

**7. Git 提交**
```bash
git add components/bank-campaign/CollectionSlots.tsx features.json
git commit -m "feat: implement COLLECTION-001 - 显示5个收集槽

- 实现收集槽组件布局
- 添加响应式样式
- 测试通过: COLLECTION-001
"
```

**8. 更新工作日志**
```
会话 #5 - 2025-12-05
-------------------------------------------
会话目标:
- 实现 COLLECTION-001 功能

完成的工作:
- 实现收集槽组件布局 (耗时: 20min)
- 添加响应式样式 (耗时: 10min)
- 测试通过 COLLECTION-001 (耗时: 5min)

遇到的问题:
- (无)

Git提交:
- f7g8h9i: feat: implement COLLECTION-001 - 显示5个收集槽

下一步计划:
1. 实现 COLLECTION-002（初始状态收集槽为空）
```

**9. 继续下一个功能**
```bash
# 选择 COLLECTION-002
cat features.json | grep -A 10 "COLLECTION-002"
```

---

## 📊 进度追踪

### 查看整体进度
```bash
bash init.sh
# 或
node -e "const d = require('./features.json'); console.log('完成度:', d.metadata.testCoverage)"
```

### 查看分类进度
```bash
node -e "
const features = require('./features.json').features;
const categories = {};
features.forEach(f => {
  if (!categories[f.category]) categories[f.category] = { total: 0, passed: 0 };
  categories[f.category].total++;
  if (f.passes) categories[f.category].passed++;
});
Object.entries(categories).forEach(([cat, stats]) => {
  console.log(cat + ': ' + stats.passed + '/' + stats.total);
});
"
```

### 查看优先级分布
```bash
node -e "
const features = require('./features.json').features;
['P0', 'P1', 'P2'].forEach(p => {
  const total = features.filter(f => f.priority === p).length;
  const passed = features.filter(f => f.priority === p && f.passes).length;
  console.log(p + ': ' + passed + '/' + total);
});
"
```

---

## 🔧 故障排查

### 测试失败

**问题**: 测试运行失败
```bash
# 1. 确认开发服务器正在运行
bun dev

# 2. 手动访问测试页面
open http://localhost:3000

# 3. 使用调试模式
bunx playwright test --debug --grep "LOGIN-001"

# 4. 查看截图
open playwright-report/index.html
```

### 依赖问题

**问题**: Playwright 未安装
```bash
bun add -d playwright @playwright/test
bunx playwright install
```

**问题**: node_modules 缺失
```bash
bun install
```

### Git 问题

**问题**: 工作区不干净
```bash
# 查看修改
git status

# 提交修改
git add .
git commit -m "chore: save work in progress"

# 或者丢弃修改
git checkout .
```

---

## 📈 最佳实践

### ✅ 推荐做法

1. **严格遵循单功能开发**
   - 一次只处理一个功能
   - 完成后立即提交

2. **测试先行**
   - 先运行测试，确认失败
   - 实现功能
   - 再次运行测试，确认通过
   - 才修改 `passes: true`

3. **频繁提交**
   - 每完成一个功能就提交
   - Commit message 包含功能ID

4. **详细记录**
   - 在 `claude-progress.txt` 中如实记录问题
   - 包含解决方案或当前状态

5. **优先级驱动**
   - 优先完成 P0 功能
   - P0 完成后再处理 P1

### ❌ 禁止做法

1. **跳过测试**
   - 不允许未经测试就修改 `passes: true`

2. **批量标记**
   - 不允许一次性将多个功能标记为通过

3. **删除功能**
   - 不允许删除 `features.json` 中的功能
   - 即使功能看起来不合理

4. **修改描述**
   - 不允许修改 `description` 字段
   - 如有疑问，应咨询用户

5. **忽略依赖**
   - 不允许在依赖功能未完成时开始新功能

---

## 📚 扩展阅读

- [Anthropic - Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Playwright Documentation](https://playwright.dev/)
- [Test-Driven Development (TDD)](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

## 🤝 维护

### 添加新功能到列表

```bash
# 1. 编辑 features.json
# 添加新功能对象

# 2. 更新 metadata.totalFeatures

# 3. 在 tests/test-harness.ts 中添加对应测试

# 4. Git 提交
git add features.json tests/test-harness.ts
git commit -m "feat: add new feature definition"
```

### 修改测试逻辑

```bash
# 1. 编辑 tests/test-harness.ts
# 2. 运行测试验证
bunx playwright test
# 3. Git 提交
```

---

## 📞 获取帮助

遇到问题时：
1. 查看本文档的「故障排查」章节
2. 运行 `bash init.sh` 检查环境状态
3. 查看 Playwright 报告: `bunx playwright show-report`
4. 咨询用户或团队成员

---

## 🎉 总结

这个框架提供了：
- ✅ **上下文恢复**：通过 `init.sh` 快速了解当前状态
- ✅ **进度追踪**：通过 `features.json` 精确跟踪完成度
- ✅ **质量保证**：通过端到端测试确保功能正确性
- ✅ **防作弊机制**：严格规则防止AI代理过早标记完成
- ✅ **可持续性**：Git + 日志确保长程任务可追溯

**核心哲学**：像人类工程师一样工作 - 有交接文档、明确任务列表、定期提交、严格测试。

祝你开发顺利！🚀
