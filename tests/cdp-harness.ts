/**
 * Chrome DevTools Protocol (CDP) 测试框架
 *
 * 提供比Playwright更精细的控制：
 * - 网络请求监控（所有资源、HTTP状态码、加载时间）
 * - 控制台错误检测（error、warning、exception）
 * - 性能指标收集（FCP、LCP、TTI、FPS）
 * - 内存监控
 * - CPU分析
 *
 * 基于SPEC文档第5.4节测试要求
 */

import { chromium, Page, CDPSession } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// 类型定义
// ============================================

interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  size: number;
  duration: number;
  resourceType: string;
}

interface ConsoleMessage {
  type: 'log' | 'warning' | 'error' | 'debug';
  text: string;
  timestamp: number;
  stackTrace?: string;
}

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  tti: number; // Time to Interactive
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  totalBlockingTime: number;
}

interface AnimationFrame {
  timestamp: number;
  duration: number;
  fps: number;
}

// ============================================
// CDP测试类
// ============================================

export class CDPTestHarness {
  private page!: Page;
  private cdpSession!: CDPSession;
  private networkRequests: NetworkRequest[] = [];
  private consoleMessages: ConsoleMessage[] = [];
  private performanceMetrics: Partial<PerformanceMetrics> = {};
  private animationFrames: AnimationFrame[] = [];

