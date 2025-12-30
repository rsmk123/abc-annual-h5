/**
 * 腾讯云短信服务封装
 * 使用腾讯云 SMS SDK 发送验证码
 */

const tencentcloud = require("tencentcloud-sdk-nodejs");
const SmsClient = tencentcloud.sms.v20210111.Client;

// Mock 验证码（仅非生产环境使用）
const MOCK_CODE = '888888';

/**
 * 检查是否为 Mock 模式
 * 优先级：
 * 1. 生产环境禁止 mock（即使 MOCK_SMS=true 也无效）
 * 2. MOCK_SMS=true 强制 mock（用于签名审核期间测试）
 * 3. 配置不完整自动 mock
 * @returns {{isMock: boolean, reason?: string}}
 */
function checkMockMode() {
  const isProduction = process.env.NODE_ENV === 'production';
  const forceMock = process.env.MOCK_SMS === 'true';
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  const smsAppId = process.env.TENCENT_SMS_APP_ID;
  const signName = process.env.TENCENT_SMS_SIGN_NAME;
  const templateId = process.env.TENCENT_SMS_TEMPLATE_ID;

  const smsConfigComplete = !!(secretId && secretKey && smsAppId && signName && templateId);

  // 生产环境：禁止 mock，配置不全报错
  if (isProduction) {
    if (!smsConfigComplete) {
      return {
        isMock: false,
        isError: true,
        reason: 'SMS config incomplete in production environment'
      };
    }
    // 生产环境强制真实模式
    return { isMock: false };
  }

  // 非生产环境：MOCK_SMS=true 强制 mock（用于签名审核期间）
  if (forceMock) {
    return {
      isMock: true,
      reason: 'MOCK_SMS=true 强制启用模拟模式'
    };
  }

  // 非生产环境：配置不完整自动 mock
  if (!smsConfigComplete) {
    return {
      isMock: true,
      reason: '短信配置不完整，启用模拟模式'
    };
  }

  // 配置完整 = 真实模式
  return { isMock: false };
}

/**
 * 获取验证码（根据模式返回 mock 码或随机码）
 * @returns {{code: string, isMock: boolean}}
 */
function generateVerificationCode() {
  const mockStatus = checkMockMode();

  if (mockStatus.isError) {
    throw new Error(mockStatus.reason);
  }

  if (mockStatus.isMock) {
    return {
      code: MOCK_CODE,
      isMock: true,
      reason: mockStatus.reason
    };
  }

  // 生成6位随机验证码
  const code = String(Math.floor(100000 + Math.random() * 900000));
  return {
    code,
    isMock: false
  };
}

/**
 * 发送短信验证码
 * @param {string} phone - 手机号（不带+86前缀）
 * @param {string} code - 6位验证码
 * @returns {Promise<{success: boolean, isMock: boolean, message?: string, error?: string}>}
 */
async function sendVerificationCode(phone, code) {
  const mockStatus = checkMockMode();

  // 生产环境配置不全，直接报错
  if (mockStatus.isError) {
    console.error('[SMS] 生产环境短信配置不完整');
    return {
      success: false,
      isMock: false,
      error: mockStatus.reason
    };
  }

  // Mock 模式：不实际发送短信
  if (mockStatus.isMock) {
    console.log(`[Mock SMS] 验证码 ${code} -> ${phone}`);
    console.log(`[Mock SMS] 原因: ${mockStatus.reason}`);
    return {
      success: true,
      isMock: true,
      message: '模拟模式：验证码已生成（未实际发送）'
    };
  }

  // 真实发送模式
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  const smsAppId = process.env.TENCENT_SMS_APP_ID;
  const signName = process.env.TENCENT_SMS_SIGN_NAME;
  const templateId = process.env.TENCENT_SMS_TEMPLATE_ID;

  try {
    // 创建腾讯云 SMS 客户端
    const client = new SmsClient({
      credential: {
        secretId: secretId,
        secretKey: secretKey,
      },
      region: "ap-guangzhou",
      profile: {
        httpProfile: {
          endpoint: "sms.tencentcloudapi.com",
        },
      },
    });

    // 构建请求参数
    const params = {
      SmsSdkAppId: smsAppId,
      SignName: signName,
      TemplateId: templateId,
      TemplateParamSet: [code], // 只需要验证码一个参数
      PhoneNumberSet: [`+86${phone}`],
    };

    console.log(`[腾讯云SMS] 发送验证码到 ${phone}...`);

    // 调用发送短信接口
    const response = await client.SendSms(params);

    // 检查发送结果
    if (response.SendStatusSet && response.SendStatusSet[0]) {
      const status = response.SendStatusSet[0];

      if (status.Code === "Ok") {
        console.log(`[腾讯云SMS] 发送成功: ${phone}, SerialNo: ${status.SerialNo}`);
        return {
          success: true,
          isMock: false,
          message: '验证码已发送',
          serialNo: status.SerialNo
        };
      } else {
        console.error(`[腾讯云SMS] 发送失败: ${status.Code} - ${status.Message}`);
        return {
          success: false,
          isMock: false,
          error: `发送失败: ${status.Message}`,
          errorCode: status.Code
        };
      }
    }

    console.error('[腾讯云SMS] 响应异常: 无发送状态');
    return {
      success: false,
      isMock: false,
      error: '短信服务响应异常'
    };

  } catch (error) {
    console.error('[腾讯云SMS] 调用异常:', error.message);
    return {
      success: false,
      isMock: false,
      error: `短信发送异常: ${error.message}`
    };
  }
}

module.exports = {
  sendVerificationCode,
  generateVerificationCode,
  checkMockMode,
  MOCK_CODE
};
