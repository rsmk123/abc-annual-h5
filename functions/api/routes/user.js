const Router = require('koa-router');
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');
const cryptoUtil = require('../utils/crypto');

const router = new Router();

// GET /api/user/status
router.get('/status', authMiddleware, async (ctx) => {
  const userId = ctx.state.userId;

  const result = await pool.query(
    `SELECT id, cards, collected_count, is_completed, draw_count, last_draw_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'User not found' };
    return;
  }

  const user = result.rows[0];

  // 转换cards JSONB为数组
  const cards = user.cards || {};
  const cardsArray = [0, 1, 2, 3, 4].map(i =>
    cards[i]?.collected === true
  );

  ctx.body = {
    success: true,
    data: {
      userId: user.id,
      phone: cryptoUtil.maskPhone(ctx.state.phone),
      cards: cardsArray,
      collectedCount: user.collected_count,
      isCompleted: user.is_completed,
      drawCount: user.draw_count,
      lastDrawAt: user.last_draw_at
    }
  };
});

module.exports = router;
