#!/bin/bash

# ============================================
# ABC 银行开门红 H5 - 环境初始化脚本
# ============================================
# 用途: 启动新的工作会话，快速恢复上下文
# 使用: bash init.sh
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${RED}============================================${NC}"
echo -e "${RED}  ABC 银行开门红 H5 - 环境初始化${NC}"
echo -e "${RED}============================================${NC}"
echo ""

# ============================================
# 1. 确认工作目录
# ============================================
echo -e "${BLUE}[1/7] 确认工作目录...${NC}"
CURRENT_DIR=$(pwd)
echo "   当前目录: $CURRENT_DIR"
echo ""

# ============================================
# 2. 检查必要工具
# ============================================
echo -e "${BLUE}[2/7] 检查必要工具...${NC}"

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "   ${GREEN}✓${NC} $1 已安装: $(command -v $1)"
    else
        echo -e "   ${RED}✗${NC} $1 未安装"
        return 1
    fi
}

check_command "bun" || echo "   提示: 安装 Bun - curl -fsSL https://bun.sh/install | bash"
check_command "git"
check_command "node"
echo ""

# ============================================
# 3. Git 状态检查
# ============================================
echo -e "${BLUE}[3/7] Git 状态检查...${NC}"
if [ -d .git ]; then
    echo -e "   ${GREEN}✓${NC} Git 仓库已初始化"

    # 显示当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    echo "   当前分支: $CURRENT_BRANCH"

    # 显示最近的提交
    echo ""
    echo "   最近的提交:"
    git log --oneline -5 | sed 's/^/   /'

    # 显示工作区状态
    echo ""
    GIT_STATUS=$(git status --short)
    if [ -z "$GIT_STATUS" ]; then
        echo -e "   ${GREEN}✓${NC} 工作区干净"
    else
        echo -e "   ${YELLOW}⚠${NC}  工作区有未提交的修改:"
        git status --short | sed 's/^/   /'
    fi
else
    echo -e "   ${YELLOW}⚠${NC}  Git 仓库未初始化"
fi
echo ""

# ============================================
# 4. 依赖检查和安装
# ============================================
echo -e "${BLUE}[4/7] 依赖检查...${NC}"
if [ -d "node_modules" ]; then
    echo -e "   ${GREEN}✓${NC} node_modules 已存在"
else
    echo -e "   ${YELLOW}⚠${NC}  node_modules 不存在，准备安装..."
    if command -v bun &> /dev/null; then
        bun install
    elif command -v npm &> /dev/null; then
        npm install
    else
        echo -e "   ${RED}✗${NC} 无法找到包管理器 (bun/npm)"
    fi
fi
echo ""

# ============================================
# 5. 读取工作日志
# ============================================
echo -e "${BLUE}[5/7] 读取工作日志...${NC}"
if [ -f "claude-progress.txt" ]; then
    echo -e "   ${GREEN}✓${NC} 找到 claude-progress.txt"
    echo ""
    echo -e "${YELLOW}--- 工作日志摘要 ---${NC}"

    # 提取最后更新时间
    LAST_UPDATE=$(grep "最后更新时间:" claude-progress.txt | head -1)
    echo "   $LAST_UPDATE"

    # 提取当前阶段
    CURRENT_PHASE=$(grep "当前阶段:" claude-progress.txt | head -1)
    echo "   $CURRENT_PHASE"

    # 提取当前优先级
    PRIORITY=$(grep "当前优先级:" claude-progress.txt | head -1)
    echo "   $PRIORITY"

    echo ""
else
    echo -e "   ${RED}✗${NC} 未找到 claude-progress.txt"
fi
echo ""

# ============================================
# 6. 功能完成度统计
# ============================================
echo -e "${BLUE}[6/7] 功能完成度统计...${NC}"
if [ -f "features.json" ]; then
    echo -e "   ${GREEN}✓${NC} 找到 features.json"

    # 使用 node 解析 JSON（兼容性更好）
    if command -v node &> /dev/null; then
        TOTAL=$(node -e "console.log(require('./features.json').features.length)")
        PASSED=$(node -e "console.log(require('./features.json').features.filter(f => f.passes).length)")
        PERCENTAGE=$(node -e "let t = require('./features.json').features.length; let p = require('./features.json').features.filter(f => f.passes).length; console.log(Math.round(p/t*100))")

        echo ""
        echo "   总功能数: $TOTAL"
        echo "   已通过: $PASSED"
        echo "   完成度: $PERCENTAGE%"

        # 显示各分类统计
        echo ""
        echo "   分类统计:"
        node -e "
            const features = require('./features.json').features;
            const categories = {};
            features.forEach(f => {
                if (!categories[f.category]) {
                    categories[f.category] = { total: 0, passed: 0 };
                }
                categories[f.category].total++;
                if (f.passes) categories[f.category].passed++;
            });
            Object.entries(categories).forEach(([cat, stats]) => {
                const pct = Math.round(stats.passed / stats.total * 100);
                console.log('   - ' + cat + ': ' + stats.passed + '/' + stats.total + ' (' + pct + '%)');
            });
        "
    else
        echo "   (需要 Node.js 来解析统计数据)"
    fi
else
    echo -e "   ${RED}✗${NC} 未找到 features.json"
fi
echo ""

# ============================================
# 7. 下一步指引
# ============================================
echo -e "${BLUE}[7/7] 下一步指引${NC}"
echo ""
echo -e "${GREEN}环境已准备就绪！${NC}"
echo ""
echo "建议操作:"
echo "  1. 阅读工作日志: ${YELLOW}cat claude-progress.txt${NC}"
echo "  2. 查看功能列表: ${YELLOW}cat features.json${NC}"
echo "  3. 启动开发服务器: ${YELLOW}bun dev${NC}"
echo "  4. 运行测试: ${YELLOW}bun test${NC} (需先配置测试框架)"
echo ""
echo "选择下一个功能:"
if [ -f "features.json" ] && command -v node &> /dev/null; then
    echo ""
    echo -e "${YELLOW}未通过的高优先级功能 (P0):${NC}"
    node -e "
        const features = require('./features.json').features;
        const p0Failed = features.filter(f => !f.passes && f.priority === 'P0').slice(0, 5);
        if (p0Failed.length === 0) {
            console.log('   (全部完成！)');
        } else {
            p0Failed.forEach((f, i) => {
                console.log('   ' + (i+1) + '. [' + f.id + '] ' + f.description);
            });
        }
    "
fi
echo ""
echo -e "${RED}============================================${NC}"
echo -e "${RED}  初始化完成 - 开始工作吧！${NC}"
echo -e "${RED}============================================${NC}"
echo ""
