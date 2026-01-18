/**
 * 上传纯HTML版本到腾讯云 COS
 */
const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');

const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY
});

const BUCKET = 'abc-h5-20251205-1331245644';
const REGION = 'ap-guangzhou';

async function uploadFile(localPath, cosPath) {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: BUCKET,
      Region: REGION,
      Key: cosPath,
      Body: fs.readFileSync(localPath),
      ContentType: 'text/html; charset=utf-8',
      CacheControl: 'no-cache, no-store, must-revalidate'
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function main() {
  const localFile = path.join(__dirname, 'static-build/bank-campaign/index.html');
  const cosPath = 'bank-campaign/index.html';

  console.log('📦 上传纯HTML版本到 COS...\n');
  console.log(`本地文件: ${localFile}`);
  console.log(`COS路径: ${cosPath}\n`);

  try {
    await uploadFile(localFile, cosPath);
    console.log('✅ 上传成功！');
    console.log('🌐 访问地址: https://h5.actionlist.cool/bank-campaign/index.html');
  } catch (err) {
    console.error('❌ 上传失败:', err.message);
  }
}

main();
