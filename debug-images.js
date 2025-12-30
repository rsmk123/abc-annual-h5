const CDP = require('chrome-remote-interface');
const { spawn } = require('child_process');

const url = process.argv[2] || 'https://h5.actionlist.cool/bank-campaign/index.html';

async function checkImages() {
  console.log('启动 Chrome...');

  // 启动 Chrome
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-web-security'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  let client;
  try {
    client = await CDP();
    const { Network, Page, Runtime, Console } = client;

    const failedRequests = [];
    const allRequests = [];

    // 监听控制台消息
    Console.messageAdded((params) => {
      console.log('[Console]', params.message.text);
    });

    Network.requestWillBeSent((params) => {
      const reqUrl = params.request.url;
      if (reqUrl.match(/\.(png|jpg|jpeg|gif|webp|svg|mp3|mp4)/i)) {
        console.log('[Request]', reqUrl);
        allRequests.push({
          url: reqUrl,
          requestId: params.requestId,
          type: params.type
        });
      }
    });

    Network.loadingFailed((params) => {
      const req = allRequests.find(r => r.requestId === params.requestId);
      if (req) {
        console.log('[FAILED]', req.url, '-', params.errorText);
        failedRequests.push({
          url: req.url,
          error: params.errorText,
          blockedReason: params.blockedReason
        });
      }
    });

    Network.responseReceived((params) => {
      const req = allRequests.find(r => r.requestId === params.requestId);
      if (req) {
        const status = params.response.status;
        if (status >= 400) {
          console.log('[HTTP ERROR]', req.url, '-', status);
          failedRequests.push({
            url: req.url,
            status: status,
            error: 'HTTP ' + status
          });
        } else {
          console.log('[OK]', status, req.url);
        }
      }
    });

    await Console.enable();
    await Network.enable();
    await Page.enable();

    console.log('\n========================================');
    console.log('检查页面:', url);
    console.log('========================================\n');

    await Page.navigate({ url });
    await Page.loadEventFired();

    console.log('\n等待页面完全加载...\n');
    await new Promise(r => setTimeout(r, 5000));

    // 获取页面上所有图片元素
    const result = await Runtime.evaluate({
      expression: `
        (function() {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs.map(img => ({
            src: img.src,
            currentSrc: img.currentSrc,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            displayed: img.offsetWidth > 0 && img.offsetHeight > 0,
            alt: img.alt || '',
            className: img.className || ''
          }));
        })()
      `,
      returnByValue: true
    });

    const images = result.result.value || [];

    console.log('\n========================================');
    console.log('页面中的 <img> 元素:');
    console.log('========================================');

    if (images.length === 0) {
      console.log('未找到任何 <img> 元素');
    } else {
      images.forEach((img, idx) => {
        const loaded = img.complete && img.naturalWidth > 0;
        const status = loaded ? '✅' : '❌';
        console.log('\n' + (idx + 1) + '. ' + status + ' ' + (img.src || img.currentSrc));
        console.log('   complete:', img.complete);
        console.log('   naturalWidth:', img.naturalWidth);
        console.log('   naturalHeight:', img.naturalHeight);
        console.log('   displayed:', img.displayed);
        if (img.className) console.log('   class:', img.className);
      });
    }

    // 检查CSS背景图
    const bgResult = await Runtime.evaluate({
      expression: `
        (function() {
          const elements = Array.from(document.querySelectorAll('*'));
          const bgImages = [];
          elements.forEach(el => {
            const style = window.getComputedStyle(el);
            const bg = style.backgroundImage;
            if (bg && bg !== 'none' && bg.includes('url')) {
              const match = bg.match(/url\\(["']?([^"')]+)["']?\\)/);
              if (match) {
                bgImages.push({
                  url: match[1],
                  element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : '')
                });
              }
            }
          });
          return bgImages;
        })()
      `,
      returnByValue: true
    });

    const bgImages = bgResult.result.value || [];
    if (bgImages.length > 0) {
      console.log('\n========================================');
      console.log('CSS 背景图片:');
      console.log('========================================');
      bgImages.forEach((bg, idx) => {
        console.log((idx + 1) + '. ' + bg.url);
        console.log('   元素:', bg.element);
      });
    }

    // 汇总
    console.log('\n========================================');
    console.log('汇总报告:');
    console.log('========================================');
    console.log('总请求数:', allRequests.length);
    console.log('失败请求:', failedRequests.length);
    console.log('页面图片:', images.length);

    const failedImages = images.filter(img => !img.complete || img.naturalWidth === 0);
    if (failedImages.length > 0) {
      console.log('\n❌ 加载失败的图片:');
      failedImages.forEach(img => {
        console.log('  -', img.src || img.currentSrc);
      });
    }

    if (failedRequests.length > 0) {
      console.log('\n❌ 网络请求失败:');
      failedRequests.forEach(req => {
        console.log('  -', req.url);
        console.log('    原因:', req.error || req.blockedReason);
      });
    }

    console.log('\n========================================');

  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    if (client) {
      await client.close();
    }
    chrome.kill();
    process.exit(0);
  }
}

checkImages();
