// 七牛云上传 API
const qiniu = require('qiniu');

// 七牛云配置（从环境变量读取）
const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.QINIU_BUCKET || 'wallpaper-gallery';

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z0; // 华东区域，根据你的空间区域调整

module.exports = async (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // 获取文件和 key
    const formData = await new Promise((resolve, reject) => {
      const formidable = require('formidable');
      const form = new formidable.IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = formData.files.file;
    const key = formData.fields.key;

    if (!file || !key) {
      res.status(400).json({ error: 'Missing file or key' });
      return;
    }

    // 生成上传凭证
    const options = {
      scope: `${bucket}:${key}`,
      returnBody: '{"key":"$(key)","hash":"$(etag)","url":"http://' + process.env.QINIU_DOMAIN + '/$(key)"}'
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    // 上传文件
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    const result = await new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, key, file.filepath, putExtra, (err, body, info) => {
        if (err) reject(err);
        else if (info.statusCode === 200) resolve(body);
        else reject(new Error(`Upload failed: ${info.statusCode}`));
      });
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};
