<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:44:57
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:44:58
 * @FilePath: \feishu-work\web\src\views\ReportList.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div>
    <div class="toolbar">
      <t-select v-model="filters.projectId" placeholder="项目" clearable filterable style="width: 180px" @change="load">
        <t-option v-for="p in projectOptions" :key="p.id" :value="p.id" :label="p.name" />
      </t-select>
      <t-select v-model="filters.status" placeholder="状态" clearable style="width: 120px" @change="load">
        <t-option v-for="o in statusOptions" :key="o.value" :value="o.value" :label="o.label" />
      </t-select>
      <t-date-picker v-model="filters.reportDate" format="YYYY-MM-DD" placeholder="报工日期" clearable style="width: 150px" @change="load" />
      <t-button theme="default" @click="load">查询</t-button>
      <t-button theme="primary" shape="round" @click="$router.push('/reports/new')">报工</t-button>
    </div>

    <div class="surface-card table-card">
      <t-table :data="rows" :columns="columns" :loading="loading" row-key="id" hover />
    </div>

    <div class="pager">
      <t-pagination :total="total" :page-size="pageSize" :current="page" @change="onPageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { Button, Tag, MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
import { getReports, deleteReport } from '../api/report';
import { getProjects } from '../api/project';

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

function statusText(s: number) {
  return ({ 1: '审批中', 2: '已通过', 3: '已驳回', 4: '已撤销' } as Record<number, string>)[s] || String(s);
}

const columns = [
  { colKey: 'project.name', title: '项目', minWidth: 140, ellipsis: true },
  { colKey: 'reportDate', title: '日期', width: 110, cell: (h: any, { row }: any) => String(row.reportDate).slice(0, 10) },
  { colKey: 'hours', title: '普通/加班', width: 110, cell: (h: any, { row }: any) => `${row.normalHours} / ${row.overtimeHours} h` },
  { colKey: 'totalHours', title: '总时长', width: 90 },
  {
    colKey: 'isHoliday',
    title: '类型',
    width: 90,
    cell: (h: any, { row }: any) => h(Tag, { theme: row.isHoliday ? 'warning' : 'success', size: 'small', variant: 'light' }, { default: () => (row.isHoliday ? '节假日' : '工作日') }),
  },
  { colKey: 'status', title: '状态', width: 90, cell: (h: any, { row }: any) => statusText(row.status) },
  { colKey: 'userName', title: '报工人', width: 100 },
  {
    colKey: 'action',
    title: '操作',
    width: 150,
    fixed: 'right',
    cell: (h: any, { row }: any) =>
      h('div', { style: 'display:flex;gap:4px;align-items:center' }, [
        row.status === 1 ? h(Button, { theme: 'primary', variant: 'text', onClick: () => edit(row) }, { default: () => '编辑' }) : null,
        row.status !== 2 ? h(Button, { theme: 'danger', variant: 'text', onClick: () => remove(row) }, { default: () => '撤销' }) : null,
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
.table-card {
  padding: 8px 12px 16px;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
