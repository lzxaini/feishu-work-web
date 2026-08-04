<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:44:32
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-04 12:53:08
 * @FilePath: \feishu-work-web\web\src\views\ProjectList.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div class="project-list">
    <div class="page-nav">
      <t-button variant="text" theme="default" class="back-btn" @click="router.push('/')">
        ← 返回首页
      </t-button>
      <h1 class="page-title">项目管理</h1>
    </div>

    <div class="toolbar">
      <t-input v-model="keyword" placeholder="搜索项目名称/编号" clearable style="width: 220px" @enter="load" />
      <t-select v-model="status" placeholder="状态" clearable style="width: 130px" @change="load">
        <t-option v-for="o in statusOptions" :key="o.value" :value="o.value" :label="o.label" />
      </t-select>
      <t-select v-model="priority" placeholder="优先级" clearable style="width: 130px" @change="load">
        <t-option v-for="o in priorityOptions" :key="o.value" :value="o.value" :label="o.label" />
      </t-select>
      <t-button theme="default" @click="load">查询</t-button>
      <t-button v-if="auth.isAdmin" theme="primary" shape="round" @click="router.push('/projects/new')">新建项目</t-button>
    </div>

    <div class="surface-card table-card desktop-only">
      <div class="table-scroll">
        <t-table :data="rows" :columns="columns" :loading="loading" row-key="id" hover table-layout="fixed" />
      </div>
    </div>

    <!-- 移动端卡片列表 -->
    <div class="mobile-cards">
      <div
        v-for="row in rows"
        :key="row.id"
        class="project-card surface-card"
        role="button"
        tabindex="0"
        @click="router.push({ name: 'project-edit', params: { id: row.id } })"
        @keyup.enter="router.push({ name: 'project-edit', params: { id: row.id } })"
      >
        <div class="card-head">
          <span class="card-name">{{ row.name }}</span>
          <t-tag :theme="statusTheme(row.status)" size="small" variant="light">{{ statusText(row.status) }}</t-tag>
        </div>
        <div class="card-meta">
          <t-tag :theme="priorityTheme(row.priority)" size="small" variant="light">{{ priorityText(row.priority) }}</t-tag>
          <span class="card-date">📅 {{ dateText(row.contractDate) }}</span>
        </div>
        <div class="card-info">
          <div class="info-row"><span class="info-label">合同编号</span><span class="info-value">{{ row.contractNo || '-' }}</span></div>
          <div class="info-row"><span class="info-label">合同金额</span><span class="info-value">{{ moneyText(row.contractAmount) }}</span></div>
          <div class="info-row"><span class="info-label">负责人</span><span class="info-value">{{ ownerNames(row) }}</span></div>
          <div v-if="row.remark" class="info-row"><span class="info-label">备注</span><span class="info-value">{{ row.remark }}</span></div>
        </div>
        <div class="card-actions" @click.stop>
          <t-button theme="primary" variant="text" size="small" @click="router.push({ name: 'project-edit', params: { id: row.id } })">编辑</t-button>
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
import { h, onMounted, ref } from 'vue';
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
  { colKey: 'contractDate', title: '日期', width: 110, cell: (h: any, { row }: any) => dateText(row?.contractDate) },
  { colKey: 'name', title: '项目名称', width: 160, ellipsis: true },
  { colKey: 'contractNo', title: '合同编号', width: 130, cell: (h: any, { row }: any) => row?.contractNo || '-' },
  { colKey: 'rdProjectDoc', title: '研发项目书', width: 150, ellipsis: true, cell: (h: any, { row }: any) => row?.rdProjectDoc || '-' },
  { colKey: 'description', title: '项目描述', width: 160, ellipsis: true },
  { colKey: 'contractAmount', title: '合同金额', width: 120, cell: (h: any, { row }: any) => moneyText(row?.contractAmount) },
  { colKey: 'endDate', title: '项目结束日期', width: 130, cell: (h: any, { row }: any) => dateText(row?.endDate) },
  { colKey: 'remark', title: '备注', width: 140, ellipsis: true, cell: (h: any, { row }: any) => row?.remark || '-' },
  {
    colKey: 'patentApplied',
    title: '申请专利',
    width: 90,
    cell: (h: any, { row }: any) =>
      h(Tag, { theme: row?.patentApplied ? 'success' : 'default', size: 'small', variant: 'light' }, { default: () => (row?.patentApplied ? '是' : '否') }),
  },
  { colKey: 'rdCostAmortization', title: '研发费用摊销', width: 130, cell: (h: any, { row }: any) => moneyText(row?.rdCostAmortization) },
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
  {
    colKey: 'action',
    title: '操作',
    width: 150,
    fixed: 'right',
    cell: (h: any, { row }: any) =>
      h('div', { style: 'display:flex;gap:4px;align-items:center' }, [
        h(Button, { theme: 'primary', variant: 'text', onClick: () => router.push({ name: 'project-edit', params: { id: row?.id } }) }, { default: () => '编辑' }),
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
}
.page-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}
.back-btn {
  margin-left: -8px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1d1d1f;
  margin: 0;
}
.toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.table-card {
  padding: 8px 12px 16px;
}
.table-scroll {
  overflow-x: auto;
}
.table-scroll :deep(.t-table) {
  min-width: 1500px;
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
  gap: 12px;
}
.project-card {
  padding: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.project-card:active {
  transform: scale(0.99);
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
  margin-bottom: 12px;
}
.card-date {
  font-size: 13px;
  color: #86868b;
}
.card-info {
  border-top: 1px solid var(--td-component-border);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  width: 64px;
  color: #86868b;
}
.info-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

@media (max-width: 720px) {
  .page-title {
    font-size: 18px;
  }
  .toolbar > * {
    flex: 1 1 auto;
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

