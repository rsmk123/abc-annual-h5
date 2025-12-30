/**
 * 腾讯云控制台自动化脚本集合
 * 在Chrome DevTools Console中运行
 */

// ============================================
// 1. PostgreSQL 自动创建助手
// ============================================
// 使用方法：
// 1. 访问 https://console.cloud.tencent.com/postgres
// 2. 点击「新建」按钮
// 3. 打开 Chrome DevTools (Command+Option+I 或 F12)
// 4. 切换到 Console 标签
// 5. 粘贴下面的函数并回车
// 6. 运行 autoCreatePostgreSQL()

function autoCreatePostgreSQL() {
  console.log('🚀 启动PostgreSQL自动创建流程...\n');

  let step = 1;
  const totalSteps = 7;

  const logStep = (message) => {
    console.log(`[${step}/${totalSteps}] ${message}`);
    step++;
  };

  setTimeout(() => {
    // Step 1: 地域
    logStep('设置地域为广州...');
    const regionSelect = document.querySelector('select[name="region"]') ||
                        document.querySelector('[class*="region"]') ||
                        document.querySelector('select');

    if (regionSelect) {
      const options = Array.from(regionSelect.options);
      const gzOption = options.find(opt => opt.text.includes('广州') || opt.value.includes('guangzhou'));
      if (gzOption) {
        regionSelect.value = gzOption.value;
        regionSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('  ✅ 地域已设置：广州');
      }
    } else {
      console.log('  ⚠️ 未找到地域选择框（可能需要手动选择）');
    }

    // Step 2: 版本
    logStep('设置数据库版本为PostgreSQL 14...');
    const versionSelect = document.querySelector('select[name="version"]') ||
                         document.querySelector('[class*="version"]');

    if (versionSelect) {
      const options = Array.from(versionSelect.options);
      const v14Option = options.find(opt => opt.text.includes('14'));
      if (v14Option) {
        versionSelect.value = v14Option.value;
        versionSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('  ✅ 版本已设置：PostgreSQL 14');
      }
    }

    // Step 3: 规格
    logStep('设置规格为1核2GB...');
    const specRadios = document.querySelectorAll('input[type="radio"]');
    let found = false;
    specRadios.forEach(radio => {
      const label = radio.parentElement?.textContent || '';
      if (label.includes('1核') || label.includes('2G') || label.includes('2048')) {
        radio.click();
        console.log('  ✅ 规格已选择：1核2GB');
        found = true;
      }
    });
    if (!found) console.log('  ⚠️ 请手动选择规格：1核2GB');

    // Step 4: 存储
    logStep('设置存储为10GB...');
    const storageInputs = document.querySelectorAll('input[type="number"]');
    storageInputs.forEach(input => {
      const label = input.parentElement?.textContent || '';
      if (label.includes('存储') || label.includes('GB')) {
        input.value = '10';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('  ✅ 存储已设置：10GB');
      }
    });

    // Step 5: 实例名称
    logStep('设置实例名称...');
    const nameInputs = document.querySelectorAll('input[type="text"]');
    let nameSet = false;
    nameInputs.forEach(input => {
      const placeholder = input.placeholder || '';
      if (placeholder.includes('实例名称') || placeholder.includes('名称')) {
        input.value = 'abc-bank-h5-db';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('  ✅ 实例名称：abc-bank-h5-db');
        nameSet = true;
      }
    });
    if (!nameSet) console.log('  ⚠️ 请手动输入实例名称：abc-bank-h5-db');

    // Step 6: 密码提示
    logStep('密码设置提示...');
    console.log('  ⚠️ 请手动设置root密码：AbcBank@2025');

    // Step 7: 总结
    logStep('表单填写完成');

    console.log('\n' + '='.repeat(50));
    console.log('📋 表单已自动填写，请检查：');
    console.log('  ✓ 地域：广州');
    console.log('  ✓ 版本：PostgreSQL 14');
    console.log('  ✓ 规格：1核2GB');
    console.log('  ✓ 存储：10GB SSD');
    console.log('  ✓ 实例名称：abc-bank-h5-db');
    console.log('\n  ⚠️  请手动设置：');
    console.log('  • 密码：AbcBank@2025（重要！）');
    console.log('\n然后点击「立即购买」');
    console.log('='.repeat(50) + '\n');

  }, 1500); // 等待1.5秒确保页面加载完成
}

// ============================================
// 2. Redis 自动创建助手
// ============================================
// 使用方法：
// 1. 访问 https://console.cloud.tencent.com/redis
// 2. 点击「新建」按钮
// 3. 在 Console 运行 autoCreateRedis()

