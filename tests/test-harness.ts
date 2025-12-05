/**
 * ABC 银行开门红 H5 - 端到端测试框架
 *
 * 基于 Anthropic 长程代理最佳实践
 * 使用 Playwright 进行浏览器自动化测试
 *
 * 安装依赖:
 *   bun add -d playwright @playwright/test
 *   bunx playwright install
 *
 * 运行测试:
 *   bun test
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// 配置
// ============================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const FEATURES_FILE = path.join(__dirname, '..', 'features.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'claude-progress.txt');

// ============================================
// 工具函数
// ============================================

/**
 * 读取功能列表
 */
function loadFeatures() {
  const content = fs.readFileSync(FEATURES_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * 更新功能状态
 */
function updateFeatureStatus(featureId: string, passes: boolean) {
  const data = loadFeatures();
  const feature = data.features.find((f: any) => f.id === featureId);

  if (!feature) {
    throw new Error(`Feature ${featureId} not found`);
  }

  feature.passes = passes;

  // 更新元数据
  data.metadata.lastUpdated = new Date().toISOString().split('T')[0];
  data.metadata.completedFeatures = data.features.filter((f: any) => f.passes).length;
  data.metadata.testCoverage = `${Math.round(data.metadata.completedFeatures / data.metadata.totalFeatures * 100)}%`;

  fs.writeFileSync(FEATURES_FILE, JSON.stringify(data, null, 2));

  console.log(`✓ Feature ${featureId} marked as ${passes ? 'PASSED' : 'FAILED'}`);
}

/**
 * 记录测试结果到工作日志
 */
function logToProgress(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `\n[${timestamp}] ${message}`;
  fs.appendFileSync(PROGRESS_FILE, logEntry);
}

/**
 * 等待指定毫秒
 */
async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// 辅助函数 - 登录流程
// ============================================

async function loginUser(page: Page, phone: string = '13800138000') {
  // 等待登录弹窗出现
  await expect(page.locator('text=手机号登录')).toBeVisible({ timeout: 5000 });

  // 输入手机号
  const phoneInput = page.locator('input[type="tel"]');
  await phoneInput.fill(phone);

  // 点击立即参与
  await page.click('text=立即参与');

  // 等待弹窗关闭
  await expect(page.locator('text=手机号登录')).not.toBeVisible({ timeout: 3000 });
}

// ============================================
// 测试套件: 登录系统
// ============================================

test.describe('登录系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('LOGIN-001: 页面加载时自动弹出登录弹窗', async ({ page }) => {
    const loginModal = page.locator('text=手机号登录');
    await expect(loginModal).toBeVisible({ timeout: 5000 });
    updateFeatureStatus('LOGIN-001', true);
  });

  test('LOGIN-002: 手机号输入框接受11位数字', async ({ page }) => {
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('13800138000');
    const value = await phoneInput.inputValue();
    expect(value).toBe('13800138000');
    updateFeatureStatus('LOGIN-002', true);
  });

  test('LOGIN-003: 手机号输入框限制最大长度为11位', async ({ page }) => {
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('138001380001234'); // 输入15位
    const value = await phoneInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(11);
    updateFeatureStatus('LOGIN-003', true);
  });

  test('LOGIN-004: 验证码输入框存在且可输入', async ({ page }) => {
    const codeInput = page.locator('input[type="number"]');
    await expect(codeInput).toBeVisible();
    await codeInput.fill('8888');
    const value = await codeInput.inputValue();
    expect(value).toBe('8888');
    updateFeatureStatus('LOGIN-004', true);
  });

  test('LOGIN-005: 点击"获取验证码"按钮显示提示', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('8888');
      await dialog.accept();
    });
    await page.click('text=获取');
    updateFeatureStatus('LOGIN-005', true);
  });

  test('LOGIN-006: 手机号少于11位时点击"立即参与"显示错误提示', async ({ page }) => {
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('138001'); // 只输入6位

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('11位');
      await dialog.accept();
    });

    await page.click('text=立即参与');
    updateFeatureStatus('LOGIN-006', true);
  });

  test('LOGIN-007: 输入11位手机号后点击"立即参与"关闭登录弹窗', async ({ page }) => {
    await loginUser(page);
    updateFeatureStatus('LOGIN-007', true);
  });

  test('LOGIN-008: 登录弹窗有关闭按钮(X)且可点击', async ({ page }) => {
    const closeButton = page.locator('button:has-text("×")').first();
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(page.locator('text=手机号登录')).not.toBeVisible();
    updateFeatureStatus('LOGIN-008', true);
  });
});

