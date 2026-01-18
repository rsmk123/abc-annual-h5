/**
 * 上传序列帧图片到腾讯云 COS
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
const LOCAL_DIR = path.join(__dirname, 'public/images/frames/card-spin');
const COS_PREFIX = 'images/frames/card-spin';

// 递归获取所有文件
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        localPath: fullPath,
        cosPath: COS_PREFIX + '/' + relativePath.replace(/\\/g, '/')
      });
    }
  }

  return files;
}

async function uploadAll() {
  console.log('📦 上传序列帧图片到 COS...\n');
  console.log(`本地目录: ${LOCAL_DIR}`);
  console.log(`COS路径: ${COS_PREFIX}\n`);

  const files = getAllFiles(LOCAL_DIR);
  console.log(`📁 找到 ${files.length} 个文件\n`);
  console.log('📤 开始上传...\n');

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    try {
      await new Promise((resolve, reject) => {
        cos.putObject({
          Bucket: BUCKET,
          Region: REGION,
          Key: file.cosPath,
          Body: fs.createReadStream(file.localPath),
          ContentLength: fs.statSync(file.localPath).size,
          CacheControl: 'max-age=31536000'
        }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });

      uploaded++;
      console.log(`✅ [${uploaded}/${files.length}] ${file.cosPath}`);

    } catch (error) {
      failed++;
      console.error(`❌ [失败] ${file.cosPath}: ${error.message}`);
    }
  }

  console.log(`\n📊 上传结果:`);
  console.log(`   成功: ${uploaded} 个`);
  console.log(`   失败: ${failed} 个`);
  console.log(`   总计: ${files.length} 个`);

  if (failed === 0) {
    console.log(`\n✅ 全部上传成功！`);
  } else {
    console.log(`\n⚠️  部分文件上传失败，请检查`);
  }
}

uploadAll().catch(error => {
  console.error('\n❌ 上传失败:', error.message);
  process.exit(1);
});
