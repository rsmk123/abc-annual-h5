/**
 * 测试 Redis - 无密码
 */
const Redis = require('ioredis');

const configs = [
  {
    name: '无密码',
    host: 'gz-crs-mq2rf8jh.sql.tencentcdb.com',
    port: 27830,
    // 不设置密码
  },
  {
    name: '只有密码',
    host: 'gz-crs-mq2rf8jh.sql.tencentcdb.com',
    port: 27830,
    password: 'Redis@2025',
  },
  {
    name: 'default用户+密码',
    host: 'gz-crs-mq2rf8jh.sql.tencentcdb.com',
    port: 27830,
    username: 'default',
    password: 'Redis@2025',
  },
  {
    name: 'rsmk用户+密码',
    host: 'gz-crs-mq2rf8jh.sql.tencentcdb.com',
    port: 27830,
    username: 'rsmk',
    password: 'Redis@2025',
  }
];

async function testConfig(config) {
  return new Promise((resolve) => {
    console.log(`\n🔗 测试配置: ${config.name}`);

    const redis = new Redis(config);

    const timeout = setTimeout(() => {
      redis.disconnect();
      resolve({ name: config.name, success: false, error: '超时' });
    }, 5000);

    redis.on('connect', () => {
      // 测试 ping
      redis.ping().then(() => {
        clearTimeout(timeout);
        redis.disconnect();
        resolve({ name: config.name, success: true });
      }).catch((err) => {
        clearTimeout(timeout);
        redis.disconnect();
        resolve({ name: config.name, success: false, error: err.message });
      });
    });

    redis.on('error', (err) => {
      clearTimeout(timeout);
      redis.disconnect();
      resolve({ name: config.name, success: false, error: err.message });
    });
  });
}

async function testAll() {
  console.log('🧪 开始测试所有配置组合...\n');

  for (const config of configs) {
    const result = await testConfig(config);
    if (result.success) {
      console.log(`✅ ${result.name} - 成功！`);
    } else {
      console.log(`❌ ${result.name} - 失败: ${result.error}`);
    }
  }

  process.exit(0);
}

testAll();
