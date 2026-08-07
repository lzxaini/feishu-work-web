<!--
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-04 13:49:25
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 09:49:55
 * @FilePath: \feishu-work-web\web\src\views\ProjectDetail.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<!--
 * @Description: 项目详情页
-->
<template>
  <div class="project-detail-page">
    <div class="surface-card hero-card">
      <div class="hero-top">
        <t-button variant="text" theme="default" class="back-btn" @click="router.push('/projects')">← 返回项目管理</t-button>
        <div class="hero-actions">
          <t-button v-if="auth.isAdmin" theme="default" variant="outline" shape="round" @click="router.push({ name: 'project-edit', params: { id: id } })">编辑项目</t-button>
          <t-button v-if="auth.isAdmin" theme="danger" variant="outline" shape="round" @click="remove">删除</t-button>
        </div>
      </div>

      <div class="hero-main">
        <h1 class="page-title">{{ project?.name || '项目详情' }}</h1>
        <div class="hero-tags" v-if="project">
          <t-tag :theme="statusTheme(project.status)" size="medium" variant="light">{{ statusText(project.status) }}</t-tag>
          <t-tag :theme="priorityTheme(project.priority)" size="medium" variant="light">{{ priorityText(project.priority) }}</t-tag>
          <t-tag v-if="project.contractNo" size="medium" variant="light">项目编号 {{ project.contractNo }}</t-tag>
        </div>
      </div>
    </div>

    <template v-if="project">
      <div class="surface-card section-card">
        <div class="section-title">基础信息</div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">项目编号</span><span class="info-value">{{ project.contractNo || '-' }}</span></div>
          <!-- <div class="info-item"><span class="info-label">日期</span><span class="info-value">{{ dateText(project.contractDate) }}</span></div> -->
          <div class="info-item"><span class="info-label">起止日期</span><span class="info-value">{{ dateText(project.startDate) }} ~ {{ dateText(project.endDate) }}</span></div>
          <div class="info-item"><span class="info-label">优先级</span><span class="info-value">{{ priorityText(project.priority) }}</span></div>
          <div class="info-item"><span class="info-label">状态</span><span class="info-value">{{ statusText(project.status) }}</span></div>
          <!-- <div class="info-item"><span class="info-label">申请专利</span><span class="info-value">{{ project.patentApplied ? '是' : '否' }}</span></div> -->
        </div>
      </div>

      <!-- <div class="surface-card section-card">
        <div class="section-title">成本与文档</div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">合同编号</span><span class="info-value">{{ project.contractNo || '-' }}</span></div>
          <div class="info-item"><span class="info-label">合同金额</span><span class="info-value money">{{ moneyText(project.contractAmount) }}</span></div>
          <div class="info-item"><span class="info-label">研发费用摊销</span><span class="info-value money">{{ moneyText(project.rdCostAmortization) }}</span></div>
          <div class="info-item span-2"><span class="info-label">研发项目书</span><span class="info-value">{{ project.rdProjectDoc || '-' }}</span></div>
        </div>
      </div> -->

      <div class="surface-card section-card">
        <div class="section-title">审批人</div>
        <div class="owner-list">
          <div v-for="m in project.members || []" :key="m.id" class="owner-chip">
            {{ m.userName || m.openId }}
          </div>
          <span v-if="!(project.members || []).length" class="empty">暂无审批人</span>
        </div>
      </div>

      <div class="surface-card section-card">
        <div class="section-title">补充说明</div>
        <div class="text-block">
          <div class="text-label">项目描述</div>
          <p class="text-content">{{ project.description || '暂无' }}</p>
        </div>
        <div class="text-block">
          <div class="text-label">备注</div>
          <p class="text-content">{{ project.remark || '暂无' }}</p>
        </div>
      </div>
    </template>

    <t-empty v-else-if="!loading" description="项目不存在或已删除" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
import { getProject, deleteProject } from '../api/project';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const id = Number(route.params.id);
const project = ref<any>(null);
const loading = ref(false);

function statusText(s: number) {
  return ({ 1: '进行中', 2: '已完成', 3: '已取消', 4: '已暂停', 5: '已失败' } as Record<number, string>)[s] || String(s);
}
function statusTheme(s: number): 'primary' | 'default' | 'success' | 'danger' | 'warning' {
  return ({ 1: 'primary', 2: 'success', 3: 'danger' } as Record<number, 'primary' | 'default' | 'success' | 'danger' | 'warning'>)[s] || 'default';
}
function priorityText(p: number) {
  return ({ 1: '紧急', 2: '优先', 3: '普通' } as Record<number, string>)[p] || '普通';
}
function priorityTheme(p: number): 'primary' | 'default' | 'success' | 'danger' | 'warning' {
  return ({ 1: 'danger', 2: 'warning', 3: 'default' } as Record<number, 'primary' | 'default' | 'success' | 'danger' | 'warning'>)[p] || 'default';
}
function dateText(v: any) {
  return v ? String(v).slice(0, 10) : '-';
}
function moneyText(v: any) {
  if (v === null || v === undefined || v === '') return '-';
  const n = Number(v);
  return Number.isNaN(n) ? '-' : n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function load() {
  loading.value = true;
  try {
    project.value = await getProject(id);
  } finally {
    loading.value = false;
  }
}

function remove() {
  const dialog = DialogPlugin.confirm({
    header: '删除确认',
    body: `确认删除项目「${project.value?.name}」？`,
    theme: 'warning',
    onConfirm: async () => {
      await deleteProject(id);
      MessagePlugin.success('已删除');
      dialog.destroy();
      router.push('/projects');
    },
  });
}

onMounted(load);
</script>

<style scoped>
.project-detail-page {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fbff 100%);
  border-color: #d9e6f7;
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.back-btn {
  margin-left: -8px;
}

.hero-actions {
  display: flex;
  gap: 8px;
}

.hero-main {
  margin-top: 14px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1d1d1f;
  margin: 0;
}

.hero-tags {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.section-card {
  padding-top: 18px;
  padding-bottom: 18px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.info-item.span-2 {
  grid-column: span 2;
}

.info-label {
  font-size: 12px;
  color: #86868b;
}

.info-value {
  font-size: 15px;
  color: #1d1d1f;
  word-break: break-all;
}

.info-value.money {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.owner-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.owner-chip {
  background: #f5f5f7;
  border: 1px solid #e0e0e0;
  border-radius: 9999px;
  padding: 6px 14px;
  font-size: 13px;
  color: #1d1d1f;
}

.empty {
  color: #86868b;
  font-size: 13px;
}

.text-block {
  margin-bottom: 14px;
}

.text-label {
  font-size: 12px;
  color: #86868b;
  margin-bottom: 6px;
}

.text-content {
  margin: 0;
  font-size: 15px;
  color: #1d1d1f;
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 720px) {
  .hero-top {
    flex-direction: column;
    align-items: stretch;
  }
  .hero-actions {
    justify-content: flex-end;
  }
  .page-title {
    font-size: 22px;
  }
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 16px;
  }
  .info-item.span-2 {
    grid-column: span 2;
  }
}
</style>
