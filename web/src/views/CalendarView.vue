<template>
  <div class="calendar-page">
    <div class="surface-card overview-card">
      <div class="overview-top">
        <div>
          <p class="overview-kicker">CALENDAR DASHBOARD</p>
          <h1 class="page-title">日历配置</h1>
          <p class="overview-sub">维护例外日期（法定节假日 / 调休上班日），默认周末为节假日</p>
        </div>
        <div class="overview-actions">
          <t-button variant="text" theme="default" class="back-btn" @click="router.push('/')">← 返回首页</t-button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">规则总数</div>
          <div class="metric-value">{{ totalCount }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">法定节假日</div>
          <div class="metric-value">{{ holidayCount }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">调休上班日</div>
          <div class="metric-value">{{ workdayCount }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">默认规则</div>
          <div class="metric-value">周末</div>
        </div>
      </div>
    </div>

    <div class="surface-card add-card">
      <div class="add-title">新增规则</div>
      <div class="toolbar">
        <t-date-picker v-model="form.calDate" format="YYYY-MM-DD" placeholder="选择日期" clearable style="width: 180px" />
        <t-select v-model="form.dayType" style="width: 160px">
          <t-option label="法定节假日" :value="1" />
          <t-option label="调休上班日" :value="2" />
        </t-select>
        <t-button theme="primary" shape="round" @click="add">+ 添加</t-button>
      </div>
      <p class="add-tip">仅需维护例外日期，周末自动视为节假日</p>
    </div>

    <div class="surface-card table-card desktop-only">
      <div class="table-head">
        <div class="table-title">规则列表</div>
        <div class="table-tip">共 {{ totalCount }} 条</div>
      </div>
      <t-table :data="rows" :columns="columns" :loading="loading" row-key="id" hover table-layout="fixed" />
    </div>

    <!-- 移动端卡片列表 -->
    <div class="mobile-cards">
      <div v-for="row in rows" :key="row.id" class="rule-card surface-card">
        <div class="card-head">
          <span class="card-date">📅 {{ dateText(row.calDate) }}</span>
          <t-tag :theme="row.dayType === 1 ? 'danger' : 'success'" size="small" variant="light">{{ dayTypeText(row.dayType) }}</t-tag>
        </div>
        <div v-if="row.name" class="card-name">{{ row.name }}</div>
        <div class="card-actions">
          <t-button theme="danger" variant="text" size="small" @click="remove(row)">删除</t-button>
        </div>
      </div>
      <t-empty v-if="!loading && rows.length === 0" description="暂无日历规则" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Tag, MessagePlugin } from 'tdesign-vue-next';
import { getCalendarRules, createCalendarRule, deleteCalendarRule } from '../api/calendar';

const router = useRouter();
const rows = ref<any[]>([]);
const loading = ref(false);
const form = ref<any>({ calDate: '', dayType: 1, name: '' });

const totalCount = computed(() => rows.value.length);
const holidayCount = computed(() => rows.value.filter((i) => i.dayType === 1).length);
const workdayCount = computed(() => rows.value.filter((i) => i.dayType === 2).length);

function dayTypeText(t: number) {
  return ({ 1: '法定节假日', 2: '调休上班日' } as Record<number, string>)[t] || String(t);
}
function dateText(v: any) {
  return v ? String(v).slice(0, 10) : '-';
}

const columns = [
  { colKey: 'calDate', title: '日期', width: 150, cell: (h: any, { row }: any) => dateText(row?.calDate) },
  {
    colKey: 'dayType',
    title: '类型',
    width: 130,
    cell: (h: any, { row }: any) => h(Tag, { theme: row?.dayType === 1 ? 'danger' : 'success', size: 'small', variant: 'light' }, { default: () => dayTypeText(row?.dayType) }),
  },
  { colKey: 'name', title: '名称', cell: (h: any, { row }: any) => row?.name || '-' },
  { colKey: 'action', title: '操作', width: 90, cell: (h: any, { row }: any) => h(Button, { theme: 'danger', variant: 'text', onClick: () => remove(row) }, { default: () => '删除' }) },
];

async function load() {
  loading.value = true;
  try {
    rows.value = await getCalendarRules();
  } finally {
    loading.value = false;
  }
}

async function add() {
  if (!form.value.calDate) return MessagePlugin.warning('请选择日期');
  await createCalendarRule(form.value);
  MessagePlugin.success('已添加');
  form.value = { calDate: '', dayType: 1, name: '' };
  load();
}

async function remove(row: any) {
  await deleteCalendarRule(row.id);
  MessagePlugin.success('已删除');
  load();
}

onMounted(load);
</script>

<style scoped>
.calendar-page {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.overview-card {
  background: linear-gradient(145deg, #ffffff 0%, #f6f4ff 100%);
  border-color: #e0d9f5;
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
  border: 1px solid #ebe6f7;
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

.add-card {
  padding-top: 18px;
  padding-bottom: 18px;
}

.add-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.add-tip {
  margin: 10px 0 0;
  color: #86868b;
  font-size: 12px;
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
  min-width: 600px;
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

.rule-card {
  padding: 14px;
  border-color: #e7e0f7;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-date {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.card-name {
  margin-top: 8px;
  color: #86868b;
  font-size: 13px;
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
  .desktop-only {
    display: none;
  }
  .mobile-cards {
    display: flex;
  }
}
</style>
