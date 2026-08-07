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
  <div class="settings-page">
    <div class="surface-card overview-card">
      <div class="overview-top">
        <div>
          <p class="overview-kicker">SYSTEM SETTINGS</p>
          <h1 class="page-title">系统设置</h1>
          <p class="overview-sub">管理飞书通讯录、全局管理员与报工规则</p>
        </div>
        <div class="overview-actions">
          <t-button variant="text" theme="default" class="back-btn" @click="router.push('/')">← 返回首页</t-button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">管理员</div>
          <div class="metric-value">{{ admins.length }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">普通时长上限</div>
          <div class="metric-value">{{ hoursLimit }}<span class="metric-unit">h</span></div>
        </div>
        <div class="metric-item">
          <div class="metric-label">通讯录</div>
          <div class="metric-value">飞书</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">审批方式</div>
          <div class="metric-value">系统内</div>
        </div>
      </div>
    </div>

    <div class="surface-card section-card">
      <div class="card-head">
        <div class="card-icon">👥</div>
        <div>
          <div class="card-title">飞书通讯录</div>
          <div class="card-desc">用户不建表，从飞书通讯录拉取缓存，用于选择负责人/报工人</div>
        </div>
      </div>
      <div class="toolbar">
        <t-button theme="primary" shape="round" :loading="syncing" @click="doSync">同步飞书通讯录</t-button>
        <span v-if="lastSyncText" class="tip">上次同步：{{ lastSyncText }}</span>
      </div>
    </div>

    <div class="surface-card section-card">
      <div class="card-head">
        <div class="card-icon">🛡️</div>
        <div>
          <div class="card-title">全局管理员</div>
          <div class="card-desc">管理员可管理项目、报工与系统配置</div>
        </div>
      </div>
      <div class="toolbar">
        <UserSelect v-model="newAdminOpenId" placeholder="搜索并选择用户" width="260px" />
        <t-button theme="primary" shape="round" @click="addAdmin">添加管理员</t-button>
      </div>
      <div class="table-wrap">
        <t-table :data="admins" :columns="adminColumns" row-key="id" hover />
      </div>
    </div>

    <div class="surface-card section-card">
      <div class="card-head">
        <div class="card-icon">👤</div>
        <div>
          <div class="card-title">用户节假日报工权限</div>
          <div class="card-desc">从飞书通讯录拉取用户列表，可单独控制每位用户是否允许节假日报工</div>
        </div>
      </div>
      <div class="toolbar">
        <t-input v-model="userKeyword" placeholder="搜索姓名/手机/邮箱" clearable style="width: 260px" @enter="doSearchUsers" @clear="doSearchUsers" />
        <t-button theme="default" shape="round" @click="doSearchUsers">搜索</t-button>
      </div>
      <div class="table-wrap">
        <t-table :data="userRows" :columns="userColumns" row-key="openId" hover :loading="userLoading" />
        <div v-if="userTotal > 0" class="pager">
          <t-pagination :total="userTotal" :page-size="userPageSize" :current="userPage" @change="onUserPageChange" />
        </div>
      </div>
    </div>

    <div class="surface-card section-card">
      <div class="card-head">
        <div class="card-icon">📅</div>
        <div>
          <div class="card-title">日历配置</div>
          <div class="card-desc">配置节假日 JSON 链接，系统自动同步法定节假日与调休上班日（周六日自动判定，无需配置）</div>
        </div>
      </div>
      <div class="toolbar">
        <t-input v-model="calendarJsonUrl" placeholder="https://unpkg.com/holiday-calendar/data/CN/{year}.json" clearable style="width: 460px" />
        <t-button theme="primary" shape="round" :loading="syncingCalendar" @click="saveCalendar">保存并同步</t-button>
      </div>
      <div v-if="calendarSyncText" class="config-help">
        <span class="tip">{{ calendarSyncText }}</span>
      </div>
      <div class="config-help">支持 {year} 占位符自动同步今年与明年；保存后立即同步一次，之后每周自动更新。</div>
    </div>

    <div class="surface-card section-card">
      <div class="card-head">
        <div class="card-icon">⚙️</div>
        <div>
          <div class="card-title">报工配置</div>
          <div class="card-desc">普通报工时长由系统按剩余额度自动计算，此值为每日上限</div>
        </div>
      </div>

      <div class="config-group">
        <div class="config-group-title">报工规则</div>
        <div class="config-row">
          <span class="config-label">工作日普通时长上限</span>
          <t-input-number v-model="hoursLimit" :min="1" :max="24" :step="1" style="width: 140px" />
          <span class="config-hint">工作日普通报工每日时长上限，超出部分请填加班时长</span>
        </div>
        <div class="config-row">
          <span class="config-label">节假日允许报工</span>
          <t-switch v-model="holidayEnabled" />
          <span class="config-hint">开启后节假日可提交报工（节假日报工一律走审批）</span>
        </div>
      </div>

      <div class="config-group">
        <div class="config-group-title">报工提醒（定时任务）</div>
        <div class="config-row">
          <span class="config-label">报工提醒开关</span>
          <t-switch v-model="remindEnabled" />
          <span class="config-hint">开启后每天定时提醒昨天未报工或普通时长不足的用户</span>
        </div>
        <div class="config-row">
          <span class="config-label">提醒时间</span>
          <t-time-picker v-model="remindTime" format="HH:mm" style="width: 120px" clearable />
          <span class="config-hint">每天发送报工提醒的时间（默认 08:00，仅工作日生效）</span>
        </div>
      </div>

      <div class="config-actions">
        <t-button theme="primary" shape="round" :loading="savingConfig" @click="saveConfig">保存配置</t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, MessagePlugin, Switch } from 'tdesign-vue-next';
