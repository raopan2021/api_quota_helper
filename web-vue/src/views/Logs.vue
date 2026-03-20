<template>
  <div>
    <div class="log-tabs">
      <button v-for="t in types" :key="t" class="log-tab" :class="{ active: selectedType === t }" @click="selectedType = t">
        {{ t }}
      </button>
    </div>

    <div v-if="filteredLogs.length === 0" class="log-empty">暂无日志</div>

    <div v-for="log in filteredLogs" :key="log.id" class="log-entry">
      <div class="log-entry-header">
        <span>{{ log.time }} {{ log.logType }}</span>
        <span :class="log.success ? 'success' : 'fail'">
          {{ log.success ? '✅' : '❌' }} {{ log.message }}
        </span>
      </div>
      <div style="font-size:11px;color:#888;margin-top:4px;">{{ log.username }}</div>
      <div v-if="expanded === log.id" class="log-detail">
        <div><strong>请求:</strong> {{ log.requestBody }}</div>
        <div v-if="log.body" style="margin-top:4px;"><strong>响应:</strong> {{ log.body }}</div>
        <div v-if="log.error" style="color:#F44336;margin-top:4px;"><strong>错误:</strong> {{ log.error }}</div>
      </div>
      <button @click="expanded = expanded === log.id ? null : log.id" style="margin-top:6px;background:none;border:none;color:#1976D2;cursor:pointer;font-size:12px;">
        {{ expanded === log.id ? '收起' : '展开详情' }}
      </button>
    </div>

    <div style="padding:12px 16px;">
      <button class="btn" @click="clearByType(selectedType)">清空当前类型日志</button>
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
</script>
