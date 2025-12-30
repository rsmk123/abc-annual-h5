const Router = require('koa-router');
const Joi = require('joi');
const pool = require('../config/db');
const redis = require('../config/redis');
const authMiddleware = require('../middlewares/auth');

const router = new Router();

const CARD_TEXTS = ['马', '上', '发', '财', '哇'];

// POST /api/card/draw
router.post('/draw', authMiddleware, async (ctx) => {
  const userId = ctx.state.userId;

  // 防刷检查
  const drawKey = `draw:user:${userId}:count`;
  const drawCount = await redis.get(drawKey);

  if (drawCount && parseInt(drawCount) > 50) {
    ctx.status = 429;
    ctx.body = { success: false, error: '今日抽卡次数已用完' };
    return;
  }

  // 开始事务
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 查询用户当前状态（包含所有必要字段）
    const userResult = await client.query(
      `SELECT id, cards, collected_count, is_completed, draw_count, last_draw_at
       FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );

    const user = userResult.rows[0];

    // 每日限制检查（在事务内，使用 SQL 时区函数）
    if (user.last_draw_at) {
      const checkResult = await client.query(
        `SELECT
           (last_draw_at AT TIME ZONE 'Asia/Shanghai')::date =
           (NOW() AT TIME ZONE 'Asia/Shanghai')::date AS is_today
         FROM users WHERE id = $1`,
        [userId]
      );

      if (checkResult.rows[0].is_today) {
        await client.query('ROLLBACK');

        // 计算明天0点（北京时间）
        const tomorrow = await client.query(
          `SELECT (DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Shanghai') +
                  INTERVAL '1 day') AS next_draw`
        );

        ctx.body = {
          success: false,
          error: '今天已经抽过卡了，明天再来吧！',
          data: {
            nextDrawTime: tomorrow.rows[0].next_draw
          }
        };
        return;
      }
    }

    if (user.is_completed) {
      await client.query('ROLLBACK');
      ctx.body = { success: false, error: '已集齐所有卡片' };
      return;
    }

    // 计算未收集的卡片
    const cards = user.cards || {};
    const missing = [];
    for (let i = 0; i < 5; i++) {
      if (!cards[i]?.collected) {
        missing.push(i);
      }
    }

    if (missing.length === 0) {
      await client.query('ROLLBACK');
      ctx.body = { success: false, error: '已集齐所有卡片' };
      return;
    }

    // 保底机制抽卡算法
    const drawCount = user.draw_count || 0;
    const collectedCount = user.collected_count || 0;

    const MIN_DRAWS = 6;
    const MAX_DRAWS = 10;

    // 计算保底要求
    const guaranteedCount = Math.max(
      0,
      Math.ceil(((drawCount + 1) - MIN_DRAWS + 1) / (MAX_DRAWS - MIN_DRAWS + 1) * 5)
    );

    let luckyIndex;
    let isNew;

    if (collectedCount < guaranteedCount) {
      // 保底触发：必须抽新卡
      luckyIndex = missing[Math.floor(Math.random() * missing.length)];
      isNew = true;
      console.log(`[保底] 第${drawCount+1}次，已收集${collectedCount}，要求≥${guaranteedCount}`);
    } else {
      // 正常随机：按权重抽取
      const weights = [0, 1, 2, 3, 4].map(i =>
        cards[i]?.collected ? 1 : 9
      );

      const total = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;

      for (let i = 0; i < 5; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          luckyIndex = i;
          isNew = !cards[i]?.collected;
          break;
        }
      }
    }

    const cardText = CARD_TEXTS[luckyIndex];

    // 更新用户收集状态（只有新卡才更新）
    const newCards = { ...cards };
    if (isNew) {
      newCards[luckyIndex] = {
        collected: true,
        collectedAt: new Date().toISOString()
      };
    }

    const newCount = isNew ? collectedCount + 1 : collectedCount;
    const isCompleted = newCount >= 5;

    await client.query(
      `UPDATE users SET
        cards = $1,
        collected_count = $2,
        is_completed = $3,
        completed_at = CASE WHEN $3 THEN NOW() ELSE completed_at END,
        draw_count = draw_count + 1,
        last_draw_at = NOW()
       WHERE id = $4`,
      [JSON.stringify(newCards), newCount, isCompleted, userId]
    );

    // 记录抽卡日志（使用动态的 isNew）
    await client.query(
      `INSERT INTO draw_logs (user_id, card_index, card_text, is_new, ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, luckyIndex, cardText, isNew, ctx.request.ip]
    );

    await client.query('COMMIT');

    // Redis计数已删除（改用数据库每日限制）

    // 返回结果
    const cardsArray = [0, 1, 2, 3, 4].map(i =>
      newCards[i]?.collected === true
    );

    ctx.body = {
      success: true,
      data: {
        cardIndex: luckyIndex,
        cardText,
        isNew,  // 使用动态变量
        collectedCount: newCount,
        totalDrawCount: drawCount + 1,  // 总抽卡次数
        isCompleted,
        cards: cardsArray,
        // 保底信息
        guarantee: {
          minDraws: MIN_DRAWS,
          maxDraws: MAX_DRAWS,
          currentDraw: drawCount + 1,
          guaranteedCount,
          isGuaranteed: collectedCount < guaranteedCount
        }
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

module.exports = router;
