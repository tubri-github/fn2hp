import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      // 自定义插件：替换 HTML 中的环境变量占位符
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            /%VITE_ELASTICSEARCH_URL%/g,
            env.VITE_ELASTICSEARCH_URL || 'http://localhost:9200'
          )
        }
      }
    ],
    base: process.env.NODE_ENV === 'production' ? '/dist/' : '/',
    server: {
      port: 5174,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
