/**
 * 测试 Redis 连接
 */
const Redis = require('ioredis');

const config = {
  host: 'gz-crs-mq2rf8jh.sql.tencentcdb.com',
  port: 27830,
  username: 'default', // Redis 7.0 需要用户名
  password: 'RedisPass123', // 新密码
};

console.log('🔗 测试 Redis 连接...');
console.log('配置:', { ...config, password: '******' });

const redis = new Redis(config);

redis.on('connect', () => {
  console.log('\n✅ Redis 连接成功！');

  // 测试写入
  redis.set('test_key', 'test_value', 'EX', 60).then(() => {
    console.log('✅ 写入测试成功');

    // 测试读取
    redis.get('test_key').then((value) => {
      console.log('✅ 读取测试成功，值:', value);
      process.exit(0);
    });
  });
});

redis.on('error', (err) => {
  console.error('\n❌ Redis 连接失败:', err.message);
  console.error('完整错误:', err);
  process.exit(1);
});

setTimeout(() => {
  console.log('\n⏱️  连接超时');
  process.exit(1);
}, 10000);
