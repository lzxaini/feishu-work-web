<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:44:34
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:44:35
 * @FilePath: \feishu-work\web\src\views\ProjectForm.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div class="surface-card">
    <h1 class="page-title">{{ editId ? '编辑项目' : '新建项目' }}</h1>
    <t-form :data="form" label-align="top" style="max-width: 640px">
      <t-form-item label="项目名称" required-mark>
        <t-input v-model="form.name" placeholder="请输入项目名称" />
      </t-form-item>
      <t-form-item label="项目编号">
        <t-input v-model="form.code" />
      </t-form-item>
      <t-form-item label="负责人">
        <t-select
          v-model="form.ownerOpenIds"
          multiple
          filterable
          :options="userOptions"
          :loading="searching"
          @search="searchUsers"
          placeholder="搜索并选择飞书用户"
          style="width: 100%"
        />
      </t-form-item>
      <t-form-item label="起止日期">
        <t-date-picker v-model="dateRange" type="range" format="YYYY-MM-DD" clearable style="width: 100%" />
      </t-form-item>
      <t-form-item label="描述">
        <t-textarea v-model="form.description" :maxlength="500" placeholder="项目描述（可选）" />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" shape="round" :loading="saving" @click="save">保存</t-button>
        <t-button theme="default" variant="outline" style="margin-left: 12px" @click="$router.back()">返回</t-button>
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { getProject, createProject, updateProject, getUsers } from '../api/project';

const route = useRoute();
const router = useRouter();
const editId = route.params.id ? Number(route.params.id) : null;

const saving = ref(false);
const searching = ref(false);
const form = ref<any>({ name: '', code: '', description: '', ownerOpenIds: [] });
// 范围选择器 value 需为长度为 2 的数组，不能是空数组 []
const dateRange = ref<string[]>(['', '']);
const userOptions = ref<{ label: string; value: string }[]>([]);

async function searchUsers(keyword: string) {
  searching.value = true;
  try {
    const res = await getUsers({ keyword, pageSize: 20 });
    userOptions.value = res.items.map((u: any) => ({
      label: `${u.name}${u.departmentName ? '（' + u.departmentName + '）' : ''}`,
      value: u.openId,
    }));
  } finally {
    searching.value = false;
  }
}

async function save() {
  if (!form.value.name) {
    MessagePlugin.warning('请输入项目名称');
    return;
  }
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      code: form.value.code || undefined,
      description: form.value.description || undefined,
      ownerOpenIds: form.value.ownerOpenIds,
      startDate: dateRange.value?.[0] || undefined,
      endDate: dateRange.value?.[1] || undefined,
    };
    if (editId) {
      await updateProject(editId, payload);
      MessagePlugin.success('已更新');
    } else {
      await createProject(payload);
      MessagePlugin.success('已创建');
    }
    router.push('/projects');
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await searchUsers('');
  if (editId) {
    const p = await getProject(editId);
    form.value = {
      name: p.name,
      code: p.code || '',
      description: p.description || '',
      ownerOpenIds: (p.members || []).filter((m: any) => m.role === 1).map((m: any) => m.openId),
    };
    if (p.startDate && p.endDate) dateRange.value = [String(p.startDate).slice(0, 10), String(p.endDate).slice(0, 10)];
    userOptions.value = (p.members || []).map((m: any) => ({ label: m.userName || m.openId, value: m.openId }));
  }
});
</script>
