<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:45:00
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 16:14:51
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
        <p class="hero-sub">选择项目与日期，填写工时后提交；节假日/加班报工需指定审批人（默认项目审批人）。</p>
      </div>
      <div class="hero-badge is-create">报工模式</div>
    </div>

    <div class="surface-card form-card">
      <t-form :data="form" label-align="top" class="form-grid">
        <t-form-item label="项目" required-mark class="span-full">
          <t-input
            readonly
            :model-value="selectedProjectName"
            placeholder="点击选择项目"
            style="width: 100%; cursor: pointer"
            @click="openProjectPicker"
          >
            <template #suffixIcon>
              <span style="color: #c2c2c7; font-size: 12px">▾</span>
            </template>
          </t-input>
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
            :disabled="!canFillOvertime"
            :min="0"
            :max="24"
            :step="0.5"
            style="width: 100%"
          />
        </t-form-item>
        <div class="span-full field-tips">
          <p v-if="quota.remaining > 0">普通时长：今日还可报 {{ quota.remaining }}h（普通额度用完后才可填写加班）</p>
          <p v-else>普通时长：今日已报满 {{ quota.limit }}h，普通时长不可再报</p>
          <p v-if="quota.userHolidayEnabled === false">加班时长：您已被禁止填写加班申请，请联系管理员</p>
          <p v-else>加班时长：{{ canFillOvertime ? '可填写，>0 将走审批' : '普通额度未用完，暂不可填写加班' }}</p>
        </div>

        <t-form-item v-if="needApproval" label="指定审批人" required-mark class="span-full">
          <UserSelect v-model="form.approverOpenId" placeholder="默认项目审批人，可改为其他审批人" />
        </t-form-item>

        <t-form-item v-if="holiday !== null" label="提示" class="span-full">
          <t-alert
            :theme="holiday || form.overtimeHours > 0 ? 'warning' : 'success'"
            :message="holiday ? '该日期为节假日，报工将全部走审批（默认指定项目审批人）' : form.overtimeHours > 0 ? '已填写加班时长，报工将走审批（默认指定项目审批人）' : '工作日且无加班，报工免审批直接生效'"
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

    <t-dialog v-model:visible="projectPickerVisible" header="选择项目" :footer="false" width="92%">
      <div class="picker-toolbar">
        <t-tabs v-model="projectTab" :tabs-dividers="false" @change="onProjectTabChange">
          <t-tab-panel value="mine" label="历史填报" />
          <t-tab-panel value="all" label="所有项目" />
        </t-tabs>
        <t-input v-model="projectKeyword" placeholder="搜索项目名称/合同编号" clearable style="width: 100%;margin-top: 20px;" @enter="searchProjectRows" @clear="searchProjectRows" />
      </div>
      <t-table
        :data="projectRows"
        :columns="projectColumns"
        row-key="id"
        hover
        :loading="projectLoading"
        table-layout="fixed"
        @row-click="pickProject"
      />
      <div class="picker-pager">
        <span class="picker-tip">共 {{ projectTotal }} 个项目，点击行选择</span>
        <t-pagination :total="projectTotal" :page-size="projectPageSize" :current="projectPage" @change="onProjectPageChange" />
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin, Tag } from 'tdesign-vue-next';
import UserSelect from '../components/UserSelect.vue';
import { getProjects } from '../api/project';
import { createReport, isHoliday, getReportQuota } from '../api/report';

const router = useRouter();
const saving = ref(false);
const projects = ref<any[]>([]);
const holiday = ref<boolean | null>(null);
const quota = ref<any>({ limit: 8, used: 0, remaining: 8, userHolidayEnabled: true });

// 项目选择弹窗
const projectPickerVisible = ref(false);
const projectTab = ref('mine'); // mine 我的项目 / all 所有项目
const projectKeyword = ref('');
const projectRows = ref<any[]>([]);
const projectLoading = ref(false);
const projectTotal = ref(0);
const projectPage = ref(1);
const projectPageSize = 10;

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

