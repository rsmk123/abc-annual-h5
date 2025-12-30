/**
 * 穷举测试 Redis 密码
 */
const Redis = require('ioredis');

const passwords = [
  'RedisPass123',
  'Redis@2025',
  'redis@2025',
  'Redis2025',
  'redis2025',
  'Redis_2025',
  'rsmk2025',
  'Rsmk@2025',
  'abc-bank-2025',
  'AbcBank2025',
  '',  // 空密码
];

const host = 'gz-crs-mq2rf8jh.sql.tencentcdb.com';
const port = 27830;

async function testPassword(password, index) {
  return new Promise((resolve) => {
    console.log(`\n[${index + 1}/${passwords.length}] 测试密码: ${password || '(空)'}`);

    const config = {
      host,
      port,
      password: password || undefined,
      connectTimeout: 5000,
      retryStrategy: () => null
    };

    const redis = new Redis(config);

    const timeout = setTimeout(() => {
      redis.disconnect();
      resolve({ password, success: false, error: '超时' });
    }, 6000);

    redis.on('ready', () => {
      clearTimeout(timeout);
      redis.ping().then(() => {
        redis.disconnect();
        resolve({ password, success: true });
      }).catch((err) => {
        redis.disconnect();
        resolve({ password, success: false, error: err.message });
      });
    });

    redis.on('error', (err) => {
      clearTimeout(timeout);
      redis.disconnect();
      resolve({ password, success: false, error: err.message });
    });
  });
}

async function testAll() {
  console.log('🔍 开始穷举测试 Redis 密码...\n');
  console.log(`Host: ${host}:${port}\n`);
  console.log('='.repeat(50));

  for (let i = 0; i < passwords.length; i++) {
    const result = await testPassword(passwords[i], i);
    if (result.success) {
      console.log(`\n🎉🎉🎉 找到正确密码！`);
      console.log(`密码: ${result.password}`);
      process.exit(0);
    } else {
      console.log(`   ❌ 失败: ${result.error}`);
    }
  }

  console.log('\n\n😢 所有密码都失败了');
  console.log('建议：通过控制台重置密码');
  process.exit(1);
}

testAll();
