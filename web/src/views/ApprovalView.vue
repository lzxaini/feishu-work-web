<!--
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-04 15:43:50
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-04 15:43:51
 * @FilePath: \feishu-work-web\web\src\views\ApprovalView.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<!--
 * @Description: 审批管理页（系统内审批）
-->
<template>
  <div class="approval-page">
    <div class="surface-card overview-card">
      <div class="overview-top">
        <div>
          <p class="overview-kicker">APPROVAL CENTER</p>
          <h1 class="page-title">审批管理</h1>
          <p class="overview-sub">审批你名下项目的待审批报工，通过后计入工时</p>
        </div>
        <div class="overview-actions">
          <t-button variant="text" theme="default" class="back-btn" @click="router.push('/')">← 返回首页</t-button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">待审批</div>
          <div class="metric-value">{{ total }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">普通/加班</div>
          <div class="metric-value">{{ normalHoursText }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">总工时</div>
          <div class="metric-value">{{ totalHoursText }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">状态</div>
          <div class="metric-value">审批中</div>
        </div>
      </div>
    </div>

    <div class="surface-card table-card desktop-only">
      <div class="table-head">
        <div class="table-title">待审批报工</div>
        <div class="table-tip">共 {{ total }} 项待处理</div>
      </div>
      <t-table :data="rows" :columns="columns" :loading="loading" row-key="id" hover table-layout="fixed" />
    </div>

    <!-- 移动端卡片列表 -->
    <div class="mobile-cards">
      <div v-for="row in rows" :key="row.id" class="approval-card surface-card">
        <div class="card-head">
          <span class="card-name">{{ row.project?.name || '-' }}</span>
          <t-tag theme="primary" size="small" variant="light">待审批</t-tag>
        </div>
        <div class="card-meta">
          <span class="card-date">📅 {{ dateText(row.reportDate) }}</span>
          <span class="card-hours">总 {{ row.totalHours }}h</span>
        </div>
        <div class="card-info">
          <div class="info-row"><span class="info-label">报工人</span><span class="info-value">{{ row.userName || '-' }}</span></div>
          <div class="info-row"><span class="info-label">普通/加班</span><span class="info-value">{{ row.normalHours }} / {{ row.overtimeHours }} h</span></div>
          <div v-if="row.remark" class="info-row"><span class="info-label">备注</span><span class="info-value">{{ row.remark }}</span></div>
        </div>
        <div class="card-actions">
          <t-button theme="success" variant="outline" size="small" @click="approve(row)">通过</t-button>
          <t-button theme="danger" variant="outline" size="small" @click="openReject(row)">驳回</t-button>
        </div>
      </div>
      <t-empty v-if="!loading && rows.length === 0" description="暂无待审批报工" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
import { getPendingApprovals, approveReport, rejectReport } from '../api/approval';

const router = useRouter();
const rows = ref<any[]>([]);
const loading = ref(false);

const total = computed(() => rows.value.length);
const normalHoursText = computed(() => {
  const sum = rows.value.reduce((acc: number, i: any) => acc + (Number(i.normalHours) || 0), 0);
  return sum.toFixed(1);
});
const totalHoursText = computed(() => {
  const sum = rows.value.reduce((acc: number, i: any) => acc + (Number(i.totalHours) || 0), 0);
  return sum.toFixed(1);
});

function dateText(v: any) {
  return v ? String(v).slice(0, 10) : '-';
}

const columns = [
  { colKey: 'project.name', title: '项目', minWidth: 140, ellipsis: true },
  { colKey: 'reportDate', title: '日期', width: 110, cell: (h: any, { row }: any) => dateText(row?.reportDate) },
  { colKey: 'userName', title: '报工人', width: 110 },
  { colKey: 'hours', title: '普通/加班', width: 110, cell: (h: any, { row }: any) => `${row?.normalHours ?? 0} / ${row?.overtimeHours ?? 0} h` },
  { colKey: 'totalHours', title: '总时长', width: 90 },
  { colKey: 'remark', title: '备注', minWidth: 140, ellipsis: true, cell: (h: any, { row }: any) => row?.remark || '-' },
  {
    colKey: 'action',
    title: '操作',
    width: 160,
    fixed: 'right',
    cell: (h: any, { row }: any) =>
      h('div', { style: 'display:flex;gap:4px;align-items:center' }, [
        h(Button, { theme: 'success', variant: 'outline', size: 'small', onClick: () => approve(row) }, { default: () => '通过' }),
        h(Button, { theme: 'danger', variant: 'outline', size: 'small', onClick: () => openReject(row) }, { default: () => '驳回' }),
      ]),
  },
];

async function load() {
  loading.value = true;
  try {
    rows.value = await getPendingApprovals();
  } finally {
    loading.value = false;
  }
}

function approve(row: any) {
  const dialog = DialogPlugin.confirm({
    header: '审批通过',
    body: `确认通过 ${row.userName || ''} 于 ${dateText(row.reportDate)} 的报工（${row.normalHours}/${row.overtimeHours}h）？`,
    theme: 'success',
    confirmBtn: { content: '通过', theme: 'success' },
    onConfirm: async () => {
      await approveReport(row.id);
      MessagePlugin.success('已通过');
      dialog.destroy();
      load();
    },
  });
}

function openReject(row: any) {
  rejectTarget.value = row;
  rejectReason.value = '';
  const dialog = DialogPlugin({
    header: '审批驳回',
    theme: 'warning',
    confirmBtn: { content: '驳回', theme: 'danger' },
    body: () =>
      h('div', { style: 'display:flex;flex-direction:column;gap:8px' }, [
        h('p', { style: 'margin:0;color:#86868b;font-size:13px' }, `将驳回 ${row.userName || ''} 的报工，可填写原因：`),
        h('input', {
          value: rejectReason.value,
          onInput: (e: any) => (rejectReason.value = e.target.value),
          placeholder: '驳回原因（选填）',
          style: 'padding:8px 12px;border:1px solid #dcdcdc;border-radius:8px;font-size:14px;',
        }),
      ]),
    onConfirm: async () => {
      await rejectReport(rejectTarget.value.id, rejectReason.value || undefined);
      MessagePlugin.success('已驳回');
      dialog.destroy();
      load();
    },
  });
}

const rejectReason = ref('');
const rejectTarget = ref<any>(null);

onMounted(load);
</script>

<style scoped>
.approval-page {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.overview-card {
  background: linear-gradient(145deg, #ffffff 0%, #fef6ee 100%);
  border-color: #f3e2cf;
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
  border: 1px solid #f3e7d6;
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

.table-card {
  padding: 12px;
}

.table-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.table-tip {
  font-size: 12px;
  color: #86868b;
}

.table-card :deep(.t-table) {
  min-width: 900px;
}
.table-card :deep(.t-table__content) {
  overflow-x: auto;
}

/* 移动端卡片列表 */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 10px;
}

.approval-card {
  padding: 14px;
  border-color: #f3e7d6;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #1d1d1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.card-date {
  font-size: 13px;
  color: #86868b;
}

.card-hours {
  font-size: 13px;
  font-weight: 600;
  color: #ed7b2f;
}

.card-info {
  border-top: 1px solid #f5efe7;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  color: #1d1d1f;
}

.info-label {
  flex-shrink: 0;
  width: 68px;
  color: #86868b;
}

.info-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 72px);
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
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
  .desktop-only {
    display: none;
  }
  .mobile-cards {
    display: flex;
  }
}
</style>