// 是否可填写加班：用户未被禁止，且（节假日 或 普通额度已用完）
const canFillOvertime = computed(
  () => quota.value.userHolidayEnabled !== false && (holiday.value === true || quota.value.remaining === 0),
);

const selectedProjectName = computed(() => {
  const p =
    projects.value.find((x: any) => x.id === form.value.projectId) ||
    projectRows.value.find((x: any) => x.id === form.value.projectId);
  return p?.name || '';
});

function defaultApproverOpenId() {
  const p =
    projects.value.find((x: any) => x.id === form.value.projectId) ||
    projectRows.value.find((x: any) => x.id === form.value.projectId);
  return p?.members?.[0]?.openId || '';
}

// 选择项目后默认审批人为项目负责人
function onProjectChange() {
  form.value.approverOpenId = defaultApproverOpenId();
}

const projectColumns = computed(() => {
  const cols: any[] = [
    { colKey: 'contractNo', title: '项目编号', minWidth: 200, cell: (h: any, { row }: any) => row?.contractNo || '-' },
    { colKey: 'name', title: '项目名称', minWidth: 200, ellipsis: true },
    { colKey: 'description', title: '项目描述', minWidth: 200, ellipsis: true },
    { colKey: 'members', title: '审批人', width: 140, ellipsis: true, cell: (h: any, { row }: any) => (row?.members || []).map((m: any) => m.userName || m.openId).join('、') || '-' },
    { colKey: 'status', title: '状态', width: 80, cell: (h: any, { row }: any) => h(Tag, { theme: 'primary', variant: 'light' }, { default: () => '进行中' }) },
  ];
  // 我的项目页签：展示最近一次报工日期
  if (projectTab.value === 'mine') {
    cols.splice(2, 0, {
      colKey: 'lastReportAt',
      title: '上次填报',
      minWidth: 150,
      cell: (h: any, { row }: any) => (row?.lastReportAt ? String(row.lastReportAt).slice(0, 10) : '-'),
    });
  }
  return cols;
});

function openProjectPicker() {
  projectTab.value = 'mine';
  projectKeyword.value = '';
  projectPage.value = 1;
  loadProjectRows();
  projectPickerVisible.value = true;
}

async function loadProjectRows() {
  projectLoading.value = true;
  try {
    const params: any = { keyword: projectKeyword.value, page: projectPage.value, pageSize: projectPageSize };
    if (projectTab.value === 'mine') params.my = 1; // 我的项目：按最近报工时间倒序
    else params.status = 1; // 所有项目：进行中
    const res = await getProjects(params);
    projectRows.value = res.items;
    projectTotal.value = res.total;
  } finally {
    projectLoading.value = false;
  }
}

// 切换页签：重置到第 1 页再加载
function onProjectTabChange() {
  projectPage.value = 1;
  loadProjectRows();
}

// 搜索：重置到第 1 页再加载
function searchProjectRows() {
  projectPage.value = 1;
  loadProjectRows();
}

function onProjectPageChange(pageInfo: any) {
  projectPage.value = pageInfo.current;
  loadProjectRows();
}

function pickProject({ row }: any) {
  form.value.projectId = row.id;
  onProjectChange();
  projectPickerVisible.value = false;
}

// 变为需审批时：未指定审批人则自动默认项目负责人
watch(needApproval, (v) => {
  if (v && !form.value.approverOpenId) form.value.approverOpenId = defaultApproverOpenId();
});

async function loadQuota() {
  if (!form.value.reportDate) {
    quota.value = { limit: 8, used: 0, remaining: 8, userHolidayEnabled: true };
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
  if (form.value.overtimeHours > 0 && quota.value.userHolidayEnabled === false) {
    return MessagePlugin.warning('您已被禁止填写加班申请');
  }
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

.picker-toolbar {
  margin-bottom: 12px;
}

.picker-pager {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.picker-tip {
  color: #86868b;
  font-size: 12px;
  flex-shrink: 0;
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
