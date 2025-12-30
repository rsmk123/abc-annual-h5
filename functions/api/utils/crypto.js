const crypto = require('crypto');

const ENCRYPT_KEY = process.env.ENCRYPT_KEY || '12345678901234567890123456789012'; // 32字节

// 手机号哈希（用于查询）
exports.hashPhone = (phone) => {
  return crypto.createHash('sha256').update(phone).digest('hex');
};

// 手机号加密（用于存储）
exports.encryptPhone = (phone) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPT_KEY), iv);
  let encrypted = cipher.update(phone, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// 手机号解密
exports.decryptPhone = (encrypted) => {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPT_KEY), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// 手机号脱敏
exports.maskPhone = (phone) => {
  if (!phone || phone.length !== 11) return phone;
  return phone.substr(0, 3) + '****' + phone.substr(7);
};
