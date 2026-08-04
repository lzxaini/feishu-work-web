<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:44:57
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-04 16:29:26
 * @FilePath: \feishu-work-web\web\src\views\ReportList.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div class="report-list">
    <div class="surface-card overview-card">
      <div class="overview-top">
        <div>
          <p class="overview-kicker">REPORT DASHBOARD</p>
          <h1 class="page-title">报工管理</h1>
          <p class="overview-sub">跟踪每日工时填报与审批状态，按项目汇总工作量</p>
        </div>
        <div class="overview-actions">
          <t-button variant="text" theme="default" class="back-btn" @click="router.push('/')">← 返回首页</t-button>
          <t-button v-if="auth.isAdmin" theme="default" variant="outline" :loading="exporting" @click="doExport">导出 Excel</t-button>
          <t-button theme="primary" shape="round" @click="router.push('/reports/new')">+ 报工</t-button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">报工总数</div>
          <div class="metric-value">{{ total }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">审批中</div>
          <div class="metric-value">{{ pendingCount }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">已通过</div>
          <div class="metric-value">{{ approvedCount }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">总工时</div>
          <div class="metric-value">{{ totalHoursText }}</div>
        </div>
      </div>
    </div>

    <div class="surface-card filter-card">
      <div class="toolbar">
        <t-select v-model="filters.projectId" placeholder="项目" clearable filterable style="width: 180px" @change="load">
          <t-option v-for="p in projectOptions" :key="p.id" :value="p.id" :label="p.name" />
        </t-select>
        <t-select v-model="filters.status" placeholder="状态" clearable style="width: 130px" @change="load">
          <t-option v-for="o in statusOptions" :key="o.value" :value="o.value" :label="o.label" />
        </t-select>
        <t-date-picker v-model="filters.startDate" format="YYYY-MM-DD" placeholder="开始日期" clearable style="width: 150px" @change="load" />
        <t-date-picker v-model="filters.endDate" format="YYYY-MM-DD" placeholder="结束日期" clearable style="width: 150px" @change="load" />
        <t-button theme="primary" @click="load">查询</t-button>
        <t-button theme="default" variant="outline" @click="resetFilters">重置</t-button>
      </div>

      <div class="quick-filters">
        <span class="quick-label">快捷筛选</span>
        <t-button size="small" variant="outline" :theme="filters.status === 1 ? 'primary' : 'default'" @click="setStatusFilter(1)">审批中</t-button>
        <t-button size="small" variant="outline" :theme="filters.status === 2 ? 'primary' : 'default'" @click="setStatusFilter(2)">已通过</t-button>
        <t-button size="small" variant="outline" :theme="filters.status === 3 ? 'primary' : 'default'" @click="setStatusFilter(3)">已驳回</t-button>
        <t-button size="small" variant="outline" :theme="filters.status === 4 ? 'primary' : 'default'" @click="setStatusFilter(4)">已撤销</t-button>
      </div>
    </div>

    <div class="surface-card table-card desktop-only">
      <div class="table-head">
        <div class="table-title">报工记录</div>
        <div class="table-tip">共 {{ total }} 项，当前第 {{ page }} 页</div>
      </div>
      <t-table :data="rows" :columns="columns" :loading="loading" row-key="id" hover table-layout="fixed" />
    </div>

    <!-- 移动端卡片列表 -->
    <div class="mobile-cards">
      <div v-for="row in rows" :key="row.id" class="report-card surface-card">
        <div class="card-head">
          <span class="card-name name-link" @click="goProject(row.project?.id)">{{ row.project?.name || '-' }}</span>
          <t-tag :theme="statusTheme(row.status)" size="small" variant="light">{{ statusText(row.status) }}</t-tag>
        </div>
        <div class="card-meta">
          <span class="card-date">📅 {{ dateText(row.reportDate) }}</span>
          <span class="card-hours">总 {{ row.totalHours }}h</span>
        </div>
        <div class="card-info">
          <div class="info-row"><span class="info-label">普通/加班</span><span class="info-value">{{ row.normalHours }} / {{ row.overtimeHours }} h</span></div>
          <div class="info-row"><span class="info-label">类型</span><span class="info-value">{{ row.isHoliday ? '节假日' : '工作日' }}</span></div>
          <div class="info-row"><span class="info-label">报工人</span><span class="info-value">{{ row.userName || '-' }}</span></div>
        </div>
        <div class="card-actions">
          <t-button v-if="row.status === 1" theme="primary" variant="text" size="small" @click="edit(row)">编辑</t-button>
          <t-button v-if="row.status !== 2" theme="danger" variant="text" size="small" @click="remove(row)">撤销</t-button>
        </div>
      </div>
      <t-empty v-if="!loading && rows.length === 0" description="暂无报工数据" />
    </div>

    <div class="pager">
      <t-pagination :total="total" :page-size="pageSize" :current="page" @change="onPageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Tag, MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
import { getReports, deleteReport, exportReports } from '../api/report';
import { getProjects } from '../api/project';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const exporting = ref(false);
const rows = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const projectOptions = ref<any[]>([]);
const filters = ref<any>({});

const statusOptions = [
  { value: 1, label: '审批中' },
  { value: 2, label: '已通过' },
  { value: 3, label: '已驳回' },
  { value: 4, label: '已撤销' },
];

const pendingCount = computed(() => rows.value.filter((i) => i.status === 1).length);
const approvedCount = computed(() => rows.value.filter((i) => i.status === 2).length);
const totalHoursText = computed(() => {
  const sum = rows.value.reduce((acc: number, i: any) => acc + (Number(i.totalHours) || 0), 0);
  return sum.toFixed(1);
});

function statusText(s: number) {
  return ({ 1: '审批中', 2: '已通过', 3: '已驳回', 4: '已撤销' } as Record<number, string>)[s] || String(s);
}
function statusTheme(s: number): 'primary' | 'default' | 'success' | 'danger' | 'warning' {
  return ({ 1: 'primary', 2: 'success', 3: 'danger', 4: 'default' } as Record<number, 'primary' | 'default' | 'success' | 'danger' | 'warning'>)[s] || 'default';
}
function dateText(v: any) {
  return v ? String(v).slice(0, 10) : '-';
}

const columns = [
  {
    colKey: 'project.name',
    title: '项目',
    minWidth: 100,
    ellipsis: true,
    cell: (h: any, { row }: any) => {
      const pid = row?.project?.id;
      return h(
        'a',
        {
          class: 'name-link',
          onClick: (e: any) => {
            e.stopPropagation();
            if (pid) router.push({ name: 'project-detail', params: { id: pid } });
          },
        },
        { default: () => row?.project?.name || '-' },
      );
    },
  },
  { colKey: 'reportDate', title: '日期', width: 150, cell: (h: any, { row }: any) => dateText(row?.reportDate) },
  { colKey: 'hours', title: '普通/加班', width: 110, cell: (h: any, { row }: any) => `${row?.normalHours ?? 0} / ${row?.overtimeHours ?? 0} h` },
  { colKey: 'totalHours', title: '总时长', width: 90 },
  {
    colKey: 'isHoliday',
    title: '类型',
    width: 90,
    cell: (h: any, { row }: any) => h(Tag, { theme: row?.isHoliday ? 'warning' : 'success', size: 'small', variant: 'light' }, { default: () => (row?.isHoliday ? '节假日' : '工作日') }),
  },
  {
    colKey: 'status',
    title: '状态',
    width: 90,
    cell: (h: any, { row }: any) => h(Tag, { theme: statusTheme(row?.status), size: 'small', variant: 'light' }, { default: () => statusText(row?.status) }),
  },
  { colKey: 'userName', title: '报工人', width: 100 },
  {
    colKey: 'action',
    title: '操作',
    width: 150,
    fixed: 'right',
    cell: (h: any, { row }: any) =>
      h('div', { style: 'display:flex;gap:4px;align-items:center' }, [
        // row?.status === 1 ? h(Button, { theme: 'primary', variant: 'text', onClick: () => edit(row) }, { default: () => '编辑' }) : null,
        row?.status === 1 ? h(Button, { theme: 'danger', variant: 'text', onClick: () => remove(row) }, { default: () => '撤销' }) : null,
      ]),
  },
];

async function load() {
  loading.value = true;
  try {
    const res = await getReports({ ...filters.value, page: page.value, pageSize });
    rows.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onPageChange(pageInfo: any) {
  page.value = pageInfo.current;
  load();
}

function resetFilters() {
  filters.value = {};
  page.value = 1;
  load();
}

function setStatusFilter(v: number) {
  filters.value = { ...filters.value, status: filters.value.status === v ? undefined : v };
  page.value = 1;
  load();
}

function goProject(pid: any) {
  if (pid) router.push({ name: 'project-detail', params: { id: pid } });
}

async function doExport() {
  exporting.value = true;
  try {
    const blob = await exportReports({
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const range = filters.value.startDate || filters.value.endDate ? `_${filters.value.startDate || ''}~${filters.value.endDate || ''}` : '';
    a.href = url;
    a.download = `报工记录${range}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    MessagePlugin.success('已导出');
  } catch (e: any) {
    MessagePlugin.error('导出失败：' + (e?.message || '未知错误'));
  } finally {
    exporting.value = false;
  }
}

function edit(_row: any) {
  MessagePlugin.info('审批中的报工可由本人/管理员编辑（编辑表单待接入）');
}

function remove(row: any) {
  const dialog = DialogPlugin.confirm({
    header: '撤销确认',
    body: `确认撤销 ${String(row.reportDate).slice(0, 10)} 的报工？`,
    theme: 'warning',
    onConfirm: async () => {
      await deleteReport(row.id);
      MessagePlugin.success('已撤销');
      dialog.destroy();
      load();
    },
  });
}

onMounted(async () => {
  const res = await getProjects({ pageSize: 100 });
  projectOptions.value = res.items;
  load();
});
</script>

<style scoped>
.report-list {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.overview-card {
  background: linear-gradient(145deg, #ffffff 0%, #eefbf3 100%);
  border-color: #d3eee0;
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
  border: 1px solid #e3f0e9;
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

.filter-card {
  padding-top: 16px;
  padding-bottom: 16px;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.quick-filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.quick-label {
  color: #6e6e73;
  font-size: 13px;
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

.name-link {
  color: #0066cc;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}
.name-link:hover {
  text-decoration: underline;
}

.table-card :deep(.t-table) {
  min-width: 1000px;
}
.table-card :deep(.t-table__content) {
  overflow-x: auto;
}

.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 移动端卡片列表 */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 10px;
}

.report-card {
  padding: 14px;
  border-color: #e3f0e9;
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
  color: #0066cc;
}

.card-info {
  border-top: 1px solid #edf1f7;
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
  gap: 4px;
  margin-top: 4px;
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
  .toolbar > * {
    flex: 1 1 40%;
  }
  .quick-label {
    width: 100%;
    margin-bottom: 2px;
  }
  .desktop-only {
    display: none;
  }
  .mobile-cards {
    display: flex;
  }
  .pager {
    justify-content: center;
  }
}
</style>
