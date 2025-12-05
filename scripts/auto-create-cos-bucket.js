// 腾讯云COS自动创建脚本 - 在浏览器控制台执行
// 使用方法：
// 1. 在腾讯云控制台页面按 F12 打开开发者工具
// 2. 切换到 Console (控制台) 标签
// 3. 复制粘贴此脚本并回车

(async function autoCreateCOSBucket() {
  console.log('🚀 开始自动创建COS存储桶...\n');

  const config = {
    bucketName: 'abc-h5-20251205',
    region: 'ap-guangzhou',
    acl: 'public-read'
  };

  // 步骤1: 导航到COS控制台
  console.log('步骤1: 导航到COS控制台...');
  if (!window.location.href.includes('console.cloud.tencent.com/cos')) {
    window.location.href = 'https://console.cloud.tencent.com/cos5/bucket';
    console.log('⏳ 等待页面加载，加载完成后请重新执行此脚本');
    return;
  }

  // 步骤2: 等待页面加载
  console.log('步骤2: 等待页面元素加载...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 步骤3: 查找并点击"创建存储桶"按钮
  console.log('步骤3: 查找"创建存储桶"按钮...');
  const createButton = Array.from(document.querySelectorAll('button, a, span'))
    .find(el => el.textContent?.includes('创建存储桶') || el.textContent?.includes('创建'));

  if (createButton) {
    console.log('✅ 找到创建按钮，点击中...');
    createButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
  } else {
    console.error('❌ 未找到创建按钮，请手动点击"创建存储桶"');
    console.log('\n📋 手动步骤：');
    console.log('1. 点击页面右上角的"创建存储桶"按钮');
    console.log('2. 重新运行此脚本继续自动化填表');
    return;
  }

  // 步骤4: 填写表单
  console.log('步骤4: 填写存储桶配置表单...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 填写存储桶名称
  const nameInput = document.querySelector('input[placeholder*="名称"], input[placeholder*="bucket"]');
  if (nameInput) {
    nameInput.value = config.bucketName;
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✅ 存储桶名称已填写: ${config.bucketName}`);
  } else {
    console.log('⚠️ 未找到名称输入框，请手动填写：abc-h5-20251205');
  }

  // 选择地域（广州）
  await new Promise(resolve => setTimeout(resolve, 500));
  const regionSelect = Array.from(document.querySelectorAll('select, div[class*="select"]'))
    .find(el => el.textContent?.includes('地域') || el.innerHTML?.includes('region'));

  if (regionSelect) {
    console.log('✅ 正在选择地域: 广州 (ap-guangzhou)');
    // 尝试点击选择器
    regionSelect.click();
    await new Promise(resolve => setTimeout(resolve, 500));

    // 查找广州选项
    const guangzhouOption = Array.from(document.querySelectorAll('li, option, div'))
      .find(el => el.textContent?.includes('广州') || el.textContent?.includes('ap-guangzhou'));

    if (guangzhouOption) {
      guangzhouOption.click();
      console.log('✅ 已选择：广州');
    } else {
      console.log('⚠️ 请手动选择地域: 广州 (ap-guangzhou)');
    }
  } else {
    console.log('⚠️ 未找到地域选择器，请手动选择：广州');
  }

  // 选择访问权限：公有读私有写
  await new Promise(resolve => setTimeout(resolve, 500));
  const publicReadRadio = Array.from(document.querySelectorAll('input[type="radio"], label, span'))
    .find(el => {
      const text = el.textContent || el.value || el.getAttribute('value') || '';
      return text.includes('公有读') || text.includes('public-read');
    });

  if (publicReadRadio) {
    if (publicReadRadio.tagName === 'INPUT') {
      publicReadRadio.checked = true;
      publicReadRadio.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      publicReadRadio.click();
    }
    console.log('✅ 已选择访问权限: 公有读私有写');
  } else {
    console.log('⚠️ 请手动选择访问权限: 公有读私有写');
  }

  // 步骤5: 确认创建
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('\n步骤5: 查找确认按钮...');

  const confirmButton = Array.from(document.querySelectorAll('button'))
    .find(el => {
      const text = el.textContent || '';
      return text.includes('确定') || text.includes('确认') || text.includes('创建');
    });

  if (confirmButton) {
    console.log('✅ 找到确认按钮');
    console.log('\n⚠️ 请检查以下配置是否正确:');
    console.log(`   - 名称: ${config.bucketName}`);
    console.log(`   - 地域: 广州 (ap-guangzhou)`);
    console.log(`   - 权限: 公有读私有写`);
    console.log('\n如果正确，请在控制台输入以下命令点击确认:');
    console.log('confirmButton.click()');

    // 将按钮暴露到全局作用域
    window.confirmButton = confirmButton;
  } else {
    console.log('❌ 未找到确认按钮，请手动点击"确定"按钮');
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📋 配置摘要');
  console.log('═══════════════════════════════════════');
  console.log(`存储桶名称: ${config.bucketName}`);
  console.log(`地域: ${config.region}`);
  console.log(`访问权限: ${config.acl}`);
  console.log('\n下一步: 创建完成后，请告诉我"存储桶已创建"，我会继续配置静态网站托管');

})();
