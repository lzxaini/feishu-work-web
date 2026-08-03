<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:45:00
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:45:01
 * @FilePath: \feishu-work\web\src\views\ReportForm.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div class="surface-card">
    <h1 class="page-title">提交报工</h1>
    <t-form :data="form" label-align="top" style="max-width: 560px">
      <t-form-item label="项目" required-mark>
        <t-select v-model="form.projectId" filterable placeholder="选择项目" style="width: 100%">
          <t-option v-for="p in projects" :key="p.id" :value="p.id" :label="p.name" />
        </t-select>
      </t-form-item>
      <t-form-item label="报工日期" required-mark>
        <t-date-picker
          v-model="form.reportDate"
          format="YYYY-MM-DD"
          :disabled-date="(d: Date) => d.getTime() > Date.now()"
          placeholder="选择日期"
          @change="checkHoliday"
        />
      </t-form-item>
      <t-form-item label="普通时长">
        <div class="inline-field">
          <t-input-number v-model="form.normalHours" :min="0" :max="24" :step="0.5" />
          <span class="tip">小时（工作日 ≤8h 免审批）</span>
        </div>
      </t-form-item>
      <t-form-item label="加班时长">
        <div class="inline-field">
          <t-input-number v-model="form.overtimeHours" :min="0" :max="24" :step="0.5" />
          <span class="tip">小时（&gt;0 将走审批）</span>
        </div>
      </t-form-item>
      <t-form-item v-if="holiday !== null" label="提示">
        <t-alert
          :theme="holiday || form.overtimeHours > 0 ? 'warning' : 'success'"
          :message="holiday ? '该日期为节假日，报工将全部走审批' : form.overtimeHours > 0 ? '已填写加班时长，报工将走审批' : '工作日且无加班，报工免审批直接生效'"
        />
      </t-form-item>
      <t-form-item label="备注">
        <t-textarea v-model="form.remark" :maxlength="500" placeholder="备注（可选）" />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" shape="round" :loading="saving" @click="save">提交</t-button>
        <t-button theme="default" variant="outline" style="margin-left: 12px" @click="$router.back()">返回</t-button>
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { getProjects } from '../api/project';
import { createReport, isHoliday } from '../api/report';

const router = useRouter();
const saving = ref(false);
const projects = ref<any[]>([]);
const holiday = ref<boolean | null>(null);
const form = ref<any>({ projectId: undefined, reportDate: '', normalHours: 0, overtimeHours: 0, remark: '' });

async function checkHoliday(date: string) {
  if (!date) return (holiday.value = null);
  const res = await isHoliday(date);
  holiday.value = res.isHoliday;
}

async function save() {
  if (!form.value.projectId) return MessagePlugin.warning('请选择项目');
  if (!form.value.reportDate) return MessagePlugin.warning('请选择报工日期');
  if (form.value.normalHours + form.value.overtimeHours <= 0) return MessagePlugin.warning('总时长必须大于 0');
  saving.value = true;
  try {
    await createReport(form.value);
    MessagePlugin.success(holiday.value || form.value.overtimeHours > 0 ? '已提交，等待审批' : '已提交，报工生效');
    router.push('/reports');
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const res = await getProjects({ pageSize: 100 });
  projects.value = res.items.filter((p: any) => p.status === 1);
});
</script>

<style scoped>
.inline-field {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
