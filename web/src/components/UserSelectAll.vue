<!--
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-07 15:38:58
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 15:38:59
 * @FilePath: \feishu-work-web\web\src\components\UserSelect.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<!--
 * @Description: 可复用的飞书用户下拉选择（支持搜索 + 滚动加载更多）
 * 用法：<UserSelect v-model="openId" placeholder="..." :show-department="true" />
-->
<template>
  <t-select
    :model-value="modelValue"
    clearable
    filterable
    :options="options"
    :loading="searching || loadingMore"
    :popup-props="{ onScrollToBottom: onPopupScroll }"
    :placeholder="placeholder"
    :style="{ width }"
    @update:model-value="(v: any) => emit('update:modelValue', v)"
    @change="(v: any) => emit('change', v)"
    @search="searchUsers"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getUsers } from '../api/project';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    /** 是否在选项标签中展示部门 */
    showDepartment?: boolean;
    /** 挂载时是否自动加载第 1 页 */
    autoLoad?: boolean;
    /** 组件宽度（默认 100%） */
    width?: string;
  }>(),
  { placeholder: '搜索并选择用户', showDepartment: false, autoLoad: true, width: '100%' },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: any): void;
}>();

const options = ref<{ label: string; value: string }[]>([]);
const keyword = ref('');
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const searching = ref(false);
const loadingMore = ref(false);

function mapUser(u: any) {
  const suffix = props.showDepartment && u.departmentName ? `（${u.departmentName}）` : '';
  return { label: `${u.name}${suffix}`, value: u.openId };
}

async function searchUsers(kw: string) {
  searching.value = true;
  keyword.value = kw || '';
  page.value = 1;
  try {
    const res = await getUsers({ keyword: keyword.value, page: 1, pageSize });
    options.value = res.items.map(mapUser);
    total.value = res.total;
  } finally {
    searching.value = false;
  }
}

// 下拉滚动到底部时加载下一页（追加，不清空已加载项）
async function loadMore() {
  if (loadingMore.value || options.value.length >= total.value) return;
  loadingMore.value = true;
  try {
    const nextPage = page.value + 1;
    const res = await getUsers({ keyword: keyword.value, page: nextPage, pageSize });
    options.value = [...options.value, ...res.items.map(mapUser)];
    page.value = nextPage;
  } finally {
    loadingMore.value = false;
  }
}

function onPopupScroll() {
  loadMore();
}

/** 重新加载（如同步通讯录后可调用刷新） */
function reload() {
  searchUsers('');
}

/** 追加一个选项（用于回显不在候选列表中的选中值，如编辑时的负责人） */
function addOption(label: string, value: string) {
  if (!value) return;
  if (!options.value.some((o) => o.value === value)) {
    options.value.push({ label: label || value, value });
  }
}

onMounted(() => {
  if (props.autoLoad) reload();
});

defineExpose({ reload, addOption });
</script>