import {
  getAdminList,
  addAdmin as apiAddAdmin,
  removeAdmin as apiRemoveAdmin,
  syncUsers,
  getConfig,
  setConfig,
  setUserHolidayEnabled,
  setUserEnabled,
} from '../api/admin';
import { getUsers } from '../api/project';
import { syncCalendar } from '../api/calendar';
import UserSelect from '../components/UserSelect.vue';

const router = useRouter();
const syncing = ref(false);
const savingConfig = ref(false);
const admins = ref<any[]>([]);
const newAdminOpenId = ref('');
const hoursLimit = ref(8);
const holidayEnabled = ref(false);
const remindEnabled = ref(true);
const remindTime = ref('08:00');
const lastSyncText = ref('');
const calendarJsonUrl = ref('');
const syncingCalendar = ref(false);
const calendarSyncText = ref('');

// 用户列表（节假日报工权限）
const userRows = ref<any[]>([]);
const userTotal = ref(0);
const userPage = ref(1);
const userPageSize = 20;
const userKeyword = ref('');
const userLoading = ref(false);
const togglingIds = ref<Set<string>>(new Set());

const userColumns = [
  { colKey: 'name', title: '姓名' },
  { colKey: 'departmentName', title: '部门' },
  { colKey: 'mobile', title: '手机' },
  { colKey: 'email', title: '邮箱' },
  {
    colKey: 'systemEnabled',
    title: '启用系统',
    width: 100,
    cell: (h: any, { row }: any) =>
      h(Switch, {
        value: row.systemEnabled === 1,
        disabled: togglingIds.value.has(row.openId),
        onChange: (v: any) => toggleEnabled(row, !!v),
      }),
  },
  {
    colKey: 'holidayReportEnabled',
    title: '允许节假日报工',
    width: 150,
    cell: (h: any, { row }: any) =>
      h(Switch, {
        value: row.holidayReportEnabled === 1,
        disabled: togglingIds.value.has(row.openId),
        onChange: (v: any) => toggleHoliday(row, !!v),
      }),
  },
];

async function loadUserList() {
  userLoading.value = true;
  try {
    const res = await getUsers({ keyword: userKeyword.value, page: userPage.value, pageSize: userPageSize });
    userRows.value = res.items;
    userTotal.value = res.total;
  } finally {
    userLoading.value = false;
  }
}

function doSearchUsers() {
  userPage.value = 1;
  loadUserList();
}

function onUserPageChange(pageInfo: any) {
  userPage.value = pageInfo.current;
  loadUserList();
}

async function toggleHoliday(row: any, enabled: boolean) {
  if (togglingIds.value.has(row.openId)) return;
  togglingIds.value.add(row.openId);
  try {
    await setUserHolidayEnabled(row.openId, enabled);
    row.holidayReportEnabled = enabled ? 1 : 0;
    MessagePlugin.success(`${row.name} 已${enabled ? '允许' : '禁止'}节假日报工`);
  } catch (e) {
    MessagePlugin.error('设置失败，请重试');
  } finally {
    togglingIds.value.delete(row.openId);
  }
}

