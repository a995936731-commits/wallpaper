// 七牛云上传凭证 API
const qiniu = require('qiniu');

const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.QINIU_BUCKET || 'wallpaper-gallery';

module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { key } = req.query;

    if (!key) {
      res.status(400).json({ error: 'Missing key parameter' });
      return;
    }

    // 生成上传凭证
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const options = {
      scope: `${bucket}:${key}`,
      expires: 3600 // 1小时有效
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    res.status(200).json({ token: uploadToken });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: error.message });
  }
};