// ============================================
// 测试套件: 3D翻牌系统
// ============================================

test.describe('3D翻牌系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('CARD-001: 页面中央显示一张卡片，默认显示问号', async ({ page }) => {
    await loginUser(page);
    const card = page.locator('text=?');
    await expect(card).toBeVisible();
    updateFeatureStatus('CARD-001', true);
  });

  test('CARD-002: 未登录时点击卡片弹出登录弹窗', async ({ page }) => {
    // 关闭初始登录弹窗
    await page.click('button:has-text("×")');

    // 点击卡片
    await page.click('.perspectiveContainer');

    // 验证登录弹窗再次出现
    await expect(page.locator('text=手机号登录')).toBeVisible();
    updateFeatureStatus('CARD-002', true);
  });

  test('CARD-003: 登录后点击卡片触发3D翻转动画', async ({ page }) => {
    await loginUser(page);

    const cardContainer = page.locator('[class*="cardContainer"]').first();
    await cardContainer.click();

    // 等待翻转动画
    await wait(1000);

    // 检查是否有 flipped 类
    const classes = await cardContainer.getAttribute('class');
    expect(classes).toContain('flipped');

    updateFeatureStatus('CARD-003', true);
  });

  test('CARD-004: 翻转后卡片正面显示一个汉字', async ({ page }) => {
    await loginUser(page);
    await page.click('.perspectiveContainer');
    await wait(1000);

    // 检查是否显示了汉字（马/上/发/财/哇）
    const chars = ['马', '上', '发', '财', '哇'];
    let foundChar = false;

    for (const char of chars) {
      const element = page.locator(`text=${char}`).first();
      if (await element.isVisible()) {
        foundChar = true;
        break;
      }
    }

    expect(foundChar).toBe(true);
    updateFeatureStatus('CARD-004', true);
  });

  test('CARD-006: 翻转过程中卡片不可再次点击', async ({ page }) => {
    await loginUser(page);

    const cardContainer = page.locator('.perspectiveContainer');

    // 第一次点击
    await cardContainer.click();

    // 立即再次点击（动画进行中）
    await cardContainer.click();
    await cardContainer.click();

    // 等待动画完成
    await wait(1000);

    // 验证只触发了一次抽卡（通过检查结果弹窗只出现一次）
    const resultModalCount = await page.locator('text=欧气爆发').count();
    expect(resultModalCount).toBeLessThanOrEqual(1);

    updateFeatureStatus('CARD-006', true);
  });
});

// ============================================
// 测试套件: 收集系统
// ============================================

test.describe('收集系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginUser(page);
  });

  test('COLLECTION-001: 页面底部显示5个收集槽', async ({ page }) => {
    // 查找收集槽容器
    const slots = page.locator('div[class*="aspect-[3/4]"]');
    const count = await slots.count();
    expect(count).toBe(5);
    updateFeatureStatus('COLLECTION-001', true);
  });

  test('COLLECTION-002: 初始状态所有收集槽为空', async ({ page }) => {
    const slots = page.locator('div[class*="aspect-[3/4]"]');

    for (let i = 0; i < 5; i++) {
      const slot = slots.nth(i);
      const classes = await slot.getAttribute('class');
      // 虚线边框表示空槽
      expect(classes).toContain('border-dashed');
    }

    updateFeatureStatus('COLLECTION-002', true);
  });

  test('COLLECTION-003: 抽中某个字后，对应收集槽高亮显示', async ({ page }) => {
    // 抽一张卡
    await page.click('.perspectiveContainer');
    await wait(1500);

    // 关闭结果弹窗
    await page.click('text=收下卡片');
    await wait(500);

    // 检查是否有高亮的收集槽
    const activeSlots = page.locator('[class*="slotActive"]');
    const count = await activeSlots.count();
    expect(count).toBeGreaterThan(0);

    updateFeatureStatus('COLLECTION-003', true);
  });
});

