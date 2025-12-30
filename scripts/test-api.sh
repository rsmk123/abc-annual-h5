#!/bin/bash

# ============================================
# API接口完整测试脚本
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 从文件读取API URL
if [ -f "functions/api-gateway-url.txt" ]; then
    API_BASE=$(cat functions/api-gateway-url.txt)
else
    echo "请输入API网关URL（例如：https://service-xxx.gz.apigw.tencentcs.com/release/）："
    read API_BASE
fi

# 移除末尾斜杠
API_BASE="${API_BASE%/}"

echo "=========================================="
echo "🧪 API接口完整测试"
echo "=========================================="
echo ""
echo "API地址：$API_BASE"
echo ""

PASSED=0
FAILED=0

# 测试函数
test_api() {
    local test_name=$1
    local url=$2
    local method=$3
    local data=$4
    local expected=$5

    echo -n "测试 ${test_name}... "

    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -s "$url")
    else
        RESPONSE=$(curl -s -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    if echo "$RESPONSE" | grep -q "$expected"; then
        echo -e "${GREEN}✓ 通过${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "  响应: $RESPONSE"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# ============================================
# 1. 健康检查
# ============================================
test_api "健康检查" "$API_BASE/" "GET" "" "ABC Bank H5 API is running"

# ============================================
# 2. 发送验证码
# ============================================
test_api "发送验证码" "${API_BASE}/api/auth/send-code" "POST" \
    '{"phone": "13800138000", "deviceId": "test-device-001"}' \
    "8888"

# ============================================
# 3. 验证码登录
# ============================================
echo -n "测试 验证码登录... "
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/api/auth/verify-code" \
    -H "Content-Type: application/json" \
    -d '{"phone": "13800138000", "code": "8888", "deviceId": "test-device-001"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ 通过${NC}"
    PASSED=$((PASSED + 1))

    # 提取token
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "  Token: ${TOKEN:0:30}..."
else
    echo -e "${RED}✗ 失败${NC}"
    echo "  响应: $LOGIN_RESPONSE"
    FAILED=$((FAILED + 1))
    TOKEN=""
fi

# ============================================
# 4. 获取用户状态（需要token）
# ============================================
if [ -n "$TOKEN" ]; then
    echo -n "测试 获取用户状态... "
    STATUS_RESPONSE=$(curl -s "${API_BASE}/api/user/status" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$STATUS_RESPONSE" | grep -q "cards"; then
        echo -e "${GREEN}✓ 通过${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "  响应: $STATUS_RESPONSE"
        FAILED=$((FAILED + 1))
    fi
fi

# ============================================
# 5. 抽卡（需要token）
# ============================================
if [ -n "$TOKEN" ]; then
    echo -n "测试 抽卡接口... "
    DRAW_RESPONSE=$(curl -s -X POST "${API_BASE}/api/card/draw" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{"deviceId": "test-device-001"}')

    if echo "$DRAW_RESPONSE" | grep -q "cardText"; then
        echo -e "${GREEN}✓ 通过${NC}"
        PASSED=$((PASSED + 1))

        # 提取卡片信息
        CARD_TEXT=$(echo "$DRAW_RESPONSE" | grep -o '"cardText":"[^"]*"' | cut -d'"' -f4)
        echo "  抽到的卡片：$CARD_TEXT"
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "  响应: $DRAW_RESPONSE"
        FAILED=$((FAILED + 1))
    fi
fi

# ============================================
# 总结
# ============================================
echo ""
echo "=========================================="
echo "📊 测试结果"
echo "=========================================="
echo -e "  通过: ${GREEN}$PASSED${NC}"
echo -e "  失败: ${RED}$FAILED${NC}"
echo "  总计: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 所有测试通过！${NC}"
    echo ""
    echo "🎉 后端API已就绪，可以开始前端对接！"
    echo ""
    echo "下一步："
    echo "  1. npm run dev"
    echo "  2. 访问 http://localhost:3000/bank-campaign"
    echo "  3. 测试完整流程"
    exit 0
else
    echo -e "${RED}❌ 有测试失败，请检查日志${NC}"
    exit 1
fi
