<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:44:32
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:44:32
 * @FilePath: \feishu-work\web\src\views\ProjectList.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div>
    <div class="toolbar">
      <t-input v-model="keyword" placeholder="搜索项目" clearable style="width: 220px" @enter="load" />
      <t-select v-model="status" placeholder="状态" clearable style="width: 130px" @change="load">
        <t-option v-for="o in statusOptions" :key="o.value" :value="o.value" :label="o.label" />
      </t-select>
      <t-button theme="default" @click="load">查询</t-button>
      <t-button v-if="auth.isAdmin" theme="primary" shape="round" @click="$router.push('/projects/new')">新建项目</t-button>
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

const statusOptions = [
  { value: 1, label: '进行中' },
  { value: 2, label: '暂停' },
  { value: 3, label: '已归档' },
];

function statusText(s: number) {
  return ({ 1: '进行中', 2: '暂停', 3: '已归档' } as Record<number, string>)[s] || String(s);
}

const columns = [
  { colKey: 'name', title: '项目名称', minWidth: 160 },
  { colKey: 'code', title: '编号', width: 110 },
  {
    colKey: 'status',
    title: '状态',
    width: 90,
    cell: ({ row }: any) =>
      h(
        Tag,
        { theme: row.status === 1 ? 'success' : row.status === 2 ? 'warning' : 'default', size: 'small', variant: 'light' },
        { default: () => statusText(row.status) },
      ),
  },
  {
    colKey: 'members',
    title: '负责人',
    minWidth: 140,
    cell: ({ row }: any) => (row.members || []).map((m: any) => m.userName || m.openId).join('、'),
  },
  { colKey: 'description', title: '描述', minWidth: 160, ellipsis: true },
  {
    colKey: 'action',
    title: '操作',
    width: 150,
    fixed: 'right',
    cell: ({ row }: any) =>
      h('div', { style: 'display:flex;gap:4px;align-items:center' }, [
        h(Button, { theme: 'primary', variant: 'text', onClick: () => router.push({ name: 'project-edit', params: { id: row.id } }) }, { default: () => '编辑' }),
        auth.isAdmin ? h(Button, { theme: 'danger', variant: 'text', onClick: () => remove(row) }, { default: () => '删除' }) : null,
      ]),
  },
];

async function load() {
  loading.value = true;
  try {
    const res = await getProjects({ keyword: keyword.value, status: status.value, page: page.value, pageSize });
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
.table-card {
  padding: 8px 12px 16px;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
