const CDP = require('chrome-remote-interface');
const { spawn } = require('child_process');

const url = process.argv[2] || 'https://h5.actionlist.cool/bank-campaign/index.html';

async function checkImages() {
  console.log('启动 Chrome...');

  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-web-security',
    '--window-size=375,812'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  let client;
  try {
    client = await CDP();
    const { Network, Page, Runtime, DOM } = client;

    const allRequests = new Map();
    const failedRequests = [];

    Network.requestWillBeSent((params) => {
      allRequests.set(params.requestId, {
        url: params.request.url,
        type: params.type,
        status: 'pending'
      });
    });

    Network.loadingFailed((params) => {
      const req = allRequests.get(params.requestId);
      if (req) {
        req.status = 'failed';
        req.error = params.errorText;
        req.blockedReason = params.blockedReason;
        console.log('[FAILED]', req.url.substring(0, 80), '-', params.errorText);
      }
    });

    Network.responseReceived((params) => {
      const req = allRequests.get(params.requestId);
      if (req) {
        req.status = params.response.status;
        req.mimeType = params.response.mimeType;
        if (params.response.status >= 400) {
          console.log('[HTTP ' + params.response.status + ']', req.url.substring(0, 80));
        }
      }
    });

    await Network.enable();
    await Page.enable();
    await DOM.enable();

    // 设置移动设备模拟
    await client.Emulation.setDeviceMetricsOverride({
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log('\n========================================');
    console.log('检查页面:', url);
    console.log('========================================\n');

    await Page.navigate({ url });
    await Page.loadEventFired();

    console.log('页面加载完成，等待 React 渲染...\n');

    // 等待更长时间让 React 完全渲染
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000));

      // 检查是否有图片
      const checkResult = await Runtime.evaluate({
        expression: 'document.querySelectorAll("img").length',
        returnByValue: true
      });

      const imgCount = checkResult.result.value;
      console.log('第 ' + (i + 1) + ' 秒: 找到 ' + imgCount + ' 个 img 元素');

      if (imgCount > 0) break;
    }

    // 获取完整 HTML 结构
    const htmlResult = await Runtime.evaluate({
      expression: 'document.body.innerHTML.substring(0, 2000)',
      returnByValue: true
    });
    console.log('\n页面 HTML 片段:');
    console.log(htmlResult.result.value);

    // 获取所有图片
    const result = await Runtime.evaluate({
      expression: `
        (function() {
          const imgs = document.querySelectorAll('img');
          return Array.from(imgs).map(img => ({
            src: img.getAttribute('src'),
            fullSrc: img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            width: img.width,
            height: img.height
          }));
        })()
      `,
      returnByValue: true
    });

    const images = result.result.value || [];

    console.log('\n========================================');
    console.log('图片元素详情:');
    console.log('========================================');

    if (images.length === 0) {
      console.log('未找到 img 元素');
    } else {
      images.forEach((img, idx) => {
        const loaded = img.complete && img.naturalWidth > 0;
        console.log('\n' + (idx + 1) + '. ' + (loaded ? '✅' : '❌'));
        console.log('   src:', img.src);
        console.log('   fullSrc:', img.fullSrc);
        console.log('   complete:', img.complete);
        console.log('   naturalSize:', img.naturalWidth + 'x' + img.naturalHeight);
        console.log('   displaySize:', img.width + 'x' + img.height);
      });
    }

    // 检查图片相关的网络请求
    console.log('\n========================================');
    console.log('图片/媒体网络请求:');
    console.log('========================================');

    allRequests.forEach((req, id) => {
      if (req.url.match(/\.(png|jpg|jpeg|gif|webp|svg|mp3)/i) ||
          (req.mimeType && req.mimeType.includes('image'))) {
        const statusIcon = req.status === 200 ? '✅' : (req.status === 'failed' ? '❌' : '⚠️');
        console.log(statusIcon, req.status, req.url);
        if (req.error) {
          console.log('   错误:', req.error);
        }
      }
    });

    console.log('\n========================================');

  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    if (client) await client.close();
    chrome.kill();
    process.exit(0);
  }
}

checkImages();
