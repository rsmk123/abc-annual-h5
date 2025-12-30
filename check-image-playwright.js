const { chromium } = require('playwright');

async function checkImages() {
  const url = process.argv[2] || 'https://h5.actionlist.cool/bank-campaign/index.html';

  console.log('启动浏览器...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await context.newPage();

  const failedRequests = [];
  const imageRequests = [];

  page.on('requestfailed', request => {
    const url = request.url();
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)) {
      failedRequests.push({
        url: url,
        error: request.failure()?.errorText
      });
      console.log('[FAILED]', url, '-', request.failure()?.errorText);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)) {
      const status = response.status();
      imageRequests.push({ url, status });
      if (status >= 400) {
        console.log('[HTTP ' + status + ']', url);
      } else {
        console.log('[OK ' + status + ']', url);
      }
    }
  });

  console.log('\n========================================');
  console.log('检查页面:', url);
  console.log('========================================\n');

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log('页面加载超时，继续检查...');
  }

  await page.waitForTimeout(3000);

  // 截图
  const screenshotPath = '/tmp/page-screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('\n截图已保存到:', screenshotPath);

  // 获取图片元素
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.getAttribute('src'),
      fullSrc: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      width: img.width,
      height: img.height
    }));
  });

  console.log('\n========================================');
  console.log('页面中的 <img> 元素:');
  console.log('========================================');

  if (images.length === 0) {
    console.log('未找到 img 元素');
  } else {
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const loaded = img.complete && img.naturalWidth > 0;
      console.log('\n' + (i + 1) + '. ' + (loaded ? '✅' : '❌'));
      console.log('   src:', img.src);
      console.log('   完整URL:', img.fullSrc);
      console.log('   complete:', img.complete);
      console.log('   原始尺寸:', img.naturalWidth + 'x' + img.naturalHeight);
      console.log('   显示尺寸:', img.width + 'x' + img.height);
    }
  }

  console.log('\n========================================');
  console.log('汇总:');
  console.log('========================================');
  console.log('图片请求:', imageRequests.length);
  console.log('失败请求:', failedRequests.length);

  const failedImages = images.filter(img => !img.complete || img.naturalWidth === 0);
  if (failedImages.length > 0) {
    console.log('\n❌ 加载失败的图片:');
    failedImages.forEach(img => console.log('  -', img.fullSrc));
  }

  await browser.close();
  console.log('\n完成');
}

checkImages().catch(console.error);
