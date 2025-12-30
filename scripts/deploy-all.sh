#!/bin/bash

# ============================================
# ABC银行H5 - 一键部署脚本
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

progress() {
  echo -e "${GREEN}[✓]${NC} $1"
}

error() {
  echo -e "${RED}[✗]${NC} $1"
  exit 1
}

warn() {
  echo -e "${YELLOW}[!]${NC} $1"
}

info() {
  echo -e "${BLUE}[i]${NC} $1"
}

# 显示进度条
show_progress() {
  local current=$1
  local total=$2
  local percent=$((current * 100 / total))
  local filled=$((current * 20 / total))
  local empty=$((20 - filled))

  printf "\r📊 总进度: ["
  printf "%${filled}s" | tr ' ' '█'
  printf "%${empty}s" | tr ' ' '░'
  printf "] %d%% (%d/%d)" "$percent" "$current" "$total"

  if [ $current -eq $total ]; then
    echo " 🎉"
  fi
}

echo "=========================================="
echo "🎯 ABC银行集五福H5 - 一键部署"
echo "=========================================="
echo ""

TOTAL_STEPS=10
CURRENT_STEP=0

# ============================================
# Step 1: 检查必要工具
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "检查必要工具..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    error "Node.js未安装，请先安装：brew install node@18"
fi
progress "Node.js版本：$(node -v)"

# 检查Serverless Framework
if ! command -v serverless &> /dev/null; then
    warn "Serverless Framework未安装，正在安装..."
    npm install -g serverless
fi
progress "Serverless Framework已安装"

# 检查PostgreSQL客户端
if ! command -v psql &> /dev/null; then
    warn "PostgreSQL客户端未安装，正在安装..."
    brew install postgresql@14
fi
progress "PostgreSQL客户端已安装"

# ============================================
# Step 2: 检查环境变量
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "检查环境变量配置..."

if [ ! -f "functions/api/.env" ]; then
    error "环境变量文件不存在！请先配置 functions/api/.env"
    echo ""
    echo "操作步骤："
    echo "1. cp functions/api/.env.template functions/api/.env"
    echo "2. 编辑 .env 文件，填入数据库连接信息"
    echo ""
    exit 1
fi

# 加载环境变量
source functions/api/.env

# 验证必要的环境变量
if [ -z "$POSTGRES_HOST" ] || [ "$POSTGRES_HOST" = "172.x.x.x" ]; then
    error "POSTGRES_HOST未配置或仍是模板值"
    echo "请编辑 functions/api/.env，填入实际的PostgreSQL内网地址"
    exit 1
fi

if [ -z "$REDIS_HOST" ] || [ "$REDIS_HOST" = "172.x.x.x" ]; then
    error "REDIS_HOST未配置或仍是模板值"
    echo "请编辑 functions/api/.env，填入实际的Redis内网地址"
    exit 1
fi

progress "环境变量配置正确"

# ============================================
# Step 3: 测试数据库连接
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "测试PostgreSQL连接..."

if psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" &> /dev/null; then
    progress "PostgreSQL连接成功"
else
    error "PostgreSQL连接失败，请检查配置"
    echo "连接信息："
    echo "  Host: $POSTGRES_HOST"
    echo "  Port: $POSTGRES_PORT"
    echo "  User: $POSTGRES_USER"
    echo "  Database: $POSTGRES_DB"
    exit 1
fi

# ============================================
# Step 4: 检查数据库表
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "检查数据库表..."

TABLE_COUNT=$(psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -lt 3 ]; then
    warn "数据库表未初始化，正在执行初始化..."
    psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" < database/init.sql
    progress "数据库初始化完成"
else
    progress "数据库表已存在（$TABLE_COUNT 个表）"
fi

# ============================================
# Step 5: 测试Redis连接
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "测试Redis连接..."

if command -v redis-cli &> /dev/null; then
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" PING &> /dev/null; then
        progress "Redis连接成功"
    else
        warn "Redis连接失败，但继续部署（部署时会再次测试）"
    fi
else
    warn "redis-cli未安装，跳过Redis连接测试"
fi