function autoCreateRedis() {
  console.log('🚀 启动Redis自动创建流程...\n');

  let step = 1;
  const totalSteps = 5;

  const logStep = (message) => {
    console.log(`[${step}/${totalSteps}] ${message}`);
    step++;
  };

  setTimeout(() => {
    // Step 1: 地域
    logStep('设置地域为广州...');
    const regionSelect = document.querySelector('select[name="region"]') ||
                        document.querySelector('[class*="region"]');

    if (regionSelect) {
      const options = Array.from(regionSelect.options);
      const gzOption = options.find(opt => opt.text.includes('广州'));
      if (gzOption) {
        regionSelect.value = gzOption.value;
        regionSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('  ✅ 地域已设置：广州');
      }
    }

    // Step 2: 规格
    logStep('设置规格为256MB...');
    const specRadios = document.querySelectorAll('input[type="radio"]');
    specRadios.forEach(radio => {
      const label = radio.parentElement?.textContent || '';
      if (label.includes('256') || label.includes('0.25')) {
        radio.click();
        console.log('  ✅ 规格已选择：256MB');
      }
    });

    // Step 3: 实例名称
    logStep('设置实例名称...');
    const nameInputs = document.querySelectorAll('input[type="text"]');
    nameInputs.forEach(input => {
      const placeholder = input.placeholder || '';
      if (placeholder.includes('实例名称') || placeholder.includes('名称')) {
        input.value = 'abc-bank-h5-redis';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('  ✅ 实例名称：abc-bank-h5-redis');
      }
    });

    // Step 4: 密码提示
    logStep('密码设置提示...');
    console.log('  ⚠️ 请手动设置密码：Redis@2025');

    // Step 5: 总结
    logStep('表单填写完成');

    console.log('\n' + '='.repeat(50));
    console.log('📋 表单已自动填写，请检查：');
    console.log('  ✓ 地域：广州');
    console.log('  ✓ 规格：256MB');
    console.log('  ✓ 实例名称：abc-bank-h5-redis');
    console.log('\n  ⚠️  请手动设置：');
    console.log('  • 密码：Redis@2025（重要！）');
    console.log('\n然后点击「立即购买」');
    console.log('='.repeat(50) + '\n');

  }, 1500);
}

// ============================================
// 3. 获取连接信息助手
// ============================================
// 在PostgreSQL或Redis实例详情页运行

function exportConnectionInfo() {
  console.log('📝 导出连接信息...\n');

  // 尝试多种选择器找到IP地址
  const ipSelectors = [
    '.instance-ip',
    '[class*="private-ip"]',
    '[class*="内网地址"]',
    'td:contains("内网地址")',
  ];

  let ipElement = null;
  for (const selector of ipSelectors) {
    ipElement = document.querySelector(selector);
    if (ipElement) break;
  }

  const ip = ipElement?.innerText?.trim() || '请手动查看';

  // 判断是PostgreSQL还是Redis
  const isPostgres = window.location.href.includes('postgres');
  const isRedis = window.location.href.includes('redis');

  let envText = '';

  if (isPostgres) {
    envText = `
# PostgreSQL配置
POSTGRES_HOST=${ip}
POSTGRES_PORT=5432
POSTGRES_USER=root
POSTGRES_PASSWORD=AbcBank@2025
POSTGRES_DB=abc_bank_h5
    `.trim();
  } else if (isRedis) {
    envText = `
# Redis配置
REDIS_HOST=${ip}
REDIS_PORT=6379
REDIS_PASSWORD=Redis@2025
    `.trim();
  } else {
    console.log('❌ 请在PostgreSQL或Redis实例详情页运行此脚本');
    return;
  }

  console.log('='.repeat(50));
  console.log('📋 复制以下内容到 functions/api/.env 文件：\n');
  console.log(envText);
  console.log('\n' + '='.repeat(50));

  // 尝试复制到剪贴板
  if (navigator.clipboard) {
    navigator.clipboard.writeText(envText).then(() => {
      console.log('\n✅ 已复制到剪贴板！');
    }).catch(() => {
      console.log('\n⚠️ 无法自动复制，请手动复制上面的内容');
    });
  }
}

// ============================================
// 4. 一键完整流程（需要在不同页面分步执行）
// ============================================

function printInstructions() {
  console.log('='.repeat(60));
  console.log('🎯 腾讯云资源自动化创建指南');
  console.log('='.repeat(60));
  console.log('\n【第1步】创建PostgreSQL');
  console.log('  1. 访问：https://console.cloud.tencent.com/postgres');
  console.log('  2. 点击「新建」');
  console.log('  3. 在Console运行：autoCreatePostgreSQL()');
  console.log('  4. 手动设置密码：AbcBank@2025');
  console.log('  5. 点击「立即购买」');
  console.log('');
  console.log('【第2步】创建Redis');
  console.log('  1. 访问：https://console.cloud.tencent.com/redis');
  console.log('  2. 点击「新建」');
  console.log('  3. 在Console运行：autoCreateRedis()');
  console.log('  4. 手动设置密码：Redis@2025');
  console.log('  5. 点击「立即购买」');
  console.log('');
  console.log('【第3步】获取连接信息');
  console.log('  1. 进入PostgreSQL实例详情页');
  console.log('  2. 在Console运行：exportConnectionInfo()');
  console.log('  3. 进入Redis实例详情页');
  console.log('  4. 在Console运行：exportConnectionInfo()');
  console.log('');
  console.log('【第4步】完成配置');
  console.log('  1. 将复制的内容保存到 functions/api/.env');
  console.log('  2. 按照文档继续后续步骤');
  console.log('');
  console.log('='.repeat(60));
  console.log('\n💡 提示：每个函数都可以独立使用');
  console.log('   - autoCreatePostgreSQL()  # PostgreSQL表单填写');
  console.log('   - autoCreateRedis()       # Redis表单填写');
  console.log('   - exportConnectionInfo()  # 导出连接信息');
  console.log('   - printInstructions()     # 显示本指南');
  console.log('\n');
}

// 自动显示使用说明
printInstructions();