// ============================================
// 测试套件: 结果弹窗
// ============================================

test.describe('结果弹窗', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginUser(page);
  });

  test('RESULT-001: 抽卡完成后自动弹出结果弹窗', async ({ page }) => {
    await page.click('.perspectiveContainer');
    await wait(1500);

    const resultModal = page.locator('text=欧气爆发');
    await expect(resultModal).toBeVisible();

    updateFeatureStatus('RESULT-001', true);
  });

  test('RESULT-003: 结果弹窗显示抽中的汉字', async ({ page }) => {
    await page.click('.perspectiveContainer');
    await wait(1500);

    // 检查弹窗中是否有大号汉字
    const chars = ['马', '上', '发', '财', '哇'];
    let foundChar = false;

    for (const char of chars) {
      const element = page.locator('text=欧气爆发').locator(`..`).locator(`text=${char}`);
      if (await element.isVisible()) {
        foundChar = true;
        break;
      }
    }

    expect(foundChar).toBe(true);
    updateFeatureStatus('RESULT-003', true);
  });

  test('RESULT-004: 结果弹窗有"收下卡片"按钮', async ({ page }) => {
    await page.click('.perspectiveContainer');
    await wait(1500);

    const button = page.locator('text=收下卡片');
    await expect(button).toBeVisible();

    updateFeatureStatus('RESULT-004', true);
  });

  test('RESULT-005: 点击"收下卡片"按钮关闭弹窗', async ({ page }) => {
    await page.click('.perspectiveContainer');
    await wait(1500);

    await page.click('text=收下卡片');
    await wait(500);

    await expect(page.locator('text=欧气爆发')).not.toBeVisible();

    updateFeatureStatus('RESULT-005', true);
  });
});

// ============================================
// 测试套件: 最终奖励
// ============================================

test.describe('最终奖励', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginUser(page, '13712345678');
  });

  test('FINAL-001: 集齐5个字后自动弹出最终奖励弹窗', async ({ page }) => {
    // 连续抽5次卡（智能算法保证集齐）
    for (let i = 0; i < 5; i++) {
      await page.click('.perspectiveContainer');
      await wait(1500);
      await page.click('text=收下卡片');
      await wait(800);
    }

    // 验证最终奖励弹窗
    await expect(page.locator('text=五福集齐')).toBeVisible({ timeout: 5000 });

    updateFeatureStatus('FINAL-001', true);
  });

  test('FINAL-003: 最终奖励弹窗显示"马上发财哇"5个字', async ({ page }) => {
    // 集齐5个字
    for (let i = 0; i < 5; i++) {
      await page.click('.perspectiveContainer');
      await wait(1500);
      await page.click('text=收下卡片');
      await wait(800);
    }

    // 验证显示5个字
    await expect(page.locator('text=马上发财哇')).toBeVisible();

    updateFeatureStatus('FINAL-003', true);
  });

  test('FINAL-004: 最终奖励弹窗显示脱敏的手机号', async ({ page }) => {
    // 集齐5个字
    for (let i = 0; i < 5; i++) {
      await page.click('.perspectiveContainer');
      await wait(1500);
      await page.click('text=收下卡片');
      await wait(800);
    }

    // 验证脱敏手机号（137****5678）
    await expect(page.locator('text=137****5678')).toBeVisible();

    updateFeatureStatus('FINAL-004', true);
  });
});

