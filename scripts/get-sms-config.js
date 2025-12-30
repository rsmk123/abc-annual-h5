#!/usr/bin/env node
/**
 * 通过 Chrome DevTools Protocol 获取腾讯云短信服务配置
 * 需要 Chrome 以远程调试模式启动
 */

const puppeteer = require('puppeteer-core');

async function getSmsConfig() {
  console.log('🔍 连接到 Chrome...\n');

  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
  } catch (e) {
    console.log('❌ 无法连接到 Chrome');
    console.log('\n请确保 Chrome 以远程调试模式启动：');
    console.log('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222\n');
    process.exit(1);
  }

  console.log('✅ 已连接到 Chrome\n');

  const config = {
    secretId: '',
    secretKey: '',
    smsAppId: '',
    signName: '',
    templateId: '2240945'
  };

  try {
    const pages = await browser.pages();
    console.log(`📄 找到 ${pages.length} 个标签页\n`);

    // 列出所有页面
    console.log('当前打开的页面:');
    for (let i = 0; i < pages.length; i++) {
      const url = await pages[i].url();
      const title = await pages[i].title();
      console.log(`  [${i}] ${title.substring(0, 40)} - ${url.substring(0, 60)}...`);
    }
    console.log('');

    // 从已有页面提取信息
    for (const page of pages) {
      const url = await page.url();

      // API 密钥页面
      if (url.includes('cam/capi') || url.includes('访问密钥')) {
        console.log('【找到】API 密钥管理页面');
        const keyInfo = await page.evaluate(() => {
          const result = { secretId: '', secretKey: '' };
          const text = document.body.innerText;

          // 查找 AKID 开头的密钥 ID
          const matches = text.match(/AKID[a-zA-Z0-9]{20,}/g);
          if (matches && matches.length > 0) {
            result.secretId = matches[0];
          }

          return result;
        });

        if (keyInfo.secretId) {
          config.secretId = keyInfo.secretId;
          console.log(`  ✅ SecretId: ${config.secretId}`);
        }
      }

      // 短信应用管理页面
      if (url.includes('smsv2/app-manage') || url.includes('短信') || url.includes('sms')) {
        console.log('【找到】短信应用管理页面');
        const smsInfo = await page.evaluate(() => {
          const result = { appId: '', signName: '' };
          const text = document.body.innerText;

          // SDK AppID 通常是 140 开头的 10 位数字
          const appIdMatches = text.match(/\b(14\d{8})\b/g);
          if (appIdMatches && appIdMatches.length > 0) {
            result.appId = appIdMatches[0];
          }

          return result;
        });

        if (smsInfo.appId) {
          config.smsAppId = smsInfo.appId;
          console.log(`  ✅ SMS App ID: ${config.smsAppId}`);
        }
      }

      // 短信签名页面
      if (url.includes('csms-sign') || url.includes('签名')) {
        console.log('【找到】短信签名管理页面');
        const signInfo = await page.evaluate(() => {
          const result = { signName: '' };

          // 查找表格中的签名
          const tables = document.querySelectorAll('table');
          tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
              const cells = row.querySelectorAll('td');
              // 签名通常在第一列
              if (cells.length > 0) {
                const text = cells[0].innerText.trim();
                if (text && text.length < 15 && !text.includes('签名')) {
                  result.signName = text;
                }
              }
            });
          });

          return result;
        });

        if (signInfo.signName) {
          config.signName = signInfo.signName;
          console.log(`  ✅ 签名名称: ${config.signName}`);
        }
      }
    }

    // 如果没找到短信配置，尝试打开相关页面
    if (!config.smsAppId) {
      console.log('\n⚠️ 未找到短信应用配置页面，正在打开...');
      const smsPage = await browser.newPage();
      try {
        await smsPage.goto('https://console.cloud.tencent.com/smsv2/app-manage', {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        await new Promise(r => setTimeout(r, 5000));

        const smsInfo = await smsPage.evaluate(() => {
          const result = { appId: '' };
          const text = document.body.innerText;
          const appIdMatches = text.match(/\b(14\d{8})\b/g);
          if (appIdMatches && appIdMatches.length > 0) {
            result.appId = appIdMatches[0];
          }
          return result;
        });

        if (smsInfo.appId) {
          config.smsAppId = smsInfo.appId;
          console.log(`  ✅ SMS App ID: ${config.smsAppId}`);
        }

        // 截图
        await smsPage.screenshot({ path: '/tmp/sms-app.png', fullPage: true });
        console.log('  📸 截图已保存: /tmp/sms-app.png');
      } catch (e) {
        console.log('  ⚠️ 打开页面超时，请手动查看');
      }
    }

    // 如果没找到签名，尝试打开签名页面
    if (!config.signName) {
      console.log('\n⚠️ 未找到短信签名页面，正在打开...');
      const signPage = await browser.newPage();
      try {
        await signPage.goto('https://console.cloud.tencent.com/smsv2/csms-sign', {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        await new Promise(r => setTimeout(r, 5000));

        const signInfo = await signPage.evaluate(() => {
          const result = { signName: '' };
          const tables = document.querySelectorAll('table');
          tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
              const cells = row.querySelectorAll('td');
              if (cells.length > 0) {
                const text = cells[0].innerText.trim();
                if (text && text.length < 15 && !text.includes('签名') && !text.includes('ID')) {
                  result.signName = text;
                }
              }
            });
          });
          return result;
        });

        if (signInfo.signName) {
          config.signName = signInfo.signName;
          console.log(`  ✅ 签名名称: ${config.signName}`);
        }

        // 截图
        await signPage.screenshot({ path: '/tmp/sms-sign.png', fullPage: true });
        console.log('  📸 截图已保存: /tmp/sms-sign.png');
      } catch (e) {
        console.log('  ⚠️ 打开页面超时，请手动查看');
      }
    }

    // 输出最终结果
    console.log('\n' + '='.repeat(60));
    console.log('📋 获取到的短信服务配置：');
    console.log('='.repeat(60));
    console.log(`TENCENT_SECRET_ID=${config.secretId || 'your_secret_id_here'}`);
    console.log(`TENCENT_SECRET_KEY=${config.secretKey || '⚠️ 需要在控制台点击「显示」后复制'}`);
    console.log(`TENCENT_SMS_APP_ID=${config.smsAppId || '⚠️ 待获取'}`);
    console.log(`TENCENT_SMS_SIGN_NAME=${config.signName || '⚠️ 待获取'}`);
    console.log(`TENCENT_SMS_TEMPLATE_ID=${config.templateId}`);
    console.log('='.repeat(60));

    if (config.smsAppId && config.signName) {
      console.log('\n✅ 配置获取完成！');
      console.log('\n下一步：');
      console.log('1. 获取 SecretKey（在 API 密钥管理页面点击「显示」）');
      console.log('2. 更新 functions/api/.env 文件');
      console.log('3. 重新部署云函数: cd functions/api && scf deploy');
    }

  } catch (error) {
    console.error('❌ 获取配置时出错:', error.message);
  } finally {
    browser.disconnect();
    console.log('\n浏览器保持打开状态');
  }
}

getSmsConfig().catch(console.error);
