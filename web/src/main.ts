/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:22
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:23
 * @FilePath: \feishu-work\web\src\main.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';
import './styles/theme.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(TDesign);
app.mount('#app');
