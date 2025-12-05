#!/bin/bash

# ============================================
# 手动部署到COS（使用coscmd）
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${RED}开始部署到腾讯云COS${NC}"
echo ""

# 1. 加载环境变量
if [ ! -f .env.local ]; then
    echo -e "${RED}错误: .env.local 文件不存在${NC}"
    echo "请先运行: bash scripts/setup-cos.sh"
    exit 1
fi

source .env.local

echo -e "${GREEN}✓${NC} 加载配置: $COS_BUCKET @ $COS_REGION"
echo ""

# 2. 检查coscmd
if ! command -v coscmd &> /dev/null; then
    echo -e "${RED}错误: coscmd 未安装${NC}"
    echo "安装: pip3 install coscmd"
    exit 1
fi

# 3. 构建
echo -e "${YELLOW}[1/3] 构建静态站点...${NC}"
bun run build
echo -e "${GREEN}✓${NC} 构建完成"
echo ""

# 4. 上传
echo -e "${YELLOW}[2/3] 上传到COS...${NC}"
coscmd upload -r out/ / --delete
echo -e "${GREEN}✓${NC} 上传完成"
echo ""

# 5. 验证
echo -e "${YELLOW}[3/3] 验证部署...${NC}"
echo "存储桶内容:"
coscmd list | head -15
echo ""

# 6. 输出访问URL
echo -e "${RED}============================================${NC}"
echo -e "${GREEN}✅ 部署成功！${NC}"
echo -e "${RED}============================================${NC}"
echo ""
echo "访问地址:"
echo -e "${GREEN}http://$COS_BUCKET.cos-website.$COS_REGION.myqcloud.com${NC}"
echo ""
echo "如果已绑定自定义域名，访问你的域名即可"
echo ""
