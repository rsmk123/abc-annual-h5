// 测试数据库和Redis连接
require('dotenv').config();
const { Pool } = require('pg');
const Redis = require('ioredis');

async function testConnections() {
  console.log('🧪 开始测试数据库和Redis连接...\n');

  // 测试PostgreSQL
  console.log('1️⃣ 测试PostgreSQL连接...');
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    connectionTimeoutMillis: 10000,
  });

  try {
    const result = await pool.query('SELECT version(), current_database()');
    console.log('✅ PostgreSQL连接成功！');
    console.log(`   版本: ${result.rows[0].version.substring(0, 30)}...`);
    console.log(`   数据库: ${result.rows[0].current_database}`);

    // 检查表
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(`   表数量: ${tables.rows.length}`);
    console.log(`   表列表: ${tables.rows.map(r => r.table_name).join(', ')}`);

  } catch (err) {
    console.log('❌ PostgreSQL连接失败:');
    console.log(`   错误: ${err.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log('');

  // 测试Redis
  console.log('2️⃣ 测试Redis连接...');
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 30000,
    retryStrategy: () => null, // 不重试
  });

  try {
    const pong = await redis.ping();
    console.log('✅ Redis连接成功！');
    console.log(`   PING响应: ${pong}`);

    // 测试基本操作
    await redis.set('test_key', 'hello');
    const value = await redis.get('test_key');
    await redis.del('test_key');
    console.log(`   SET/GET测试: ${value}`);

  } catch (err) {
    console.log('❌ Redis连接失败:');
    console.log(`   错误: ${err.message}`);
    process.exit(1);
  } finally {
    redis.disconnect();
  }

  console.log('');
  console.log('🎉 所有连接测试通过！');
  console.log('');
  console.log('✅ 下一步:');
  console.log('   1. 启动API服务器: node start-local.js');
  console.log('   2. 测试API接口');
  console.log('   3. 部署到腾讯云SCF');

  process.exit(0);
}

testConnections().catch(err => {
  console.error('测试过程出错:', err);
  process.exit(1);
});
