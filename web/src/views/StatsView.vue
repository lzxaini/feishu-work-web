<!--
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-07 16:48:38
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 16:48:39
 * @FilePath: \feishu-work-web\web\src\views\StatsView.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-07 16:00:00
 * @LastEditors: lzx 1245634367@qq.com
 * @FilePath: \feishu-work-web\web\src\views\StatsView.vue
 * @Description: 报工统计：按用户×日期统计启用系统用户的报工时长，支持筛选与推送报工提醒
-->
<template>
  <div class="stats-page">
    <div class="surface-card overview-card">
      <div class="overview-top">
        <div>
          <p class="overview-kicker">REPORT STATS</p>
          <h1 class="page-title">报工统计</h1>
          <p class="overview-sub">按用户与日期统计启用了系统用户的报工时长，可一键推送报工提醒</p>
        </div>
        <div class="overview-actions">
          <t-button variant="text" theme="default" class="back-btn" @click="router.push('/')">← 返回首页</t-button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">总报工时长</div>
          <div class="metric-value">{{ summary.totalHours.toFixed(1) }}<span class="metric-unit">h</span></div>
        </div>
        <div class="metric-item">
          <div class="metric-label">报工人数</div>
          <div class="metric-value">{{ summary.reportedUsers }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">报工次数</div>
          <div class="metric-value">{{ summary.reportCount }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">可统计用户</div>
          <div class="metric-value">{{ users.length }}</div>
        </div>
      </div>
    </div>

    <div class="surface-card section-card">
      <div class="card-head">
        <div class="card-icon">📊</div>
        <div>
          <div class="card-title">统计查询</div>
          <div class="card-desc">汇总「审批中 / 已通过」的有效报工；用户留空表示全部启用系统用户</div>
        </div>
      </div>
      <div class="toolbar">
        <t-select
          v-model="filters.openId"
          :options="userOptions"
          clearable
          filterable
          placeholder="全部用户"
          style="width: 220px"
        />
        <t-date-picker v-model="filters.startDate" format="YYYY-MM-DD" placeholder="开始日期" clearable style="width: 150px" />
        <span class="range-sep">至</span>
        <t-date-picker v-model="filters.endDate" format="YYYY-MM-DD" placeholder="结束日期" clearable style="width: 150px" />
        <t-button theme="primary" shape="round" :loading="loading" @click="loadStats">查询</t-button>
        <div class="spacer" />
        <t-button theme="warning" variant="outline" shape="round" @click="remindVisible = true">⏰ 提醒报工</t-button>
      </div>

      <div class="table-wrap">
        <t-tabs v-model="activeTab">
          <t-tab-panel value="user" label="按用户汇总">
            <t-table
              :data="userTotals"
              :columns="userColumns"
              row-key="openId"
              hover
              :loading="loading"
              :pagination="userPagination"
              @page-change="onUserPageChange"
            />
          </t-tab-panel>
          <t-tab-panel value="date" label="按日期汇总">
            <t-table :data="dateTotals" :columns="dateColumns" row-key="date" hover :loading="loading" />
          </t-tab-panel>
          <t-tab-panel value="detail" label="明细">
            <t-table
              :data="rows"
              :columns="detailColumns"
              row-key="rowKey"
              hover
              :loading="loading"
              :pagination="detailPagination"
              @page-change="onDetailPageChange"
            />
          </t-tab-panel>
        </t-tabs>
      </div>
    </div>

    <!-- 提醒报工弹窗 -->
    <t-dialog
      v-model:visible="remindVisible"
      header="推送报工提醒"
      :confirm-btn="{ content: '发送提醒', loading: reminding }"
      :cancel-btn="{ content: '取消' }"
      @confirm="doRemind"
    >
      <div class="remind-form">
        <div class="remind-row">
          <span class="remind-label">提醒日期</span>
          <t-date-picker v-model="remindDate" format="YYYY-MM-DD" placeholder="选择日期" clearable style="width: 200px" />
        </div>
        <div class="remind-row">
          <span class="remind-label">提醒用户</span>
          <t-select
            v-model="remindOpenId"
            :options="userOptions"
            clearable
            filterable
            placeholder="留空提醒全部启用用户"
            style="width: 200px"
          />
        </div>
        <p class="remind-tip">
          将向所选日期尚未报工的启用系统用户推送卡片消息（含「去报工」跳转按钮）。用户留空则提醒全部。
        </p>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, MessagePlugin } from 'tdesign-vue-next';
import { getStatsDaily, sendReportRemind } from '../api/stats';

const router = useRouter();

const loading = ref(false);
const users = ref<any[]>([]);
const rows = ref<any[]>([]);
const userTotals = ref<any[]>([]);
const dateTotals = ref<any[]>([]);
const summary = ref({ totalHours: 0, reportCount: 0, reportedUsers: 0 });

const filters = ref<{ openId?: string; startDate?: string; endDate?: string }>({});
const activeTab = ref('user');

const userOptions = computed(() => users.value.map((u) => ({ label: u.name, value: u.openId })));

// 分页（本地分页，数据量小）
const userPageSize = 20;
const userPage = ref(1);
const userPagination = computed(() => ({ current: userPage.value, pageSize: userPageSize, total: userTotals.value.length }));
const onUserPageChange = (p: any) => {
  userPage.value = p.current;
};
const pagedUserTotals = computed(() => userTotals.value.slice((userPage.value - 1) * userPageSize, userPage.value * userPageSize));

const detailPageSize = 20;
const detailPage = ref(1);
const detailPagination = computed(() => ({ current: detailPage.value, pageSize: detailPageSize, total: rows.value.length }));
const onDetailPageChange = (p: any) => {
  detailPage.value = p.current;
};
const pagedDetail = computed(() => rows.value.slice((detailPage.value - 1) * detailPageSize, detailPage.value * detailPageSize));

// 表格内「提醒报工」按钮的加载状态（按 openId 记录，防止重复点击）
const remindingIds = ref<Set<string>>(new Set());

const userColumns = [
  { colKey: 'name', title: '用户' },
  { colKey: 'departmentName', title: '部门' },
  { colKey: 'normalHours', title: '普通时长(h)', align: 'right' as const },
  { colKey: 'overtimeHours', title: '加班时长(h)', align: 'right' as const },
  { colKey: 'totalHours', title: '总时长(h)', align: 'right' as const },
  { colKey: 'reportCount', title: '报工次数', align: 'right' as const },
  { colKey: 'days', title: '报工天数', align: 'right' as const },
  {
    colKey: 'action',
    title: '操作',
    width: 120,
    align: 'center' as const,
    cell: (h: any, { row }: any) => {
      // 普通时长不足 8 小时 → 提供「提醒报工」按钮，点击直接给该用户推送提醒
      if (Number(row.normalHours) >= 8) return null;
      return h(Button, {
        size: 'small',
        theme: 'warning',
        variant: 'outline',
        loading: remindingIds.value.has(row.openId),
        onClick: () => remindUser(row),
      }, { default: () => '提醒报工' });
    },
  },
];

const dateColumns = [
  { colKey: 'date', title: '日期' },
  { colKey: 'reportedUsers', title: '报工人数', align: 'right' as const },
  { colKey: 'totalHours', title: '总时长(h)', align: 'right' as const },
  { colKey: 'reportCount', title: '报工次数', align: 'right' as const },
];

const detailColumns = [
  { colKey: 'name', title: '用户' },
  { colKey: 'departmentName', title: '部门' },
  { colKey: 'reportDate', title: '日期' },
  { colKey: 'normalHours', title: '普通时长(h)', align: 'right' as const },
  { colKey: 'overtimeHours', title: '加班时长(h)', align: 'right' as const },
  { colKey: 'totalHours', title: '总时长(h)', align: 'right' as const },
  { colKey: 'reportCount', title: '报工次数', align: 'right' as const },
];

async function loadStats() {
  loading.value = true;
  try {
    const params: any = {};
    if (filters.value.openId) params.openId = filters.value.openId;
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;
    const res = await getStatsDaily(params);
    users.value = res.users || [];
    rows.value = (res.rows || []).map((r: any, i: number) => ({ ...r, rowKey: `${r.openId}-${r.reportDate}` }));
    userTotals.value = res.userTotals || [];
    dateTotals.value = res.dateTotals || [];
    summary.value = res.summary || { totalHours: 0, reportCount: 0, reportedUsers: 0 };
    userPage.value = 1;
    detailPage.value = 1;
  } catch (e) {
    MessagePlugin.error('统计加载失败');
  } finally {
    loading.value = false;
  }
}

// 提醒报工
const remindVisible = ref(false);
const reminding = ref(false);
const remindDate = ref('');
const remindOpenId = ref('');

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function openRemind() {
  remindDate.value = todayStr();
  remindOpenId.value = '';
  remindVisible.value = true;
}

async function doRemind() {
  if (!remindDate.value) {
    MessagePlugin.warning('请选择提醒日期');
    return;
  }
  reminding.value = true;
  try {
    const data: any = { date: remindDate.value };
    if (remindOpenId.value) data.openId = remindOpenId.value;
    const res = await sendReportRemind(data);
    const base = `共 ${res.total} 位启用用户`;
    const already = `${res.alreadyReported} 位已报工`;
    const sent = `成功发送 ${res.sent} 位`;
    const failed = res.failed > 0 ? `，${res.failed} 位失败` : '';
    MessagePlugin.success(`${base}，${already}，${sent}${failed}`);
    remindVisible.value = false;
  } catch (e: any) {
    MessagePlugin.error(e?.message || '发送提醒失败');
  } finally {
    reminding.value = false;
  }
}

// 按用户汇总表内「提醒报工」按钮：直接给该用户推送提醒（force=true 忽略是否已报工）
async function remindUser(row: any) {
  if (remindingIds.value.has(row.openId)) return;
  remindingIds.value.add(row.openId);
  try {
    const res = await sendReportRemind({ openId: row.openId, force: true });
    if (res.failed > 0) {
      MessagePlugin.error(`提醒 ${row.name} 发送失败，请检查飞书配置`);
    } else {
      MessagePlugin.success(`已向 ${row.name} 发送报工提醒`);
    }
  } catch (e: any) {
    MessagePlugin.error(e?.message || '发送提醒失败');
  } finally {
    remindingIds.value.delete(row.openId);
  }
}

onMounted(() => {
  remindDate.value = todayStr();
  filters.value.startDate = todayStr(); // 开始日期默认今天，统计今日起的报工
  loadStats();
});
</script>

<style scoped>
.stats-page {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.surface-card {
  background: #ffffff;
  border: 1px solid #e8e8ed;
  border-radius: 16px;
  padding: 20px 24px;
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

.range-sep {
  color: #86868b;
  font-size: 13px;
}

.spacer {
  flex: 1;
}

.table-wrap {
  margin-top: 12px;
  overflow-x: auto;
}

.remind-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.remind-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.remind-label {
  width: 72px;
  flex-shrink: 0;
  font-size: 14px;
  color: #1d1d1f;
}

.remind-tip {
  margin: 4px 0 0;
  font-size: 12px;
  color: #86868b;
  line-height: 1.6;
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
}
</style>
