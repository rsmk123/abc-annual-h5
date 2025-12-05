import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置
 * 用于 ABC 银行开门红 H5 端到端测试
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // 顺序执行，避免状态冲突
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 单线程执行
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 移动端测试
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  // 启动开发服务器
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
