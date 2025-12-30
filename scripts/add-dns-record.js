#!/usr/bin/env node

// DNSPod API添加CNAME记录
const https = require('https');
const querystring = require('querystring');

const params = querystring.stringify({
  login_token: process.env.DNSPOD_LOGIN_TOKEN || 'your_dnspod_login_token_here',
  format: 'json',
  domain: 'actionlist.cool',
  sub_domain: 'h5',
  record_type: 'CNAME',
  record_line: '默认',
  value: 'abc-h5-20251205-1331245644.cos.ap-guangzhou.myqcloud.com',
  ttl: '600'
});

const options = {
  hostname: 'dnsapi.cn',
  path: '/Record.Create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(params),
    'User-Agent': 'abc-h5-dns-setup/1.0.0'
  }
};

console.log('正在添加DNS CNAME记录...');
console.log('域名：h5.actionlist.cool');
console.log('指向：abc-h5-20251205-1331245644.cos.ap-guangzhou.myqcloud.com');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);

      if (result.status && result.status.code === '1') {
        console.log('\n✅ DNS记录添加成功！');
        console.log('记录ID：', result.record.id);
        console.log('记录值：', result.record.value);
        console.log('\nDNS生效时间：约5-10分钟');
        console.log('届时可访问：http://h5.actionlist.cool');
      } else {
        console.log('\n❌ 添加失败：', result.status.message);
        console.log('完整响应：', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.log('响应解析错误：', e.message);
      console.log('原始响应：', data);
    }
  });
});

req.on('error', (e) => {
  console.error('请求错误：', e.message);
});

req.write(params);
req.end();
