#!/bin/bash
# 部署云函数到腾讯云SCF

set -e

# 加载环境变量
export POSTGRES_HOST=10.0.0.10
export POSTGRES_PORT=5432
export POSTGRES_USER=rsmk_
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-"your_password_here"}
export POSTGRES_DB=abc_bank_h5

export REDIS_HOST=10.0.0.13
export REDIS_PORT=6379
export REDIS_PASSWORD=${REDIS_PASSWORD:-"your_redis_password_here"}

export JWT_SECRET=${JWT_SECRET:-"your_jwt_secret_here"}
export ENCRYPT_KEY=${ENCRYPT_KEY:-"your_32_byte_encrypt_key_here!!!"}

# 腾讯云短信服务配置
export TENCENT_SECRET_ID=${TENCENT_SECRET_ID:-"your_secret_id_here"}
export TENCENT_SECRET_KEY=${TENCENT_SECRET_KEY:-"your_secret_key_here"}
export TENCENT_SMS_APP_ID=${TENCENT_SMS_APP_ID:-"your_sms_app_id"}
export TENCENT_SMS_SIGN_NAME=${TENCENT_SMS_SIGN_NAME:-"your_sign_name"}
export TENCENT_SMS_TEMPLATE_ID=${TENCENT_SMS_TEMPLATE_ID:-"your_template_id"}

echo "🚀 开始部署云函数..."
echo "环境变量已加载"

# 部署
npx serverless deploy

echo "✅ 部署完成！"
