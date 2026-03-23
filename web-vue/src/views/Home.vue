<template>
  <div>
    <div v-if="accounts.length === 0" class="empty">
      <p>暂无账户</p>
      <p style="font-size:13px;margin-top:8px;color:#bbb;">点击底部 + 添加账户</p>
    </div>

    <div v-for="acc in accounts" :key="acc.id" class="card">
      <div class="card-header">
        <span class="card-username">{{ acc.username }}</span>
        <div class="card-actions">
          <button @click="refreshAccount(acc)">刷新</button>
          <button @click="$emit('edit', acc)">编辑</button>
          <button @click="deleteAccount(acc.id)">删除</button>
        </div>
      </div>

      <div v-if="data[acc.id]?.loading" class="loading" />

      <div v-else-if="data[acc.id]?.error" style="color:#F44336;font-size:13px;margin-top:8px;">
        {{ data[acc.id].error }}
      </div>

      <template v-else-if="data[acc.id]">
        <p style="font-size:13px;opacity:0.7">{{ data[acc.id].planName }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :class="percentClass(data[acc.id])" :style="{ width: percent(data[acc.id]) + '%' }" />
        </div>
        <div class="card-meta">
          <span>已用: {{ data[acc.id].amountUsed?.toFixed(1) }}</span>
          <span>剩余: {{ data[acc.id].remaining?.toFixed(1) }}</span>
        </div>
        <p v-if="data[acc.id].nextResetTime" class="countdown">重置: {{ data[acc.id].nextResetTime }}</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';

defineEmits(['edit']);

const accounts = inject('accounts');
const accountData = inject('accountData');
const refreshAll = inject('refreshAll');
const deleteAccount = inject('deleteAccount');

const data = accountData;

function percent(d) {
  if (!d || !d.amount) return 0;
  return Math.min(100, (d.amountUsed / d.amount) * 100);
}

function percentClass(d) {
  const p = percent(d);
  if (p > 80) return 'danger';
  if (p > 50) return 'warning';
  return '';
}

function refreshAccount(acc) {
  // 触发单个账户刷新
  const key = acc.id;
  data.value[key] = { ...(data.value[key] || {}), loading: true };
  refreshAll();
}
</script>
