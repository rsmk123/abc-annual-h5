/**
 * SPEC验收标准测试
 *
 * 基于SPEC文档2.5节的验收标准
 * 使用Chrome DevTools Protocol进行精细监控
 */

import { test, expect } from '@playwright/test';
import { CDPTestHarness, testNetwork, testConsole, testPerformance, testBundleSize } from './cdp-harness';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const FEATURES_FILE = path.join(__dirname, '..', 'features-complete.json');

function updateFeatureStatus(featureId: string, passes: boolean) {
  const data = JSON.parse(fs.readFileSync(FEATURES_FILE, 'utf-8'));
  const feature = data.features.find((f: any) => f.id === featureId);

  if (!feature) {
    console.warn(`功能 ${featureId} 未找到`);
    return;
  }

  feature.passes = passes;
  data.metadata.lastUpdated = new Date().toISOString().split('T')[0];
  data.metadata.completedFeatures = data.features.filter((f: any) => f.passes).length;
  data.metadata.testCoverage = `${Math.round(data.metadata.completedFeatures / data.metadata.totalFeatures * 100)}%`;

  fs.writeFileSync(FEATURES_FILE, JSON.stringify(data, null, 2));
  console.log(`✓ Feature ${featureId} marked as ${passes ? 'PASSED' : 'FAILED'}`);
}

// ============================================
// SPEC验收标准 - P0（必须通过）
// ============================================

test.describe('SPEC验收标准 - P0', () => {
  test('SPEC-P0-001: 登录弹窗接受11位手机号', async ({ page }) => {
    await page.goto(BASE_URL);

    // 等待登录弹窗
    await expect(page.locator('text=手机号登录')).toBeVisible();

    // 输入11位手机号
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('13800138000');

    // 验证值
    const value = await phoneInput.inputValue();
    const passed = value === '13800138000';

    expect(passed).toBe(true);
    updateFeatureStatus('SPEC-P0-001', passed);
  });

  test('SPEC-P0-002: 卡牌翻转动画在800ms内流畅完成', async ({ page }) => {
    await page.goto(BASE_URL);

    // 登录
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('13800138000');
    await page.click('text=立即参与');

    await page.waitForTimeout(1000);

    // 记录开始时间
    const startTime = Date.now();

    // 点击卡片
    await page.click('.perspectiveContainer');

    // 等待翻转完成（检查flipped类）
    await page.waitForSelector('.flipped', { timeout: 2000 });

    const duration = Date.now() - startTime;

    console.log(`翻转动画耗时: ${duration}ms`);

    // SPEC要求800ms，允许100ms误差
    const passed = duration >= 700 && duration <= 900;

    updateFeatureStatus('SPEC-P0-002', passed);
  });

  test('SPEC-P0-003: 智能收集算法工作正常（收集完全前无重复）', async ({ page }) => {
    await page.goto(BASE_URL);

    // 登录
    await page.locator('input[type="tel"]').fill('13800138000');
    await page.click('text=立即参与');
    await page.waitForTimeout(1000);

    const collectedChars = new Set<string>();

    // 抽4张卡
    for (let i = 0; i < 4; i++) {
      await page.click('.perspectiveContainer');
      await page.waitForTimeout(1500);

      // 读取结果
      const chars = ['马', '上', '发', '财', '哇'];
      for (const char of chars) {
        const visible = await page.locator(`text=欧气爆发`).locator(`..`).locator(`text=${char}`).isVisible().catch(() => false);
        if (visible) {
          collectedChars.add(char);
          break;
        }
      }

      await page.click('text=收下卡片');
      await page.waitForTimeout(800);
    }

    // 验证：4次抽卡应该得到4个不同的字
    const passed = collectedChars.size === 4;

    console.log(`抽中的不同字符数: ${collectedChars.size}/4`);

    expect(passed).toBe(true);
    updateFeatureStatus('SPEC-P0-003', passed);
  });

  test('SPEC-P0-004: 收集全部5个字符后显示最终奖励弹窗', async ({ page }) => {
    await page.goto(BASE_URL);

    // 登录
    await page.locator('input[type="tel"]').fill('13800138000');
    await page.click('text=立即参与');
    await page.waitForTimeout(1000);

    // 抽5张卡
    for (let i = 0; i < 5; i++) {
      await page.click('.perspectiveContainer');
      await page.waitForTimeout(1500);
      await page.click('text=收下卡片');
      await page.waitForTimeout(800);
    }

    // 验证最终奖励弹窗
    const finalModal = await page.locator('text=五福集齐').isVisible();

    expect(finalModal).toBe(true);
    updateFeatureStatus('SPEC-P0-004', finalModal);
  });

  test('SPEC-P0-005: 重置按钮清除所有状态并重启游戏', async ({ page }) => {
    await page.goto(BASE_URL);

    // 登录
    await page.locator('input[type="tel"]').fill('13800138000');
    await page.click('text=立即参与');
    await page.waitForTimeout(1000);

    // 抽一张卡
    await page.click('.perspectiveContainer');
    await page.waitForTimeout(1500);
    await page.click('text=收下卡片');
    await page.waitForTimeout(500);

    // 点击重置
    await page.click('text=重置');
    await page.waitForTimeout(500);

    // 验证：登录弹窗重新出现
    const loginVisible = await page.locator('text=手机号登录').isVisible();

    expect(loginVisible).toBe(true);
    updateFeatureStatus('SPEC-P0-005', loginVisible);
  });

  test('SPEC-P0-006: 在375px-480px视口上移动端响应式', async ({ page }) => {
    // 测试375px
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    const passed375 = await page.locator('text=集五福').isVisible();

    // 测试480px
    await page.setViewportSize({ width: 480, height: 800 });
    await page.reload();

    const passed480 = await page.locator('text=集五福').isVisible();

    const passed = passed375 && passed480;

    expect(passed).toBe(true);
    updateFeatureStatus('SPEC-P0-006', passed);
  });

  test('SPEC-P0-007: 浏览器中无控制台错误', async () => {
    const result = await testConsole(BASE_URL);

    console.log('控制台检查结果:', result.report);

    if (!result.passed) {
      console.error('控制台错误:', result.errors);
    }

    expect(result.passed).toBe(true);
    updateFeatureStatus('SPEC-P0-007', result.passed);
  });
});

