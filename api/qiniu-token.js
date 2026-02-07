// Vercel Serverless Function - 生成七牛云上传 Token (使用官方 SDK)
const qiniu = require('qiniu');

module.exports = async (req, res) => {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { key } = req.query;

        // 七牛云配置
        const accessKey = (process.env.QINIU_ACCESS_KEY || 'KPPt1MipaBOYrQCH_2IXfaaxy0SbhuLXFoyflYEP').trim();
        const secretKey = (process.env.QINIU_SECRET_KEY || 'TnTMZkxk1iOtnOu-bDrPtkFHp87ycKCs7JD07M5u').trim();
        const bucket = 'wallpaper-gallery';

        // 使用官方 SDK 生成 token
        const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        const options = {
            scope: bucket,
            expires: 3600 // 1小时
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);

        res.status(200).json({
            success: true,
            token: uploadToken,
            key: key || `wallpapers/${Date.now()}.jpg`
        });
    } catch (error) {
        console.error('生成 token 失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
