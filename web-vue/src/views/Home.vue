<template>
  <div :class="['home-wrap', { dark: settings.darkMode }]">
    <div v-if="accounts.length === 0" class="empty">
      <p>暂无账户</p>
      <p style="font-size:13px;margin-top:8px;color:#bbb;">点击上方 + 添加账户</p>
    </div>

    <div v-for="acc in accounts" :key="acc.id" class="card-wrap">
      <div class="card">
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
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { useSettings } from '../stores/settings.js';

defineEmits(['edit']);

const { settings } = useSettings();
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
  const key = acc.id;
  data.value[key] = { ...(data.value[key] || {}), loading: true };
  refreshAll();
}
</script>

<style scoped>
.home-wrap {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 12px 0;
}
.home-wrap.dark {
  background: #1a1a1a;
}
.card-wrap {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.dark .card {
  background: #2a2a2a;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.dark .card-header {
  border-color: #333;
}
.card-username { font-weight: bold; font-size: 16px; }
.card-actions { display: flex; gap: 6px; }
.card-actions button { background: none; border: 1px solid #ddd; border-radius: 6px; padding: 3px 8px; cursor: pointer; font-size: 12px; }
.dark .card-actions button { border-color: #444; color: #e0e0e0; }
.loading { height: 3px; background: #eee; border-radius: 2px; margin: 8px 0; overflow: hidden; }
.dark .loading { background: #333; }
.progress-bar { height: 6px; background: #eee; border-radius: 3px; margin: 8px 0; overflow: hidden; }
.dark .progress-bar { background: #333; }
.progress-fill { height: 100%; background: #4CAF50; border-radius: 3px; transition: width 0.3s; }
.progress-fill.warning { background: #FF9800; }
.progress-fill.danger { background: #F44336; }
.card-meta { display: flex; justify-content: space-between; font-size: 12px; color: #888; margin-top: 4px; }
.countdown { color: #1976D2; font-size: 12px; margin-top: 4px; }
.empty { text-align: center; padding: 60px 20px; color: #999; font-size: 15px; }
</style>
