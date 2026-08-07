<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:45:00
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 08:32:29
 * @FilePath: \feishu-work-web\web\src\views\ReportForm.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div class="report-form-page">
    <div class="surface-card hero-card">
      <div class="hero-left">
        <t-button variant="text" theme="default" class="back-btn" @click="router.back()">← 返回报工管理</t-button>
        <h1 class="page-title">提交报工</h1>
        <p class="hero-sub">选择项目与日期，填写工时后提交；节假日/加班报工需指定审批人（默认项目负责人）。</p>
      </div>
      <div class="hero-badge is-create">报工模式</div>
    </div>

    <div class="surface-card form-card">
      <t-form :data="form" label-align="top" class="form-grid">
        <t-form-item label="项目" required-mark class="span-full">
          <t-select v-model="form.projectId" filterable placeholder="选择项目" style="width: 100%" @change="onProjectChange">
            <t-option v-for="p in projects" :key="p.id" :value="p.id" :label="p.name" />
          </t-select>
        </t-form-item>
        <t-form-item label="报工日期" required-mark class="span-full">
          <t-date-picker
            v-model="form.reportDate"
            format="YYYY-MM-DD"
            :disable-date="(d: any) => new Date(d).getTime() > Date.now()"
            placeholder="选择日期"
            style="width: 100%"
            @change="checkHoliday"
          />
        </t-form-item>

        <t-form-item label="普通时长">
          <t-input-number
            v-model="form.normalHours"
            :disabled="quota.remaining === 0"
            :min="0"
            :max="quota.remaining"
            :step="0.5"
            style="width: 100%"
          />
        </t-form-item>
        <t-form-item label="加班时长">
          <t-input-number
            v-model="form.overtimeHours"
            :disabled="quota.remaining > 0"
            :min="0"
            :max="24"
            :step="0.5"
            style="width: 100%"
          />
        </t-form-item>
        <div class="span-full field-tips">
          <p v-if="quota.remaining > 0">普通时长：今日还可报 {{ quota.remaining }}h（普通额度用完后才可填写加班）</p>
          <p v-else>普通时长：今日已报满 {{ quota.limit }}h，普通时长不可再报</p>
          <p>加班时长：{{ quota.remaining > 0 ? '普通额度未用完，暂不可填写加班' : '可填写，>0 将走审批' }}</p>
        </div>

        <t-form-item v-if="needApproval" label="指定审批人" required-mark class="span-full">
          <t-select
            v-model="form.approverOpenId"
            filterable
            clearable
            :options="approverOptions"
            :loading="approverSearching"
            @search="searchApprovers"
            placeholder="默认项目负责人，可改为其他审批人"
            style="width: 100%"
          />
        </t-form-item>

        <t-form-item v-if="holiday !== null" label="提示" class="span-full">
          <t-alert
            :theme="holiday || form.overtimeHours > 0 ? 'warning' : 'success'"
            :message="holiday ? '该日期为节假日，报工将全部走审批（默认指定项目负责人）' : form.overtimeHours > 0 ? '已填写加班时长，报工将走审批（默认指定项目负责人）' : '工作日且无加班，报工免审批直接生效'"
          />
        </t-form-item>

        <t-form-item label="备注" class="span-full">
          <t-textarea v-model="form.remark" :maxlength="500" placeholder="备注（可选）" />
        </t-form-item>

        <div class="form-actions span-full">
          <t-button theme="primary" shape="round" size="large" :loading="saving" @click="save">提交报工</t-button>
          <t-button theme="default" variant="outline" size="large" @click="router.back()">取消并返回</t-button>
        </div>
      </t-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { getProjects, getUsers } from '../api/project';
import { createReport, isHoliday, getReportQuota } from '../api/report';

const router = useRouter();
const saving = ref(false);
const projects = ref<any[]>([]);
const holiday = ref<boolean | null>(null);
const quota = ref<any>({ limit: 8, used: 0, remaining: 8 });
const approverOptions = ref<{ label: string; value: string }[]>([]);
const approverSearching = ref(false);

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const form = ref<any>({
  projectId: undefined,
  reportDate: todayStr(),
  normalHours: 0,
  overtimeHours: 0,
  remark: '',
  approverOpenId: '',
});

// 是否需审批：节假日 或 加班>0
const needApproval = computed(() => holiday.value === true || form.value.overtimeHours > 0);

function defaultApproverOpenId() {
  const p = projects.value.find((x: any) => x.id === form.value.projectId);
  return p?.members?.[0]?.openId || '';
}

// 选择项目后默认审批人为项目负责人
function onProjectChange() {
  form.value.approverOpenId = defaultApproverOpenId();
}

// 变为需审批时：未指定审批人则自动默认项目负责人
watch(needApproval, (v) => {
  if (v && !form.value.approverOpenId) form.value.approverOpenId = defaultApproverOpenId();
});

async function searchApprovers(keyword: string) {
  approverSearching.value = true;
  try {
    const res = await getUsers({ keyword, pageSize: 20 });
    approverOptions.value = res.items.map((u: any) => ({ label: u.name, value: u.openId }));
  } finally {
    approverSearching.value = false;
  }
}

async function loadQuota() {
  if (!form.value.reportDate) {
    quota.value = { limit: 8, used: 0, remaining: 8 };
    return;
  }
  const res = await getReportQuota(form.value.reportDate);
  quota.value = res;
  // 普通时长：有余额默认剩余额度、无余额为 0（禁用）；加班时长重置为 0（有余额时禁填加班）
  form.value.normalHours = res.used > 0 ? res.remaining : 0;
  form.value.overtimeHours = 0;
}

async function checkHoliday(date: string) {
  if (!date) return (holiday.value = null);
  const res = await isHoliday(date);
  holiday.value = res.isHoliday;
  await loadQuota();
}

async function save() {
  if (!form.value.projectId) return MessagePlugin.warning('请选择项目');
  if (!form.value.reportDate) return MessagePlugin.warning('请选择报工日期');
  if (form.value.normalHours + form.value.overtimeHours <= 0) return MessagePlugin.warning('总时长必须大于 0');
  const needApprove = holiday.value === true || form.value.overtimeHours > 0;
  if (needApprove && !form.value.approverOpenId) return MessagePlugin.warning('该报工需审批，请选择指定审批人');
  saving.value = true;
  try {
    await createReport({ ...form.value, approverOpenId: form.value.approverOpenId || undefined });
    MessagePlugin.success(needApprove ? '已提交，等待指定审批人审批' : '已提交，报工生效');
    router.push('/reports');
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const res = await getProjects({ pageSize: 100 });
  projects.value = res.items.filter((p: any) => p.status === 1);
  // 默认今天：加载当天节假日提示与普通时长额度
  if (form.value.reportDate) await checkHoliday(form.value.reportDate);
  searchApprovers('');
});
</script>

<style scoped>
.report-form-page {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-card {
  background: linear-gradient(145deg, #ffffff 0%, #eefbf3 100%);
  border-color: #d3eee0;
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
  background: #e8f5ee;
  color: #0a7a49;
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

.field-tips {
  padding-left: 4px;
  margin-bottom: 6px;
  color: #86868b;
  font-size: 12px;
}

.field-tips p {
  margin: 2px 0;
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
