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
  <div class="surface-card project-form">
    <div class="page-nav">
      <t-button variant="text" theme="default" class="back-btn" @click="router.back()">← 返回</t-button>
      <h1 class="page-title">{{ editId ? '编辑项目' : '新建项目' }}</h1>
    </div>

    <t-form :data="form" label-align="top" class="form-grid">
      <t-form-item label="项目名称" required-mark class="span-2">
        <t-input v-model="form.name" placeholder="请输入项目名称" />
      </t-form-item>
      <t-form-item label="项目编号">
        <t-input v-model="form.code" placeholder="可选" />
      </t-form-item>
      <t-form-item label="合同编号">
        <t-input v-model="form.contractNo" placeholder="可选" />
      </t-form-item>

      <t-form-item label="日期">
        <t-date-picker v-model="form.contractDate" format="YYYY-MM-DD" clearable style="width: 100%" placeholder="合同/立项日期" />
      </t-form-item>
      <t-form-item label="起止日期" class="span-2">
        <t-date-picker v-model="dateRange" type="range" format="YYYY-MM-DD" clearable style="width: 100%" />
      </t-form-item>

      <t-form-item label="优先级">
        <t-select v-model="form.priority" :options="priorityOptions" style="width: 100%" />
      </t-form-item>
      <t-form-item label="状态">
        <t-select v-model="form.status" :options="statusOptions" style="width: 100%" />
      </t-form-item>
      <t-form-item label="申请专利">
        <t-radio-group v-model="form.patentApplied">
          <t-radio :value="1">是</t-radio>
          <t-radio :value="0">否</t-radio>
        </t-radio-group>
      </t-form-item>

      <t-form-item label="合同金额">
        <t-input-number v-model="form.contractAmount" style="width: 100%" theme="normal" placeholder="可选" :min="0" />
      </t-form-item>
      <t-form-item label="研发费用摊销">
        <t-input-number v-model="form.rdCostAmortization" style="width: 100%" theme="normal" placeholder="可选" :min="0" />
      </t-form-item>
      <t-form-item label="研发项目书">
        <t-input v-model="form.rdProjectDoc" placeholder="可选" />
      </t-form-item>

      <t-form-item label="负责人" class="span-2">
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

      <t-form-item label="项目描述" class="span-2">
        <t-textarea v-model="form.description" :maxlength="500" placeholder="项目描述（可选）" />
      </t-form-item>
      <t-form-item label="备注" class="span-2">
        <t-textarea v-model="form.remark" :maxlength="500" placeholder="备注（可选）" />
      </t-form-item>

      <t-form-item class="span-2">
        <t-button theme="primary" shape="round" :loading="saving" @click="save">保存</t-button>
        <t-button theme="default" variant="outline" style="margin-left: 12px" @click="router.back()">返回</t-button>
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
const form = ref<any>({
  name: '',
  code: '',
  description: '',
  ownerOpenIds: [],
  status: 1,
  priority: 3,
  contractDate: '',
  contractNo: '',
  rdProjectDoc: '',
  contractAmount: undefined,
  remark: '',
  patentApplied: 0,
  rdCostAmortization: undefined,
});
// 范围选择器 value 需为长度为 2 的数组，不能是空数组 []
const dateRange = ref<string[]>(['', '']);
const userOptions = ref<{ label: string; value: string }[]>([]);

const statusOptions = [
  { label: '进行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已取消', value: 3 },
];
const priorityOptions = [
  { label: '紧急', value: 1 },
  { label: '优先', value: 2 },
  { label: '普通', value: 3 },
];

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
      status: form.value.status,
      priority: form.value.priority,
      contractDate: form.value.contractDate || undefined,
      contractNo: form.value.contractNo || undefined,
      rdProjectDoc: form.value.rdProjectDoc || undefined,
      contractAmount: form.value.contractAmount === '' ? undefined : form.value.contractAmount,
      remark: form.value.remark || undefined,
      patentApplied: form.value.patentApplied ?? 0,
      rdCostAmortization: form.value.rdCostAmortization === '' ? undefined : form.value.rdCostAmortization,
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
      status: p.status ?? 1,
      priority: p.priority ?? 3,
      contractDate: p.contractDate ? String(p.contractDate).slice(0, 10) : '',
      contractNo: p.contractNo || '',
      rdProjectDoc: p.rdProjectDoc || '',
      contractAmount: p.contractAmount ?? undefined,
      remark: p.remark || '',
      patentApplied: p.patentApplied ?? 0,
      rdCostAmortization: p.rdCostAmortization ?? undefined,
    };
    if (p.startDate && p.endDate) dateRange.value = [String(p.startDate).slice(0, 10), String(p.endDate).slice(0, 10)];
    userOptions.value = (p.members || []).map((m: any) => ({ label: m.userName || m.openId, value: m.openId }));
  }
});
</script>

<style scoped>
.project-form {
  max-width: 780px;
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
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 16px;
}
.form-grid :deep(.span-2) {
  grid-column: span 3;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-grid :deep(.span-2) {
    grid-column: span 1;
  }
}
</style>

