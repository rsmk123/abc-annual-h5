const Router = require('koa-router');
const Joi = require('joi');
const pool = require('../config/db');
const redis = require('../config/redis');
const jwtUtil = require('../utils/jwt');
const cryptoUtil = require('../utils/crypto');
const smsService = require('../utils/sms');

const router = new Router();

// POST /api/auth/send-code
router.post('/send-code', async (ctx) => {
  // 参数验证
  const schema = Joi.object({
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
    deviceId: Joi.string().required()
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { success: false, error: error.details[0].message };
    return;
  }

  const { phone, deviceId } = value;

  // 防刷检查
  const phoneKey = `sms:phone:${phone}:last_sent`;
  let lastSent;
  try {
    lastSent = await redis.get(phoneKey);
  } catch (redisError) {
    console.error('Redis错误:', redisError.message);
    ctx.status = 500;
    ctx.body = { success: false, error: `Redis connection failed: ${redisError.message}` };
    return;
  }

  if (lastSent) {
    ctx.body = {
      success: false,
      error: '验证码已发送，请60秒后重试'
    };
    return;
  }

  // 生成验证码（使用 sms.js 的统一逻辑：mock 模式返回 888888，否则随机码）
  let codeResult;
  try {
    codeResult = smsService.generateVerificationCode();
  } catch (err) {
    // 生产环境 SMS 配置不全会抛出异常
    ctx.status = 500;
    ctx.body = { success: false, error: err.message };
    return;
  }

  const { code, isMock } = codeResult;

  // 存储验证码到数据库（5分钟过期）
  // 注意：使用 SQL 的 NOW() + INTERVAL 来避免时区问题

  try {
    // 使用数据库时间计算过期时间，避免时区问题
    const insertResult = await pool.query(
      `INSERT INTO sms_logs (phone, code, expires_at, ip)
       VALUES ($1, $2, NOW() + INTERVAL '5 minutes', $3)
       RETURNING id, phone, code, expires_at, sent_at`,
      [phone, code, ctx.request.ip]
    );
    console.log('[send-code] 验证码已存入数据库:', JSON.stringify(insertResult.rows[0]));
  } catch (dbError) {
    console.error('[send-code] 数据库写入失败:', dbError.message);
    ctx.status = 500;
    ctx.body = { success: false, error: `数据库错误: ${dbError.message}` };
    return;
  }

  // Redis 记录发送时间（60秒防刷）
  await redis.setex(phoneKey, 60, Date.now().toString());

  // 发送短信（mock 模式下不会实际发送）
  const smsResult = await smsService.sendVerificationCode(phone, code);
  console.log('[send-code] SMS发送结果:', JSON.stringify(smsResult));

  if (!smsResult.success) {
    console.error('短信发送失败:', smsResult.error);
    // 真实模式下短信发送失败，返回错误
    if (!isMock) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: `短信发送失败: ${smsResult.error || '未知错误'}`,
        smsError: smsResult.errorCode || null
      };
      return;
    }
  }

  // 构建响应
  const response = {
    success: true,
    message: isMock ? '验证码已生成（模拟模式）' : '验证码已发送',
    expiresIn: 300,
    canResendAfter: 60,
    isMock, // 告知前端是否为模拟模式
    smsSuccess: smsResult.success // 添加短信发送状态
  };

  // 仅在模拟模式下返回验证码（方便测试）
  if (isMock) {
    response.code = code;
  }

  ctx.body = response;
});

// POST /api/auth/verify-code
router.post('/verify-code', async (ctx) => {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
    code: Joi.string().length(6).required(),
    deviceId: Joi.string().required()
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { success: false, error: error.details[0].message };
    return;
  }

  const { phone, code, deviceId } = value;

  // 验证验证码
  console.log(`[verify-code] 查询验证码: phone=${phone}, code=${code}`);

  let smsResult;
  try {
    smsResult = await pool.query(
      `SELECT * FROM sms_logs
       WHERE phone = $1 AND code = $2 AND verified = false
       AND expires_at > NOW()
       ORDER BY sent_at DESC LIMIT 1`,
      [phone, code]
    );
    console.log(`[verify-code] 查询结果: ${smsResult.rows.length} 条记录`);
    if (smsResult.rows.length > 0) {
      console.log(`[verify-code] 匹配记录:`, JSON.stringify(smsResult.rows[0]));
    }
  } catch (dbError) {
    console.error('[verify-code] 数据库查询失败:', dbError.message);
    ctx.status = 500;
    ctx.body = { success: false, error: `数据库错误: ${dbError.message}` };
    return;
  }

  if (smsResult.rows.length === 0) {
    // 额外调试：查看该手机号的所有验证码记录
    try {
      const debugResult = await pool.query(
        `SELECT id, phone, code, verified, expires_at, sent_at FROM sms_logs
         WHERE phone = $1 ORDER BY sent_at DESC LIMIT 5`,
        [phone]
      );
      console.log(`[verify-code] 调试 - 该手机号最近记录:`, JSON.stringify(debugResult.rows));
    } catch (e) {
      console.log('[verify-code] 调试查询失败:', e.message);
    }

    ctx.status = 400;
    ctx.body = { success: false, error: '验证码错误或已过期' };
    return;
  }

  // 标记验证码已使用
  await pool.query(
    `UPDATE sms_logs SET verified = true, verified_at = NOW()
     WHERE id = $1`,
    [smsResult.rows[0].id]
  );

  // 查找或创建用户
  const phoneHash = cryptoUtil.hashPhone(phone);
  const phoneEncrypted = cryptoUtil.encryptPhone(phone);

  let user = await pool.query(
    `SELECT * FROM users WHERE phone_hash = $1`,
    [phoneHash]
  );

  if (user.rows.length === 0) {
    // 创建新用户
    user = await pool.query(
      `INSERT INTO users (phone, phone_hash, phone_encrypted, ip, device_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [phone, phoneHash, phoneEncrypted, ctx.request.ip, deviceId]
    );
  }

  const userData = user.rows[0];

  // 签发JWT
  const token = jwtUtil.sign({
    userId: userData.id,
    phone: phone
  });

  ctx.body = {
    success: true,
    token,
    user: {
      id: userData.id,
      phone: cryptoUtil.maskPhone(phone),
      collectedCount: userData.collected_count,
      isCompleted: userData.is_completed
    }
  };
});

module.exports = router;
