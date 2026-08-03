/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:27
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:28
 * @FilePath: \feishu-work\web\src\env.d.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_FEISHU_APP_ID: string;
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
