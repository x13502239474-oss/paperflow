import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 项目站点路径为 /paperflow/，base 必须与仓库名一致，
// 否则构建出的 JS/CSS 会请求域名根路径而返回 404。
export default defineConfig({
  base: '/paperflow/',
  plugins: [react()]
})