async function toggleEnabled(row: any, enabled: boolean) {
  if (togglingIds.value.has(row.openId)) return;
  togglingIds.value.add(row.openId);
  try {
    await setUserEnabled(row.openId, enabled);
    row.systemEnabled = enabled ? 1 : 0;
    MessagePlugin.success(`${row.name} 已${enabled ? '启用' : '禁用'}`);
  } catch (e) {
    MessagePlugin.error('设置失败，请重试');
  } finally {
    togglingIds.value.delete(row.openId);
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
    lastSyncText.value = new Date().toLocaleString('zh-CN');
    MessagePlugin.success(`同步完成，共 ${res.count} 人`);
    loadUserList();
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
  holidayEnabled.value = cfg.holiday_report_enabled === '1';
  remindEnabled.value = cfg.report_remind_enabled !== '0';
  remindTime.value = cfg.report_remind_time || '08:00';
  if (cfg.calendar_json_url) calendarJsonUrl.value = cfg.calendar_json_url;
}

async function saveCalendar() {
  const url = calendarJsonUrl.value.trim();
  if (!url) return MessagePlugin.warning('请输入节假日 JSON 链接');
  syncingCalendar.value = true;
  try {
    await setConfig('calendar_json_url', url);
    const res = await syncCalendar();
    if (res.skipped) {
      MessagePlugin.warning('未获取到节假日数据，请检查链接');
    } else {
      calendarSyncText.value = `最近同步：${new Date().toLocaleString('zh-CN')}，共 ${res.total} 条（法定 ${res.holiday} / 调休 ${res.adjustWorkday}）${res.failedUrls ? `，${res.failedUrls} 个链接拉取失败` : ''}`;
      MessagePlugin.success(`同步完成，共 ${res.total} 条节假日`);
    }
  } finally {
    syncingCalendar.value = false;
  }
}

async function saveConfig() {
  savingConfig.value = true;
  try {
    await setConfig('working_hours_limit', String(hoursLimit.value));
    await setConfig('holiday_report_enabled', holidayEnabled.value ? '1' : '0');
    await setConfig('report_remind_enabled', remindEnabled.value ? '1' : '0');
    await setConfig('report_remind_time', remindTime.value || '08:00');
    MessagePlugin.success('已保存');
  } finally {
    savingConfig.value = false;
  }
}

onMounted(() => {
  loadAdmins();
  loadConfig();
  loadUserList();
});
</script>

<style scoped>
.settings-page {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.overview-card {
  background: linear-gradient(145deg, #ffffff 0%, #f2f2f7 100%);
  border-color: #e3e3ea;
  overflow: hidden;
}

.overview-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.overview-kicker {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #6e6e73;
}

.overview-sub {
  margin: 6px 0 0;
  color: #6e6e73;
  font-size: 14px;
}

.overview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  margin-left: -8px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1d1d1f;
  margin: 0;
}

.metrics-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metric-item {
  background: #ffffff;
  border: 1px solid #e8e8ed;
  border-radius: 14px;
  padding: 12px 14px;
}

.metric-label {
  font-size: 12px;
  color: #6e6e73;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1d1d1f;
}

.metric-unit {
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
  margin-left: 2px;
}

.section-card {
  padding-top: 18px;
  padding-bottom: 18px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.card-desc {
  font-size: 12px;
  color: #86868b;
  margin-top: 2px;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.config-group {
  padding: 4px 2px;
}

.config-group + .config-group {
  margin-top: 16px;
}

.config-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #6e6e73;
  margin-bottom: 8px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 6px 0;
}

.config-label {
  font-size: 14px;
  color: #1d1d1f;
  width: 140px;
  flex-shrink: 0;
}

.config-hint {
  font-size: 12px;
  color: #86868b;
}

.config-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.table-wrap {
  margin-top: 6px;
  overflow-x: auto;
}

.config-help {
  margin-top: 8px;
  font-size: 12px;
  color: #86868b;
}

.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .overview-top {
    flex-direction: column;
    align-items: stretch;
  }
  .overview-actions {
    justify-content: space-between;
  }
  .page-title {
    font-size: 22px;
  }
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .config-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .config-label {
    width: auto;
  }
}
</style>
