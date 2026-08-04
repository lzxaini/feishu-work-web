<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:44:29
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:44:29
 * @FilePath: \feishu-work\web\src\views\Login.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div class="login-wrap">
    <div class="login-card surface-card">
      <div class="brand-logo">📋</div>
      <h1 class="login-title">飞书报工系统</h1>
      <p class="status">{{ status }}</p>
      <t-button v-if="failed" theme="primary" shape="round" size="large" @click="requestAccess">
        重新登录
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const status = ref('正在飞书免登中…');
const failed = ref(false);

// 飞书 JSSDK 是异步注入的：不能在 setup 顶层同步读 window.tt（此时必为 undefined）
// 需等 window.h5sdk.ready / ttready 事件触发后，window.tt 才可用
function getTT() {
  return (window as any).tt;
}

function loginWithCode(code: string) {
  auth
    .loginByCode(code)
    .then(() => router.push('/projects'))
    .catch((e: any) => {
      failed.value = true;
      status.value = '登录失败：' + (e?.message || '未知错误');
    });
}

function requestAuthCode() {
  const tt = getTT();
  if (!tt?.requestAuthCode) {
    failed.value = true;
    status.value = '当前环境不支持免登，请在飞书客户端内打开应用（浏览器访问请接入网页授权 OAuth）';
    return;
  }
  tt.requestAuthCode({
    appId: import.meta.env.VITE_FEISHU_APP_ID,
    success: (res: any) => loginWithCode(res.code),
    fail: (err: any) => {
      failed.value = true;
      status.value = '免登失败：' + (err?.errString || '未知错误');
    },
  });
}

// requestAccess 优先，低版本回退 requestAuthCode（对应 docs/04 3.1）
function requestAccess() {
  const tt = getTT();
  if (tt?.requestAccess) {
    tt.requestAccess({
      appID: import.meta.env.VITE_FEISHU_APP_ID,
      scopeList: [],
      success: (res: any) => loginWithCode(res.code),
      fail: (err: any) => {
        if (err?.errno === 103) requestAuthCode();
        else {
          failed.value = true;
          status.value = '免登失败：' + (err?.errString || '未知错误');
        }
      },
    });
  } else {
    requestAuthCode();
  }
}

function startLogin() {
  const h5sdk = (window as any).h5sdk;
  const tt = getTT();
  if (h5sdk?.ready) {
    // 新版 JSSDK：等 SDK 就绪后再调免登
    h5sdk.ready(() => requestAccess());
  } else if (tt) {
    // SDK 已注入
    requestAccess();
  } else {
    // 兼容旧版：监听 ttready 事件
    const onReady = () => {
      document.removeEventListener('ttready', onReady);
      requestAccess();
    };
    document.addEventListener('ttready', onReady);
  }
}

onMounted(() => {
  if (auth.token) {
    router.push('/projects');
    return;
  }
  startLogin();
  // 兜底：若 SDK 始终未注入（说明不在飞书客户端内），给出提示
  setTimeout(() => {
    if (!getTT() && !(window as any).h5sdk) {
      failed.value = true;
      status.value = '当前环境不支持免登，请在飞书客户端内打开应用（浏览器访问请接入网页授权 OAuth）';
    }
  }, 3000);
});
</script>

<style scoped>
.login-wrap {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7; /* DESIGN: canvas-parchment */
}
.login-card {
  width: 380px;
  text-align: center;
  padding: 48px 32px;
}
.brand-logo {
  font-size: 48px;
  line-height: 1;
}
.login-title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1d1d1f;
  margin: 16px 0 8px;
}
.status {
  color: #86868b;
  font-size: 14px;
  min-height: 22px;
}
</style>
