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
    <div class="login-bg-blob blob-1" />
    <div class="login-bg-blob blob-2" />

    <div class="login-card surface-card">
      <div class="brand-logo">📋</div>
      <h1 class="login-title">飞书报工系统</h1>
      <p class="login-desc">项目工时报送 · 审批 · 统计一体化</p>

      <div class="status-area">
        <span v-if="!failed" class="spinner" />
        <p class="status" :class="{ 'status-error': failed }">{{ status }}</p>
      </div>

      <t-button
        v-if="failed"
        class="retry-btn"
        theme="primary"
        shape="round"
        size="large"
        block
        @click="retry"
      >
        重新登录
      </t-button>

      <!-- 临时登录（仅本地调试） -->
      <t-button
        v-if="devLoginEnabled"
        class="dev-login-btn"
        theme="default"
        variant="outline"
        shape="round"
        block
        :loading="devLogging"
        @click="doDevLogin"
      >
        临时登录（调试）
      </t-button>
    </div>

    <p class="login-footer">© 飞书报工系统</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const status = ref('正在登录…');
const failed = ref(false);
const devLogging = ref(false);
// 仅本地调试：VITE_DEV_LOGIN=1 时显示临时登录按钮
const devLoginEnabled = import.meta.env.VITE_DEV_LOGIN === '1';

// ---------- 环境判断 ----------
// 飞书 JSSDK 是异步注入的：不能同步读 window.tt，需结合 UA 判断环境
function getTT() {
  return (window as any).tt;
}

function isFeishuEnv() {
  if (/lark|feishu/i.test(navigator.userAgent)) return true;
  if ((window as any).h5sdk || getTT()) return true;
  return false;
}

// ---------- 登录核心 ----------
function loginWithCode(code: string) {
  auth
    .loginByCode(code)
    .then(() => router.push('/'))
    .catch((e: any) => {
      failed.value = true;
      status.value = '登录失败：' + (e?.message || '未知错误');
    });
}

// ---------- 浏览器网页授权 OAuth ----------
// 流程：跳转飞书授权页 → 用户授权 → 跳回本页带 code → 复用 /auth/feishu/login
function startOAuth() {
  const appId = import.meta.env.VITE_FEISHU_APP_ID;
  if (!appId) {
    failed.value = true;
    status.value = '缺少 VITE_FEISHU_APP_ID 配置';
    return;
  }
  // redirect_uri 用当前域名（与飞书后台重定向 URL 精确匹配），不带路径
  const redirectUri = window.location.origin;
  const state = Math.random().toString(36).slice(2);
  localStorage.setItem('oauth_state', state);
  window.location.href =
    'https://accounts.feishu.cn/open-apis/authen/v1/authorize' +
    `?client_id=${encodeURIComponent(appId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&response_type=code' +
    `&state=${state}`;
}

function handleOAuthCallback(code: string, state: string | null) {
  const saved = localStorage.getItem('oauth_state');
  localStorage.removeItem('oauth_state');
  if (saved && state && state === saved) {
    loginWithCode(code);
  } else {
    // state 不匹配（如手动访问/过期），仍尝试登录；失败会给提示
    loginWithCode(code);
  }
}

// ---------- 飞书客户端内免登 ----------
function requestAuthCode() {
  const tt = getTT();
  if (!tt?.requestAuthCode) {
    failed.value = true;
    status.value = '当前环境不支持免登，正在跳转网页授权…';
    startOAuth();
    return;
  }
  tt.requestAuthCode({
    appId: import.meta.env.VITE_FEISHU_APP_ID,
    success: (res: any) => loginWithCode(res.code),
    fail: (err: any) => {
      // 桌面端/浏览器被判定 h5 场景时，降级走网页授权
      if (err?.errno === 20029) {
        startOAuth();
        return;
      }
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
        if (err?.errno === 103) {
          requestAuthCode();
          return;
        }
        if (err?.errno === 20029) {
          // h5 case（桌面端常见）：降级走网页授权
          startOAuth();
          return;
        }
        failed.value = true;
        status.value = '免登失败：' + (err?.errString || '未知错误');
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

// 重新登录：客户端内重试免登，浏览器重新发起授权
function retry() {
  if (isFeishuEnv()) requestAccess();
  else startOAuth();
}

// 临时登录：一键以管理员身份进入（仅本地调试，后端 DEV_LOGIN_ENABLED=1）
async function doDevLogin() {
  devLogging.value = true;
  status.value = '临时登录中…';
  try {
    await auth.loginDev();
    router.push('/');
  } catch (e: any) {
    failed.value = true;
    status.value = '临时登录失败：' + (e?.message || '未知错误');
  } finally {
    devLogging.value = false;
  }
}

onMounted(() => {
  if (auth.token) {
    router.push('/');
    return;
  }

  // 1) OAuth 授权回调（浏览器跳回，URL 带 code）
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    handleOAuthCallback(code, params.get('state'));
    return;
  }

  // 2) 浏览器直接访问 → 网页授权
  if (!isFeishuEnv()) {
    if (devLoginEnabled) {
      // 本地调试模式：不自动跳转，停留在登录页等用户点"临时登录"或 OAuth
      status.value = '调试模式：可点击下方「临时登录」直接进入系统';
      return;
    }
    startOAuth();
    return;
  }

  // 3) 飞书客户端内 → 免登
  status.value = '正在飞书免登中…';
  startLogin();
});
</script>

<style scoped>
.login-wrap {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f7; /* DESIGN: canvas-parchment */
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
}

/* 背景装饰光斑，营造 Apple 风格的柔和纵深感 */
.login-bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  pointer-events: none;
}
.blob-1 {
  width: 360px;
  height: 360px;
  top: -120px;
  left: -100px;
  background: radial-gradient(circle, rgba(0, 102, 204, 0.18), transparent 70%);
}
.blob-2 {
  width: 420px;
  height: 420px;
  bottom: -160px;
  right: -120px;
  background: radial-gradient(circle, rgba(0, 102, 204, 0.12), transparent 70%);
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  text-align: center;
  padding: 48px 32px;
  box-sizing: border-box;
}
.brand-logo {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 20px;
  background: linear-gradient(135deg, #e8f0fe, #d6e6fb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  line-height: 1;
}
.login-title {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1d1d1f;
  margin: 20px 0 6px;
}
.login-desc {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 28px;
}
.status-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  justify-content: center;
}
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 102, 204, 0.18);
  border-top-color: #0066cc; /* DESIGN: action-blue */
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.status {
  color: #86868b;
  font-size: 14px;
  margin: 0;
}
.status-error {
  color: #d70015;
}
.retry-btn {
  margin-top: 20px;
}
.dev-login-btn {
  margin-top: 12px;
}
.login-footer {
  position: relative;
  margin-top: 24px;
  font-size: 12px;
  color: #a1a1a6;
}

@media (max-width: 480px) {
  .login-card {
    padding: 36px 24px;
  }
  .brand-logo {
    width: 60px;
    height: 60px;
    font-size: 30px;
    border-radius: 16px;
  }
  .login-title {
    font-size: 22px;
  }
}
</style>
