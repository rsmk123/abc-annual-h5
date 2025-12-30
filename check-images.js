const CDP = require('chrome-remote-interface');
const { spawn } = require('child_process');

const url = process.argv[2] || 'https://h5.actionlist.cool/bank-campaign/index.html';

async function checkImages() {
  // 启动 Chrome
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--no-sandbox'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  let client;
  try {
    client = await CDP();
    const { Network, Page, Runtime } = client;

    const failedRequests = [];
    const imageRequests = [];

    Network.requestWillBeSent((params) => {
      if (params.type === 'Image' || params.request.url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)) {
        imageRequests.push({
          url: params.request.url,
          requestId: params.requestId
        });
      }
    });

    Network.loadingFailed((params) => {
      const img = imageRequests.find(i => i.requestId === params.requestId);
      if (img) {
        failedRequests.push({
          url: img.url,
          error: params.errorText
        });
      }
    });

    Network.responseReceived((params) => {
      const img = imageRequests.find(i => i.requestId === params.requestId);
      if (img && params.response.status >= 400) {
        failedRequests.push({
          url: img.url,
          status: params.response.status,
          error: 'HTTP ' + params.response.status
        });
      }
    });

    await Network.enable();
    await Page.enable();

    console.log('\n🔍 检查页面: ' + url + '\n');
    await Page.navigate({ url });
    await Page.loadEventFired();
    await new Promise(r => setTimeout(r, 3000));

    // 获取页面上所有图片
    const result = await Runtime.evaluate({
      expression: `
        Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          alt: img.alt
        }))
      `,
      returnByValue: true
    });

    const images = result.result.value || [];

    console.log('============================================================');
    console.log('📷 页面图片检查报告');
    console.log('============================================================');

    console.log('\n总共发现 ' + images.length + ' 个 <img> 标签:\n');

    images.forEach((img, idx) => {
      const loaded = img.complete && img.naturalWidth > 0;
      const status = loaded ? '✅' : '❌';
      console.log((idx + 1) + '. ' + status + ' ' + img.src);
      if (!loaded) {
        console.log('   ⚠️  加载失败 (naturalWidth: ' + img.naturalWidth + ')');
      } else {
        console.log('   尺寸: ' + img.naturalWidth + 'x' + img.naturalHeight);
      }
    });

    if (failedRequests.length > 0) {
      console.log('\n============================================================');
      console.log('❌ 网络请求失败的图片:');
      console.log('============================================================');
      failedRequests.forEach(f => {
        console.log('  - ' + f.url);
        console.log('    错误: ' + f.error);
      });
    }

    // 检查背景图片
    const bgResult = await Runtime.evaluate({
      expression: `
        Array.from(document.querySelectorAll('*')).filter(el => {
          const bg = window.getComputedStyle(el).backgroundImage;
          return bg && bg !== 'none' && bg.includes('url');
        }).map(el => {
          const bg = window.getComputedStyle(el).backgroundImage;
          const match = bg.match(/url\\(["']?([^"')]+)["']?\\)/);
          return match ? match[1] : null;
        }).filter(Boolean)
      `,
      returnByValue: true
    });

    const bgImages = bgResult.result.value || [];
    if (bgImages.length > 0) {
      console.log('\n============================================================');
      console.log('🖼️  CSS背景图片:');
      console.log('============================================================');
      bgImages.forEach((bg, idx) => {
        console.log((idx + 1) + '. ' + bg);
      });
    }

    console.log('\n============================================================');
    console.log('📋 所有图片资源请求:');
    console.log('============================================================');
    imageRequests.forEach((req, idx) => {
      const failed = failedRequests.find(f => f.url === req.url);
      const status = failed ? '❌' : '✅';
      console.log((idx + 1) + '. ' + status + ' ' + req.url);
    });

    console.log('\n============================================================');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (client) await client.close();
    chrome.kill();
  }
}

checkImages();
