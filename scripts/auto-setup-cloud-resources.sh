#!/bin/bash

# ============================================
# ABC银行H5 - 自动创建腾讯云资源
# ============================================

set -e  # 遇到错误立即退出

echo "🚀 开始自动创建腾讯云资源..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 进度函数
progress() {
  echo -e "${GREEN}[✓]${NC} $1"
}

error() {
  echo -e "${RED}[✗]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[!]${NC} $1"
}

# ============================================
# 1. 检查依赖
# ============================================
echo "📋 检查依赖..."

if ! command -v tccli &> /dev/null; then
    error "腾讯云CLI未安装"
    echo "请运行：pip install tccli"
    exit 1
fi

progress "腾讯云CLI已安装"

# ============================================
# 2. 配置腾讯云密钥
# ============================================
echo ""
echo "🔑 配置腾讯云密钥..."

if [ ! -f ~/.tccli/default.credential ]; then
    warn "未检测到腾讯云密钥配置"
    echo ""
    echo "请访问：https://console.cloud.tencent.com/cam/capi"
    echo "获取你的 SecretId 和 SecretKey，然后运行："
    echo ""
    echo "  tccli configure set secretId <你的SecretId>"
    echo "  tccli configure set secretKey <你的SecretKey>"
    echo "  tccli configure set region ap-guangzhou"
    echo ""
    exit 1
fi

progress "腾讯云密钥已配置"

# ============================================
# 3. 创建PostgreSQL数据库
# ============================================
echo ""
echo "🗄️  创建PostgreSQL数据库..."

# 检查是否已存在
EXISTING_PG=$(tccli postgres DescribeDBInstances --region ap-guangzhou 2>/dev/null | grep "abc-bank-h5-db" || true)

if [ -n "$EXISTING_PG" ]; then
    warn "PostgreSQL实例 abc-bank-h5-db 已存在，跳过创建"
else
    echo "正在创建PostgreSQL实例（需要3-5分钟）..."

    # 创建PostgreSQL实例
    PG_RESULT=$(tccli postgres CreateDBInstances \
        --region ap-guangzhou \
        --Zone ap-guangzhou-3 \
        --Memory 2048 \
        --Storage 10 \
        --InstanceCount 1 \
        --ProjectId 0 \
        --DBVersion 14 \
        --InstanceChargeType POSTPAID_BY_HOUR \
        --AutoRenewFlag 0 \
        --DBInstanceName abc-bank-h5-db \
        --AdminPassword "AbcBank@2025" \
        --AdminName root 2>&1)

    if echo "$PG_RESULT" | grep -q "Error"; then
        error "创建PostgreSQL失败"
        echo "$PG_RESULT"
        exit 1
    fi

    progress "PostgreSQL实例创建中..."

    # 等待实例创建完成
    echo "⏳ 等待实例初始化（约3分钟）..."
    sleep 180
fi

# 获取PostgreSQL连接信息
echo "📝 获取PostgreSQL连接信息..."
PG_INFO=$(tccli postgres DescribeDBInstances --region ap-guangzhou | grep -A 20 "abc-bank-h5-db")

# 这里需要解析JSON获取内网地址，简化处理
warn "请手动获取PostgreSQL内网地址："
echo "1. 访问：https://console.cloud.tencent.com/postgres"
echo "2. 找到实例 abc-bank-h5-db"
echo "3. 复制「内网地址」"

# ============================================
# 4. 创建Redis实例
# ============================================
echo ""
echo "💾 创建Redis实例..."

EXISTING_REDIS=$(tccli redis DescribeInstances --region ap-guangzhou 2>/dev/null | grep "abc-bank-h5-redis" || true)

if [ -n "$EXISTING_REDIS" ]; then
    warn "Redis实例 abc-bank-h5-redis 已存在，跳过创建"
else
    echo "正在创建Redis实例（需要2-3分钟）..."

    REDIS_RESULT=$(tccli redis CreateInstances \
        --region ap-guangzhou \
        --ZoneId 100003 \
        --TypeId 7 \
        --MemSize 256 \
        --GoodsNum 1 \
        --Period 1 \
        --BillingMode 0 \
        --InstanceName abc-bank-h5-redis \
        --Password "Redis@2025" 2>&1)

    if echo "$REDIS_RESULT" | grep -q "Error"; then
        error "创建Redis失败"
        echo "$REDIS_RESULT"
        exit 1
    fi

    progress "Redis实例创建中..."

    echo "⏳ 等待实例初始化（约2分钟）..."
    sleep 120
fi

warn "请手动获取Redis内网地址："
echo "1. 访问：https://console.cloud.tencent.com/redis"
echo "2. 找到实例 abc-bank-h5-redis"
echo "3. 复制「内网地址」"

# ============================================
# 5. 生成配置文件
# ============================================
echo ""
echo "📝 生成配置文件模板..."

cat > functions/api/.env.todo << 'EOF'
# ============================================
# 请完成以下配置（替换为实际值）
# ============================================

# PostgreSQL配置
POSTGRES_HOST=172.x.x.x    # ← 替换为PostgreSQL内网地址
POSTGRES_PORT=5432
POSTGRES_USER=root
POSTGRES_PASSWORD=AbcBank@2025
POSTGRES_DB=abc_bank_h5

# Redis配置
REDIS_HOST=172.x.x.x       # ← 替换为Redis内网地址
REDIS_PORT=6379
REDIS_PASSWORD=Redis@2025

# JWT密钥（保持不变）
JWT_SECRET=abc-bank-h5-jwt-secret-key-20251207-random

# 加密密钥（保持不变）
ENCRYPT_KEY=12345678901234567890123456789012

# 腾讯云短信服务配置（待审核通过后配置）
# TENCENT_SECRET_ID=
# TENCENT_SECRET_KEY=
# TENCENT_SMS_APP_ID=
# TENCENT_SMS_SIGN_NAME=
# TENCENT_SMS_TEMPLATE_ID=
EOF

progress "配置模板已生成：functions/api/.env.todo"

# ============================================
# 6. 总结
# ============================================
echo ""
echo "========================================"
echo "✅ 自动化任务完成"
echo "========================================"
echo ""
echo "已创建的资源："
echo "  ✓ PostgreSQL实例：abc-bank-h5-db"
echo "  ✓ Redis实例：abc-bank-h5-redis"
echo ""
echo "接下来请手动完成："
echo ""
echo "1. 获取数据库连接信息："
echo "   https://console.cloud.tencent.com/postgres"
echo "   https://console.cloud.tencent.com/redis"
echo ""
echo "2. 编辑配置文件："
echo "   cd functions/api"
echo "   cp .env.todo .env"
echo "   nano .env  # 替换内网地址"
echo ""
echo "3. 初始化数据库："
echo "   psql -h <地址> -U root -d abc_bank_h5 < ../../database/init.sql"
echo ""
echo "4. 部署云函数："
echo "   source .env"
echo "   serverless deploy"
echo ""
echo "详细文档：接下来要做的事.md"
echo ""
