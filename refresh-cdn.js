const tencentcloud = require("tencentcloud-sdk-nodejs");
const CdnClient = tencentcloud.cdn.v20180606.Client;

const client = new CdnClient({
  credential: {
    secretId: process.env.TENCENT_SECRET_ID || "your_secret_id_here",
    secretKey: process.env.TENCENT_SECRET_KEY || "your_secret_key_here",
  },
  region: "",
  profile: {
    httpProfile: { endpoint: "cdn.tencentcloudapi.com" },
  },
});

async function refreshCdn() {
  console.log("🔄 正在刷新 CDN 缓存...");
  
  try {
    // 刷新目录
    const result = await client.PurgePathCache({
      Paths: ["https://h5.actionlist.cool/"],
      FlushType: "flush",
    });
    console.log("✅ CDN 缓存刷新成功！");
    console.log("TaskId:", result.TaskId);
  } catch (err) {
    console.error("❌ 刷新失败:", err.message);
    
    // 尝试刷新单个文件
    console.log("\n尝试刷新关键文件...");
    try {
      const result2 = await client.PurgeUrlsCache({
        Urls: [
          "https://h5.actionlist.cool/bank-campaign/index.html",
          "https://h5.actionlist.cool/index.html",
        ],
      });
      console.log("✅ 文件缓存刷新成功！");
      console.log("TaskId:", result2.TaskId);
    } catch (err2) {
      console.error("❌ 文件刷新也失败:", err2.message);
    }
  }
}

refreshCdn();
