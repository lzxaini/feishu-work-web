<template>
  <div>
    <div class="surface-card">
      <h1 class="page-title">日历配置</h1>
      <p class="tip">仅存例外（法定节假日 / 调休上班日），默认周末为节假日</p>
      <div class="toolbar" style="margin-top: 12px">
        <t-date-picker v-model="form.calDate" format="YYYY-MM-DD" placeholder="选择日期" />
        <t-select v-model="form.dayType" style="width: 150px">
          <t-option label="法定节假日" :value="1" />
          <t-option label="调休上班日" :value="2" />
        </t-select>
        <t-button theme="primary" shape="round" @click="add">添加</t-button>
      </div>
    </div>

    <div class="surface-card table-card" style="margin-top: 16px">
      <t-table :data="rows" :columns="columns" :loading="loading" row-key="id" hover />
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { Button, Tag, MessagePlugin } from 'tdesign-vue-next';
import { getCalendarRules, createCalendarRule, deleteCalendarRule } from '../api/calendar';

const rows = ref<any[]>([]);
const loading = ref(false);
const form = ref<any>({ calDate: '', dayType: 1, name: '' });

function dayTypeText(t: number) {
  return ({ 1: '法定节假日', 2: '调休上班日' } as Record<number, string>)[t] || String(t);
}

const columns = [
  { colKey: 'calDate', title: '日期', width: 150, cell: ({ row }: any) => String(row.calDate).slice(0, 10) },
  {
    colKey: 'dayType',
    title: '类型',
    width: 130,
    cell: ({ row }: any) => h(Tag, { theme: row.dayType === 1 ? 'danger' : 'success', size: 'small', variant: 'light' }, { default: () => dayTypeText(row.dayType) }),
  },
  { colKey: 'name', title: '名称' },
  { colKey: 'action', title: '操作', width: 90, cell: ({ row }: any) => h(Button, { theme: 'danger', variant: 'text', onClick: () => remove(row) }, { default: () => '删除' }) },
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
.table-card {
  padding: 8px 12px 16px;
}
</style>
