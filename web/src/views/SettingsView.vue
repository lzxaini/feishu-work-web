<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:45:06
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:45:07
 * @FilePath: \feishu-work\web\src\views\SettingsView.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div>
    <div class="surface-card" style="margin-bottom: 16px">
      <h1 class="page-title">系统设置</h1>
      <p class="section-title">飞书通讯录</p>
      <div class="toolbar">
        <t-button theme="primary" shape="round" :loading="syncing" @click="doSync">同步飞书通讯录</t-button>
        <span class="tip">用户不建表，从飞书通讯录拉取缓存，用于选择负责人/报工人</span>
      </div>
    </div>

    <div class="surface-card">
      <p class="section-title">全局管理员</p>
      <div class="toolbar">
        <t-select
          v-model="newAdminOpenId"
          filterable
          :options="userOptions"
          :loading="searching"
          @search="searchUsers"
          placeholder="搜索并选择用户"
          style="width: 260px"
        />
        <t-button theme="primary" shape="round" @click="addAdmin">添加管理员</t-button>
      </div>
      <t-table :data="admins" :columns="adminColumns" row-key="id" hover />
    </div>

    <div class="surface-card" style="margin-top: 16px">
      <p class="section-title">报工配置</p>
      <div class="toolbar">
        <t-input-number v-model="hoursLimit" :min="1" :max="24" :step="1" style="width: 160px" />
        <span class="tip">工作日普通时长每日上限（小时），默认 8；普通报工时长由系统按剩余额度自动计算</span>
        <t-button theme="primary" shape="round" :loading="savingConfig" @click="saveConfig">保存</t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { Button, MessagePlugin } from 'tdesign-vue-next';
import { getAdminList, addAdmin as apiAddAdmin, removeAdmin as apiRemoveAdmin, syncUsers, getConfig, setConfig } from '../api/admin';
import { getUsers } from '../api/project';

const syncing = ref(false);
const searching = ref(false);
const savingConfig = ref(false);
const admins = ref<any[]>([]);
const userOptions = ref<{ label: string; value: string }[]>([]);
const newAdminOpenId = ref('');
const hoursLimit = ref(8);

async function searchUsers(keyword: string) {
  searching.value = true;
  try {
    const res = await getUsers({ keyword, pageSize: 20 });
    userOptions.value = res.items.map((u: any) => ({ label: u.name, value: u.openId }));
  } finally {
    searching.value = false;
  }
}

async function loadAdmins() {
  admins.value = await getAdminList();
}

const adminColumns = [
  { colKey: 'userName', title: '姓名' },
  { colKey: 'openId', title: 'openId' },
  {
    colKey: 'action',
    title: '操作',
    width: 90,
    cell: (h: any, { row }: any) => h(Button, { theme: 'danger', variant: 'text', onClick: () => removeAdmin(row) }, { default: () => '移除' }),
  },
];

async function doSync() {
  syncing.value = true;
  try {
    const res = await syncUsers();
    MessagePlugin.success(`同步完成，共 ${res.count} 人`);
  } finally {
    syncing.value = false;
  }
}

async function addAdmin() {
  if (!newAdminOpenId.value) return MessagePlugin.warning('请选择用户');
  await apiAddAdmin(newAdminOpenId.value);
  MessagePlugin.success('已添加');
  newAdminOpenId.value = '';
  loadAdmins();
}

async function removeAdmin(row: any) {
  await apiRemoveAdmin(row.openId);
  MessagePlugin.success('已移除');
  loadAdmins();
}

async function loadConfig() {
  const cfg = await getConfig();
  if (cfg.working_hours_limit) hoursLimit.value = Number(cfg.working_hours_limit);
}

async function saveConfig() {
  savingConfig.value = true;
  try {
    await setConfig('working_hours_limit', String(hoursLimit.value));
    MessagePlugin.success('已保存');
  } finally {
    savingConfig.value = false;
  }
}

onMounted(() => {
  searchUsers('');
  loadAdmins();
  loadConfig();
});
</script>

<style scoped>
.section-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #1d1d1f;
}
</style>
