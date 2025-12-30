const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 签发Token
exports.sign = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // 7天过期
  });
};

// 验证Token
exports.verify = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid token');
  }
};
