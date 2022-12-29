const {
    createProxyMiddleware
} = require('http-proxy-middleware')
module.exports = (req, res) => {
    let target = ''
    // 代理目标地址
    if (req.url.startsWith('/sweetword')) { //这里使用/api可能会与vercel serverless 的 api 路径冲突，根据接口进行调整
        target = 'https://api.1314.cool' //这里就是在vite中配置的一样
    }
    // 创建代理对象并转发请求
    createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            '^/sweetword/': '/'
        }
    })(req, res)
}