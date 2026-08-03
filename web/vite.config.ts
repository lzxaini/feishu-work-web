/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:42:55
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 23:02:21
 * @FilePath: \feishu-work\web\vite.config.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	server: {
		host: true,
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
			},
		},
	},
});
