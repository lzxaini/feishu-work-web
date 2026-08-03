/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:35
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:35
 * @FilePath: \feishu-work\web\src\api\request.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import axios from 'axios';
import { MessagePlugin } from 'tdesign-vue-next';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || '请求失败';
    MessagePlugin.error(Array.isArray(msg) ? msg.join('；') : String(msg));
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default request;
