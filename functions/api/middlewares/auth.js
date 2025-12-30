const jwtUtil = require('../utils/jwt');

module.exports = async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ctx.status = 401;
    ctx.body = { success: false, error: 'No token provided' };
    return;
  }

  try {
    const decoded = jwtUtil.verify(token);
    ctx.state.userId = decoded.userId;
    ctx.state.phone = decoded.phone;
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { success: false, error: 'Invalid token' };
  }
};
