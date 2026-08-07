<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:44:32
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 08:12:13
 * @FilePath: \feishu-work-web\web\src\views\ProjectList.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div class="project-list">
    <div class="surface-card overview-card">
      <div class="overview-top">
        <div>
          <p class="overview-kicker">PROJECT DASHBOARD</p>
          <h1 class="page-title">项目管理</h1>
          <p class="overview-sub">集中管理研发项目的计划、成本、负责人和执行状态</p>
        </div>
        <div class="overview-actions">
          <t-button variant="text" theme="default" class="back-btn" @click="router.push('/')">← 返回首页</t-button>
          <t-button v-if="auth.isAdmin" theme="primary" shape="round" @click="router.push('/projects/new')">新建项目</t-button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">项目总数</div>
          <div class="metric-value">{{ total }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">进行中</div>
          <div class="metric-value">{{ activeCount }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">已完成</div>
          <div class="metric-value">{{ completedCount }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">紧急优先级</div>
          <div class="metric-value">{{ urgentCount }}</div>
        </div>
      </div>
    </div>

    <div class="surface-card filter-card">
      <div class="toolbar">
        <t-input v-model="keyword" placeholder="搜索项目名称/合同编号" clearable style="width: 260px" @enter="load" />
        <t-select v-model="status" placeholder="状态" clearable style="width: 140px" @change="load">
          <t-option v-for="o in statusOptions" :key="o.value" :value="o.value" :label="o.label" />
        </t-select>
        <t-select v-model="priority" placeholder="优先级" clearable style="width: 140px" @change="load">
          <t-option v-for="o in priorityOptions" :key="o.value" :value="o.value" :label="o.label" />
        </t-select>
        <t-button theme="primary" @click="load">查询</t-button>
        <t-button theme="default" variant="outline" @click="resetFilters">重置</t-button>
      </div>

      <div class="quick-filters">
        <span class="quick-label">快捷筛选</span>
        <t-button size="small" variant="outline" :theme="status === 1 ? 'primary' : 'default'" @click="setStatusFilter(1)">进行中</t-button>
        <t-button size="small" variant="outline" :theme="status === 2 ? 'primary' : 'default'" @click="setStatusFilter(2)">已完成</t-button>
        <t-button size="small" variant="outline" :theme="status === 3 ? 'primary' : 'default'" @click="setStatusFilter(3)">已取消</t-button>
        <t-button size="small" variant="outline" :theme="priority === 1 ? 'primary' : 'default'" @click="setPriorityFilter(1)">紧急</t-button>
        <t-button size="small" variant="outline" :theme="priority === 2 ? 'primary' : 'default'" @click="setPriorityFilter(2)">优先</t-button>
        <t-button size="small" variant="outline" :theme="priority === 3 ? 'primary' : 'default'" @click="setPriorityFilter(3)">普通</t-button>
      </div>
    </div>

    <div class="surface-card table-card desktop-only">
      <div class="table-head">
        <div class="table-title">项目列表</div>
        <div class="table-tip">共 {{ total }} 项，当前第 {{ page }} 页</div>
      </div>
      <t-table :data="rows" :columns="columns" :loading="loading" row-key="id" hover table-layout="fixed" />
    </div>

    <!-- 移动端卡片列表 -->
    <div class="mobile-cards">
      <div
        v-for="row in rows"
        :key="row.id"
        class="project-card surface-card"
        role="button"
        tabindex="0"
        @click="router.push({ name: 'project-detail', params: { id: row.id } })"
        @keyup.enter="router.push({ name: 'project-detail', params: { id: row.id } })"
      >
        <div class="card-head">
          <span class="card-name">{{ row.name }}</span>
          <t-tag :theme="statusTheme(row.status)" size="small" variant="light">{{ statusText(row.status) }}</t-tag>
        </div>
        <div class="card-meta">
          <t-tag :theme="priorityTheme(row.priority)" size="small" variant="light">{{ priorityText(row.priority) }}</t-tag>
          <span class="card-date">日期 {{ dateText(row.contractDate) }}</span>
        </div>
        <div class="card-info">
          <div class="info-row"><span class="info-label">合同编号</span><span class="info-value">{{ row.contractNo || '-' }}</span></div>
          <div class="info-row"><span class="info-label">合同金额</span><span class="info-value">{{ moneyText(row.contractAmount) }}</span></div>
          <div class="info-row"><span class="info-label">负责人</span><span class="info-value">{{ ownerNames(row) }}</span></div>
          <div v-if="row.remark" class="info-row"><span class="info-label">备注</span><span class="info-value">{{ row.remark }}</span></div>
        </div>
        <div class="card-actions" @click.stop>
          <t-button theme="default" variant="text" size="small" @click="router.push({ name: 'project-detail', params: { id: row.id } })">详情</t-button>
          <t-button v-if="auth.isAdmin" theme="primary" variant="text" size="small" @click="router.push({ name: 'project-edit', params: { id: row.id } })">编辑</t-button>
          <t-button v-if="auth.isAdmin" theme="danger" variant="text" size="small" @click="remove(row)">删除</t-button>
        </div>
      </div>
      <t-empty v-if="!loading && rows.length === 0" description="暂无项目数据" />
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
import { getProjects, deleteProject } from '../api/project';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const rows = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const keyword = ref('');
const status = ref<number | undefined>();
const priority = ref<number | undefined>();

const statusOptions = [
  { value: 1, label: '进行中' },
  { value: 2, label: '已完成' },
  { value: 3, label: '已取消' },
];

const priorityOptions = [
  { value: 1, label: '紧急' },
  { value: 2, label: '优先' },
  { value: 3, label: '普通' },
];

const activeCount = computed(() => rows.value.filter((i) => i.status === 1).length);
const completedCount = computed(() => rows.value.filter((i) => i.status === 2).length);
const urgentCount = computed(() => rows.value.filter((i) => i.priority === 1).length);

function statusText(s: number) {
  return ({ 1: '进行中', 2: '已完成', 3: '已取消' } as Record<number, string>)[s] || String(s);
}
function statusTheme(s: number): 'primary' | 'default' | 'success' | 'danger' | 'warning' {
  return ({ 1: 'primary', 2: 'success', 3: 'danger' } as Record<number, 'primary' | 'default' | 'success' | 'danger' | 'warning'>)[s] || 'default';
}
function priorityText(p: number) {
  return ({ 1: '紧急', 2: '优先', 3: '普通' } as Record<number, string>)[p] || '普通';
}
function priorityTheme(p: number): 'primary' | 'default' | 'success' | 'danger' | 'warning' {
  return ({ 1: 'danger', 2: 'warning', 3: 'default' } as Record<number, 'primary' | 'default' | 'success' | 'danger' | 'warning'>)[p] || 'default';
}
function dateText(v: any) {
  return v ? String(v).slice(0, 10) : '-';
}
function moneyText(v: any) {
  if (v === null || v === undefined || v === '') return '-';
  const n = Number(v);
  return Number.isNaN(n) ? '-' : n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function ownerNames(row: any) {
  return (row.members || []).map((m: any) => m.userName || m.openId).join('、') || '-';
}

const columns = [
  {
    colKey: 'serial',
    title: '序号',
    width: 64,
    cell: (h: any, { rowIndex }: any) => (page.value - 1) * pageSize + rowIndex + 1,
  },
  { colKey: 'contractNo', title: '项目编号', minWidth: 130, cell: (h: any, { row }: any) => row?.contractNo || '-' },
  {
    colKey: 'name',
    title: '项目名称',
    width: 180,
    ellipsis: true,
    cell: (h: any, { row }: any) =>
      h(
        'a',
        {
          class: 'name-link',
          onClick: (e: any) => {
            e.stopPropagation();
            router.push({ name: 'project-detail', params: { id: row?.id } });
          },
        },
        { default: () => row?.name || '-' },
      ),
  },
  // { colKey: 'contractAmount', title: '合同金额', width: 120, cell: (h: any, { row }: any) => moneyText(row?.contractAmount) },
  {
    colKey: 'members',
    title: '负责人',
    width: 140,
    ellipsis: true,
    cell: (h: any, { row }: any) => (row?.members || []).map((m: any) => m.userName || m.openId).join('、'),
  },
  {
    colKey: 'priority',
    title: '优先级',
    width: 90,
    cell: (h: any, { row }: any) => h(Tag, { theme: priorityTheme(row?.priority), size: 'small', variant: 'light' }, { default: () => priorityText(row?.priority) }),
  },
  {
    colKey: 'status',
    title: '状态',
    width: 90,
    cell: (h: any, { row }: any) => h(Tag, { theme: statusTheme(row?.status), size: 'small', variant: 'light' }, { default: () => statusText(row?.status) }),
  },
  { colKey: 'startDate', title: '日期', minWidth: 100, cell: (h: any, { row }: any) => dateText(row?.startDate) },
  {
    colKey: 'action',
    title: '操作',
    width: 150,
    fixed: 'right',
    cell: (h: any, { row }: any) =>
      h('div', { style: 'display:flex;gap:4px;align-items:center' }, [
        h(Button, { theme: 'primary', variant: 'text', onClick: () => router.push({ name: 'project-detail', params: { id: row?.id } }) }, { default: () => '详情' }),
        auth.isAdmin ? h(Button, { theme: 'primary', variant: 'text', onClick: () => router.push({ name: 'project-edit', params: { id: row?.id } }) }, { default: () => '编辑' }) : null,
        auth.isAdmin ? h(Button, { theme: 'danger', variant: 'text', onClick: () => remove(row) }, { default: () => '删除' }) : null,
      ]),
  },
];

async function load() {
  loading.value = true;
  try {
    const res = await getProjects({ keyword: keyword.value, status: status.value, priority: priority.value, page: page.value, pageSize });
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
  keyword.value = '';
  status.value = undefined;
  priority.value = undefined;
  page.value = 1;
  load();
}

function setStatusFilter(v: number) {
  status.value = status.value === v ? undefined : v;
  page.value = 1;
  load();
}

function setPriorityFilter(v: number) {
  priority.value = priority.value === v ? undefined : v;
  page.value = 1;
  load();
}

function remove(row: any) {
  const dialog = DialogPlugin.confirm({
    header: '删除确认',
    body: `确认删除项目「${row.name}」？`,
    theme: 'warning',
    onConfirm: async () => {
      await deleteProject(row.id);
      MessagePlugin.success('已删除');
      dialog.destroy();
      load();
    },
  });
}

onMounted(load);
</script>

<style scoped>
.project-list {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.overview-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fbff 100%);
  border-color: #d9e6f7;
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
  border: 1px solid #e7edf6;
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

.table-card :deep(.t-table) {
  min-width: 1000px;
}
.table-card :deep(.t-table__content) {
  overflow-x: auto;
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
.project-card {
  padding: 14px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  border-color: #e7edf6;
}
.project-card:active {
  transform: scale(0.99);
}
.project-card:hover {
  border-color: #bfd5f1;
  box-shadow: 0 8px 18px rgba(11, 53, 102, 0.08);
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
  gap: 8px;
  margin-bottom: 10px;
}
.card-date {
  font-size: 13px;
  color: #86868b;
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

