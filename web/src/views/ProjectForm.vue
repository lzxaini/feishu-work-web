<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:44:34
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-04 13:56:49
 * @FilePath: \feishu-work-web\web\src\views\ProjectForm.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div class="project-form-page">
    <div class="surface-card hero-card">
      <div class="hero-left">
        <t-button variant="text" theme="default" class="back-btn" @click="router.back()">← 返回项目管理</t-button>
        <h1 class="page-title">{{ editId ? '编辑项目' : '新建项目' }}</h1>
        <p class="hero-sub">
          {{ editId ? '更新项目计划、成本和负责人信息，变更会立即生效。' : '填写项目基础信息后创建，后续可在项目管理中持续维护。' }}
        </p>
      </div>
      <div class="hero-badge" :class="editId ? 'is-edit' : 'is-create'">
        {{ editId ? '编辑模式' : '创建模式' }}
      </div>
    </div>

    <div class="surface-card form-card">
      <t-form :data="form" label-align="top" class="form-grid">
        <div class="form-section span-full">基础信息</div>
        <t-form-item label="项目名称" required-mark class="span-full">
        <t-input v-model="form.name" placeholder="请输入项目名称" />
      </t-form-item>
      <!-- <t-form-item label="项目编号">
        <t-input v-model="form.code" placeholder="可选" />
      </t-form-item> -->
      <t-form-item label="合同编号">
        <t-input v-model="form.contractNo" placeholder="可选" />
      </t-form-item>

      <t-form-item label="日期">
        <t-date-picker v-model="form.contractDate" format="YYYY-MM-DD" clearable style="width: 100%" placeholder="合同/立项日期" />
      </t-form-item>
      <t-form-item label="开始日期">
        <t-date-picker v-model="form.startDate" format="YYYY-MM-DD" clearable style="width: 100%" placeholder="项目开始日期" />
      </t-form-item>
      <t-form-item label="结束日期">
        <t-date-picker v-model="form.endDate" format="YYYY-MM-DD" clearable style="width: 100%" placeholder="项目结束日期" />
      </t-form-item>

      <div class="form-section span-full">流程与优先级</div>

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

      <div class="form-section span-full">成本与文档</div>

      <t-form-item label="合同金额">
        <t-input-number v-model="form.contractAmount" style="width: 100%" theme="normal" placeholder="可选" :min="0" />
      </t-form-item>
      <t-form-item label="研发费用摊销">
        <t-input-number v-model="form.rdCostAmortization" style="width: 100%" theme="normal" placeholder="可选" :min="0" />
      </t-form-item>
      <t-form-item label="研发项目书">
        <t-input v-model="form.rdProjectDoc" placeholder="可选" />
      </t-form-item>

      <t-form-item label="负责人" class="span-full">
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

      <div class="form-section span-full">补充说明</div>

      <t-form-item label="项目描述" class="span-full">
        <t-textarea v-model="form.description" :maxlength="500" placeholder="项目描述（可选）" />
      </t-form-item>
      <t-form-item label="备注" class="span-full">
        <t-textarea v-model="form.remark" :maxlength="500" placeholder="备注（可选）" />
      </t-form-item>

      <div class="form-actions span-full">
        <t-button theme="primary" shape="round" size="large" :loading="saving" @click="save">保存项目</t-button>
        <t-button theme="default" variant="outline" size="large" @click="router.back()">取消并返回</t-button>
      </div>
    </t-form>
    </div>
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
  startDate: '',
  endDate: '',
  contractNo: '',
  rdProjectDoc: '',
  contractAmount: undefined,
  remark: '',
  patentApplied: 0,
  rdCostAmortization: undefined,
});
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
      startDate: form.value.startDate || undefined,
      endDate: form.value.endDate || undefined,
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
      startDate: p.startDate ? String(p.startDate).slice(0, 10) : '',
      endDate: p.endDate ? String(p.endDate).slice(0, 10) : '',
      contractNo: p.contractNo || '',
      rdProjectDoc: p.rdProjectDoc || '',
      contractAmount: p.contractAmount ?? undefined,
      remark: p.remark || '',
      patentApplied: p.patentApplied ?? 0,
      rdCostAmortization: p.rdCostAmortization ?? undefined,
    };
    userOptions.value = (p.members || []).map((m: any) => ({ label: m.userName || m.openId, value: m.openId }));
  }
});
</script>

<style scoped>
.project-form-page {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fbff 100%);
  border-color: #d9e6f7;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.back-btn {
  margin-left: -8px;
  margin-bottom: 4px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1d1d1f;
  margin: 0;
}

.hero-sub {
  margin: 8px 0 0;
  color: #6e6e73;
  font-size: 14px;
}

.hero-badge {
  flex-shrink: 0;
  border-radius: 9999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.hero-badge.is-create {
  background: #e8f0fe;
  color: #0066cc;
}

.hero-badge.is-edit {
  background: #fff4e5;
  color: #ad5a14;
}

.form-card {
  padding-top: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 16px;
}

.form-grid :deep(.span-full) {
  grid-column: span 3;
}

.form-section {
  margin-top: 2px;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #6e6e73;
  letter-spacing: 0.02em;
}

.form-actions {
  margin-top: 6px;
  display: flex;
  gap: 12px;
}

@media (max-width: 720px) {
  .hero-card {
    flex-direction: column;
    align-items: stretch;
  }
  .page-title {
    font-size: 22px;
  }
  .hero-badge {
    align-self: flex-start;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-grid :deep(.span-full) {
    grid-column: span 1;
  }
  .form-actions {
    flex-direction: column;
  }
}
</style>

