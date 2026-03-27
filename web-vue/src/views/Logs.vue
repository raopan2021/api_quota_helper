<template>
  <div class="logs-wrap">
    <!-- 类型标签 -->
    <div class="flex gap-2 p-4 overflow-x-auto whitespace-nowrap">
      <button v-for="t in types" :key="t" class="px-3 py-1 text-xs rounded-full border cursor-pointer transition-colors"
        :style="selectedType === t
          ? { background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff' }
          : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }" @click="selectedType = t">
        {{ t }}
      </button>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredLogs.length === 0" class="text-center py-12 text-sm"
      :style="{ color: 'var(--color-text-muted)' }">
      暂无日志
    </div>

    <!-- 日志列表 -->
    <div v-for="log in filteredLogs" :key="log.id" class="mx-4 mb-2 p-3 rounded-lg"
      :style="{ background: 'var(--color-bg-card)' }">
      <div class="flex justify-between items-center">
        <span class="text-xs" :style="{ color: 'var(--color-text-muted)' }">{{ log.time }} {{ log.logType }}</span>
        <span class="text-xs" :class="log.success ? 'text-green-500' : 'text-red-500'">
          {{ log.success ? '✅' : '❌' }} {{ log.message }}
        </span>
      </div>
      <div class="text-xs mt-1" :style="{ color: 'var(--color-text-muted)' }">{{ log.username }}</div>

      <!-- 展开详情 -->
      <div v-if="expanded === log.id" class="mt-2 text-xs" :style="{ color: 'var(--color-text)' }">
        <div v-if="log.requestBody"><strong>请求:</strong></div>
        <pre v-if="log.requestBody" class="mt-1 p-2 rounded text-xs overflow-x-auto" :style="{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }">{{ formatJson(log.requestBody) }}</pre>
        <div v-if="log.body" class="mt-1"><strong>响应:</strong></div>
        <pre v-if="log.body" class="mt-1 p-2 rounded text-xs overflow-x-auto" :style="{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }">{{ formatJson(log.body) }}</pre>
        <div v-if="log.error" class="mt-1" style="color: var(--color-danger)"><strong>错误:</strong> {{ log.error }}</div>
      </div>
      <button class="mt-2 text-xs bg-transparent border-0 cursor-pointer" style="color: var(--color-primary)"
        @click="expanded = expanded === log.id ? null : log.id">
        {{ expanded === log.id ? '收起' : '展开详情' }}
      </button>
    </div>

    <!-- 清空按钮 -->
    <div class="p-4">
      <button class="w-full px-4 py-2 text-sm rounded-lg border cursor-pointer transition-colors"
        :style="{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text)' }"
        @click="clearByType(selectedType)">
        清空当前类型日志
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useLogs } from '../stores/logs.js';

const { logs, clearByType: clearType, getTypes } = useLogs();
const selectedType = ref('额度查询');
const expanded = ref(null);

const types = computed(() => getTypes());

const filteredLogs = computed(() => {
  return logs.value.filter(l => l.logType === selectedType.value);
});

function clearByType(t) {
  clearType(t);
}

function formatJson(str) {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}
</script>
