# 长程任务框架 - 快速开始

## 5分钟快速上手

### 1️⃣ 安装测试依赖
```bash
bun add -d playwright @playwright/test
bunx playwright install chromium
```

### 2️⃣ 初始化环境
```bash
bun run init
# 或
bash init.sh
```

### 3️⃣ 运行测试
```bash
# 终端1: 启动开发服务器
bun dev

# 终端2: 运行测试
bun test
```

### 4️⃣ 查看测试报告
```bash
bun run test:report
```

---

## 核心文件说明

| 文件 | 作用 |
|------|------|
| `claude-progress.txt` | 工作日志，记录每次会话的进度 |
| `features.json` | 功能列表，TDD驱动开发 |
| `init.sh` | 环境初始化脚本 |
| `tests/test-harness.ts` | 端到端测试框架 |
| `HARNESS.md` | 完整使用文档 |

---

## AI 代理工作流

### 启动新会话
```bash
# 1. 运行初始化
bash init.sh

# 2. 查看下一个任务
# 脚本会自动显示优先级最高的未完成功能
```

### 开发单个功能
```bash
# 1. 实现功能代码
# 2. 运行测试: bun test
# 3. 修改 features.json 中的 passes: true
# 4. Git 提交
```

### 结束会话
```bash
# 更新 claude-progress.txt 记录本次会话
```

---

## 关键规则

✅ **允许**:
- 修改 `features.json` 中的 `passes` 字段
- 在测试通过后标记为 `true`

❌ **禁止**:
- 删除或修改功能描述
- 未经测试就标记为通过
- 跳过失败的测试

---

## 常用命令

```bash
# 环境初始化
bun run init

# 开发
bun dev

# 测试
bun test                  # 运行所有测试
bun run test:ui          # UI 模式
bun run test:debug       # 调试模式
bun run test:report      # 查看报告

# 查看进度
cat features.json | grep '"passes": false' | wc -l  # 未完成功能数
```

---

## 获取帮助

详细文档: [HARNESS.md](./HARNESS.md)
