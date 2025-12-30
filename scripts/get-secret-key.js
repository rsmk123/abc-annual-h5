#!/usr/bin/env node
const puppeteer = require('puppeteer-core');

async function getSecretKey() {
  console.log('🔍 连接到 Chrome...\n');

  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
  } catch (e) {
    console.log('❌ 无法连接到 Chrome');
    process.exit(1);
  }

  try {
    const pages = await browser.pages();

    // 找到 API 密钥页面
    let keyPage = pages.find(p => p.url().includes('cam/capi'));

    if (!keyPage) {
      console.log('打开 API 密钥管理页面...');
      keyPage = await browser.newPage();
      await keyPage.goto('https://console.cloud.tencent.com/cam/capi', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      await new Promise(r => setTimeout(r, 5000));
    }

    // 截图
    await keyPage.screenshot({ path: '/tmp/api-keys.png', fullPage: true });
    console.log('📸 API 密钥页面截图已保存: /tmp/api-keys.png');

    // 尝试点击「显示」按钮
    console.log('\n尝试点击「显示」按钮获取 SecretKey...');

    const clicked = await keyPage.evaluate(() => {
      // 查找「显示」按钮
      const buttons = Array.from(document.querySelectorAll('a, button, span'));
      const showBtn = buttons.find(btn => {
        const text = btn.innerText || btn.textContent || '';
        return text.includes('显示') || text.includes('查看');
      });

      if (showBtn) {
        showBtn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('✅ 已点击「显示」按钮');
      await new Promise(r => setTimeout(r, 2000));

      // 再次截图
      await keyPage.screenshot({ path: '/tmp/api-keys-revealed.png', fullPage: true });
      console.log('📸 显示后截图已保存: /tmp/api-keys-revealed.png');

      // 尝试提取 SecretKey
      const secretKey = await keyPage.evaluate(() => {
        const text = document.body.innerText;
        // SecretKey 通常是 32 位字符串
        const matches = text.match(/[a-zA-Z0-9]{32}/g);
        if (matches) {
          // 过滤掉 AKID 开头的（那是 SecretId）
          return matches.find(m => !m.startsWith('AKID')) || '';
        }
        return '';
      });

      if (secretKey) {
        console.log(`\n✅ SecretKey: ${secretKey}`);
      }
    } else {
      console.log('⚠️ 未找到「显示」按钮，请手动操作');
    }

    console.log('\n请查看截图获取 SecretKey');

  } catch (error) {
    console.error('❌ 出错:', error.message);
  } finally {
    browser.disconnect();
  }
}

getSecretKey().catch(console.error);