// ============================================
// 测试套件: 重置功能
// ============================================

test.describe('重置功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginUser(page);
  });

  test('RESET-001: 页面右上角有"重置"按钮', async ({ page }) => {
    const resetButton = page.locator('text=重置');
    await expect(resetButton).toBeVisible();

    updateFeatureStatus('RESET-001', true);
  });

  test('RESET-002: 点击"重置"按钮清空收集进度', async ({ page }) => {
    // 先抽一张卡
    await page.click('.perspectiveContainer');
    await wait(1500);
    await page.click('text=收下卡片');
    await wait(500);

    // 点击重置
    await page.click('text=重置');
    await wait(500);

    // 关闭登录弹窗
    await loginUser(page);

    // 验证收集槽清空
    const activeSlots = page.locator('[class*="slotActive"]');
    const count = await activeSlots.count();
    expect(count).toBe(0);

    updateFeatureStatus('RESET-002', true);
  });

  test('RESET-003: 点击"重置"按钮重新弹出登录弹窗', async ({ page }) => {
    await page.click('text=重置');
    await wait(500);

    await expect(page.locator('text=手机号登录')).toBeVisible();

    updateFeatureStatus('RESET-003', true);
  });
});

// ============================================
// 测试套件: 智能抽卡算法
// ============================================

test.describe('抽卡算法', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginUser(page);
  });

  test('ALGO-001: 智能抽卡：优先抽取未收集的字', async ({ page }) => {
    const drawnChars = new Set<string>();

    // 连续抽4张卡
    for (let i = 0; i < 4; i++) {
      await page.click('.perspectiveContainer');
      await wait(1500);

      // 读取抽中的字
      const chars = ['马', '上', '发', '财', '哇'];
      for (const char of chars) {
        const element = page.locator('text=欧气爆发').locator(`..`).locator(`text=${char}`);
        if (await element.isVisible()) {
          drawnChars.add(char);
          break;
        }
      }

      await page.click('text=收下卡片');
      await wait(800);
    }

    // 验证：4次抽卡应该抽中4个不同的字
    expect(drawnChars.size).toBe(4);

    updateFeatureStatus('ALGO-001', true);
  });
});

// ============================================
// 测试套件: UI/样式
// ============================================

test.describe('UI/样式', () => {
  test('UI-002: 页面标题显示"集五福·赢大奖"', async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.locator('text=集五福 · 赢大奖')).toBeVisible();

    updateFeatureStatus('UI-002', true);
  });
});

// ============================================
// 测试套件: 响应式
// ============================================

test.describe('响应式', () => {
  test('RESPONSIVE-001: 页面在480px宽度下正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await page.goto(BASE_URL);

    await loginUser(page);

    // 验证关键元素可见
    await expect(page.locator('text=集五福 · 赢大奖')).toBeVisible();
    await expect(page.locator('text=?')).toBeVisible();

    updateFeatureStatus('RESPONSIVE-001', true);
  });

  test('RESPONSIVE-002: 页面在320px宽度下正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(BASE_URL);

    await loginUser(page);

    // 验证关键元素可见
    await expect(page.locator('text=集五福 · 赢大奖')).toBeVisible();

    updateFeatureStatus('RESPONSIVE-002', true);
  });
});

// ============================================
// 测试后钩子：生成报告
// ============================================

test.afterAll(async () => {
  const data = loadFeatures();
  const passed = data.features.filter((f: any) => f.passes).length;
  const total = data.features.length;
  const percentage = Math.round(passed / total * 100);

  const report = `
===========================================
测试完成 - ${new Date().toISOString()}
===========================================
总功能数: ${total}
已通过: ${passed}
未通过: ${total - passed}
完成度: ${percentage}%
===========================================
  `;

  console.log(report);
  logToProgress(report);
});
