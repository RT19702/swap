import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { VantResolver, NaiveUiResolver } from "unplugin-vue-components/resolvers";
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            imports: [
                'vue',
                {
                    'naive-ui': [
                        'useDialog',
                        'useMessage',
                        'useNotification',
                        'useLoadingBar'
                    ]
                }
            ]
        }),
        Components({
            resolvers: [VantResolver(), NaiveUiResolver()],
        }),
    ],
    server: {
        host: '0.0.0.0',
        port: 8080,
        open: true,
        hmr: true,
        usePolling: true,
        // 设置代理
        proxy: {
            '/api': {
                // 线上
                target: 'https://hm-swap.com',

                // 本地调试
                // target: 'http://192.168.31.57:8082/',

                // 线上测试环境
                // target: 'http://108.160.141.13:8081/',
                // rewrite: path => path.replace(/^\/api/, ''),
                changeOrigin: true,
            },
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            web3: 'web3/dist/web3.min.js',
        },
    },
});