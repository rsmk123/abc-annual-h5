#!/bin/bash
# 腾讯云COS自动配置脚本

BUCKET="abc-h5-20251205"
REGION="ap-guangzhou"

echo "✅ 存储桶名称: $BUCKET"
echo "✅ 地域: $REGION"
echo "✅ 静态网站URL: http://${BUCKET}.cos-website.${REGION}.myqcloud.com"
