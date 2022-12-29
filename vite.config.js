import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        cors: true,
        proxy: {
            "/weixin": {
                target: "https://api.weixin.qq.com",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/weixin/, ""),
            },
            "/weather": {
                target: "http://autodev.openspeech.cn",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/weather/, ""),
            },
            "/sweetword": {
                target: "https://api.1314.cool",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/sweetword/, ""),
            },
        },
    },
})