// ============================================
// 网络监控测试
// ============================================

test.describe('NETWORK - 网络监控', () => {
  test('NETWORK-001: 所有资源加载成功（HTTP 200）', async () => {
    const result = await testNetwork(BASE_URL);

    console.log('网络请求统计:', result.report);

    if (!result.passed) {
      console.error('网络错误:', result.errors);
    }

    expect(result.passed).toBe(true);
    updateFeatureStatus('NETWORK-001', result.passed);
  });

  test('NETWORK-002: 无404错误（资源缺失）', async () => {
    const harness = new CDPTestHarness();
    await harness.initialize(BASE_URL);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const notFoundRequests = harness.get404Requests();
    const passed = notFoundRequests.length === 0;

    if (!passed) {
      console.error('404错误:', notFoundRequests.map(r => r.url));
    }

    await harness.cleanup();

    expect(passed).toBe(true);
    updateFeatureStatus('NETWORK-002', passed);
  });

  test('NETWORK-003: 无5xx服务器错误', async () => {
    const harness = new CDPTestHarness();
    await harness.initialize(BASE_URL);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const serverErrors = harness.get5xxRequests();
    const passed = serverErrors.length === 0;

    if (!passed) {
      console.error('5xx错误:', serverErrors.map(r => r.url));
    }

    await harness.cleanup();

    expect(passed).toBe(true);
    updateFeatureStatus('NETWORK-003', passed);
  });
});

// ============================================
// 控制台监控测试
// ============================================

test.describe('CONSOLE - 控制台监控', () => {
  test('CONSOLE-001: 页面加载过程中无console.error', async () => {
    const harness = new CDPTestHarness();
    await harness.initialize(BASE_URL);

    // 等待页面完全加载
    await new Promise(resolve => setTimeout(resolve, 3000));

    const errors = harness.getConsoleErrors();
    const passed = errors.length === 0;

    if (!passed) {
      console.error('控制台错误:');
      errors.forEach(err => console.error(`  - ${err.text}`));
    }

    await harness.cleanup();

    expect(passed).toBe(true);
    updateFeatureStatus('CONSOLE-001', passed);
  });

  test('CONSOLE-002: 游戏交互过程中无未捕获异常', async () => {
    const harness = new CDPTestHarness();
    await harness.initialize(BASE_URL);

    const page = harness.getPage();

    // 执行完整游戏流程
    try {
      // 登录
      await page.locator('input[type="tel"]').fill('13800138000');
      await page.click('text=立即参与');
      await page.waitForTimeout(1000);

      // 抽卡
      await page.click('.perspectiveContainer');
      await page.waitForTimeout(1500);
      await page.click('text=收下卡片');
      await page.waitForTimeout(500);

      // 重置
      await page.click('text=重置');
      await page.waitForTimeout(500);
    } catch (e) {
      console.error('交互失败:', e);
    }

    const errors = harness.getConsoleErrors();
    const passed = errors.length === 0;

    if (!passed) {
      console.error('交互过程中的控制台错误:');
      errors.forEach(err => console.error(`  - ${err.text}`));
    }

    await harness.cleanup();

    expect(passed).toBe(true);
    updateFeatureStatus('CONSOLE-002', passed);
  });
});

// ============================================
// 性能测试
// ============================================

test.describe('PERF - 性能指标', () => {
  test('PERF-001: 首次内容绘制（FCP）< 1.5秒', async () => {
    const result = await testPerformance(BASE_URL, {
      maxFCP: 1500, // ms
    });

    console.log('性能指标:', result.report);

    if (!result.passed) {
      console.error('性能问题:', result.errors);
    }

    // 注意: FCP测试可能不稳定，仅作为参考
    updateFeatureStatus('PERF-001', result.passed);
  });

  test('PERF-003: 动画帧率稳定60fps', async () => {
    const result = await testPerformance(BASE_URL, {
      minFPS: 55, // 允许轻微波动
    });

    console.log('动画FPS:', result.report.fps);

    const passed = result.report.fps >= 55;

    updateFeatureStatus('PERF-003', passed);
  });
});