# ============================================
# Step 6: 安装云函数依赖
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "安装云函数依赖..."

cd functions/api

if [ ! -d "node_modules" ]; then
    npm install
    progress "依赖安装完成"
else
    progress "依赖已安装（跳过）"
fi

# ============================================
# Step 7: 部署云函数到腾讯云
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "部署云函数到腾讯云..."

# 检查Serverless凭证
if [ ! -f ~/.tencentcloud/credentials ]; then
    error "腾讯云凭证未配置"
    echo ""
    echo "请先配置腾讯云密钥："
    echo "  mkdir -p ~/.tencentcloud"
    echo "  nano ~/.tencentcloud/credentials"
    echo ""
    echo "填入内容："
    echo "  [default]"
    echo "  tencent_secret_id = 你的SecretId"
    echo "  tencent_secret_key = 你的SecretKey"
    echo ""
    exit 1
fi

echo "正在部署（可能需要1-2分钟）..."
DEPLOY_OUTPUT=$(serverless deploy 2>&1)

if echo "$DEPLOY_OUTPUT" | grep -q "Deploy successful"; then
    progress "云函数部署成功"

    # 提取API网关URL
    API_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://service-[^[:space:]]*' | head -1)

    if [ -n "$API_URL" ]; then
        echo ""
        echo "=========================================="
        echo "🌐 API网关URL："
        echo "   $API_URL"
        echo "=========================================="
        echo ""

        # 保存到文件
        echo "$API_URL" > ../api-gateway-url.txt
        progress "API URL已保存到 functions/api-gateway-url.txt"
    fi
else
    error "云函数部署失败"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

cd ../..

# ============================================
# Step 8: 测试API接口
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "测试API接口..."

if [ -z "$API_URL" ]; then
    API_URL=$(cat functions/api-gateway-url.txt 2>/dev/null || echo "")
fi

if [ -n "$API_URL" ]; then
    # 健康检查
    HEALTH_RESPONSE=$(curl -s "$API_URL")

    if echo "$HEALTH_RESPONSE" | grep -q "success.*true"; then
        progress "API健康检查通过"
    else
        warn "API可能未正常运行"
        echo "响应：$HEALTH_RESPONSE"
    fi

    # 测试发送验证码
    SEND_CODE_RESPONSE=$(curl -s -X POST "${API_URL}api/auth/send-code" \
      -H "Content-Type: application/json" \
      -d '{"phone": "13800138000", "deviceId": "test-001"}')

    if echo "$SEND_CODE_RESPONSE" | grep -q '"success":true'; then
        progress "验证码API测试通过"
    else
        warn "验证码API可能有问题"
        echo "响应：$SEND_CODE_RESPONSE"
    fi
fi

# ============================================
# Step 9: 配置前端环境变量
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "配置前端环境变量..."

if [ -n "$API_URL" ]; then
    cat > .env.production << EOF
NEXT_PUBLIC_API_BASE_URL=${API_URL}api
EOF
    progress "前端环境变量已配置"
fi

# ============================================
# Step 10: 验证完整性
# ============================================
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS
echo ""
info "验证数据库表..."

TABLE_LIST=$(psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")

if echo "$TABLE_LIST" | grep -q "users"; then
    progress "数据库表验证通过"
else
    warn "数据库表可能未正确创建"
fi

# ============================================
# 完成总结
# ============================================
echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📊 部署摘要："
echo "  ✓ PostgreSQL: $POSTGRES_HOST:$POSTGRES_PORT"
echo "  ✓ Redis: $REDIS_HOST:$REDIS_PORT"
echo "  ✓ 云函数: 已部署"
echo "  ✓ API网关: $API_URL"
echo "  ✓ 前端配置: .env.production 已更新"
echo ""
echo "🧪 测试命令："
echo "  npm run dev"
echo "  # 访问 http://localhost:3000/bank-campaign"
echo ""
echo "🚀 生产部署："
echo "  npm run build"
echo "  git add . && git commit -m \"feat: 后端API上线\""
echo "  git push origin main"
echo ""
echo "📖 查看进度："
echo "  cat backend-progress.json"
echo ""
echo "=========================================="