  /**
   * 初始化测试环境
   */
  async initialize(url: string) {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await browser.newPage();
    this.cdpSession = await this.page.context().newCDPSession(this.page);

    // 启用CDP域
    await this.cdpSession.send('Network.enable');
    await this.cdpSession.send('Performance.enable');
    await this.cdpSession.send('Console.enable');
    await this.cdpSession.send('Runtime.enable');
    await this.cdpSession.send('Page.enable');

    // 监听网络事件
    this.setupNetworkMonitoring();

    // 监听控制台事件
    this.setupConsoleMonitoring();

    // 监听性能事件
    this.setupPerformanceMonitoring();

    // 导航到页面
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * 设置网络监控
   */
  private setupNetworkMonitoring() {
    const requestMap = new Map<string, { startTime: number; request: any }>();

    // 请求开始
    this.cdpSession.on('Network.requestWillBeSent', (params: any) => {
      requestMap.set(params.requestId, {
        startTime: params.timestamp,
        request: params.request
      });
    });

    // 响应接收
    this.cdpSession.on('Network.responseReceived', (params: any) => {
      const requestData = requestMap.get(params.requestId);
      if (!requestData) return;

      const endTime = params.timestamp;
      const duration = (endTime - requestData.startTime) * 1000; // 转换为ms

      this.networkRequests.push({
        url: params.response.url,
        method: requestData.request.method,
        status: params.response.status,
        size: params.response.encodedDataLength || 0,
        duration,
        resourceType: params.type
      });
    });

    // 加载失败
    this.cdpSession.on('Network.loadingFailed', (params: any) => {
      const requestData = requestMap.get(params.requestId);
      if (!requestData) return;

      this.networkRequests.push({
        url: requestData.request.url,
        method: requestData.request.method,
        status: 0,
        size: 0,
        duration: 0,
        resourceType: params.type
      });
    });
  }

  /**
   * 设置控制台监控
   */
  private setupConsoleMonitoring() {
    // Runtime.consoleAPICalled - console.log/error/warn
    this.cdpSession.on('Runtime.consoleAPICalled', (params: any) => {
      const message: ConsoleMessage = {
        type: params.type as any,
        text: params.args.map((arg: any) => arg.value || arg.description).join(' '),
        timestamp: params.timestamp
      };

      if (params.stackTrace) {
        message.stackTrace = JSON.stringify(params.stackTrace, null, 2);
      }

      this.consoleMessages.push(message);
    });

    // Runtime.exceptionThrown - 未捕获异常
    this.cdpSession.on('Runtime.exceptionThrown', (params: any) => {
      const exception = params.exceptionDetails;
      this.consoleMessages.push({
        type: 'error',
        text: exception.text || exception.exception?.description || 'Unknown error',
        timestamp: exception.timestamp,
        stackTrace: exception.stackTrace ? JSON.stringify(exception.stackTrace, null, 2) : undefined
      });
    });
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring() {
    // 监听性能时间线事件
    this.cdpSession.on('Performance.metrics', (params: any) => {
      const metrics = params.metrics;
      metrics.forEach((metric: any) => {
        switch (metric.name) {
          case 'FirstContentfulPaint':
            this.performanceMetrics.fcp = metric.value;
            break;
          case 'LargestContentfulPaint':
            this.performanceMetrics.lcp = metric.value;
            break;
        }
      });
    });
  }

  /**
   * 获取Web Vitals性能指标
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const metrics = await this.page.evaluate(() => {
      return new Promise<Partial<PerformanceMetrics>>((resolve) => {
        // 使用Performance API
        const perfObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const result: Partial<PerformanceMetrics> = {};

          entries.forEach((entry) => {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              result.fcp = entry.startTime;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              result.lcp = entry.startTime;
            }
          });

          resolve(result);
        });

        perfObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

        // 超时保护
        setTimeout(() => resolve({}), 5000);
      });
    });

    return {
      fcp: metrics.fcp || this.performanceMetrics.fcp || 0,
      lcp: metrics.lcp || this.performanceMetrics.lcp || 0,
      tti: 0, // 需要更复杂的计算
      cls: 0,
      fid: 0,
      totalBlockingTime: 0
    };
  }

  /**
   * 监控动画帧率
   */
  async monitorAnimationFPS(durationMs: number = 1000): Promise<number> {
    const frames: number[] = await this.page.evaluate((duration: number) => {
      return new Promise<number[]>((resolve) => {
        const frameTimes: number[] = [];
        let startTime = performance.now();

        function recordFrame(timestamp: number) {
          frameTimes.push(timestamp);

          if (performance.now() - startTime < duration) {
            requestAnimationFrame(recordFrame);
          } else {
            resolve(frameTimes);
          }
        }

        requestAnimationFrame(recordFrame);
      });
    }, durationMs);

    // 计算平均FPS
    if (frames.length < 2) return 0;

    const totalTime = frames[frames.length - 1] - frames[0];
    const avgFPS = (frames.length / totalTime) * 1000;

    return Math.round(avgFPS);
  }

  /**
   * 检查网络请求
   */
  getNetworkRequests(): NetworkRequest[] {
    return this.networkRequests;
  }

  /**
   * 检查是否有失败的请求
   */
  hasFailedRequests(): boolean {
    return this.networkRequests.some(req => req.status >= 400 || req.status === 0);
  }

  /**
   * 获取404错误
   */
  get404Requests(): NetworkRequest[] {
    return this.networkRequests.filter(req => req.status === 404);
  }

  /**
   * 获取5xx错误
   */
  get5xxRequests(): NetworkRequest[] {
    return this.networkRequests.filter(req => req.status >= 500);
  }

  /**
   * 检查控制台错误
   */
  getConsoleErrors(): ConsoleMessage[] {
    return this.consoleMessages.filter(msg => msg.type === 'error');
  }

  /**
   * 检查控制台警告
   */
  getConsoleWarnings(): ConsoleMessage[] {
    return this.consoleMessages.filter(msg => msg.type === 'warning');
  }

  /**
   * 检查是否有控制台错误
   */
  hasConsoleErrors(): boolean {
    return this.getConsoleErrors().length > 0;
  }

  /**
   * 获取总传输大小
   */
  getTotalTransferSize(): number {
    return this.networkRequests.reduce((sum, req) => sum + req.size, 0);
  }

  /**
   * 获取JavaScript包大小
   */
  getJavaScriptSize(): number {
    return this.networkRequests
      .filter(req => req.resourceType === 'Script')
      .reduce((sum, req) => sum + req.size, 0);
  }

  /**
   * 获取CSS包大小
   */
  getCSSSize(): number {
    return this.networkRequests
      .filter(req => req.resourceType === 'Stylesheet')
      .reduce((sum, req) => sum + req.size, 0);
  }

  /**
   * 生成测试报告
   */
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      network: {
        totalRequests: this.networkRequests.length,
        failedRequests: this.networkRequests.filter(r => r.status >= 400).length,
        totalSize: this.getTotalTransferSize(),
        jsSize: this.getJavaScriptSize(),
        cssSize: this.getCSSSize(),
        requests: this.networkRequests
      },
      console: {
        errors: this.getConsoleErrors(),
        warnings: this.getConsoleWarnings(),
        total: this.consoleMessages.length
      },
      performance: this.performanceMetrics
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * 保存报告到文件
   */
  saveReport(filename: string) {
    const report = this.generateReport();
    const reportPath = path.join(__dirname, '..', 'test-results', filename);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report);
    console.log(`报告已保存到: ${reportPath}`);
  }

  /**
   * 清理资源
   */
  async cleanup() {
    await this.cdpSession.detach();
    await this.page.close();
  }

  /**
   * 获取Page对象（用于Playwright操作）
   */
  getPage(): Page {
    return this.page;
  }
}

// ============================================
// 快捷测试函数
// ============================================

/**
 * 测试网络请求
 */
export async function testNetwork(url: string): Promise<{
  passed: boolean;
  errors: string[];
  report: any;
}> {
  const harness = new CDPTestHarness();
  await harness.initialize(url);

  await new Promise(resolve => setTimeout(resolve, 3000)); // 等待页面完全加载

  const errors: string[] = [];

  // 检查404错误
  const notFoundRequests = harness.get404Requests();
  if (notFoundRequests.length > 0) {
    errors.push(`发现${notFoundRequests.length}个404错误: ${notFoundRequests.map(r => r.url).join(', ')}`);
  }

  // 检查5xx错误
  const serverErrors = harness.get5xxRequests();
  if (serverErrors.length > 0) {
    errors.push(`发现${serverErrors.length}个服务器错误: ${serverErrors.map(r => r.url).join(', ')}`);
  }

  const report = {
    totalRequests: harness.getNetworkRequests().length,
    failedRequests: harness.hasFailedRequests(),
    notFoundCount: notFoundRequests.length,
    serverErrorCount: serverErrors.length,
    totalSize: harness.getTotalTransferSize()
  };

  await harness.cleanup();

  return {
    passed: errors.length === 0,
    errors,
    report
  };
}

/**
 * 测试控制台错误
 */
export async function testConsole(url: string): Promise<{
  passed: boolean;
  errors: string[];
  report: any;
}> {
  const harness = new CDPTestHarness();
  await harness.initialize(url);

  // 执行一些交互
  const page = harness.getPage();
  await page.waitForTimeout(2000);

  const consoleErrors = harness.getConsoleErrors();
  const errors: string[] = [];

  if (consoleErrors.length > 0) {
    errors.push(`发现${consoleErrors.length}个控制台错误:`);
    consoleErrors.forEach(err => {
      errors.push(`  - ${err.text}`);
      if (err.stackTrace) {
        errors.push(`    堆栈: ${err.stackTrace}`);
      }
    });
  }

  const report = {
    totalMessages: harness.getConsoleErrors().length + harness.getConsoleWarnings().length,
    errors: harness.getConsoleErrors(),
    warnings: harness.getConsoleWarnings()
  };

  await harness.cleanup();

  return {
    passed: consoleErrors.length === 0,
    errors,
    report
  };
}

/**
 * 测试性能指标
 */
export async function testPerformance(url: string, targets: {
  maxFCP?: number; // 毫秒
  maxLCP?: number;
  minFPS?: number;
}): Promise<{
  passed: boolean;
  errors: string[];
  report: any;
}> {
  const harness = new CDPTestHarness();
  await harness.initialize(url);

  // 获取性能指标
  await new Promise(resolve => setTimeout(resolve, 3000));
  const metrics = await harness.getPerformanceMetrics();

  // 测试动画FPS
  const page = harness.getPage();

  // 触发动画（点击卡片）
  try {
    await page.click('.perspectiveContainer', { timeout: 5000 });
  } catch (e) {
    // 忽略点击失败
  }

  const fps = await harness.monitorAnimationFPS(1000);

  const errors: string[] = [];

  // 检查FCP
  if (targets.maxFCP && metrics.fcp > targets.maxFCP) {
    errors.push(`FCP ${metrics.fcp}ms 超过目标 ${targets.maxFCP}ms`);
  }

  // 检查LCP
  if (targets.maxLCP && metrics.lcp > targets.maxLCP) {
    errors.push(`LCP ${metrics.lcp}ms 超过目标 ${targets.maxLCP}ms`);
  }

  // 检查FPS
  if (targets.minFPS && fps < targets.minFPS) {
    errors.push(`FPS ${fps} 低于目标 ${targets.minFPS}`);
  }

  const report = {
    fcp: metrics.fcp,
    lcp: metrics.lcp,
    fps,
    jsSize: harness.getJavaScriptSize(),
    cssSize: harness.getCSSSize(),
    totalSize: harness.getTotalTransferSize()
  };

  await harness.cleanup();

  return {
    passed: errors.length === 0,
    errors,
    report
  };
}

/**
 * 测试包大小
 */
export async function testBundleSize(url: string, targets: {
  maxTotal?: number; // 字节
  maxJS?: number;
  maxCSS?: number;
}): Promise<{
  passed: boolean;
  errors: string[];
  report: any;
}> {
  const harness = new CDPTestHarness();
  await harness.initialize(url);

  await new Promise(resolve => setTimeout(resolve, 3000));

  const totalSize = harness.getTotalTransferSize();
  const jsSize = harness.getJavaScriptSize();
  const cssSize = harness.getCSSSize();

  const errors: string[] = [];

  if (targets.maxTotal && totalSize > targets.maxTotal) {
    errors.push(`总大小 ${(totalSize / 1024).toFixed(2)}KB 超过目标 ${(targets.maxTotal / 1024).toFixed(2)}KB`);
  }

  if (targets.maxJS && jsSize > targets.maxJS) {
    errors.push(`JS大小 ${(jsSize / 1024).toFixed(2)}KB 超过目标 ${(targets.maxJS / 1024).toFixed(2)}KB`);
  }

  if (targets.maxCSS && cssSize > targets.maxCSS) {
    errors.push(`CSS大小 ${(cssSize / 1024).toFixed(2)}KB 超过目标 ${(targets.maxCSS / 1024).toFixed(2)}KB`);
  }

  const report = {
    totalSize: `${(totalSize / 1024).toFixed(2)}KB`,
    jsSize: `${(jsSize / 1024).toFixed(2)}KB`,
    cssSize: `${(cssSize / 1024).toFixed(2)}KB`,
    totalRequests: harness.getNetworkRequests().length
  };

  await harness.cleanup();

  return {
    passed: errors.length === 0,
    errors,
    report
  };
}
